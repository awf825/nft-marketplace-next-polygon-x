import Image from "next/image"

export default function Vision() {
    return (
        <div className="vision mobile-top-margin-sm">
            {/* <Image src="/mint_pic.png" layout="fill"/> */}
            {/* <p>VISION</p> */}
            <div className="vis-blurb">
                <div className="vis-blurb-header">
                    <div className="white-divider hidden-mobile" style={{marginBottom: "-6%", width: "55%"}}></div>
                    <h1>THE VISION</h1>
                </div>
                <div className="vis-blurb-row">
                    <div className="vis-blurb-img hidden-mobile">
                        <Image src="/vision-pic.png" alt="IMAGE" width={400} height={400}/>
                    </div>
                    <div className="vis-blurb-text">
                        The world today is all about doing things quickly; we often find ourselves in constant motion,
                        never stopping to think about what it is that we&apos;re doing or why we started doing it in the first
                        place. This go-go-go state of mind had led to anxiety and stress for many of us around the world.
                        We wanted to create an NFT project that could serve as a reminder that the quick way isn&apos;t always the
                        right way and that, when it comes to living our best lives, &quot;slow and steady, wins the race...&quot; #WAGMI
                    </div>
                </div>
            </div>
        </div>
    )
}