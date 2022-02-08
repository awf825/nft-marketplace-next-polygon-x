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
} from "./contexts/GalleryContext.js";

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
  const [hasMore, setHasMore] = useState(true);
  const [currentGallery, setCurrentGallery] = useState([])
  const [areFiltersClear, setAreFiltersClear] = useState(true);

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
      setCurrentGallery(currentGallery.concat(galleryState.gallery.slice(count.prev, count.next)))
    }, 500)
    setCount((prevState) => ({ prev: prevState.prev + 20, next: prevState.next + 20 }))
  }

  useEffect(() => {
    //debugger
    if (attributeFilters.find(af => Object.values(af)[0].length>0) ) {
      setAreFiltersOn(true)
      const newGallery = galleryState.gallery.filter(g => {
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