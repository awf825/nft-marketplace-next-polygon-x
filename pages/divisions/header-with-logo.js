import Image from 'next/image'

export default function HeaderWithLogo() {
    return (
        <div className="header-with-logo" style={{ textAlign: 'left !important'}}>
            <Image src="/TV_Logo_white.png" alt="tv-white" width="75" height="75" />
        </div>
    )
}