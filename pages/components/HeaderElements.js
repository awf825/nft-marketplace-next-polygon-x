import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';

const Nav = styled.nav`
  width: 100%;
  height: 55px;
  padding: 0 20px;
  position: fixed;
  background-color: black;
  height: 7vh;
  width: 100%;
  z-index: 9997;
`

const StyledBurger = styled.div`
  width: 2rem;
  height: 2rem;
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 9999;
  display: flex;
  justify-content: space-around;
  flex-flow: column nowrap;
  div {
    width: 2rem;
    height: 0.25rem;
    background-color: white;
    border-radius: 10px;
    transform-origin: 1px;
    transition: all 0.3s linear;
    &:nth-child(1) {
      transform: ${({ open }) => open ? 'rotate(45deg)' : 'rotate(0)'};
    }
    &:nth-child(2) {
      transform: ${({ open }) => open ? 'translateX(100%)' : 'translateX(0)'};
      opacity: ${({ open }) => open ? 0 : 1};
    }
    &:nth-child(3) {
      transform: ${({ open }) => open ? 'rotate(-45deg)' : 'rotate(0)'};
    }
  }
`;

const Menu = styled.ul`
  color: white;
  text-align: center;
  list-style: none;
  display: flex;
  flex-flow: row nowrap;
  z-index: 9998;
  flex-flow: column nowrap;
  background-color: #0D2538;
  position: fixed;
  transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
  top: 0;
  right: 0;
  height: 30vh;
  width: 20vh;
  padding-top: 3.5rem;
  transition: transform 0.3s ease-in-out;
  li {
    color: #fff;
  }
`;

const BrandLogo = styled.div`
height: 5rem;
width: 6rem;
position: fixed;
left: 0;
`

export default function HeaderElements() {
    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [isHome, setIsHome] = useState(true)

    useEffect(() => {
      const p = window.location.pathname;
      if (p === "/") {
        setIsHome(true)
      } else {
        setIsHome(false)
      }
      //console.log('window.location @ sideeffect: ', window.location)
    }, [router.pathname])

    return (
        <div>
            <Nav>
              <BrandLogo><Image  src="/TV_Logo_white.png" alt="tv-white" width="150" height="100" /></BrandLogo>
            </Nav>
            <StyledBurger open={open} onClick={() => setOpen(!open)}>
                <div />
                <div />
                <div />
            </StyledBurger>
            {
              isHome 
              ?
              <Menu open={open}>
                  <Link href="#aboutUs">About Us</Link>
                  <Link href="#ourTeam">Our Team</Link>
                  <Link href="#roadmap">Roadmap</Link>
                  <Link href="/gallery">Gallery</Link>
                  <Link href="#officialLinks">Official Links</Link>
                  <Link href="/minter-page">
                      Mint
                  </Link>
              </Menu> 
              :
              <Menu open={open}>
                <Link href="/">Home</Link>
                <Link href="/gallery">Gallery</Link>
                <Link href="/minter-page">
                    Mint
                </Link>
              </Menu> 
            }
        </div>
    )
}

// import { useMoralis } from 'react-moralis';
// import { Twitter, Discord } from 'react-bootstrap-icons';
// import MetaMaskSvg from './MetaMaskSvg';
// import { useState, useRef } from 'react'
// import Image from 'next/image'


// export default function HeaderElements() {
//     const [open, setOpen] = useState(false)
//     // const [open, setBurgerOpen] = useState(false)

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
//     //                 <a href="https://www.npmjs.com/package/react-sticky-header" target="_blank" rel="noreferrer" ><Twitter /></a>
//     //             </div>
//     //             <div>
//     //                 <a href="https://www.npmjs.com/package/react-bootstrap-icons" target="_blank" rel="noreferrer" ><Discord /></a>
//     //             </div>
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