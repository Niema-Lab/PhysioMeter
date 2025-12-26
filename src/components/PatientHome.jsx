import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

import { getCurrentUser } from '../DB.js'
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
            <div id="home">
                {this.state.user ?
                    <Fragment>
                        <Title value={`Patient Home Page: ${this.state.user.name}`} />
                        <nav className="d-flex flex-column align-items-center">
                            <Link to={`/patient-tests${this.state.user ? `?uid=${this.state.user.uid}` : ''}`} className="link text-decoration-underline"><h2>Patient Tests</h2></Link>
                            <Link to={`/utilities${this.state.user ? `?uid=${this.state.user.uid}` : ''}`} className="link text-decoration-underline"><h2>Utilities</h2></Link>
                        </nav>
                    </Fragment>
                    :
                    <Title value="Patient Home Page" />
                }

            </div>
        )
    }
}

export default PatientHome
