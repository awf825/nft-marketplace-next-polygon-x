/*
  https://medium.com/geekculture/metamask-authentication-with-moralis-in-next-js-33972b242b05
  https://github.com/MoralisWeb3/react-moralis
*/

import '../styles/globals.css'
import Link from 'next/link';
// import { MoralisProvider } from "react-moralis";
// import { DAppProvider } from '@usedapp/core'
// import { Mainnet } from '@usedapp/core/src/model/chain/ethereum.ts'
// import { Local } from '@usedapp/core/src/model/chain/local.ts'

// const config = {
//   readOnlyChainId: Local.chainId,
//   // readOnlyUrls: {
//   //   [Mainnet.chainId]: 'https://mainnet.infura.io/v3/62687d1a985d4508b2b7a24827551934',
//   // },
// }

// const config = {
//   readOnlyChainId: ChainId.Ropsten,
//   readOnlyUrls: {
//     // [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/5ae4b97d4ee44b838e88224cb474d9bf',
//     [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/5ae4b97d4ee44b838e88224cb474d9bf',
//   },
// }

function Marketplace({ Component, pageProps }) {
  return (
    // <MoralisProvider
    //   appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
    //   serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_ID}
    // >
    <div>
      <nav className="border-b p-6">
        <p className="text-4xl font-bold">TURTLEVERSE</p>
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">
              Home
            </a>
          </Link>
          {/* <Link href="/create-item">
            <a className="mr-4 text-pink-500">
              Sell Digital Asset
            </a>
          </Link>
          <Link href="/my-assets">
            <a className="mr-6 text-pink-500">
              My Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-pink-500">
              Creator Dashboard
            </a>
          </Link> */}
          <Link href="/minter-page">
            <a className="mr-6 text-pink-500">
              Mint
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
    // </MoralisProvider>
  )
}

export default Marketplace
