import Image from "next/image"

export default function Vision() {
    return (
        <div className="vision mobile-top-margin-sm">
            {/* <Image src="/mint_pic.png" layout="fill"/> */}
            {/* <p>VISION</p> */}
            <div className="vis-blurb">
                <div className="vis-blurb-header">
                    <h1>THE VISION</h1>
                    <p>
                        The world today is all about doing things quickly; we often gfind ourselves in constant motion,
                        never stopping to think about what it is that we&apos;re doing or why we started doing it in the first
                        place. This go-go-go state of mind had led to anxiety and stress for many of us aroubnd the world.
                        We wanted to create an NFT project that could serve as a reminder that the quick way isn&apos;t always the
                        right way and that, when it comes to living our best lives, &quot;slow and steady, wins the race...&quot; #WAGMI
                    </p>
                </div>
            </div>
            {/* <div className="vis-img hidden-mobile">
            <Image unoptimized={true} src="/TV_Logo_white.png" alt="tv-white" width="1200" height="1200" />
            </div> */}
        </div>
    )
}