import React, { Component } from 'react'
import Measurement, { RestingPulseRate, BloodPressure, OxygenSaturation } from './Measurement'

export class VitalSigns extends Measurement {
    constructor(props) {
        super(props)

        this.state = {
            vitals: {
                restingPulseRate: null,
                bloodPressure: null,
                oxygenSaturation: null
            }
        }
    }

    updateVitals = (key, value) => {
        const newVitals = { ...this.state.vitals, [key]: value }
        this.setState({ vitals: newVitals })
        this.props.onChange(newVitals)
    }

    render() {
        return (
            <div className="measurement d-flex flex-column pt-4">
                <div className="d-flex align-items-center">
                    {this.renderLabel()}
                    {this.renderDeleteButton()}
                </div>
                <RestingPulseRate value={this.state.vitals.restingPulseRate} onChange={(value) => this.updateVitals('restingPulseRate', value)} />
                <BloodPressure value={this.state.vitals.bloodPressure} onChange={(value) => this.updateVitals('bloodPressure', value)} />
                <OxygenSaturation value={this.state.vitals.oxygenSaturation} onChange={(value) => this.updateVitals('oxygenSaturation', value)} />
            </div>
        )
    }
}

export default VitalSigns