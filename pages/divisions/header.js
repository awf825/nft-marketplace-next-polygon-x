import HeaderElements from '../components/HeaderElements'
import Image from 'next/image'
// import { useEffect, useState, useRef } from 'react'
import 'react-sticky-header/styles.css';
import StickyHeader from 'react-sticky-header';

export default function Header() {
    return (
        <HeaderElements />
        // <StickyHeader
        //     // This is the sticky part of the header.
        //     header={<HeaderElements />}
        // >
        //     <section className="header-section">
        //         <p></p>
        //     </section>
        // </StickyHeader>
    )

}