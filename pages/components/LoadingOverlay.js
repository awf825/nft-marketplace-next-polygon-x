import Image from 'next/image'

export default function LoadingOverlay({ loading }) {
    return (
        loading
        ?
        <h1>HIIII</h1>
        :
        null
    )
}