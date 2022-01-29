import { useMoralis } from 'react-moralis';
import Image from 'next/image'
import { Twitter, Discord } from 'react-bootstrap-icons';
import MetaMaskSvg from './MetaMaskSvg';

export default function HeaderElements() {
    const { authenticate, isAuthenticated, logout, user } = useMoralis();
    return ( 
        <div className='header'>
            <div className="logo">
                <Image src="/TV_Logo_white.png" alt="tv-white" width="75" height="75" style={{ textAlign: 'left !important'}}/>
            </div>
            <div className="header-icons">
                <div>
                    <a href="https://www.npmjs.com/package/react-sticky-header" target="_blank"><Twitter /></a>
                </div>
                <div>
                    <a href="https://www.npmjs.com/package/react-bootstrap-icons" target="_blank"><Discord /></a>
                </div>
                <div>
                    {
                        isAuthenticated ? <button onClick={() => logout()}><MetaMaskSvg /></button> : 
                        <button onClick={() => authenticate()}><MetaMaskSvg /></button>
                    }
                </div>
                <div>
                    {
                        isAuthenticated ? "DISCONNECT METAMASK >>>" : "CONNECT METAMASK >>>"
                    }
                </div>
            </div>
        </div>
    
    )
}