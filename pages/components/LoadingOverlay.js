import Image from 'next/image'
import { useEffect } from 'react'

export default function LoadingOverlay({ loading }) {
    // return (
    //     loading
    //     ?
    //     <div className="loading-overlay">
    //         <Image className="loading-overlay-img" src={"/turtles.gif"} width={400} height={400}/>
    //         <h1>PLEASE WAIT WHILE WE LOAD OUR GALLERY</h1>
    //     </div>
    //     :
    //     null
    // )
    return (
        <div id="gallery-gif" className="gallery-item mobile-top-margin-sm">
            <Image src={"/turtles.gif"} width={175} height={175}/>
        </div>
    )
}