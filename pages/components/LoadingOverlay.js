import Image from 'next/image'

export default function LoadingOverlay({ loading }) {
    return (
        loading
        ?
        <div className="loading-overlay">
            <Image className="loading-overlay-img" src={"/turtles.gif"} width={600} height={600}/>
            <h1>PLEASE WAIT WHILE WE LOAD OUR GALLERY</h1>
        </div>
        :
        null
    )
}