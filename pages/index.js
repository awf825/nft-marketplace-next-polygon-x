import Header from './divisions/header'
import TVIntro from './divisions/tv-intro'
import Vision from './divisions/vision'
import Founders from './divisions/founders'
import Roadmap from './divisions/roadmap'
import Gallery from './divisions/gallery'
import Footer from './divisions/footer'

export default function Home() {
  return (
    <div className="flex justify-center top-container">
      <Header />
      <TVIntro />
      <Vision />
      <Founders />
      <Roadmap />
      <Gallery />
      <Footer />
    </div>
  )
}