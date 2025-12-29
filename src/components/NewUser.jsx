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

        try {
            const user = await createDBUser(this.state.name, crypto.randomUUID())
        } catch (e) {
            this.setState({
                submitText: `Error creating user: ${e}`,
                submitTextType: 'error'
            })
            return
        }

        this.setState({
            submitText: `User "${this.state.name}" created successfully!`,
            submitTextType: 'success',
            name: ''
        })
    }

    render() {
        return (
            <div id="new-user">
                <Title>Create New User</Title>
                <Link to="/existing-user" className="link text-decoration-underline"><h2>View Existing Users</h2></Link>
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