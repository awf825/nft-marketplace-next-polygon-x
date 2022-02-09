/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
  https://medium.com/@apalshah/how-to-handle-and-serve-data-from-aws-s3-s-private-bucket-with-aws-sts-in-node-js-104d42938b70
  https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0852923 <-- iam, s3, sts
  https://gist.github.com/hmontazeri/e9493c2110d4640a5d10429ccbafb616 <-- fetch from s3 in chunks
*/

import { useState, useEffect, useContext } from 'react'
import FilterSelects from './components/FilterSelects';
import LoadingOverlay from './components/LoadingOverlay';
import InfiniteScroll from "react-infinite-scroll-component";
import {
  GalleryContext,
  resetGallery
} from "../contexts/GalleryContext.js";

// const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
// const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET
// const gateway = 'https://turtleverse.mypinata.cloud/ipfs/'

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
  const [galleryState, dispatch] = useContext(GalleryContext);
  const [areFiltersOn, setAreFiltersOn] = useState(false)
  const [attributeFilters, setAttributeFilters] = useState(initialAttrState) 
  const [count, setCount] = useState({
    prev: 0,
    next: 20
  })
  // marker to set where we are in the motherlode array of bucket keys (galleryState)
  const [marker, setMarker] = useState(0)
  const [hasMore, setHasMore] = useState(true);
  const [currentGallery, setCurrentGallery] = useState([])
  const [areFiltersClear, setAreFiltersClear] = useState(true);
  const [gallery, setGallery] = useState([])

  useEffect(async () => {
      //if (marker === 0) { return };
      let toSet = [];
      const accessKeyId = galleryState.accessParams.Credentials.AccessKeyId
      const secretAccessKey = galleryState.accessParams.Credentials.SecretAccessKey
      const sessionToken = galleryState.accessParams.Credentials.SessionToken
      const turtleBucket = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: sessionToken,
        bucket: 'turtleverse.albums',
        region: 'ca-central-1'
      })
      let benchmark = 0
      while (benchmark < 20) {
        const params = {
          Bucket: 'turtleverse.albums',
          Key: galleryState.gallery[benchmark].Key
        }
        const resp = await turtleBucket.getObject(params).promise();
        // console.log('resp: ', resp)
        const baseBody = JSON.parse(resp.Body.toString('utf-8'))
        baseBody.signed = turtleBucket.getSignedUrl('getObject', {
          Bucket: 'turtleverse.albums',
          Key: `generation-four/turtles/${baseBody.image.split('/')[6]}`,
          Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
        })
        toSet.push(baseBody);
        benchmark+=1;
      }
      setMarker(marker+20)
      setGallery(gallery.concat(toSet))
      if (currentGallery.length === 0) {
        setCurrentGallery(toSet)
      }
  }, [])

  const getMoreData = () => {
    /*
      Logic is in place to get more data when filters are off. 
      need to make some changes for when filters are on. 

      If filters are on, I want to query the whole gallery for entries with filters. 

      Upon getting this, reset count hook to 0,20 and set marker hook to ( length of filtered gallery ) - 1
      setHasMore(false) if currentGallery.length < 20  

    */
    if (currentGallery.length === 10000) {
      // setCount({
      //   prev: 0,
      //   next: 20
      // })
      setHasMore(false);
      return;
    // } else if ( areFiltersOn && ( currentGallery.length < 20 ) ) {
    //   setHasMore(false);
    //   setCount({
    //     prev: 0,
    //     next: currentGallery.length
    //   })
    //   return;
    } else if ( areFiltersOn && ( currentGallery.length > 20 ) ) {
      setHasMore(true)
      return
    }
    setTimeout(async () => {
      if (marker === 0) { return };
      let toSet = [];
      const accessKeyId = galleryState.accessParams.Credentials.AccessKeyId
      const secretAccessKey = galleryState.accessParams.Credentials.SecretAccessKey
      const sessionToken = galleryState.accessParams.Credentials.SessionToken
      const turtleBucket = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: sessionToken,
        bucket: 'turtleverse.albums',
        region: 'ca-central-1'
      })
      let benchmark = 0
      while (benchmark < 20) {
        console.log('marker+benchmark: ', marker+benchmark)
        const params = {
          Bucket: 'turtleverse.albums',
          Key: galleryState.gallery[marker+benchmark].Key
        }
        const resp = await turtleBucket.getObject(params).promise();
        // console.log('resp: ', resp)
        const baseBody = JSON.parse(resp.Body.toString('utf-8'))
        baseBody.signed = turtleBucket.getSignedUrl('getObject', {
          Bucket: 'turtleverse.albums',
          Key: `generation-four/turtles/${baseBody.image.split('/')[6]}`,
          Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
        })
        toSet.push(baseBody);
        benchmark+=1;
      }
      setMarker(marker+20)
      setGallery(gallery.concat(toSet))
      setCurrentGallery(currentGallery.concat(toSet))
    }, 500)
    setCount((prevState) => ({ prev: prevState.prev + 20, next: prevState.next + 20 }))
    setMarker(marker+20)
  }

  useEffect(async () => {
    //debugger
    if (attributeFilters.find(af => Object.values(af)[0].length>0) ) {
      setAreFiltersOn(true)
      const newGallery = galleryState.gallery.filter(g => {
        // console.log('gallery item combo code @ newGallery filter: ', g.comboCode)
        
        const filtersRef = attributeFilters.map(f => Object.entries(f)[0][1]).filter(mf => mf.length>0)
        // console.log('filters @ newGallery filter: ', filtersRef)
        // console.log('checkForAllMatches(attributeFilters, g.comboCode): ', checkForAllMatches(filtersRef, g.comboCode))
        const comboCode = g.Key.split('/')[2].split('_')[1].split('.')[0]
        return checkForAllMatches(filtersRef, comboCode)
      })

      dispatch(resetGallery(newGallery))

      let toSet = [];
      const accessKeyId = galleryState.accessParams.Credentials.AccessKeyId
      const secretAccessKey = galleryState.accessParams.Credentials.SecretAccessKey
      const sessionToken = galleryState.accessParams.Credentials.SessionToken
      const turtleBucket = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        sessionToken: sessionToken,
        bucket: 'turtleverse.albums',
        region: 'ca-central-1'
      })
      let benchmark = 0
      while (benchmark < 20) {
        const params = {
          Bucket: 'turtleverse.albums',
          Key: newGallery[benchmark].Key
        }
        const resp = await turtleBucket.getObject(params).promise();
        // console.log('resp: ', resp)
        const baseBody = JSON.parse(resp.Body.toString('utf-8'))
        baseBody.signed = turtleBucket.getSignedUrl('getObject', {
          Bucket: 'turtleverse.albums',
          Key: `generation-four/turtles/${baseBody.image.split('/')[6]}`,
          Expires: 60 * 30 // time in seconds: e.g. 60 * 5 = 5 mins
        })
        toSet.push(baseBody);
        benchmark+=1;
      }
      setGallery(toSet)
      setCurrentGallery(toSet)
      setMarker(0)
      setCount({
        prev: 0,
        next: 20
      })

      console.log('newGallery @ state change effect: ', newGallery)
      // setGallery(newGallery)
      // setCurrentGallery(newGallery)
      // if (newGallery.length > 20) {
      //   setHasMore(false)
      // } else {
      //   setHasMore(true)
      // }
      // setMarker(newGallery.length)
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
      <LoadingOverlay loading={galleryState.loading}/>
      <FilterSelects 
        filter={filter} 
        setAreFiltersClear={setAreFiltersClear}
      />
      <div className="iscroll-wrapper">
        <InfiniteScroll
          dataLength={currentGallery.length}
          next={getMoreData}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          <div className="gallery-items-wrapper">
            {currentGallery && currentGallery.map(((item, index) => (
              <div key={index} className="gallery-item mobile-top-margin-sm">
                <img
                  src={item.signed}
                  width="175"
                  height="175"
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