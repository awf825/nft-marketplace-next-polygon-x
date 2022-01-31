/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
*/

import { useState, useEffect } from 'react'
import AWS from 'aws-sdk'
import Image from 'next/image';
import InfiniteScroll from "react-infinite-scroll-component";
import Select from 'react-select'

const filterOptions = [
  { value: 'A1', label: 'Orange Creamsicle' },
  { value: 'A2', label: 'Hot Pink' },
  { value: 'A3', label: 'Summer Blue' },
  { value: 'A4', label: 'Tiel Green' },
  { value: 'A5', label: 'Lemon Yellow' },
  { value: 'A6', label: 'Faded Red' }
]

const customStyles = {
  menu: (provided, state) => ({
    ...provided,
    width: state.selectProps.width,
    borderBottom: '1px dotted pink',
    color: '#000',
    padding: 20,
  }),

  // control: (_, { selectProps: { width }}) => ({
  //   width: width
  // }),

  // singleValue: (provided, state) => {
  //   // const opacity = state.isDisabled ? 0.5 : 1;
  //   // const transition = 'opacity 300ms';

  //   return { ...provided };
  // }
}

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

export default function Gallery() {
  const [areFiltersOn, setAreFiltersOn] = useState(false)
  const [attributeFilters, setAttributeFilters] = useState([]) 
  const [gallery, setGallery] = useState([])
  const [count, setCount] = useState({
    prev: 0,
    next: 20
  })
  const [hasMore, setHasMore] = useState(true);
  const [currentGallery, setCurrentGallery] = useState([])
   
  const getMoreData = () => {
    if (currentGallery.length === gallery.length) {
      setHasMore(false);
      return;
    } else if (areFiltersOn && ( currentGallery.length < 20 ) ) {
      //debugger
      setHasMore(false);
      setCount({
        prev: 0,
        next: currentGallery.length
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
    // 
    // debugger
    // const filterCodes = attributeFilters.map(function(af) { 
    //   return Object.values(af) 
    // })
    // const filteredGallery = gallery.filter(function (g) {
    //   filters.forEach(f => g.comboCode.includes(f))
    // })
    if (attributeFilters.length > 0) {
      setAreFiltersOn(true)
      const newGallery = gallery.filter(g => {
        // return g.comboCode.includes(attributeFilters[0])
        console.log('gallery item combo code @ newGallery filter: ', g.comboCode)
        const filtersRef = attributeFilters.map(f => f);
        console.log('filters @ newGallery filter: ', filtersRef)
        console.log('checkForAllMatches(attributeFilters, g.comboCode): ', checkForAllMatches(filtersRef, g.comboCode))
        return checkForAllMatches(filtersRef, g.comboCode)
        // while (attributeFilters.length > 0) {
        //   const match =  g.comboCode.includes(attributeFilters[0])
        //   if (match) {
        //     return match
        //   } else {
        //     attributeFilters.shift()
        //   } 
        // }
        //checkForAllMatches(attributeFilters, g.comboCode) 
        // console.log('g @ filter: ', g)
      })
      console.log('newGallery @ state change effect: ', newGallery)
      // setGallery(newGallery)
      // if (newGallery.length > 20) {
      //   setCurrentGallery(newGallery.slice(count.prev, count.next))
      // } else {
      //   \
      // }
      setCurrentGallery(newGallery)
      // setCount({
      //   prev: 0,
      //   next: newGallery.length
      // })
    } else {
      setAreFiltersOn(false)
    }

  }, [attributeFilters])

  const filter = selectedOption => {
    // if (attributeFilters.find(af => af.trait_type===selectedOption.value)) {

    // } else {
    // const filtersRef = [...attributeFilters];
    setAttributeFilters([...attributeFilters, selectedOption.value])
    // }
    // console.log(`Option selected:`, selectedOption);
  };

  /*
    single chomp, just chomp the string and check for each code (for loop inside of a while loop)
    a = codes to check
    s = full combo code
  */
  function checkForAllMatches(a, s) {
    while ( ( ( s.length-2 ) > 0 ) && ( a.length > 0 ) ) {
        console.log(s)
        a.forEach((code, i) => {
            // check for match
            var match = (code === s.slice(0, code.length))
            if (match) {
                // if theres a match, delete the match from the codes array (a). If we empty 
                // out this array, the while loop will stop, and we will recheck this condition
                // on the final return. 
                console.log('MATCH FOUND: ', a[i])
                a.splice(i, 1);
                console.log('a after match found: ', a)
            }
        })
        // slice substring of s after checking each of the codes for a match
        s = s.slice(1)
    }
    // if we haven't emptied out the checks, return false cos we didn't match ALL element
    return (a.length > 0) ? false : true
  }

  return (
    <div className="gallery">
      <Select 
        onChange={filter}
        placeholder={"Background"}
        options={filterOptions}
        styles={customStyles} 
      />
      {/* <select></select>
      <select></select>
      <select></select>
      <select></select>
      <select></select>
      <select></select> */}
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
                {/* <div className="attr-lines">
                  <h3>{`${item.name}-${item.comboCode}`}</h3>
                  {
                    item.attributes.map((a,idx) => (
                      <div key={idx} className="attr-line">
                        <span>{a.trait_type}: </span>
                        <span>{a.value}</span>
                      </div>
                    ))
                  }
                </div> */}
            </div>
          )))
          }
        </div>
      </InfiniteScroll>
    </div>
  );
}