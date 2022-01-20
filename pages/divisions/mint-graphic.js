import Image from 'next/image';
import MintPic from '../../public/mint_pic.png'

export default function MintGraphic() {
    return (
        <div className="mint-graphic">
            {/* <Image src="/mint_pic.png" layout="fill"/> */}
            <img
                src="../../public/mint_pic.png"
                style={{
                    width:"350",
                    height:"350"
                }}
            />
            {/* <p>MINT GRAPHIC</p> */}
        </div>
    )
}