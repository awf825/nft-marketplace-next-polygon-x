/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
*/

import { useState, useEffect } from 'react'
import AWS from 'aws-sdk'
import FilterSelects from '../components/FilterSelects';
// import Image from 'next/image';
import InfiniteScroll from "react-infinite-scroll-component";
// import Select from 'react-select'

// const backgroundFilterOptions = [
//   { value: 'Background-A1', label: 'Orange Creamsicle' },
//   { value: 'Background-A2', label: 'Hot Pink' },
//   { value: 'Background-A3', label: 'Summer Blue' },
//   { value: 'Background-A4', label: 'Tiel Green' },
//   { value: 'Background-A5', label: 'Lemon Yellow' },
//   { value: 'Background-A6', label: 'Faded Red' }
// ]

// const customStyles = {
//   menu: (provided, state) => ({
//     ...provided,
//     width: state.selectProps.width,
//     borderBottom: '1px dotted pink',
//     color: '#000',
//     padding: 20,
//   }),

//   // control: (_, { selectProps: { width }}) => ({
//   //   width: width
//   // }),

//   // singleValue: (provided, state) => {
//   //   // const opacity = state.isDisabled ? 0.5 : 1;
//   //   // const transition = 'opacity 300ms';

//   //   return { ...provided };
//   // }
// }

// const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
// const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET
// const gateway = 'https://turtleverse.mypinata.cloud/ipfs/'
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY
})

const myBucket = new AWS.S3({
  params: { Bucket: 'turtleverse.albums' },
  region: 'ca-central-1',
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
   
  const getMoreData = () => {
    if (currentGallery.length === gallery.length) {
      setHasMore(false);
      return;
    } else if (areFiltersOn && ( currentGallery.length < 20 ) ) {
      setHasMore(false);
      setCount({
        prev: 0,
        next: 20
      })
      return;
    }
    setTimeout(() => {
      setCurrentGallery(currentGallery.concat(gallery.slice(count.prev, count.next)))
    }, 200)
    setCount((prevState) => ({ prev: prevState.prev + 20, next: prevState.next + 20 }))
  }

  useEffect(() => {
    const bucketParams = {
      Bucket: 'turtleverse.albums',
      Prefix: 'generation-one/metadata'
    }
    let g = [];

    myBucket.listObjects(bucketParams, function(err,payload) {
      payload.Contents.forEach(c => {
        const nextParams = {
          Bucket: 'turtleverse.albums',
          Key: c.Key
        }
        myBucket.getObject(nextParams, function(error,data) {
           g.push(JSON.parse(data.Body.toString('utf-8')))
        })        
      })
    })
    setGallery(g)
  }, [])

  useEffect(() => {
    //debugger
    console.log('attributeFilters @ side effect: ', attributeFilters)
    if (attributeFilters.find(af => Object.values(af)[0].length>0) ) {
      setAreFiltersOn(true)
      const newGallery = gallery.filter(g => {
        console.log('gallery item combo code @ newGallery filter: ', g.comboCode)
        
        const filtersRef = attributeFilters.map(f => Object.entries(f)[0][1]).filter(mf => mf.length>0)
        console.log('filters @ newGallery filter: ', filtersRef)
        console.log('checkForAllMatches(attributeFilters, g.comboCode): ', checkForAllMatches(filtersRef, g.comboCode))
        
        return checkForAllMatches(filtersRef, g.comboCode)

      })
      console.log('newGallery @ state change effect: ', newGallery)
      setCurrentGallery(newGallery)
    } else {
      setAreFiltersOn(false)
    }

  }, [attributeFilters])

  const filter = selectedOption => {
    const splitVals = selectedOption.value.split('-');
    const filtersRef = attributeFilters.map(f => f);
    const pairToMutate = filtersRef.find(af => Object.entries(af)[0][0]===splitVals[0])
    pairToMutate[splitVals[0]] = splitVals[1];
    setAreFiltersClear(false);
    setAttributeFilters(filtersRef)
  };

  /*
    single chomp, just chomp the string and check for each code (for loop inside of a while loop)
    a = codes to check
    s = full combo code
  */
  function checkForAllMatches(a, s) {
    while ( ( ( s.length-1 ) > 0 ) && ( a.length > 0 ) ) {
        // console.log(s)
        a.forEach((code, i) => {
            // check for match
            var firstThreeChars = s.slice(0, 3)
            // if (firstThreeChars === "B2") {
            //   debugger
            // }
            var match = ( code === firstThreeChars.slice(0, code.length) )
            if (match) {
                  // we also need to check if code is length 2 and second 2 of three to slice is NOT a number
                  if (( code.length === 2 ) && ( Number(s.slice(1,3)).length>1 ) && ( Number(s.slice(1,3)) >= 0 )) {
                    console.log('NO MATCH. BROADCHECKING: ', a[i])
                  } else {
                    // if theres a true match, delete the match from the codes array (a). If we empty 
                    // out this array, the while loop will stop, and we will recheck this condition
                    // on the final return. 
                    console.log('MATCH FOUND: ', a[i])
                    console.log('sliced check to match: ', s.slice(0, code.length))
                    a.splice(i, 1);
                    console.log('a after match found: ', a)
                  }

            }
        })
        // slice substring of s after checking each of the codes for a match
        s = s.slice(1)
    }
    // if we haven't emptied out the checks, return false cos we didn't match ALL element
    return (a.length > 0) ? false : true
  }

  function clearFilters(e) {
    e.preventDefault()
    setAttributeFilters([
      { "Background": '' },
      { "Clothes": '' },
      { "Eyes": '' },
      { "Mouth": '' },
      { "Headwear": '' },
      { "Paint": '' },
      { "Skin": '' }
    ])
    // setAttributeFilters(initialAttrState)
    setAreFiltersClear(true);
    setCurrentGallery(gallery) 
  }

  return (
    <div className="gallery">
      <FilterSelects filter={filter} areFiltersClear={areFiltersClear} attributeFilters={attributeFilters}/>
      <button onClick={(e) => clearFilters(e)}>CLEAR</button>
      <InfiniteScroll
        dataLength={currentGallery.length}
        next={getMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        <div>
          {currentGallery && currentGallery.map(((item, index) => (
            <div key={index} className="gallery-item mobile-top-margin-sm">
              <img
                src={item.image}
                width="200"
                height="200"
              />
              <h3>#{item.name.split("_")[1]}</h3>
            </div>
          )))
          }
        </div>
      </InfiniteScroll>
    </div>
  );
}