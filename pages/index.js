import HeaderWithLogo from './divisions/header-with-logo'
import MintGraphic from './divisions/mint-graphic'
import TVIntro from './divisions/tv-intro'
import Vision from './divisions/vision'
import Founders from './divisions/founders'
import Roadmap from './divisions/roadmap'
import Gallery from './divisions/gallery'

export default function Home() {
  return (
    <div className="flex justify-center top-container">
      <HeaderWithLogo />
      <MintGraphic />
      <TVIntro />
      <Vision />
      <Founders />
      <Roadmap />
      <Gallery />
      {/* <div className="px-4" style={{ width: '90%' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          WELCOME TO TURTLEVERSE
          <MintGraphic />
        </div>
      </div> */}
    </div>
  )
}