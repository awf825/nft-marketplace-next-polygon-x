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
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import TurtleMinter from '../artifacts/contracts/TurtleMinter.sol/TurtleMinter.json';
import Biz from '../artifacts/contracts/Biz.sol/Biz.json';

const nftAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
const nftMarketAddress = process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS

// const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS_ROPSTEN
// const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS_ROPSTEN

const turtleMinterAddress = process.env.NEXT_PUBLIC_MINTER_CONTRACT_ADDRESS
const bizAddress = process.env.NEXT_PUBLIC_BIZ_CONTRACT_ADDRESS

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

    async function login() {
      let user = Moralis.User.current();
      if (!user) {
          user = await Moralis.authenticate();
          setUser(user);
      }
      console.log("logged in user:", user);
    }

    async function logout() {
      await Moralis.User.logOut();
      setUser(null);
      console.log("logged out");
    }

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
            return r.data
          }))
        })
    }, [metadataRequestUrls])

    useEffect(() => {
      console.log('appliedMetadata: ', appliedMetadata)
    }, [appliedMetadata])

    // useEffect(() => {
    //     const url = `https://api.pinata.cloud/data/testAuthentication`;
    //     return axios
    //         .get(url, {
    //             headers: {
    //                 'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
    //                 'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_API_SECRET
    //             }
    //         })
    //         .then(function (response) {
    //             console.log(response)
    //         })
    //         .catch(function (error) {
    //             //handle error here
    //         });
    // }, [])

    /*
        Upload image file to ipfs, THEN create sale on the condition of this successful execution
    */
    async function createItem() {
        const { name, description } = formInput;
        if (!name || !description || !fileUrl) return;
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        try {
            // TODO: figure out where to host ipfs (Pinata, infura, etc)
            const added = await client.add(data)
            console.log('added @ createSale: ', added)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            /* after file isn uploaded to IPFS, pass the url and save it to polygon */
            createSale(url)
        } catch (err) {
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url) {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        // signer is the user identified by their metamask wallet
        // TEST ACCOUNT 1 ADDRESS = 0xB154Dc24df1404946F304FFcDA78378BdF6501AA

        // console.log('web3Modal @ createSale: ', web3Modal);
        // console.log('connection @ createSale: ', connection);
        // console.log('provider @ createSale: ', provider);
        console.log('signer @ createSale: ', signer);

        const turleMinterContract = new ethers.Contract(turtleMinterAddress, TurtleMinter.abi, signer);
        let transaction = await turleMinterContract.mintToken(url);
        let tx = await transaction.wait(); 

        // console.log('contract @ createSale: ', contract);
        // console.log('transaction @ createSale: ', transaction);
        // console.log('tx @ createSale: ', tx);

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
        ( user ? 
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
        : 
        <div className="flex justify-center">
          <div>
            <button id="btn-login" type="submit" className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" onClick={login}>Moralis Login</button>
            <button id="btn-logout" type="submit" className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg" onClick={logout}>Logout</button>
          </div>
          <div>
            {
              appliedMetadata.map((m, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <iframe src={m.image} width="400" height="400" ></iframe>
                  <div className="p-4 bg-black">
                    <p className="text-2xl font-bold text-white">{m.name}</p>
                  </div>
                </div>
              ))
            }
          </div>
          {/* <Image
            src={"https://gateway.pinata.cloud/ipfs/QmQ6ahozBToceMLgsRtTBfv1Nar3iSWAHkgyvmoFB9vkuY"}
            width={500}
            height={300}
          /> */}
        </div>
      )
    )
}