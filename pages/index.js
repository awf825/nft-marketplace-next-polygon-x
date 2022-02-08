import { useEffect } from 'react';

import TVIntro from './divisions/tv-intro'
import Vision from './divisions/vision'
import Founders from './divisions/founders'
import Roadmap from './divisions/roadmap'
import Divider from './divisions/divider'
import Hero from './divisions/hero'

// // import Gallery from './divisions/gallery'
// import Footer from './divisions/footer'

export default function Home() {  
  return (
    <div className="flex justify-center top-container">
      <Hero />
      <TVIntro />
      <Vision />
      <Divider />
      <Founders />
      <Divider />
      <Roadmap />
    </div>
  )
}
