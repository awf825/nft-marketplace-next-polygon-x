/*
  https://medium.com/geekculture/metamask-authentication-with-moralis-in-next-js-33972b242b05
  https://github.com/MoralisWeb3/react-moralis
*/

import '../styles/globals.css'
import Link from 'next/link';
import { useEffect, useReducer, useState } from "react";
import Header from './divisions/header'
import Divider from './divisions/divider'
import Footer from './divisions/footer'
import { MoralisProvider } from "react-moralis";
import AWS from 'aws-sdk'
import {
  GalleryContext,
  galleryReducer,
  startLoading,
  stopLoading,
  setGallery,
  setAccessParams,
  fetchGallery
} from "../contexts/GalleryContext.js";
// import styled from 'styled-components'
// import * as Icon from 'react-bootstrap-icons'
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
// const Footer = styled.div`
//   display: inline-block;
//   width: 33.333%;
//   margin: 13px auto;
//   padding-left: 15.5%;
//   @media only screen and (max-width: 900px) {
//     padding-left: 12.5%;
//   }
// `

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

function Marketplace({ Component, pageProps }) {
  const [stsAccessParams, setSTSAccessParams] = useState({});
  const [galleryState, dispatch] = useReducer(
    galleryReducer,
    {
      loading: null,
      gallery: [],
      accessParams: {}
    }
  )

  async function listAllObjectsFromS3Bucket(s3, bucket, prefix) {
    let isTruncated = true;
    let marker;
    const elements = [];
    while(isTruncated) {
      let params = { Bucket: bucket };
      if (prefix) params.Prefix = prefix;
      if (marker) params.Marker = marker;
      try {
        const response = await s3.listObjects(params).promise();
        response.Contents.forEach(item => {
          elements.push(item)  
        })
        isTruncated = response.IsTruncated;
        if (isTruncated) {
          marker = response.Contents.slice(-1)[0].Key;
        }
    } catch(error) {
        throw error;
      }
    }
    return elements;
  }

  useEffect(async () => {
    if (Object.keys(stsAccessParams).length === 0) {
      const sts = new AWS.STS();
      sts.assumeRole({
        DurationSeconds: 14400,
        ExternalId: 'turtleverse-assume-s3-access',
        RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
        RoleSessionName: 'TV-Gallery-View'
      }, (err, data) => {
        if (err) throw err;
        setSTSAccessParams(data)
        dispatch(setAccessParams(data))
      })
    }
  }, [])

  useEffect(async () => {
    if (Object.keys(stsAccessParams).length > 0) {
      dispatch(startLoading(true))
      const turtleBucket = new AWS.S3({
        accessKeyId: stsAccessParams.Credentials.AccessKeyId,
        secretAccessKey: stsAccessParams.Credentials.SecretAccessKey,
        sessionToken: stsAccessParams.Credentials.SessionToken,
        bucket: 'turtleverse.albums',
        region: 'ca-central-1'
      })
      const bucketParams = {
        Bucket: 'turtleverse.albums',
        Prefix: 'generation-six/metadata'
      }
      const g = await listAllObjectsFromS3Bucket(turtleBucket, 'turtleverse.albums', 'generation-six/metadata')
      dispatch(setGallery(g))
    }
    dispatch(stopLoading(false))
  }, [stsAccessParams])

  

  return (
    <MoralisProvider
      appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
      serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_ID}
    >
      <GalleryContext.Provider value={[galleryState, dispatch]}> 
        <div>
          <Header/>
          <Component {...pageProps} />
          <Divider />
          <Footer />
        </div>
      </GalleryContext.Provider> 
    </MoralisProvider>
  )
}

export default Marketplace
