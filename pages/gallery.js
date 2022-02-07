/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
  https://medium.com/@apalshah/how-to-handle-and-serve-data-from-aws-s3-s-private-bucket-with-aws-sts-in-node-js-104d42938b70
  https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0852923 <-- iam, s3, sts
*/

import { useState, useEffect } from 'react'
import AWS from 'aws-sdk'
import Image from 'next/image'
import FilterSelects from './components/FilterSelects';
import LoadingOverlay from './components/LoadingOverlay';
// import Image from 'next/image';
import InfiniteScroll from "react-infinite-scroll-component";



// const policy = {
//   "Version": "2012-10-17",
//   "Statement": [
//       {
//           "Sid": "PublicReadGetObject",
//           "Effect": "Allow",
//           "Action": [
//               "s3:GetObject",
//               "s3:PutObject"
//           ],
//           "Resource": [
//               "arn:aws:s3:::turtleverse.albums",
//               "arn:aws:s3:::turtleverse.albumsside ecd/*"
//           ]
//       }
//   ]
// }

// import {
//   checkForAllMatches
// } from '../helpers/checkForAllMatches'

// const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
// const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET
// const gateway = 'https://turtleverse.mypinata.cloud/ipfs/'

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})


const initialAttrState = [
  { "Background": '' },
  { "Clothes": '' },
  { "Eyes": '' },
  { "Mouth": '' },
  { "Headwear": '' },
  { "Paint": '' },
  { "Skin": '' }
]

export default function Gallery() {
  const [stsAccessParams, setSTSAccessParams] = useState({});
  const [areFiltersOn, setAreFiltersOn] = useState(false)
  const [attributeFilters, setAttributeFilters] = useState(initialAttrState) 
  const [gallery, setGallery] = useState([])
  const [count, setCount] = useState({
    prev: 0,
    next: 20
  })
  const [hasMore, setHasMore] = useState(true);
  const [currentGallery, setCurrentGallery] = useState([])
  const [areFiltersClear, setAreFiltersClear] = useState(true);
  const [loading, setLoading] = useState(false)
  
  async function listAllObjectsFromS3Bucket(s3, bucket, prefix) {
    let isTruncated = true;
    let marker;
    const elements = [];
    setLoading(true)
    while(isTruncated) {
      let params = { Bucket: bucket };
      if (prefix) params.Prefix = prefix;
      if (marker) params.Marker = marker;
      try {
        const response = await s3.listObjects(params).promise();
        response.Contents.forEach(async item => {
          // elements.push(item.Key);
          const nextParams = {
            Bucket: 'turtleverse.albums',
            Key: item.Key
          }
          const resp = await s3.getObject(nextParams).promise();
          console.log('resp: ', resp)
          // s3.getObject(nextParams, function(err,data) {
          //   if (err) throw err;
          //   const baseBody = JSON.parse(data.Body.toString('utf-8'))
          //   baseBody.signed = s3.getSignedUrl('getObject', {
          //     Bucket: 'turtleverse.albums',
          //     Key: `generation-four/turtles/${baseBody.image.split('/')[6]}`,
          //     Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
          //   }) 
          //   elements.push(baseBody)  
          // });
        })
        isTruncated = response.IsTruncated;
        if (isTruncated) {
          marker = response.Contents.slice(-1)[0].Key;
        }
    } catch(error) {
        throw error;
      }
    }
    setLoading(false)
    return elements;
  }

  const getMoreData = () => {
    if (currentGallery.length === gallery.length) {
      setHasMore(false);
      return;
    } else if ( areFiltersOn && ( currentGallery.length < 20 ) ) {
      setHasMore(false);
      setCount({
        prev: 0,
        next: currentGallery.length
      })
      return;
    } else if ( areFiltersOn && ( currentGallery.length > 20 ) ) {
      setHasMore(true)
      setCount({
        prev: 0,
        next: 20
      })
      return
    }
    setTimeout(() => {
      setCurrentGallery(currentGallery.concat(gallery.slice(count.prev, count.next)))
    }, 500)
    setCount((prevState) => ({ prev: prevState.prev + 20, next: prevState.next + 20 }))
  }

  useEffect(async () => {
    setLoading(true)
    const sts = new AWS.STS();
    sts.assumeRole({
      DurationSeconds: 901,
      // Policy: JSON.stringify(policy),
      ExternalId: 'turtleverse-assume-s3-access',
      RoleArn: "arn:aws:iam::996833347617:role/turleverse-assume-role",
      RoleSessionName: 'TV-Gallery-View'
    }, (err, data) => {
      if (err) throw err;
      // console.log('sts data: ', data); //success
      // return data;
      setSTSAccessParams(data)
    })
  }, [])
  
  useEffect(async () => {
    if (Object.keys(stsAccessParams).length > 0) {
      const turtleBucket = new AWS.S3({
        accessKeyId: stsAccessParams.Credentials.AccessKeyId,
        secretAccessKey: stsAccessParams.Credentials.SecretAccessKey,
        sessionToken: stsAccessParams.Credentials.SessionToken,
        bucket: 'turtleverse.albums',
        region: 'ca-central-1'
      })
      const bucketParams = {
        Bucket: 'turtleverse.albums',
        Prefix: 'generation-four/metadata'
      }
      //let g = [];

      const g = await listAllObjectsFromS3Bucket(turtleBucket, 'turtleverse.albums', 'generation-four/metadata')
      // turtleBucket.listObjects(bucketParams, function(err,payload) {
      //   if (err) throw err;
      //   debugger
      //   payload.Contents.forEach(c => {
      //     const nextParams = {
      //       Bucket: 'turtleverse.albums',
      //       Key: c.Key
      //     }
      //     turtleBucket.getObject(nextParams, function(error,data) {
      //        const baseBody = JSON.parse(data.Body.toString('utf-8'))
      //        baseBody.signed = turtleBucket.getSignedUrl('getObject', {
      //           Bucket: 'turtleverse.albums',
      //           Key: `generation-four/turtles/${baseBody.image.split('/')[6]}`,
      //           Expires: 60 * 60 // time in seconds: e.g. 60 * 5 = 5 mins
      //        })
      //        g.push(baseBody)
      //     })        
      //   })
      // })
      console.log('g before setGallery: ', g)
      setGallery(g)
    }
    setLoading(false)
  }, [stsAccessParams])

  useEffect(() => {
    //debugger
    if (attributeFilters.find(af => Object.values(af)[0].length>0) ) {
      setAreFiltersOn(true)
      const newGallery = gallery.filter(g => {
        // console.log('gallery item combo code @ newGallery filter: ', g.comboCode)
        
        const filtersRef = attributeFilters.map(f => Object.entries(f)[0][1]).filter(mf => mf.length>0)
        // console.log('filters @ newGallery filter: ', filtersRef)
        // console.log('checkForAllMatches(attributeFilters, g.comboCode): ', checkForAllMatches(filtersRef, g.comboCode))
        
        return checkForAllMatches(filtersRef, g.comboCode)
      })
      console.log('newGallery @ state change effect: ', newGallery)
      setCurrentGallery(newGallery)
    } else {
      setAreFiltersOn(false)
    }

  }, [attributeFilters])

  useEffect(() => {
    if (areFiltersClear === true) {      
      setAttributeFilters([
        { "Background": '' },
        { "Clothes": '' },
        { "Eyes": '' },
        { "Mouth": '' },
        { "Headwear": '' },
        { "Paint": '' },
        { "Skin": '' }
      ])
      // setCurrentGallery(gallery) 
      setCurrentGallery([]) 
      setCount({
        prev: 0,
        next: 20
      })
    }
  }, [areFiltersClear])

  const filter = selectedOption => {
    if (selectedOption !== null) {
      const splitVals = selectedOption.value.split('-');
      const filtersRef = attributeFilters.map(f => f);
      const pairToMutate = filtersRef.find(af => Object.entries(af)[0][0]===splitVals[0])
      pairToMutate[splitVals[0]] = splitVals[1];
      setAreFiltersClear(false);
      setAttributeFilters(filtersRef);
    }
  };
  // /*
  //   single chomp, just chomp the string and check for each code (for loop inside of a while loop)
  //   a = codes to check
  //   s = full combo code
  // */
  function checkForAllMatches(a, s) {
    // slice each code into a duple array to be checked for deep equality against combocode
    //debugger
    const duples = a.map(toCheck => toCheck.split(/([A-J])/).slice(1,4));
    // split the combo code into an array of loose duples
    const blownUpCombo = s.split(/([A-J])/).slice(1,15)
    // new while loop. chomp blownUpCombo in groups of two.
    while (( blownUpCombo.length > 0 ) && ( duples.length > 0 )) {
      // console.log('duples @ top of while loop: ', duples);
      // console.log('blownUpCombo @ top of while loop', blownUpCombo)
      duples.forEach((duple,i) => {
        // we get a match if the letter char (always [0]) in the duple matches the letter char 
        // in the blown up sequence AND same for the number char (always [1])
        var match = ( ( duple[0] === blownUpCombo[0] ) && ( duple[1] === blownUpCombo[1] )  )
        if (match) {
          // i we have a match, remove the matching duple. We do this because we return a boolean
          // based on the condition of the duples array being emptied out i.e we have matched every filter. 
          // console.log('MATCH FOUND')
          duples.splice(i,1)
          // console.log('duples after splicing: ', duples)
        }
      })
      blownUpCombo = blownUpCombo.slice(2)
    }
    return (duples.length > 0) ? false : true
  }
  

  return (
    <div id="gallery" className="gallery">
      <LoadingOverlay loading={loading}/>
      <FilterSelects 
        filter={filter} 
        setAreFiltersClear={setAreFiltersClear}
      />
      <div className="iscroll-wrapper">
        <InfiniteScroll
          dataLength={currentGallery.length}
          next={getMoreData}
          hasMore={hasMore}
          // loader={<h4>Loading...</h4>}
        >
          <div className="gallery-items-wrapper">
            {currentGallery && currentGallery.map(((item, index) => (
              <div key={index} className="gallery-item mobile-top-margin-sm">
                <img
                  src={item.signed}
                  width="175"
                  height="175"
                  // layout="responsive"
                />
                <h3>#{item.name.split("_")[0]}</h3>
              </div>
            )))
            }
            {
              currentGallery.length===0 
              ?
              ( areFiltersOn ?
                <h1 className="gallery-directive" style={{ margin: "5%"}}>No Turtles found with these filters</h1> :
                <h1 className="gallery-directive" style={{ margin: "5%" }}>SELECT A FILTER AND STEP INTO THE TURTLEVERSE!</h1>
              ) 
              :
              null
            }
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}