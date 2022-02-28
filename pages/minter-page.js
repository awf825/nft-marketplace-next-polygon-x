import Image from 'next/image'
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { create as ipfsHttpClient } from 'ipfs-http-client';
// import MetaMaskSvg from './MetaMaskSvg';
import {
    listAllObjectsFromS3Bucket,
    getRequestedMetadata,
    updateRequestedMetadata
} from './helpers/S3.js'

import AWS from 'aws-sdk'
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { useEffect, useState, useContext } from 'react'

import {
    GalleryContext,
} from "../contexts/GalleryContext.js";

AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

import Turtleverse from '../artifacts/contracts/Turtleverse.sol/Turtleverse.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function MinterPage() {
    const [signer, setSigner] = useState(null);
    const [requestedAmount, setRequestedAmount] = useState(0)
    const [allMetadata, setAllMetadata] = useState([])
    const [galleryState, dispatch] = useContext(GalleryContext);
    const { authenticate, isAuthenticated, logout, user } = useMoralis();

    useEffect(async () => {
        const turtleBucket = new AWS.S3({
            accessKeyId: galleryState.accessParams.Credentials.AccessKeyId,
            secretAccessKey: galleryState.accessParams.Credentials.SecretAccessKey,
            sessionToken: galleryState.accessParams.Credentials.SessionToken,
            bucket: 'turtleverse.albums',
            region: 'ca-central-1'
        })
        const allMetadata = await listAllObjectsFromS3Bucket(turtleBucket, 'turtleverse.albums', 'generation-five/metadata')
        console.log(allMetadata)
        setAllMetadata(allMetadata)
    }, [])

    // useEffect(async () => {
    //     alert(
    //         'YOU MUST ENABLE METAMASK TO MINT. IF YOU ARE BROWSING ON YOUR DESKTOP, PLEASE ENABLE THE METAMASK BROWSER EXTENSION. IF YOU ARE BROWSING ON YOUR PHONE, PLEASE USE THE WEB BROWSER FEATURE OF THE NATIVE METAMASK APP.'
    //     )
    // }, [])

    async function mint() {
        if (requestedAmount === 0) { alert('must select tokens'); return;}
        /*
            "A Provider in ethers is a read-only abstraction to access the blockchain data."
            https://docs.ethers.io/v5/api/providers/provider/
            https://docs.ethers.io/v5/api/contract/contract/
            https://docs.ethers.io/v5/api/utils/bignumber/

            PRIVATE BUSINESS INTERFACE IN S3
            PUBLIC MINTED INTERFACE IN PINATA (IPFS)

            MINT FUNCTION RULES AFTER BUTTON PUSH:
            3) Fetch what is needed from the bucket. Record ids for later: some values will be written to 
               PRIVATE METADATA (S3) to be used to identify sold nfts
            4) Once all resources (images and metadata) are obtained, push these to pinata, and await the pin hash id
               to be sent as the token to be minted on blockchain 
            5) Once a response is returned from the ethereum tx, write to the private metadata (get ids from step 3)
        */

        // RETURN IF TOKENS AMOUNT = 0  !!!!!!!
        // randomly select tokens based on amount requested 
        // maybe move this to the s3 function in order to filter by whether or not already minted?
        const tokensToMint = allMetadata.sort(() => Math.random() - Math.random()).slice(0, requestedAmount)
        const s3 = new AWS.S3({
            accessKeyId: galleryState.accessParams.Credentials.AccessKeyId,
            secretAccessKey: galleryState.accessParams.Credentials.SecretAccessKey,
            sessionToken: galleryState.accessParams.Credentials.SessionToken,
            bucket: 'turtleverse.albums',
            region: 'ca-central-1'
        })

        const tokensToMintMetadata = await getRequestedMetadata(tokensToMint, s3);

        //console.log('tokensToMint: ', tokensToMint)

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)

        let owner = await tvc.owner();
        let balance = await provider.getBalance(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK)
        let price = await tvc.price();
        balance = balance.toString()
        price = price;

        console.log('price: ', price);
        console.log('balance: ', balance)
        console.log('owner: ', owner)

        // requestedAmount is the state hook for select dropdown
        const tokensAmount = ethers.BigNumber.from(requestedAmount);
        const v = price.mul(tokensAmount)

        let metadataTokenPaths = [];
        let l = tokensToMintMetadata.length;
        while (l > 0) {
            const md = tokensToMintMetadata[l-1]
            try {
                const addedImage = await client.add(
                    new File([md.turtle.Body], `${md.metadata.name}.png`),
                    {
                        progress: (p) => console.log(`received: ${p}`)
                    }
                )
                const imageUrl = `https://ipfs.infura.io/ipfs/${addedImage.path}`;
                // TODO: NOT ALL METADATA IS NEEDED ON IPFS i.e PUBLIC INTERFACE
                md.metadata.image = imageUrl;

                const addedMetadata = await client.add(
                    new File([JSON.stringify(md.metadata)], `${md.metadata.name}.json`),
                    {
                        progress: (p) => console.log(`received: ${p}`)
                    }
                )
                console.log('addedMetadata: ', addedMetadata);
                console.log('addedImage: ', addedImage)
                metadataTokenPaths.push(addedMetadata.path)
            } catch (err) {
                console.log(err)
            }
            l--;
        }

        tvc.mintTokens(tokensAmount, metadataTokenPaths, { value: v })
        .then(resp => {
            // send updated metadata back to s3
            console.log(resp)
            try {
                tokensToMintMetadata.forEach(async tmd => {
                    tmd.metadata.transactionHash = resp.hash;
                    tmd.metadata.minted = true;
                    //debugger
                    await updateRequestedMetadata(tmd.metadata, s3);
                })
                alert('tx complete! ', resp)
            } catch (err) {
                alert(err.data.message)
            }
        })
        .catch(err => {
            alert(err.data.message)
        });  
    }

    async function withdraw() {
        //console.log('withdraw')
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)

        const bn = ethers.BigNumber.from("100000000000000000")
        await tvc.withdraw('0xB154Dc24df1404946F304FFcDA78378BdF6501AA', bn, {gasLimit:"300000000000000000"});
        
        try {
            /* This address is 'Account 1' in my metaamask */
            alert('ether withdrawn')
        } catch(error) {
            console.error(error);
            alert('could not withdraw: ', error)
        }
    }

    async function startGiveaway() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            await tvc.startGiveaway();
            alert('GIVEAWAY STARTED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }

    async function stopGiveaway() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            await tvc.pauseGiveaway();
            alert('GIVEAWAY PAUSED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }

    async function startPreSale() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            const bn = ethers.BigNumber.from(3)
            await tvc.startPresale(bn);
            alert('PRESALE STARTED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }

    async function stopPreSale() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            await tvc.pausePresale();
            alert('PRESALE PAUSED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }

    async function startPublicSale() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            await tvc.startPublicSale();
            alert('PUBLIC SALE STARTED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }

    async function stopPublicSale() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        
        try {
            await tvc.pausePublicSale();
            alert('PUBLIC SALE PAUSED!')
        } catch(error) {
            alert('something is wrong: ', error);
        }
    }
    
    async function addToLists(e) {
        e.preventDefault();
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, Turtleverse.abi, signer)
        // const address = await signer.getAddress();
        
        const giveawayAddress = e.target[0].value;
        const whitelistAddress = e.target[1].value;

        try {
            if (giveawayAddress) {
                await tvc.addToGiveawayList([giveawayAddress]);
            } if (whitelistAddress) {
                await tvc.addToWhitelist([whitelistAddress]);
            }
            alert('addresses added to whitelist(s)')
        } catch (error) {
            console.error(error)
            alert("something went wrong trying to add to whitelist")
        }
        //debugger
    }

    function onSelectAmount(e) {
        console.log('event: ', e.target.value)
        setRequestedAmount(e.target.value)
    }

    /*
        Make button to pause and activate different sales.
        Button to add and remove from whitelist, giveaway list
    */

    return (
        <div className="minter">
            <div className="minter-image" style={{textAlign: "center"}}>
                {/* <Image src={"/turtles.gif"} width={500} height={500}/> */}
                {/* <h1>MINT MACHINE COMING SOON</h1> */}
                <div>
                    {
                        isAuthenticated ? 
                        <div>
                            <select onChange={(e) => onSelectAmount(e)}>
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>5</option>
                                <option>10</option>
                                <option>100</option>
                            </select>
                            <button type="submit" onClick={() => mint()}>
                                MINT
                            </button>
                            <br/>
                            <button onClick={() => logout()}>DISCONNECT METAMASK WALLET</button> 
                        </div>
                        : 
                        <button onClick={() => authenticate()}>CONNECT METAMASK WALLET</button>
                    }
                </div>
                <br/>
                <div>
                    <button type="submit" onClick={() => withdraw()}>WITHDRAW</button>
                    <button type="submit" onClick={() => startGiveaway()}>START GIVEAWAY</button>
                    <button type="submit" onClick={() => stopGiveaway()}>STOP GIVEAWAY</button>
                    <button type="submit" onClick={() => startPreSale()}>START PRESALE</button>
                    <button type="submit" onClick={() => stopPreSale()}>STOP PRESALE</button>
                    <button type="submit" onClick={() => startPublicSale()}>START PUBLIC SALE</button>
                    <button type="submit" onClick={() => stopPublicSale()}>STOP PUBLIC SALE</button>
                    <form onSubmit={(e) => addToLists(e)}>
                        <input id="give" type="text" placeholder="giveaway address"/>
                        <input id="white" type="text" placeholder="whitelist address"/>
                        <button type="submit">SUBMIT</button>
                    </form>
                </div>
            </div>
        </div>
    )
}