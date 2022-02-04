// import { Twitter, Discord } from 'react-bootstrap-icons';
import * as Icon from 'react-bootstrap-icons'

export default function Footer() {
    return (
        <div id="officialLinks">
            {/* OFFICIAL LINKS */}
            <div>
                <a href="https://www.npmjs.com/package/react-sticky-header" target="_blank" rel="noreferrer" ><Icon.Twitter size="2x" /></a>
            </div>
            <div>
                <a href="https://www.npmjs.com/package/react-bootstrap-icons" target="_blank" rel="noreferrer" ><Icon.Discord /></a>
            </div>
        </div>
    )
}

// import { useMoralis } from 'react-moralis';
// import MetaMaskSvg from './MetaMaskSvg';

//     return (
//         <div className="header">
//             <Burger open={open}/>
//             {/* 
//             {
//                 open 
//                 ?
//                 <div className="navburger-open">
//                     <button onClick={() =>  setOpen(false)}>CLOSE</button>
//                 </div>
//                 :
//                 <div className="navburger-closed">

//                 </div>
//             */}
//             <SlidingMenu open={open}/>
//         </div>
//     )
//     // return (
//     //     <div></div>
//     // )
//     // const { authenticate, isAuthenticated, logout, user } = useMoralis();
//     // return ( 
//         //     <div className='header'>
//         //         <div className="logo">
//         //             <Image src="/TV_Logo_white.png" alt="tv-white" width="75" height="75" style={{ textAlign: 'left !important'}}/>
//         //         </div>
//     //         <div className="header-icons">
//     //             <div>
//     //                 {
//     //                     isAuthenticated ? <button onClick={() => logout()}><MetaMaskSvg /></button> : 
//     //                     <button onClick={() => authenticate()}><MetaMaskSvg /></button>
//     //                 }
//     //             </div>
//     //             <div>
//     //                 {
//     //                     isAuthenticated ? "DISCONNECT METAMASK >>>" : "CONNECT METAMASK >>>"
//     //                 }
//     //             </div>
//     //         </div>
//     //     </div>
    
//     // )
// }