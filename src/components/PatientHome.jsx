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

        return (
            <div id="patient-home">
                {this.state.user.uuid !== 'guest' ?
                    <>
                        <Title>Patient Home Page: {this.state.user.name}</Title>
                        <nav className="d-flex flex-column align-items-center">
                            <Link to={`/patient-tests?uuid=${this.state.user.uuid}`} className="link text-decoration-underline"><h2>Patient Tests</h2></Link>
                            <Link to={`/measurements?uuid=${this.state.user.uuid}`} className="link text-decoration-underline"><h2>Measurements</h2></Link>
                        </nav>
                    </>
                    :
                    <Title>Patient Home Page</Title>
                }

            </div>
        )
    }
}

export default PatientHome
