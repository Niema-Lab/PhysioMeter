import React, { Component } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getCurrentUser } from '../DB'
import Title from './form/Title'
import LoadingPage from './LoadingPage'

export class PatientHome extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            loaded: false
        }
    }

    componentDidMount = async () => {
        const user = await getCurrentUser()
        this.setState({ user, loaded: true })
    }

    render() {
        if (!this.state.user) {
            if (this.state.loaded) {
                return <Navigate to="/existing-patient" replace={true} />
            }
            return <LoadingPage />
        }

        // TODO: note there is currently only one; in the future there may be multiple measurement tests
        const measurementUUID = this.state.user.tests['measurements'][0].uuid;

        return (
            <div id="patient-home">
                <>
                    <Title>Patient Home Page: {this.state.user.name}</Title>
                    <nav className="d-flex flex-column align-items-center">
                        <Link to={`/patient-tests?uuid=${this.state.user.uuid}`} className="link text-decoration-underline"><h2>Patient Tests</h2></Link>
                        <Link to={`/measurements/home?uuid=${this.state.user.uuid}&testUUID=${measurementUUID}`} className="link text-decoration-underline"><h2>Measurements</h2></Link>
                    </nav>
                </>
            </div>
        )
    }
}

export default PatientHome
