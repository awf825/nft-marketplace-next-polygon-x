import HeaderElements from '../components/HeaderElements'
// import { useEffect, useState, useRef } from 'react'
import 'react-sticky-header/styles.css';
import StickyHeader from 'react-sticky-header';

export default function Header() {
    return (
        <StickyHeader
            // This is the sticky part of the header.
            header={<HeaderElements />}
        >
            <section className="header-section">
            </section>
        </StickyHeader>
    )
}