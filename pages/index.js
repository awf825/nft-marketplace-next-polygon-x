import Header from './divisions/header'
import MintGraphic from './divisions/mint-graphic'
import TVIntro from './divisions/tv-intro'
import Vision from './divisions/vision'
import Founders from './divisions/founders'
import Roadmap from './divisions/roadmap'
import Gallery from './divisions/gallery'
import { useEffect } from 'react'

export default function Home() {
  //const {authenticate, isAuthenticated, isAuthenticating, user, authError, logout} = useMoralis();
  // useEffect(() => {
  //   console.log('side effect at index')
  //   if (!isAuthenticated) {
  //     authenticate();
  //   }

  //   if (user) {
  //     alert('You must connect a Metamask wallet to use this app')
  //   }
  // }, []);
  const getMetaMaskAuth = async () => {
    console.log('getMetaMaskAuth')
    console.log(isAuthenticated)
    if (!isAuthenticated) {
      await authenticate();
    }
    
    // var user = await authenticate();
    // if (user) {
    //   console.log(user)
    // } else {
    //   alert('YOU MUST AUTHENTICATE WITH METAMASK TO USE THIS APP')
    // }
  } 

  return (
    <div className="flex justify-center top-container">
      <Header />
      <MintGraphic />
      <TVIntro />
      <Vision />
      <Founders />
      <Roadmap />
      <Gallery />
      {/* <div className="px-4" style={{ width: '90%' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          WELCOME TO TURTLEVERSE
          <MintGraphic />
        </div>
      </div> */}
    </div>
  )
}