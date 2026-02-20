import React, { Component } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { getCurrentUser } from '../DB'
import Title from './form/Title'
import LoadingPage from './LoadingPage'

export class PatientTests extends Component {
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

        const annualMobilityUUID = this.state.user.tests['annualMobilityScreening'][0].uuid;

        return (
            <div id="patient-tests">
                <Title>Patient Tests</Title>
                <nav className="d-flex flex-column align-items-center">
                    <Link to={`/annualMobilityScreening/home?uuid=${this.state.user.uuid}&testUUID=${annualMobilityUUID}`} className="link text-decoration-underline"><h2>Annual Mobility Screen</h2></Link>
                </nav>
            </div>
        )
    }
}

export default PatientTests
