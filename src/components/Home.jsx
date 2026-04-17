import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Title from './form/Title'

export default function Home() {
    const [showIndicator, setShowIndicator] = useState(false)

    useEffect(() => {
        const update = () => {
            const hasOverflow = document.documentElement.scrollHeight - 1 > window.innerHeight
            const scrolled = window.scrollY > 50
            setShowIndicator(hasOverflow && !scrolled)
        }
        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [])

    return (
        <div id="home">
            <Title>Home</Title>
            <nav className="d-flex flex-column align-items-center">
                <Link to="/new-patient" className="link text-decoration-underline"><h2>New Patient</h2></Link>
                <Link to="/existing-patient" className="link text-decoration-underline"><h2>Existing Patient</h2></Link>
                <Link to="/presets" className="link text-decoration-underline"><h2>Presets</h2></Link>
                <Link to="/utilities" className="link text-decoration-underline"><h2>Utilities</h2></Link>
                <Link to="/user-guide" className="link text-decoration-underline"><h2>User Guide</h2></Link>
            </nav>
            {showIndicator && (
                <svg id="home-scroll-indicator" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                    <path fillRule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                </svg>
            )}
        </div>
    )
}
