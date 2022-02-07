import Image from 'next/image'

export default function MinterPage() {
    return (
        <div className="minter">
            <div className="minter-image" style={{textAlign: "center"}}>
                <Image src={"/turtles.gif"} width={500} height={500}/>
                <h1>MINT MACHINE COMING SOON</h1>
            </div>
        </div>
    )
}