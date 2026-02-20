import { Component } from 'react'

import { Link } from 'react-router-dom'
import { getGuestUser } from '../DB'
import Title from './form/Title'

export class Home extends Component {
    constructor(props) {
        super(props)

        this.state = {
            guestUser: null,
        }
    }

    componentDidMount = async () => {
        const guestUser = await getGuestUser()
        this.setState({ guestUser })
    }

    render() {
        const guestUser = this.state.guestUser;
        if (!guestUser) {
            return;
        }

        const measurementTestUUID = guestUser.tests.measurements[0].uuid;

        return (
            <div id="home">
                <Title>Home</Title>
                <nav className="d-flex flex-column align-items-center">
                    <Link to="/new-patient" className="link text-decoration-underline"><h2>New Patient</h2></Link>
                    <Link to="/existing-patient" className="link text-decoration-underline"><h2>Existing Patient</h2></Link>
                    <Link to={`/measurements/home?testUUID=${measurementTestUUID}`} className="link text-decoration-underline"><h2>Measurements</h2></Link>
                </nav>
            </div>
        )
    }
}

export default Home