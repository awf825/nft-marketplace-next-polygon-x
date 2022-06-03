import Image from 'next/image';

export default function Hero() {
    return (
        <div id="hero" className="hero hidden-mobile">
            <Image src={"/tv_ad.jpeg"} width={400} height={400}/>
        </div>
    )
}