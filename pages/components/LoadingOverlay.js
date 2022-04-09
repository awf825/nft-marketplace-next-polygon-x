import Image from 'next/image'

export default function LoadingOverlay({ isGathering }) {
    console.log(isGathering)
    return (
        <>
            {
                (isGathering.loading === true)
                ?
                <div id="overlay-gif" className="loading-overlay mobile-top-margin-sm">
                    <h1>{isGathering.text}</h1>
                    <Image src={"/turtles.gif"} width={100} height={600}/>
                </div>
                :
                null
            }
        </>
    )
}