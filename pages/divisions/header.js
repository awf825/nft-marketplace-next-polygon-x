import Image from 'next/image'
import React from 'react'
import { useMoralis } from 'react-moralis'

export default function Header() {
    const { authenticate, isAuthenticated, logout, user } = useMoralis();
    return (
        <div className="header">
            <div className="logo">
                <Image src="/TV_Logo_white.png" alt="tv-white" width="75" height="75" style={{ textAlign: 'left !important'}}/>
            </div>
            {/* <div className="auth"> */}
                {
                    isAuthenticated ? 
                    <button onClick={() => logout()}>DISCONNECT WALLET</button> : 
                    <button onClick={() => authenticate()}>CONNECT WALLET</button>
                }
            {/* </div> */}
        </div>
    )
}