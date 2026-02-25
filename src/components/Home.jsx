import { Component } from 'react'

import { Link } from 'react-router-dom'
import Title from './form/Title'

export class Home extends Component {
    render() {
        return (
            <div id="home">
                <Title>Home</Title>
                <nav className="d-flex flex-column align-items-center">
                    <Link to="/new-patient" className="link text-decoration-underline"><h2>New Patient</h2></Link>
                    <Link to="/existing-patient" className="link text-decoration-underline"><h2>Existing Patient</h2></Link>
                    <Link to={`/utilities/home`} className="link text-decoration-underline"><h2>Utilities</h2></Link>
                </nav>
            </div>
        )
    }
}

export default Home