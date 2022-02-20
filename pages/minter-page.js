import Image from 'next/image'
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
// import MetaMaskSvg from './MetaMaskSvg';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { useEffect, useState, useContext } from 'react'

import {
    GalleryContext,
} from "../contexts/GalleryContext.js";

import Turtleverse from '../artifacts/contracts/Turtleverse.sol/Turtleverse.json';

export default function MinterPage() {
    const [signer, setSigner] = useState(null)
    const [galleryState, dispatch] = useContext(GalleryContext);
    const { authenticate, isAuthenticated, logout, user } = useMoralis();

    // useEffect(async () => {
    //     alert(
    //         'YOU MUST ENABLE METAMASK TO MINT. IF YOU ARE BROWSING ON YOUR DESKTOP, PLEASE ENABLE THE METAMASK BROWSER EXTENSION. IF YOU ARE BROWSING ON YOUR PHONE, PLEASE USE THE WEB BROWSER FEATURE OF THE NATIVE METAMASK APP.'
    //     )
    // }, [])

    async function mint() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const tvc = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", Turtleverse.abi, signer)
        let priceToMint = await tvc.getPriceToMint();
        priceToMint = priceToMint.toString();
        let balance = await tvc.getBalance();

        const amount = 1
        let transaction = await tvc.mintTokens(
            amount, { value: priceToMint }
        )
        let tx = await transaction.wait(); 
        //0x5FbDB2315678afecb367f032d93F642f64180aa3
    }

    return (
        <div className="minter">
            <div className="minter-image" style={{textAlign: "center"}}>
                {/* <Image src={"/turtles.gif"} width={500} height={500}/> */}
                {/* <h1>MINT MACHINE COMING SOON</h1> */}
                <div>
                    {
                        isAuthenticated ? 
                        <div>
                            <button type="submit" onClick={() => mint()}>
                                MINT
                            </button>
                            <button onClick={() => logout()}>DISCONNECT METAMASK WALLET</button> 
                        </div>
                        : 
                        <button onClick={() => authenticate()}>CONNECT METAMASK WALLET</button>
                    }
                </div>
            </div>
        </div>
    )
}