/*
  https://blog.logrocket.com/4-ways-to-render-large-lists-in-react/
*/

import { useState, useEffect } from 'react'
import Image from 'next/image';
import InfiniteScroll from "react-infinite-scroll-component";

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET
const gateway = 'https://turtleverse.mypinata.cloud/ipfs/'

export default function Gallery() {
  const [metadata, setMetadata] = useState([])
  const [gallery, setGallery] = useState([])
  const [count, setCount] = useState({
    prev: 0,
    next: 4
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
    }, 2000)
    setCount((prevState) => ({ prev: prevState.prev + 4, next: prevState.next + 4 }))
  }

  useEffect(() => {
    fetch(
      'https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}',
      {
        headers: {
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataApiSecret
        }
      }
    ).then((result) => result.json()
    ).then((payload) => {      
      setMetadata(payload.rows)
    })
  }, [])

  useEffect(async () => {
    if (metadata.length) {
      // we're gonna want to take a chunk of the metadata to set the gallery with
      // we need to get the pin hash, get it from the gateway, and then set the gallery with the data
      const gallery = await Promise.all(
        metadata.map(md => {
          return fetch(gateway+md.ipfs_pin_hash).then((result) => result.json())
        })
      )
      setGallery(gallery)
    }
  }, [metadata])
  // useEffect(() => {
  //   console.log('gallery: ', gallery)
  // }, [gallery])
  return (
    <div className="gallery">
      <InfiniteScroll
        dataLength={currentGallery.length}
        next={getMoreData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        <div>
          {currentGallery && currentGallery.map(((item, index) => (
            <div key={index} className="post">
              <Image
                  src={item.image} 
                  width="350" 
                  height="350"
              />
              <h3>{`${item.name}-${item.description}`}</h3>
            </div>
          )))
          }
        </div>
      </InfiniteScroll>
    </div>
  );
}