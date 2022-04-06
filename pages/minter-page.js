import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import {
    listAllObjectsFromS3Bucket,
    getRequestedMetadata,
    updateRequestedMetadata,
    getRequestedGiveawayMetadata,
    getAbiFromBucket
} from '../helpers/S3.js'

import { 
    pinFileToIPFS,
    pinJSONToIPFS 
} from '../helpers/Pinata.js'

import AWS from 'aws-sdk'
import { useMoralis } from 'react-moralis';
import { useEffect, useState, useContext } from 'react'

import {
    GalleryContext,
} from "../contexts/GalleryContext.js";

// use for local development. setAbi to Turtleverse.abi. Change env var to reflect local contract
import Turtleverse from '../artifacts/contracts/Turtleverse.sol/Turtleverse.json';

AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

export default function MinterPage() {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedArray, setRequestedArray] = useState([])
    const [stageMedia, setStageMedia] = useState([])
    const [isMinting, setIsMinting] = useState(false);

    const [abi, setAbi] = useState([]);
    const [allMetadata, setAllMetadata] = useState([]);

    const [galleryState, dispatch] = useContext(GalleryContext);
    const { isAuthenticated, user } = useMoralis();

    useEffect(async () => {
        const turtleBucket = new AWS.S3({
            accessKeyId: galleryState.accessParams.Credentials.AccessKeyId,
            secretAccessKey: galleryState.accessParams.Credentials.SecretAccessKey,
            sessionToken: galleryState.accessParams.Credentials.SessionToken,
            bucket: 'turtleverse.albums',
            region: 'ca-central-1'
        });
        const allMetadata = await listAllObjectsFromS3Bucket(turtleBucket, 'turtleverse.albums', `${process.env.NEXT_PUBLIC_GENERATION}/metadata`);
        /* uploaded hardhat produced abi to s3 to consume here */
        const artifact = await getAbiFromBucket(turtleBucket, 'turtleverse.albums');

        setAllMetadata(allMetadata);
        // setAbi(artifact.abi);
        setAbi(Turtleverse.abi);
    }, [])


    async function mint() {
        if (requestedAmount === 0) { alert('Must select at least one token.'); return; }
        if (requestedAmount > 4) { alert('Cannot mint more than 4 tokens at once.'); return; }
        if (!isAuthenticated) { alert('You must enable metamask to mint tokens. Please try again after connecting your wallet by clicking the link in the nav burger.'); return; }
        else 
        {
            setIsMinting(true)
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const addr = process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK;
            const tvc = new ethers.Contract(addr, abi, signer)
            let price;

            // if price returns an undefined value, we know there is no sale so we can kill execution
            try {
                price = await tvc.price();
            } catch(err) {
                setIsMinting(false);
                setStageMedia([]);
                setRequestedArray([]);
                alert(err);
                return;
            }

            // randomly select tokens based on amount requested 
            // arbitrarily get 50 pieces of metadata, odds are there will be at least the amount selected non-minted
            let tokensToMintMetadata;
            const metadata = allMetadata.sort(() => Math.random() - Math.random()).slice(0, 50)
            const s3 = new AWS.S3({
                accessKeyId: galleryState.accessParams.Credentials.AccessKeyId,
                secretAccessKey: galleryState.accessParams.Credentials.SecretAccessKey,
                sessionToken: galleryState.accessParams.Credentials.SessionToken,
                bucket: 'turtleverse.albums',
                region: 'ca-central-1'
            })
            
            // if price is 0, we know we're in the giveaway, so we have to call specific function to grab special 
            // json from bucket 
            if (price.toString() === '0') { 
                tokensToMintMetadata = await getRequestedGiveawayMetadata(user, s3) 
                if (tokensToMintMetadata.length > 0) {
                    setRequestedAmount(tokensToMintMetadata.length)
                    setRequestedArray(tokensToMintMetadata.map(tmd => {
                        return "/turtles.gif"
                    }))
                } else {
                    alert('Your giveaway tokens have already been minted, or there are no tokens reserved for this address')
                    setRequestedAmount(0);
                    setRequestedArray([]);
                    setStageMedia([]);
                    return;
                }
            }
            else { tokensToMintMetadata = await getRequestedMetadata(metadata, s3, requestedAmount); }

            let l = tokensToMintMetadata.length;
            const tokensAmount = ethers.BigNumber.from(l);
            const v = price.mul(tokensAmount);
            let tx; 
            let imageUrl;
    
            while (l > 0) {
                const md = tokensToMintMetadata[l-1]
                try {
                    const f = new File([md.turtle.Body], `${md.metadata.name}.png`);
                    const hash = await pinFileToIPFS(f);
                    imageUrl = `https://turtleverse.mypinata.cloud/ipfs/${hash}`
                    setStageMedia(stageMedia => [...stageMedia, imageUrl])                    
                } catch (err) {
                    setIsMinting(false);
                    setStageMedia([]);
                    setRequestedArray([]);
                    alert(err.message + 'We\'re sorry, please try again later.')
                    return;
                }
                l--;
            }

            try {
                let transaction = await tvc.mintTokens(tokensAmount, { value: v })
                tx = await transaction.wait();
            } catch {
                setIsMinting(false);
                setStageMedia([]);
                setRequestedArray([]);
                alert('Something went wrong trying to mint your token(s). Please try again later.');
                return;
            }

            try {
                const tokenIds = tx.events.map(ev => {
                    return ev.args.tokenId.toNumber();
                })

                tokensToMintMetadata.forEach(async (tmd, i) => {
                    tmd.metadata.transactionHash = tx.transactionHash;
                    tmd.metadata.minted = true;
                    await updateRequestedMetadata(tmd.metadata, s3);
                    let obj = {};
                    obj.name = '#'+tmd.metadata.name.split('_')[0];
                    obj.image = imageUrl;
                    obj.attributes = tmd.metadata.attributes;
                    await pinJSONToIPFS(obj, tokenIds[i])
                })
            } catch (err) {
                setIsMinting(false)
                setStageMedia([]);
                alert('Something went wrong uploading your token(s) metadata to IPFS. Please reach out to us directly and we\'ll clear this up!');
                return;
            }
        }
    }

    function onSelectAmount(e) { 
        var a = []
        for (let i = 0; i < e.target.value; i++) {
            a.push("/turtles.gif")
        }
        setRequestedAmount(e.target.value);
        // initialize empty array that is same length as requested amount, and full of default turtle gifs
        setRequestedArray(a);
        setStageMedia([]);
    }

    return (
        <div className="minter">
            <div className="minter-image" style={{textAlign: "center"}}>
                <div>
                    <select onChange={(e) => onSelectAmount(e)}>
                        <option>0</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                    </select>
                    <button type="submit" onClick={() => mint()}>
                        MINT
                    </button>
                </div>
                <br/>
            </div>
            {
                isMinting ?
                <>
                    <div className="minting-stage">
                        {
                            requestedArray && requestedArray.map((x,i) => {
                                let src;
                                if (stageMedia[i] !== undefined) { src = stageMedia[i] } 
                                else { src = x }
                                return <div key={i} className="minting-stage-tile"><img src={src} alt={src} width={300} height={300}/></div>
                            })
                        }
                    </div>
                </>
                :
                null
            }
        </div>
    )
}