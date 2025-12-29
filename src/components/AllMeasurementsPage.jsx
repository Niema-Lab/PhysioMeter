import React, { Component } from 'react'

import { Name, DoB, Sex, VitalSigns, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed, ThirtySecondSitToStand, AssistiveDevice, FourSquareStepTest, ModifiedFourSquareStepTest, TimedUpAndGo, TimedUpAndGoCognitive } from './measurements/MeasurementFactory'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import { getCurrentUser } from '../DB'
import Title from './form/Title'
import Submit from './form/Submit'

export class Measurements extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: [],
            names: [],
            dates: [],
            sexes: [],
            vitals: [],
            usualSpeeds: [],
            fastSpeeds: [],
            sitToStands: [],
            assistiveDevices: [],
            fourSquareStepTests: [],
            modifiedFourSquareStepTests: [],
            timedUpAndGos: [],
            timedUpAndGosCognitive: [],
        }
    }

    componentDidMount = async () => {
        this.setState({ user: await getCurrentUser() })
    }

    render() {
        return (
            <div id="measurements">
                <Title>Measurements {this.state.user && `(${this.state.user.name})`}</Title>
                <div className="measurements-list d-flex flex-column align-items-center">
                    <div className="utility-item w-100">
                        {!this.state.user &&
                            <MultipleMeasurements name="Name" component={Name} onChange={(names) => this.setState({ names })} formState={this.state} />
                        }
                        <MultipleMeasurements name="Date of Birth" component={DoB} onChange={(dates) => this.setState({ dates })} oneMax={this.state.user} formState={this.state} />
                        <MultipleMeasurements name="Sex" component={Sex} onChange={(sexes) => this.setState({ sexes })} oneMax={this.state.user} formState={this.state} />
                        <MultipleMeasurements name="Vital Signs" component={VitalSigns} onChange={(vitals) => this.setState({ vitals })} formState={this.state} />
                        <MultipleMeasurements name="5 Meter Usual Walking Speed" component={FiveMeterUsualWalkingSpeed} onChange={(usualSpeeds) => this.setState({ usualSpeeds })} formState={this.state} />
                        <MultipleMeasurements name="5 Meter Fast Walking Speed" component={FiveMeterFastWalkingSpeed} onChange={(fastSpeeds) => this.setState({ fastSpeeds })} formState={this.state} />
                        <MultipleMeasurements name="30 Second Sit to Stand" component={ThirtySecondSitToStand} onChange={(sitToStands) => this.setState({ sitToStands })} formState={this.state} />
                        <MultipleMeasurements name="Assistive Device" component={AssistiveDevice} onChange={(assistiveDevices) => this.setState({ assistiveDevices })} formState={this.state} />
                        <MultipleMeasurements name="Four Square Step Test" component={FourSquareStepTest} onChange={(fourSquareStepTests) => this.setState({ fourSquareStepTests })} formState={this.state} />
                        <MultipleMeasurements name="Modified Four Square Step Test" component={ModifiedFourSquareStepTest} onChange={(modifiedFourSquareStepTests) => this.setState({ modifiedFourSquareStepTests })} formState={this.state} />
                        <MultipleMeasurements name="Timed Up and Go" component={TimedUpAndGo} onChange={(timedUpAndGos) => this.setState({ timedUpAndGos })} formState={this.state} />
                        <MultipleMeasurements name="Timed Up and Go Cognitive" component={TimedUpAndGoCognitive} onChange={(timedUpAndGosCognitive) => this.setState({ timedUpAndGosCognitive })} formState={this.state} />
                    </div>
                </div>
                <Submit value="Save Measurements" onClick={() => {
                    console.log(this.state)
                }} />
            </div>
        )
    }
}

export default Measurements