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
                <div id="home-scroll-indicator" aria-hidden="true">
                    <i className="bi bi-chevron-double-down"></i>
                </div>
            )}
        </div>
    )
}
