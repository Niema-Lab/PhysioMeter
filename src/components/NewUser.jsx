import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Name } from './measurements/MeasurementFactory'
import Submit from './form/Submit'
import Title from './form/Title'
import Text from './form/Text'
import { createDBUser } from '../DB'

export class NewUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            nameValid: true,
            submitText: '',
            submitTextType: ''
        }
    }

    validate = () => {
        let valid = true

        if (!this.state.name || this.state.name.trim() === '') {
            this.setState({ nameValid: false })
            valid = false
        } else {
            this.setState({ nameValid: true })
        }

        return valid
    }

    createUser = async () => {
        if (!this.validate()) {
            return
        }

        const name = this.state.name.trim()

        try {
            const user = await createDBUser(name, crypto.randomUUID())
        } catch (e) {
            this.setState({
                submitText: `Error creating patient: ${e}`,
                submitTextType: 'error'
            })
            return
        }

        this.setState({
            submitText: `Patient "${name}" created successfully!`,
            submitTextType: 'success',
            name: ''
        })
    }

    render() {
        return (
            <div id="new-patient">
                <Title>Create New Patient</Title>
                <Link to="/existing-patient" className="link text-decoration-underline"><h2>View Existing Patients</h2></Link>
                <Name
                    value={this.state.name}
                    onChange={(v) => this.setState({ name: v })}
                    valid={this.state.nameValid}
                />
                <Submit onClick={this.createUser} />
                {this.state.submitText &&
                    <Text value={this.state.submitText} type={this.state.submitTextType} />
                }
            </div>
        )
    }
}

export default NewUser