/*
  https://medium.com/geekculture/metamask-authentication-with-moralis-in-next-js-33972b242b05
  https://github.com/MoralisWeb3/react-moralis
*/

import '../styles/globals.css'
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
  pushAppliedGallery
} from "../contexts/GalleryContext.js";

import AuthGuard from './components/AuthGuard';

import {
  listAllObjectsFromS3Bucket
} from "../helpers/S3.js"

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

const tagManagerArgs = {
  gtmId: "GTM-TMNJPSP",
  events: {
    mint: "mint"
  }
}

function Marketplace({ Component, pageProps }) {
  const appliedGalleryIdx = useRef(0);
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

  useEffect(() => { 
    GTM.initialize({ 
        gtmId: process.env.NEXT_PUBLIC_GTM,
        events: {
          mint: "mint"
        }
    }); 
  }, [])

  useEffect(async () => {
    // need to add logic here to reconcile whether or not the gallery is actually loading or not.
    // if it is (from the reducer), no need to start reloading the gallery
    let bucket;
    let gallery;
    const storedParams = localStorage.getItem("stsCredentials");
    if (storedParams !== null) {
      const json = JSON.parse(storedParams);
      if (galleryState.gallery.length <= 0) {
        try {
          bucket = new AWS.S3({
            accessKeyId: json.Credentials.AccessKeyId,
            secretAccessKey: json.Credentials.SecretAccessKey,
            sessionToken: json.Credentials.SessionToken,
            bucket: 'turtleverse.albums',
            region: 'ca-central-1'
          })
          gallery = await listAllObjectsFromS3Bucket(bucket, 'turtleverse.albums', `${process.env.NEXT_PUBLIC_GENERATION}/metadata`)
          setBucket(bucket)
          dispatch(setGallery(gallery))
        } catch (err) {
            console.log(err.code)
            if (err.code === "ExpiredToken") {
              const sts = new AWS.STS();
              sts.assumeRole({
                DurationSeconds: 43200,
                ExternalId: 'turtleverse-assume-s3-access',
                RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
                RoleSessionName: 'TV-Gallery-View'
              }, async (err, data) => {
                if (err) throw err;
                localStorage.setItem("stsCredentials", JSON.stringify(data));
                dispatch(startLoading(true))
                bucket = new AWS.S3({
                  accessKeyId: data.Credentials.AccessKeyId,
                  secretAccessKey: data.Credentials.SecretAccessKey,
                  sessionToken: data.Credentials.SessionToken,
                  bucket: 'turtleverse.albums',
                  region: 'ca-central-1'
                })
                gallery = await listAllObjectsFromS3Bucket(bucket, 'turtleverse.albums', `${process.env.NEXT_PUBLIC_GENERATION}/metadata`)
              })
              setBucket(bucket)
              dispatch(setGallery(gallery))
            }
        }
      }
    } else {
      const sts = new AWS.STS();
      sts.assumeRole({
        DurationSeconds: 43200,
        ExternalId: 'turtleverse-assume-s3-access',
        RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
        RoleSessionName: 'TV-Gallery-View'
      }, async (err, data) => {
        if (err) throw err;
        localStorage.setItem("stsCredentials", JSON.stringify(data));
        dispatch(startLoading(true))
        bucket = new AWS.S3({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
          bucket: 'turtleverse.albums',
          region: 'ca-central-1'
        })
        if (galleryState.gallery.length <= 0) {
          gallery = await listAllObjectsFromS3Bucket(bucket, 'turtleverse.albums', `${process.env.NEXT_PUBLIC_GENERATION}/metadata`)
          setBucket(bucket)
          dispatch(setGallery(gallery))
        }
      })
    }
    return;
  }, [])

  useEffect(() => {
    if (galleryState && galleryState.gallery && galleryState.gallery.length > 0) {
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
              Key: `${process.env.NEXT_PUBLIC_GENERATION}/turtles/${baseBody.image.split('/')[6]}`,
              Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
            })
            dispatch(pushAppliedGallery(baseBody))
          }
          appliedGalleryIdx.current = appliedGalleryIdx.current+20
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [
    galleryState.gallery,
    galleryState.loading,
    galleryState.appliedGallery,
    galleryState.filteredGallery,
    galleryState.filteredAppliedGallery 
  ])

  return (
    <MoralisProvider
      appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
      serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_ID}
    >
      <GalleryContext.Provider value={[galleryState, dispatch]}> 
        <div>
          <Header/>
          {
            Component.requireAuth ? (
              <AuthGuard>
                <Component {...pageProps} />
              </AuthGuard>
            ) : (
              // public page
              <Component {...pageProps} />
            )
          }
          {/* <Component {...pageProps} /> */}
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