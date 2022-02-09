import Image from 'next/image';

export default function Hero() {
    return (
        <div id="hero" className="hero hidden-mobile">
            <Image src={"/turtles-landscape.jpg"} width={900} height={450}/>
        </div>
    )
}