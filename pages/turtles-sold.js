import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

// const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS_ROPSTEN
// const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS_ROPSTEN

// const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS_RINKEBY
// const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS_RINKEBY

const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS
const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS

import TurtleMinter from '../artifacts/contracts/TurtleMinter.sol/TurtleMinter.json';
import Biz from '../artifacts/contracts/Biz.sol/Biz.json';

export default function TurtlesSold() {
    const [soldTurtles, setSoldTurtles] = useState([])

    useEffect(() => {
        loadSoldTurtles()
    }, [])

    async function loadSoldTurtles() {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        
        const marketContract = new ethers.Contract(bizAddress, Biz.abi, signer)
        const tokenContract = new ethers.Contract(turtleMinterAddress, TurtleMinter.abi, provider)
        const data = await marketContract.fetchTurtlesSold()
        
        const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
        }
        return item
        }))
        setSoldTurtles(items)
    }

    return (
        <div className="flex justify-center">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {
                soldTurtles.map((nft, i) => (
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <img src={nft.image} className="rounded" />
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )
}