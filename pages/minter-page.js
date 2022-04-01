import { ethers } from 'ethers';
import { Image } from 'next/image';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';

import ConnectButton from "./components/ConnectButton";

// import MetaMaskSvg from './MetaMaskSvg';
import {
    listAllObjectsFromS3Bucket,
    getRequestedMetadata,
    updateRequestedMetadata,
    getRequestedGiveawayMetadata,
    getAbiFromBucket
} from '../helpers/S3.js'

import AWS, { Connect } from 'aws-sdk'
import { useMoralis } from 'react-moralis';
import { Moralis } from 'moralis'
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

const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET
const auth = 'Basic '+projectId+':'+projectSecret 
// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

export default function MinterPage() {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedArray, setRequestedArray] = useState([])

    const [abi, setAbi] = useState([]);
    const [allMetadata, setAllMetadata] = useState([]);

    const [stageMedia, setStageMedia] = useState([])
    const [isMinting, setIsMinting] = useState(false);

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
        if (!isAuthenticated) { alert('You must enable metamask to mint tokens. Please try again after connecting your wallet by clicking the link in the nav burger.'); return; }
        else 
        {
            /*
                "A Provider in ethers is a read-only abstraction to access the blockchain data."
                https://docs.ethers.io/v5/api/providers/provider/
                https://docs.ethers.io/v5/api/contract/contract/
                https://docs.ethers.io/v5/api/utils/bignumber/

                Trying moralis for IPFS, may want to take hook approach, is this main library too clunky ?
                https://docs.moralis.io/moralis-dapp/files/ipfs
                https://forum.moralis.io/t/moralis-react-savefile-on-ipfs/1289
            */
            setIsMinting(true)
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const addr = process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK;
            const tvc = new ethers.Contract(addr, abi, signer)
        
            // let owner = await tvc.owner();
            let balance = await provider.getBalance(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK)
            let price = await tvc.price();
            balance = balance.toString();
            price = price;

            let tokensToMintMetadata;
            // randomly select tokens based on amount requested 
            // maybe move this to the s3 function in order to filter by whether or not already minted?
            // arbitrarily get 25 pieces of metadata, odds are there will be at least the amount selected non-minted
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
            if (price.toString() === '0') { tokensToMintMetadata = await getRequestedGiveawayMetadata(user, s3) }
            else { tokensToMintMetadata = await getRequestedMetadata(metadata, s3, requestedAmount); }

            console.log('price: ', price);
            console.log('balance: ', balance);

            const tokensAmount = ethers.BigNumber.from(requestedAmount);
            const v = price.mul(tokensAmount);
    
            let metadataTokenPaths = [];
            let l = tokensToMintMetadata.length;
            while (l > 0) {
                const md = tokensToMintMetadata[l-1]
                try {
                    const data = new File([md.turtle.Body], `${md.metadata.name}.png`)
                    const file = new Moralis.File(data.name, data)
                    await file.saveIPFS();
                    console.log("file.ipfs(), file.hash()): ", [file.ipfs(), file.hash()]);

                    let obj = {}
                    let f = file.ipfs();
                    setStageMedia(stageMedia => [...stageMedia, f])
                    
                    obj.name = md.metadata.name;
                    obj.image = f;
                    obj.attributes = md.metadata.attributes;
                    obj.comboCode = md.metadata.comboCode;

                    const metadata = new Moralis.File(`${md.metadata.name}.json`, { base64 : Buffer.from(JSON.stringify(obj)).toString('base64') });
                    await metadata.saveIPFS()
                    console.log('metadata: ', metadata)
                    
                    metadataTokenPaths.push(metadata._hash)
                } catch (err) {
                    console.log(err)
                }
                l--;
            }

           tvc.mintTokens(tokensAmount, metadataTokenPaths, { value: v })
           .then(resp => {
               try {
                   tokensToMintMetadata.forEach(async tmd => {
                       tmd.metadata.transactionHash = resp.hash;
                       tmd.metadata.minted = true;
                       await updateRequestedMetadata(tmd.metadata, s3);
                    })
                    alert('Transaction complete! Thank you for ', resp)
                    setIsMinting(false)
                    setStageMedia([]);
                } catch (err) {
                    alert(err.data.message)
                }
            })
            .catch(err => { 
                console.log(err)
            });  
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
                {/* <Image src={"/turtles.gif"} width={500} height={500}/> */}
                {/* <h1>MINT MACHINE COMING SOON</h1> */}
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