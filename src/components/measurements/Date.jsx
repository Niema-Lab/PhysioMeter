import React, { Component } from 'react'
import Measurement from './Measurement'

export class Date extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Measurement
                type="date"
                label={this.props.label}
                onLabelChange={this.props.onLabelChange}
                placeholder="Select date"
                value={this.props.value}
                onChange={this.props.onChange}
                valid={this.props.valid}
                onDelete={this.props.onDelete}
            />
        )
    }
}

export default Date