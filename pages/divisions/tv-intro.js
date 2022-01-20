import Image from 'next/image';

export default function TVIntro() {
    return (
        <div className="tv-intro">
            {/* <Image src="/mint_pic.png" layout="fill"/> */}
            <div className="tv-header">
                <Image className="tv-logo-header" src="/TV_Logo_white.png" alt="tv-white" width="150" height="100" />
                <div className="tv-text-header">
                    <h1>THE TURTLEVERSE</h1>
                </div>
                <Image className="tv-logo-header" src="/TV_Logo_white.png" alt="tv-white" width="150" height="100" />
            </div>
            <div className="tv-blurb">
                <div className="turtle-img-blurb">
                    <Image src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="tv-text-blurb">
                    The TurtleVerse is a collection of 10,000 1/1 Turtles, each one algorithmically generated from 
                    over 160 unique traits — e.g. props, expressions, colors, etc. — so that no turtle is the same.
                    Turtles range in rarity, so cross your fingers!
                </div>
                <div className="turtle-img-blurb">
                    <Image src="/B11.png" alt="tv-white" width="135" height="135" />
                </div>
            </div>
            <div className="gallery-row">
                <div className="turtle-img-gallery-one" style={{ width: "16%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%", paddingLeft: "47px" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />                
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%", paddingRight: "47px" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "16%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
            </div>
            <div className="gallery-row">
                <div className="turtle-img-gallery-one" style={{ width: "16%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%", paddingLeft: "47px" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />                
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "22.666%", paddingRight: "47px" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
                <div className="turtle-img-gallery-one" style={{ width: "16%" }}>
                    <Image className="turtle-img-gallery-one" src="/B13.png" alt="tv-white" width="135" height="135" />
                </div>
            </div>
        </div>
    )
}