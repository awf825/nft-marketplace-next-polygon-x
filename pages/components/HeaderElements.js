import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';
import MetaMaskSvg from './MetaMaskSvg';

const Nav = styled.nav`
  width: 100%;
  height: 55px;
  padding: 0 20px;
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
  z-index: 10000;
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
  font-style: italic;
  font-weight: bold;
  z-index: 9999;
  flex-flow: column nowrap;
  background-color: #0D2538;
  position: fixed;
  transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
  top: 0;
  right: 0;
  height: 35%;
  width: 25%;
  padding-top: 3.5rem;
  transition: transform 0.3s ease-in-out;
  li {
    color: #fff;
  }
  @media only screen and (max-width: 797px) {
     width: 40%;
     height: 40%;
  }
`;

const BrandLogo = styled.div`
background-color: black;
z-index: 9999;
width: 100%;
height: 0%;
position: fixed;
left: 10px;
@media only screen and (max-width: 797px) {
  height: 9%;
}
`

export default function HeaderElements() {
    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [isHome, setIsHome] = useState(true)
    const { isAuthenticated, authenticate, user, logout } = useMoralis();

    useEffect(() => {
      // if (user) { console.log('moralis user: ', user.attributes.ethAddress) }
      const p = window.location.pathname;
      if (p === "/") {
        setIsHome(true)
      } else {
        setIsHome(false)
      }
      //console.log('window.location @ sideeffect: ', window.location)
    }, [router.pathname])

    function handleConnectWallet() {
        authenticate();
    }

    function handleDisconnectWallet() {
        console.log(user.attributes)
        logout();
    }

    return (
        <div className="nav-wrapper">
            <Nav>
              <BrandLogo><Image className="brand-logo" src="/TV_Logo_white.png" alt="tv-white" width="100" height="100"/></BrandLogo>
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
                  <Link href="#hero">About Us</Link>
                  <Link href="#fullBrandDividerOne">Our Team</Link>
                  <Link href="#fullBrandDividerTwo">Roadmap</Link>
                  <Link href="/gallery">Gallery</Link>
                  <Link href="#officialLinks">Official Links</Link>
                  <Link href="/minter-page">
                      Mint
                  </Link>
                  <Link href="#">
                    {
                      user ? (
                          <a onClick={handleDisconnectWallet}><span className="wallet-nav"> Disconnect <MetaMaskSvg /></span></a>
                      ) : (
                          <a onClick={handleConnectWallet}><span className='wallet-nav'>Connect <MetaMaskSvg /></span></a>
                      )
                    }
                  </Link>
                  {
                    ( user && ( user.attributes.ethAddress === process.env.NEXT_PUBLIC_AIDEN ) )
                    ? 
                    <Link href="/admin">
                        Admin
                    </Link>
                    : 
                    null
                  }
              </Menu> 
              :
              <Menu open={open}>
                <Link href="/">Home</Link>
                <Link href="/gallery">Gallery</Link>
                <Link href="/minter-page">
                    Mint
                </Link>
                <Link href="#">
                  {
                    user ? (
                        <a onClick={handleDisconnectWallet}><span className="wallet-nav"> Disconnect <MetaMaskSvg /></span></a>
                    ) : (
                        <a onClick={handleConnectWallet}><span className="wallet-nav">Connect <MetaMaskSvg /></span></a>
                    )
                  }
                </Link>
                {
                    ( user && ( user.attributes.ethAddress === process.env.NEXT_PUBLIC_AIDEN ) )
                    ? 
                    <Link href="/admin">
                        Admin
                    </Link>
                    : 
                    null
                }
              </Menu> 
            }
        </div>
    )
}