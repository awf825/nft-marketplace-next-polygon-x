import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

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

import AWS, { ConnectContactLens } from 'aws-sdk'
import { useMoralis } from 'react-moralis';
import { useEffect, useState, useContext } from 'react'

import {
    GalleryContext,
} from "../contexts/GalleryContext.js";

import LoadingOverlay from './components/LoadingOverlay';

AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

export default function MinterPage() {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedArray, setRequestedArray] = useState([])
    const [stageMedia, setStageMedia] = useState([])
    const [isMinting, setIsMinting] = useState(false);
    const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);

    const [bucket, setBucket] = useState({})
    const [abi, setAbi] = useState([]);
    const [allMetadata, setAllMetadata] = useState([]);
    const [saleStructure, setSaleStructure] = useState({});
    const [isGathering, setIsGathering] = useState({
        loading: false,
        text: ""
    })
    const [setTxHash, txHash] = useState("");
    const [setTokenIds, tokenIds] = useState([]);

    const [galleryState, dispatch] = useContext(GalleryContext);
    const { isAuthenticated, user } = useMoralis();

    useEffect(async () => {
        setIsGathering(
            {
                loading: true,
                text: "Please wait while we gather the smart contract..."
            }
        )
        let bucket;
        let price;
        const storedParams = localStorage.getItem("stsCredentials");
        if (storedParams !== null) {
            const json = JSON.parse(storedParams);
            try {
                bucket = new AWS.S3({
                    accessKeyId: json.Credentials.AccessKeyId,
                    secretAccessKey: json.Credentials.SecretAccessKey,
                    sessionToken: json.Credentials.SessionToken,
                    bucket: 'turtleverse.albums',
                    region: 'ca-central-1'
                })
                setBucket(bucket)
            } catch (err) {
                console.log(err.code)
                if (err.code === "ExpiredToken") {
                    const sts = new AWS.STS();
                    sts.assumeRole({
                        DurationSeconds: 1800,
                        ExternalId: 'turtleverse-assume-s3-access',
                        RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
                        RoleSessionName: 'TV-Gallery-View'
                    }, async (err, data) => {
                        if (err) throw err;
                        localStorage.setItem("stsCredentials", JSON.stringify(data));
                        bucket = new AWS.S3({
                            accessKeyId: data.Credentials.AccessKeyId,
                            secretAccessKey: data.Credentials.SecretAccessKey,
                            sessionToken: data.Credentials.SessionToken,
                            bucket: 'turtleverse.albums',
                            region: 'ca-central-1'
                        })
                    })
                    setBucket(bucket)
                }
            }
        } else {
            const sts = new AWS.STS();
            sts.assumeRole({
                DurationSeconds: 1800,
                ExternalId: 'turtleverse-assume-s3-access',
                RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
                RoleSessionName: 'TV-Gallery-View'
            }, async (err, data) => {
                if (err) throw err;
                localStorage.setItem("stsCredentials", JSON.stringify(data));
                bucket = new AWS.S3({
                    accessKeyId: data.Credentials.AccessKeyId,
                    secretAccessKey: data.Credentials.SecretAccessKey,
                    sessionToken: data.Credentials.SessionToken,
                    bucket: 'turtleverse.albums',
                    region: 'ca-central-1'
                })
                setBucket(bucket)
            })
        }
        const allMetadata = await listAllObjectsFromS3Bucket(bucket, 'turtleverse.albums', `${process.env.NEXT_PUBLIC_GENERATION}/metadata`);
        setAllMetadata(allMetadata);
        /* uploaded hardhat produced abi to s3 to consume here */
        const artifact = await getAbiFromBucket(bucket, 'turtleverse.albums');

        setAbi(artifact.abi);
        try {
            console.log('abi gathered')
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const addr = process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS;
            const tvc = new ethers.Contract(addr, artifact.abi, signer)
            price = await tvc.price();
            setSaleStructure(
                {
                    price: price,
                    contract: tvc,
                    provider: provider,
                    signer: signer
                }
            )
            setIsGathering(false)
        } catch(err) {
            setSaleStructure({})
            setIsGathering(
                {
                    loading: false,
                    text: ""
                }
            )
            console.error(err)
            alert("There was a problem identifying the state of sale: there is most likely no sale running at this time.");
            return;
        }
        return;
    }, [])

    async function mint() {
        if (requestedAmount === 0) { alert('Must select at least one token.'); return; }
        if (requestedAmount > 4) { alert('Cannot mint more than 4 tokens at once.'); return; }
        if (!isAuthenticated) { alert('You must enable metamask to mint tokens. Please try again after connecting your wallet by clicking the link in the nav burger.'); return; }
        else 
        {
            setIsMinting(true)
            // randomly select tokens based on amount requested 
            // arbitrarily get 50 pieces of metadata, odds are there will be at least the amount selected non-minted
            // may have to increase this number as sale goes on, or just rethink this scheme...
            let tokensToMintMetadata;
            const metadata = allMetadata.sort(() => Math.random() - Math.random()).slice(0, 50)
            
            // if price is 0, we know we're in the giveaway, so we have to call specific function to grab special 
            // json from bucket 
            if (saleStructure.price.toString() === '0') { 
                tokensToMintMetadata = await getRequestedGiveawayMetadata(user, bucket) 
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
            else { tokensToMintMetadata = await getRequestedMetadata(metadata, bucket, requestedAmount); }

            let l = tokensToMintMetadata.length;
            const tokensAmount = ethers.BigNumber.from(l);
            const v = saleStructure.price.mul(tokensAmount);
            let tx; 
            let k = 0;
            let imageUrls = [];
            while (k < l) {
                try {
                    let md = tokensToMintMetadata[k]
                    const f = new File([md.turtle.Body], `${md.metadata.name}.png`);
                    const hash = await pinFileToIPFS(f);
                    let imageUrl = `https://turtleverse.mypinata.cloud/ipfs/${hash}`
                    setStageMedia(stageMedia => [...stageMedia, imageUrl]);
                    imageUrls.push(imageUrl);  
                } catch (err) {
                    setIsMinting(false);
                    setStageMedia([]);
                    setRequestedArray([]);
                    console.error(err)
                    alert('We\'re sorry, something went wrong uploading these images to IPFS. Please try again later.')
                    return;
                }
                k++;              
            }

            try {
                let transaction = await saleStructure.contract.mintTokens(tokensAmount, { value: v })
                setIsGathering({
                    loading: true,
                    text: "Please take note of the contract address, transaction hash, and tokenIds we are about to provide for you..."
                })
                tx = await transaction.wait();
            } catch (err) {
                setIsMinting(false);
                setStageMedia([]);
                setRequestedArray([]);
                alert('Something went wrong trying to mint your token(s) to the blockchain. Please try again later.');
                return;
            }

            
            try {
                const tokenIds = tx.events.map(ev => {
                    return ev.args.tokenId.toNumber()
                })

                localStorage.setItem("tokenIds", tokenIds);
                localStorage.setItem("tx", tx.transactionHash);

                tokensToMintMetadata.forEach(async (tmd, i) => {
                    tmd.metadata.transactionHash = tx.transactionHash;
                    tmd.metadata.minted = true;
                    await updateRequestedMetadata(tmd.metadata, bucket);
                    let obj = {};
                    obj.name = '#'+tmd.metadata.name.split('_')[0];
                    obj.image = imageUrls[i];
                    obj.description = "This is a test description of the Turtleverse!";
                    obj.attributes = tmd.metadata.attributes;
                    await pinJSONToIPFS(obj, tokenIds[i])
                })

                setIsGathering({
                    loading: false,
                    text: ""
                })
                setIsMinting(false)
                alert(
                    `
                    Your transaction is complete! 
                    `
                );
                return;
            } catch (err) {
                setIsLoadingTransaction(false)
                setIsMinting(false)
                setStageMedia([]);
                setIsGathering({
                    loading: false,
                    text: ""
                })
                alert('Something went wrong uploading your token(s) metadata to IPFS. Please reach out to us directly on our Discord and we\'ll clear this up!');
                return;
            }
        }
    }

    function onSelectAmount(e) { 
        console.log('saleStructure: ', saleStructure)
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
            {
                (isGathering && isGathering.loading)
                ?
                <LoadingOverlay isGathering={isGathering}/>
                :
                null
            }
            <div className="minter-image" style={{textAlign: "center"}}>
                <div>
                    {
                        ( ( Object.keys(saleStructure).length > 0 ) && ( saleStructure.price.toString() !== '0' ) ) 
                        ?
                        <select onChange={(e) => onSelectAmount(e)}>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                        </select>
                        : 
                        null
                    }
                    <button className="mint-button" type="submit" onClick={() => mint()}>
                        MINT
                    </button>
                </div>
                <br/>
            </div>
            <div>
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
                    <>
                        <div className="post-sale-info">
                            <p>Transaction Hash: {localStorage.getItem("tx")}</p>
                            <p>Contract Address: {saleStructure.contract && saleStructure.contract.address}</p>
                            <p>Token Ids: {localStorage.getItem("tokenIds")}</p>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}