/*
  https://medium.com/geekculture/metamask-authentication-with-moralis-in-next-js-33972b242b05
  https://github.com/MoralisWeb3/react-moralis
*/

import '../styles/globals.css'
import Link from 'next/link';
import GTM from 'react-gtm-module';
import { 
  useEffect, 
  useReducer, 
  useState,
  useRef 
} from "react";
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
  pushAppliedGallery
} from "../contexts/GalleryContext.js";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

function Marketplace({ Component, pageProps }) {
  const appliedGalleryIdx = useRef(0);
  const [stsAccessParams, setSTSAccessParams] = useState({});
  const [bucket, setBucket] = useState({})
  const [galleryState, dispatch] = useReducer(
    galleryReducer,
    {
      loading: null,
      gallery: [],
      appliedGallery: [],
      accessParams: {},
      filteredGallery: [],
      filteredAppliedGallery: [],
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

  useEffect(() => {
    GTM.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM });
  }, [])

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
      const g = await listAllObjectsFromS3Bucket(turtleBucket, 'turtleverse.albums', 'generation-six/metadata')
      setBucket(turtleBucket)
      dispatch(setGallery(g))
    }
    dispatch(stopLoading(false))
  }, [stsAccessParams])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (galleryState.appliedGallery.length >= 10000) { return }
      else {
        for (let i = appliedGalleryIdx.current; i < appliedGalleryIdx.current+20; i++) {
          const params = {
            Bucket: 'turtleverse.albums',
            Key: galleryState.gallery[i].Key
          }
          const resp = await bucket.getObject(params).promise();
          // console.log('resp: ', resp)
          const baseBody = JSON.parse(resp.Body.toString('utf-8'))
          baseBody.signed = bucket.getSignedUrl('getObject', {
            Bucket: 'turtleverse.albums',
            Key: `generation-six/turtles/${baseBody.image.split('/')[6]}`,
            Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
          })
          dispatch(pushAppliedGallery(baseBody))
        }
        appliedGalleryIdx.current = appliedGalleryIdx.current+20
      }
      console.log('This will run every five seconds!');
    }, 500);
    return () => clearInterval(interval);
  }, [galleryState])


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