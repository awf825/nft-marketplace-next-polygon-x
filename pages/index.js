import Header from './divisions/header'
import MintGraphic from './divisions/mint-graphic'
import TVIntro from './divisions/tv-intro'
import Vision from './divisions/vision'
import Founders from './divisions/founders'
import Roadmap from './divisions/roadmap'
import Gallery from './divisions/gallery'

export default function Home() {
  return (
    <div className="flex justify-center top-container">
      <Header />
      {/* <MintGraphic /> */}
      <TVIntro />
      <Vision />
      <Founders />
      <Roadmap />
      <Gallery />
    </div>
  )
}