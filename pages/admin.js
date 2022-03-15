import { useEffect, useState, useContext } from 'react';
import { getAbiFromBucket } from '../helpers/S3.js';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import {
    GalleryContext,
} from "../contexts/GalleryContext.js";

import AWS, { Connect } from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

export default function Admin() {
    const [galleryState, dispatch] = useContext(GalleryContext);
    const [abi, setAbi] = useState(null);
    useEffect(async () => {
        const turtleBucket = new AWS.S3({
            accessKeyId: galleryState.accessParams.Credentials.AccessKeyId,
            secretAccessKey: galleryState.accessParams.Credentials.SecretAccessKey,
            sessionToken: galleryState.accessParams.Credentials.SessionToken,
            bucket: 'turtleverse.albums',
            region: 'ca-central-1'
        });
        /* uploaded hardhat produced abi to s3 to consume here */
        const artifact = await getAbiFromBucket(turtleBucket, 'turtleverse.albums');

        setAbi(artifact.abi);
    }, [])

    async function withdraw() {
        // 500000000000000000 = .5 eth
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        let balance = await provider.getBalance(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK);
        balance = balance.toString();
        const gasLimit = (balance*.00000000009).toString()
        console.log('balance: ', balance)

        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)

        const bn = ethers.BigNumber.from(process.env.NEXT_PUBLIC_WITHDRAWAL_AMOUNT)
        await tvc.withdraw(process.env.NEXT_PUBLIC_AIDEN, bn);
        
        try {
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)

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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
        try {
            const bn = ethers.BigNumber.from(25)
            await tvc.startPublicSale(bn);
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
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
        const tvc = new ethers.Contract(process.env.NEXT_PUBLIC_TV_CONTRACT_ADDRESS_RINK, abi, signer)
        
        const glv = e.target[0].value;
        const wlv = e.target[1].value;

        const giveawayAddresses = (glv.length > 0) ? glv.split(',') : [];
        const whitelistAddresses = (wlv.length > 0) ? wlv.split(',') : [];

        try {
            if (giveawayAddresses.length > 0) {
                await tvc.addToGiveawayList(giveawayAddresses);
            } if (whitelistAddresses.length > 0) {
                await tvc.addToWhitelist(whitelistAddresses);
            }
            alert('addresses added to whitelist(s)')
        } catch (error) {
            console.error(error)
            alert("something went wrong trying to add to whitelist")
        }
    }
    return (
        <div className="admin">
            <div className="admin-btns">
                <button type="submit" onClick={() => withdraw()}>WITHDRAW</button>
                <button type="submit" onClick={() => startGiveaway()}>START GIVEAWAY</button>
                <button type="submit" onClick={() => stopGiveaway()}>STOP GIVEAWAY</button>
                <button type="submit" onClick={() => startPreSale()}>START PRESALE</button>
                <button type="submit" onClick={() => stopPreSale()}>STOP PRESALE</button>
                <button type="submit" onClick={() => startPublicSale()}>START PUBLIC SALE</button>
                <button type="submit" onClick={() => stopPublicSale()}>STOP PUBLIC SALE</button>
            </div>
            <div className="admin-lists">
                <form onSubmit={(e) => addToLists(e)}>
                    <input id="give" type="text" placeholder="giveaway address"/>
                    <input id="white" type="text" placeholder="whitelist address"/>
                    <input id="remove" type="text" placeholder="remove from whitelist"/>
                    <button type="submit">SUBMIT</button>
                </form>
            </div>
        </div>
    )
}