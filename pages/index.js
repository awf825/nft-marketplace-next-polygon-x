import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';

import {
  nftAddress, nftMarketAddress
} from '../config.js';

// json rep of smart contracts for client side interaction (see artifcats dir)
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, [])

  async function loadNFTs() {
    // talk to smart contract and load nfts
    const provider = new ethers.providers.JsonRpcProvider(
      //"https://matic-mumbai.chainstacklabs.com"
      //"https://polygon-mumbai.infura.io/v3/5ae4b97d4ee44b838e88224cb474d9bf"
    );
    // here we're taking a ref to the actual nft contract 
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    // we also want to get a ref to the marketContrac: we're gonna get the market items and 
    // we want to get the tokenURI by interacting with the tokenuri
    const marketContract = new ethers.Contract(nftMarketAddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price, 
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded')
  }

  async function buyNft(nft) {
    // allows user to connect toi their wallet. 
    // we want to use web3modal: will look for the instance of ethereum being injected into web browser
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftAddress, nft.tokenId, {
      value: price
    })
    await transaction.wait()
    // loadNFTs should have one less nft after transaction
    loadNFTs()
  }

  if (loadingState === 'loaded' && !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl">No items</h1>
  )

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ masWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
          nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />
              <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
              </div>
            </div>
          ))
        }
        </div>
      </div>
    </div>
  )
}
