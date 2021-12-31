import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
// this is a way for us to interact with ipfs for uploading and downloading
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Moralis from 'moralis';
import Web3Modal from 'web3modal';
import Image from 'next/image';
import axios from 'axios';

// json rep of smart contracts for client side interaction (see artifcats dir)
import TurtleMinter from '../artifacts/contracts/TurtleMinter.sol/TurtleMinter.json';
import Biz from '../artifacts/contracts/Biz.sol/Biz.json';

const nftAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
const nftMarketAddress = process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS

const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS_ROPSTEN
const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS_ROPSTEN

// const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS_RINKEBY
// const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS_RINKEBY

// const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS
// const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS

console.log(nftAddress);
console.log(nftMarketAddress);
console.log(turtleMinterAddress);

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET
const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
Moralis.start({ serverUrl, appId });

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function MinterPage() {
    const [fileUrl, setFileUrl] = useState(null)
    const [user, setUser] = useState(null);
    const [metadataRequestUrls, setMetadataRequestUrls] = useState([])
    const [appliedMetadata, setAppliedMetadata] = useState([]);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''})
    const router = useRouter();

    useEffect(() => {
      const url = 'https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}';
      return axios
          .get(url, {
              headers: {
                  pinata_api_key: pinataApiKey,
                  pinata_secret_api_key: pinataApiSecret
              }
          })
          .then(function (response) {
            if (response.data.rows) {
              const gateway = 'https://gateway.pinata.cloud/ipfs/';
              setMetadataRequestUrls(response.data.rows.map(r => {
                return axios.get(gateway+r.ipfs_pin_hash)
              }))
            }
            // setAppliedMetadata(hashes);
          })
          .catch(function (error) {
              //handle error here
          });
    }, [])

    useEffect(() => {
      console.log('metadataRequestUrls: ', metadataRequestUrls)
      Promise
        .all(metadataRequestUrls)
        .then(function (responses) { 
          console.log(responses)
          setAppliedMetadata(responses.map(r => {
            return {
              "src":r.config.url,
              "data":r.data
            }
          }))
        })
    }, [metadataRequestUrls])

    useEffect(() => {
      console.log('appliedMetadata: ', appliedMetadata)
    }, [appliedMetadata])

    /*
        Upload image file to ipfs, THEN create sale on the condition of this successful execution
    */
    // async function createItem() {
    //     const { name, description } = formInput;
    //     if (!name || !description || !fileUrl) return;
    //     const data = JSON.stringify({
    //         name, description, image: fileUrl
    //     })

    //     try {
    //         // TODO: figure out where to host ipfs (Pinata, infura, etc)
    //         const added = await client.add(data)
    //         console.log('added @ createSale: ', added)
    //         const url = `https://ipfs.infura.io/ipfs/${added.path}`
    //         /* after file isn uploaded to IPFS, pass the url and save it to polygon */
    //         createSale(url)
    //     } catch (err) {
    //         console.log('Error uploading file: ', error)
    //     }
    // }
    async function createSaleandMarketItem(src) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      console.log('signer @ createSale: ', signer);
  
      const turleMinterContract = new ethers.Contract(turtleMinterAddress, TurtleMinter.abi, signer);
      let transaction = await turleMinterContract.mintToken(src);
      let tx = await transaction.wait(); 

      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()
  
      console.log('event @ createSale: ', event)
      console.log('value @ createSale: ', value)
      console.log('tokenId @ createSale: ', tokenId)
  
      const bizContract = new ethers.Contract(bizAddress, Biz.abi, signer)
      let priceToMint = await bizContract.getPriceToMint()
      priceToMint = priceToMint.toString()
  
      /* get priceToMint from biz, make sure signer sends it when creating Turtle */
      transaction = await bizContract.createTurtle(
          turtleMinterAddress, tokenId, { value: priceToMint }
      )
      await transaction.wait();
  
      alert('done')
    }

    return (
      appliedMetadata.map((m, i) => (
        <div key={i} className="border shadow rounded-xl overflow-hidden">
          <iframe src={m.data.image} width="400" height="400" ></iframe>
          <div className="p-4 bg-black">
            <p className="text-2xl font-bold text-white">{m.data.name}</p>
          </div>
          <button onClick={() => createSaleandMarketItem(m.src)}>Buy</button>
        </div>
      ))
    )
}