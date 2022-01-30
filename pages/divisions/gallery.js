/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
*/

import { useState, useEffect } from 'react'
import AWS from 'aws-sdk'
import Image from 'next/image';
import InfiniteScroll from "react-infinite-scroll-component";
import Select from 'react-select'

const filterOptions = [
  { value: 'Background-A1', label: 'Orange Creamsicle' },
  { value: 'Background-A2', label: 'Hot Pink' },
  { value: 'Background-A3', label: 'Summer Blue' },
  { value: 'Background-A4', label: 'Tiel Green' },
  { value: 'Background-A5', label: 'Lemon Yellow' },
  { value: 'Background-A6', label: 'Faded Red' }
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

const initialAttributeFilters = [
  { "Background": null }
]

export default function Gallery() {
  const [attributeFilters, setAttributeFilters] = useState(initialAttributeFilters) 
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
    // debugger
    const filterCodes = attributeFilters.map(function(af) { 
      debugger
      return Object.values(af) 
    })
    console.log(filterCodes)
//     const terms = ["term1", "term2", "term3"]

// const strings = ["very large string text ....", "another large string text"] 

// // filter the strings of the array that contain some of the substrings we're looking for

// const result1 = strings.filter(str => terms.some(term => str.includes(term)))

// // filter the strings of the array that contain all the substrings we're looking for

// const result2 = strings.filter(str => terms.every(term => str.includes(term)))

    console.log(attributeFilters)
    // const filteredGallery = gallery.filter(function (g) {
    //   filters.forEach(f => g.comboCode.includes(f))
    // })
    gallery.filter(g => {
      // console.log('g @ filter: ', g)
    })

  }, [attributeFilters])

  const filter = selectedOption => {
    // if (attributeFilters.find(af => af.trait_type===selectedOption.value)) {

    // } else {
    // const filtersRef = [...attributeFilters];
    attributeFilters[selectedOption.value.split('-')[0]] = selectedOption.value.split('-')[1]
    setAttributeFilters(attributeFilters)
    // }
    // console.log(`Option selected:`, selectedOption);
  };

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
              <Image
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