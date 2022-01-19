import { useState, useEffect } from 'react'
import Image from 'next/image';
import axios from 'axios';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET

export default function Gallery() {
    //const [metadataRequestUrls, setMetadataRequestUrls] = useState([]);
    const [incomingMetadataRequestUrls, setIncomingMetadataRequestUrls] = useState([]);
    const [appliedMetadata, setAppliedMetadata] = useState([]);
    const [pageOffset, setPageOffset] = useState(10);

    useEffect(() => {
      const url = 'https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}';
      return axios
          .get(url, {
              headers: {
                  pinata_api_key: pinataApiKey,
                  pinata_secret_api_key: pinataApiSecret
              }
          })
          .then(function (response) {
            if (response.data.rows) {
              const gateway = 'https://turtleverse.mypinata.cloud/ipfs/';
              setIncomingMetadataRequestUrls(response.data.rows.map(r => {
                return axios.get(gateway+r.ipfs_pin_hash)
              }))
            }
            // setAppliedMetadata(hashes);
          })
          .catch(function (error) {
              //handle error here
          });

        // const axiosInstance = axios.create({
        //     headers: {
        //         pinata_api_key: pinataApiKey,
        //         pinata_secret_api_key: pinataApiSecret
        //     }
        // });

        // axios.all([
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=10&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=20&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=30&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=40&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=50&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=60&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=70&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=80&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        //     axiosInstance.get('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=10&pageOffset=90&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}'),
        // ])
        // .then(axios.spread((a,b,c,d,e,f,g,h,i,j) => {
        //     const struct = [a,b,c,d,e,f,g,h,i,j]
        //     const arr = []
        //     struct.forEach(s => arr.push( s.data.rows.map(r => r.ipfs_pin_hash) ) )
        //     const gateway = 'https://turtleverse.mypinata.cloud/ipfs/';
        //     debugger
        //     // struct.map(s => {
        //     //   setMetadataRequestUrls(s.data.rows.map(r => {
        //     //     return axios.get(gateway+r.ipfs_pin_hash)
        //     //   }))
        //     // })
        //     if (arr.length) {
        //         setMetadataRequestUrls(arr.flat().map(fh => {
        //             return axios.get(gateway+fh.ipfs_pin_hash)
        //         }))
        //     }
        // }))
    }, [])

    useEffect(() => {
      console.log('incomingMetadataRequestUrls: ', incomingMetadataRequestUrls)
      Promise
        .all(incomingMetadataRequestUrls)
        .then(function (responses) { 
          if (appliedMetadata.length > 0) {
              console.log('subseq resp @ metadataRequestUrls sideEffect')
              const toAdd = responses.map(r => {
                return {
                    "src":r.config.url,
                    "data":r.data
                  }
              })
              toAdd.forEach(ta => {
                setAppliedMetadata(prev => [...prev, ta])
              })
            } else {
              console.log('init response @ metadataRequestUrls sideEffect')
              setAppliedMetadata(responses.map(r => {
                return {
                  "src":r.config.url,
                  "data":r.data
                }
              }))
          }
        })
    }, [incomingMetadataRequestUrls])

    useEffect(() => {
      console.log('appliedMetadata: ', appliedMetadata)
    }, [appliedMetadata])

    async function onChangeCarousel() {
        if (pageOffset <= 90) {
            const pageOffsetRef = pageOffset;
            console.log('pageOffset @ onChangeCarousel: ', pageOffset)
            const url = `https://api.pinata.cloud/data/pinList?status=pinned&pageOffset=${pageOffsetRef}&metadata[keyvalues][isMetadata]={"value":"1","op":"eq"}`;
            return axios
            .get(url, {
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataApiSecret
                }
            })
            .then(function (response) {
              if (response.data.rows) {
                setPageOffset(pageOffsetRef+10)
                const gateway = 'https://turtleverse.mypinata.cloud/ipfs/';
                setIncomingMetadataRequestUrls(response.data.rows.map(r => { return axios.get(gateway+r.ipfs_pin_hash) }).flat())
              }
              // setAppliedMetadata(hashes);
            })
            .catch(function (error) {
                //handle error here
            });
            // const newMapped = await axios
            // .get(url, {
            //     headers: {
            //         pinata_api_key: pinataApiKey,
            //         pinata_secret_api_key: pinataApiSecret
            //     }
            // })
            // .then(function (response) {
            //     if (response.data.rows) {
            //     const gateway = 'https://turtleverse.mypinata.cloud/ipfs/';
            //     return response.data.rows.map(r => {
            //         return axios.get(gateway+r.ipfs_pin_hash)
            //     })
            //     // debugger
            //     // setMetadataRequestUrls(prev => [...prev, mappedToAdd.flat()])
            //     }
            //     // setAppliedMetadata(hashes);
            // })
            // .catch(function (error) {
            //     //handle error here
            // });
        }
    } 

    return (
        <Carousel showThumbs={false} onChange={() => onChangeCarousel()}>
            {
                appliedMetadata.map((m, i) => (
                    <div key={i} className="overflow-hidden">
                        <Image
                            src={m.data.image} 
                            width="350" 
                            height="350"
                            loading="lazy"
                        />
                        {/* <img
                            src={m.data.image}
                            style={{
                                height: "350px",
                                width: "350px"
                            }}
                        /> */}
                        <div className="p-4 bg-black">
                            <p className="text-2xl font-bold text-white">{m.data.name}</p>
                            <p className="text-2xl font-bold text-white">{m.data.description}</p>
                        </div>
                    </div>
                ))
            }
        </Carousel>
        // <div className="gallery">
        //     {/* <Image src="/mint_pic.png" layout="fill"/> */}
        //     <p>Gallery</p>
        // </div>
    )
}