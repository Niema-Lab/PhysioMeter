import React, { Component } from 'react'
import { Measurement } from './Measurement'

export class Name extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Measurement
                type="text"
                label={this.props.label}
                onLabelChange={this.props.onLabelChange}
                placeholder="Enter name"
                value={this.props.value}
                onChange={this.props.onChange}
                valid={this.props.valid}
                onDelete={this.props.onDelete}
            />
        )
    }
}

export default Name