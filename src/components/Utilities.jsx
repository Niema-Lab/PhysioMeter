import React, { Component } from 'react'

import { Name, DoB, Sex, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed } from './measurements/Measurement'
import VitalSigns from './measurements/VitalSigns'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import { getCurrentUser } from '../DB'
import Title from './form/Title'
import Submit from './form/Submit'

export class Utilities extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            names: null,
            dates: null,
            sexes: null,
            vitals: null,
            usualSpeeds: null,
            fastSpeeds: null
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
                        <MultipleMeasurements name="Date of Birth" component={DoB} onChange={(dates) => this.setState({ dates })} oneMax={this.state.user} />
                        <MultipleMeasurements name="Sex" component={Sex} onChange={(sexes) => this.setState({ sexes })} oneMax={this.state.user} />
                        <MultipleMeasurements name="Vital Signs" component={VitalSigns} onChange={(vitals) => this.setState({ vitals })} />
                        <MultipleMeasurements name="5 Meter Usual Walking Speed" component={FiveMeterUsualWalkingSpeed} onChange={(usualSpeeds) => this.setState({ usualSpeeds })} />
                        <MultipleMeasurements name="5 Meter Fast Walking Speed" component={FiveMeterFastWalkingSpeed} onChange={(fastSpeeds) => this.setState({ fastSpeeds })} />
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