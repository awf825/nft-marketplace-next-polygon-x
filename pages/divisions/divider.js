import Image from 'next/image'
export default function Divider({ identifier }) {
    return (
        <div id={identifier} className="divider-header mobile-top-margin-sm" style={{display: 'flex'}}>
            <div className="white-divider divider-left"></div>
            <div className="divider-image">
                <Image  src="/TV_Logo_white.png" alt="tv-white" width="150" height="100" />
            </div>
            <div className="white-divider divider-right"></div>
        </div>
    )
    
}