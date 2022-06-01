import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import Select from 'react-select';
import Image from 'next/image';

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

import GTM from "react-gtm-module";

AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      width: state.selectProps.width,
      color: '#000',
      padding: 20,
    }),
  
    control: (_, { selectProps: { display }}) => ({
      backgroundColor: "#000",
      color: "#fff",
      borderTop: "1px solid white",
      borderBottom: "1px solid white",
      borderBottom: '1px white',
      display: "flex",
      width: "100%"
    }),

    placeholder: () => ({
    //   fontSize: "30px"
      fontWeight: "800",
      fontStyle: "italic",
      fontSize: "18px",
      textTransform: "uppercase"
    }),

    indicatorSeparator: () => ({
        display: "none"
    }),

    input: () => ({
        display: "none"
    }),

    singleValue: () => ({
        //   fontSize: "30px"
          color: "#ADD8E6",
          fontWeight: "800",
          fontStyle: "italic",
          fontSize: "28px",
          textTransform: "uppercase"
    }),
}

export default function MinterPage() {
    const [requestedAmount, setRequestedAmount] = useState(0);
    const [requestedArray, setRequestedArray] = useState([])
    const [stageMedia, setStageMedia] = useState([])
    const [isMinting, setIsMinting] = useState(false);
    const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
    const [glowing, setGlowing] = useState(false)

    const [bucket, setBucket] = useState({})
    const [abi, setAbi] = useState([]);
    const [allMetadata, setAllMetadata] = useState([]);
    const [saleStructure, setSaleStructure] = useState({});
    const [isGathering, setIsGathering] = useState({
        loading: false,
        text: ""
    })
    const [confirmationObject, setConfirmationObject] = useState({
        hash: "",
        contract: "",
        tokenIds: []
    })
    const [setTxHash, txHash] = useState("");
    const [setTokenIds, tokenIds] = useState([]);

    const [galleryState, dispatch] = useContext(GalleryContext);
    const { isAuthenticated, user } = useMoralis();

    useEffect(async () => {
        setIsGathering(
            {
                loading: true,
                text: "Please wait, you may be prompted to connect your wallet..."
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
                        DurationSeconds: 43200,
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
                DurationSeconds: 43200,
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
            setIsGathering(
                {
                    loading: false,
                    text: ""
                }
            )
            if (price.toString() === '0') {
                setGlowing(true)
            }
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
        if (( requestedAmount === 0 ) && (saleStructure.price.toString() !== '0')) { alert('Must select at least one token.'); return; }
        if (requestedAmount > 4) { alert('Cannot mint more than 4 tokens at once.'); return; }
        if (!isAuthenticated) { alert('You must enable metamask to mint tokens. Please try again after connecting your wallet by clicking the link in the nav burger.'); return; }
        else 
        {
            setIsMinting(true)
            setConfirmationObject({
                hash: "",
                contract: "",
                tokenIds: []
            })
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
                    setGlowing(false);
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
                    text: "Finalizing transaction..."
                })
                tx = await transaction.wait();
            } catch (err) {
                console.error(err)
                setIsMinting(false);
                setStageMedia([]);
                setRequestedArray([]);
                alert('Something went wrong trying to mint your token(s). Please try again later.'+"\n"+err);
                return;
            }

            
            try {
                const tokenIds = tx.events.map(ev => {
                    return ev.args.tokenId.toNumber()
                })

                // localStorage.setItem("tokenIds", tokenIds);
                // localStorage.setItem("tx", tx.transactionHash);

                tokensToMintMetadata.forEach(async (tmd, i) => {
                    let obj = {};
                    obj.name = '#'+tmd.metadata.name.split('_')[0];
                    obj.image = imageUrls[i];
                    obj.description = "The world today is all about doing things quickly; we often find ourselves in constant motion, never stopping to think about what it is that we're doing or why we started doing it in the first place. This go-go-go state of mind had led to anxiety and stress for many of us around the world. We wanted to create an NFT project that could serve as a reminder that the quick way isn't always the right way and that, when it comes to living our best lives, 'slow and steady, wins the race...' #WAGMI";
                    obj.attributes = tmd.metadata.attributes;
                    await pinJSONToIPFS(obj, tokenIds[i])
                    tmd.metadata.transactionHash = tx.transactionHash;
                    tmd.metadata.minted = true;
                    await updateRequestedMetadata(tmd.metadata, bucket);
                })
                setIsGathering({
                    loading: false,
                    text: ""
                })
                setConfirmationObject({
                    hash: tx.transactionHash,
                    contract: saleStructure.contract.address,
                    tokenIds: tokenIds
                })
                //setIsMinting(false)
                GTM.dataLayer({
                    dataLayer: {
                        event: "mint",
                        tokens: requestedAmount
                    }
                });
                alert(
                    `
                    Your transaction is complete! 
                    `
                );
                return;
            } catch (err) {
                setGlowing(false)
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
        setGlowing(true)
        console.log('saleStructure: ', saleStructure)
        var a = []
        for (let i = 0; i < e.value; i++) {
            a.push("/turtles.gif")
        }
        setRequestedAmount(e.value);
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
                <div className={`minter-controls-wrapper ${isMinting ? "hidden" : ""}`}>
                    {
                        ( ( Object.keys(saleStructure).length > 0 ) && ( saleStructure.price.toString() !== '0' ) ) 
                        ?
                        <div>
                            <Select          
                                onChange={(e) => onSelectAmount(e)}
                                placeholder={"# Of Tokens"}
                                options={[
                                    { value: 0, label: "Zero" },
                                    { value: 1, label: "One" },
                                    { value: 2, label: "Two" },
                                    { value: 3, label: "Three" },
                                    { value: 4, label: "Four" }
                                ]}
                                styles={customStyles} 
                            />
                        </div>
                        : 
                        <div className="giveaway-prompt">
                            <p>CLAIM GIVEAWAY:</p>
                        </div>
                    }
                    <div className={`mint-button ${glowing ? "glowing" : ""}`}>
                        {/* <Image src={"/TV_Logo_black.png"} width={65} height={65}></Image> */}
                        <button onClick={() => mint()}>
                            <div className="button-wrapper">
                                <Image src={"/TV_Logo_black.png"} width={65} height={65}></Image>
                                <div style={{padding: "5px"}}>
                                    MINT
                                </div>
                            </div>
                        </button>
                    </div>
                    {
                        ( ( Object.keys(saleStructure).length > 0 ) && ( saleStructure.price.toString() !== '0' ) ) 
                        ?
                        <div class="price-wrapper">
                            <div><p>{requestedAmount / 20}</p></div>
                            <div><p>ETH</p></div>
                        </div>
                        :
                        null
                    }
                </div>
                <br/>
            <div>
                {
                    isMinting  ?
                    <>
                        <div className="minting-stage">
                            {
                                requestedArray && requestedArray.map((x,i) => {
                                    let src;
                                    if (stageMedia[i] !== undefined) { src = stageMedia[i] } 
                                    else { src = x }
                                    return <div key={i+1} className="minting-stage-tile"><img src={src} alt={src} width={300} height={300}/></div>
                                })
                            }
                        </div>
                        <div className="post-sale-info">
                            <p>
                                Here is the information from your last completed transaction. Please save this information 
                                for identiying your nft on marketplaces, importing it into your MetaMask wallet, and indexing
                                it on Etherscan.
                            </p>
                            <br/>
                            <p>Transaction Hash: {confirmationObject && confirmationObject.hash}</p>
                            <p>Contract Address: {saleStructure.contract && saleStructure.contract.address}</p>
                            <p>Token Ids: {confirmationObject && confirmationObject.tokenIds.map((t,i) => { return <span key={i+1}> {t} | </span> })}</p>
                        </div>
                    </>
                    :
                    null
                }
            </div>
        </div>
    )
}