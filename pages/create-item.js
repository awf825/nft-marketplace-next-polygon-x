import { useState } from 'react';
import { ethers } from 'ethers';
// this is a way for us to interact with ipfs for uploading and downloading
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Web3Modal from 'web3modal';

/*
  https://allcode.com/upload-nft-content-to-ipfs-via-pinata/
  Before you mint an NFT, you’ll want to upload the file to the InterPlanetary File System (IPFS).
  In general, blockchains do not store large quantities of data well. Instead of storing the 
  content of your image or video into the blockchain, you’ll want to store the content on IPFS, 
  and provide the hash to your content in the metadata of the NFT token.
*/

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
    nftAddress, nftMarketAddress
} from '../config.js';

// json rep of smart contracts for client side interaction (see artifcats dir)
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''})
    const router = useRouter();

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (p) => console.log(`received: ${p}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (err) {
            console.log(err)
        }
    }

    async function createItem() {
        const { name, description, price } = formInput;
        if (!name || !description || !price || !fileUrl) return;
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        console.log(
          'data @ createItem: ', data
        )

        try {
            // TODO: figure out where to host ipfs (Pinata, infura, etc)
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            console.log('url to createSale: ', url)
            /* after file isn uploaded to IPFS, pass the url and save it to polygon */
            createSale(url)
        } catch (err) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url) {
        // https://docs.ethers.io/v4/cookbook-providers.html, https://docs.ethers.io/v5/api/signer/
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        console.log('web3Modal @ createSale: ', web3Modal);
        console.log('provider @ createSale: ', provider);
        console.log('signer @ createSale: ', signer);
        /* 
            Interactying with two contracts. 
            Create ref to nft contract and call createToken async

            Create ret to market contract that creates an item and charges the 
            lister the listingPrice, gathered async from the same contract
        */
        let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait();

        console.log('contract @ createSale: ', contract);
        console.log('transaction @ createSale: ', transaction);
        console.log('tx @ createSale: ', tx);

        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftMarketAddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(
            nftAddress, tokenId, price, { value: listingPrice }
        )
        await transaction.wait()
        router.push('/')
    }

    return (
        <div className="flex justify-center">
          <div className="w-1/2 flex flex-col pb-12">
            <input 
              placeholder="Asset Name"
              className="mt-8 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
            />
            <textarea
              placeholder="Asset Description"
              className="mt-2 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
            />
            <input
              placeholder="Asset Price in Eth"
              className="mt-2 border rounded p-4"
              onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            />
            <input
              type="file"
              name="Asset"
              className="my-4"
              onChange={onChange}
            />
            {
              fileUrl && (
                <img className="rounded mt-4" width="350" src={fileUrl} />
              )
            }
            <button onClick={createItem} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
              Create Digital Asset
            </button>
          </div>
        </div>
      )
}