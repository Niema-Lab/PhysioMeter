import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { getCurrentUser } from '../DB'
import Title from './form/Title'

export class PatientHome extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null
        }
    }

    componentDidMount = async () => {
        this.setState({ user: await getCurrentUser() })
    }

    render() {
        return (
            <div id="patient-home">
                {this.state.user ?
                    <>
                        <Title>Patient Home Page: {this.state.user.name}</Title>
                        <nav className="d-flex flex-column align-items-center">
                            <Link to={`/patient-tests?uid=${this.state.user.uid}`} className="link text-decoration-underline"><h2>Patient Tests</h2></Link>
                            <Link to={`/measurements?uid=${this.state.user.uid}`} className="link text-decoration-underline"><h2>Measurements</h2></Link>
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
