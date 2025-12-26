import React, { Component } from 'react'

import { Name, Date, Sex } from './measurements/Measurement'
import VitalSigns from './measurements/VitalSigns'
import MultipleMeasurements from './MultipleMeasurements'
import { getCurrentUser } from '../DB.js'
import Title from './form/Title'
import Submit from './form/Submit.jsx'

export class Utilities extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            names: null,
            dates: null,
            sexes: null,
            vitals: null
        }
    }

    componentDidMount = async () => {
        this.setState({ user: await getCurrentUser() })
    }

    render() {
        return (
            <div id="utilities">
                <Title>Utilities {this.state.user && `(${this.state.user.name})`}</Title>
                <div className="utilities-list d-flex flex-column align-items-center">
                    <div className="utility-item w-100">
                        {!this.state.user &&
                            <MultipleMeasurements name="Name" component={Name} onChange={(names) => this.setState({ names })} />
                        }
                        <MultipleMeasurements name="Date of Birth" component={Date} onChange={(dates) => this.setState({ dates })} />
                        <MultipleMeasurements name="Sex" component={Sex} onChange={(sexes) => this.setState({ sexes })} />
                        <MultipleMeasurements name="Vital Signs" component={VitalSigns} onChange={(vitals) => this.setState({ vitals })} />
                    </div>
                </div>
                <Submit value="Save Utilities" onClick={() => {
                    console.log(this.state)
                }} />
            </div>
        )
    }
}

export default Utilities