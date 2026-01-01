import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { openDB } from '../DB'
import Title from './form/Title'
import Text from './form/Text'

export class ExistingUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: [],
            submitText: '',
            submitTextType: ''
        }
    }

    componentDidMount = async () => {
        const db = await openDB()

        const tx = db.transaction('users', 'readonly')
        const store = tx.objectStore('users')

        const allUsers = store.getAll()
        allUsers.onsuccess = () => {
            this.setState({ users: allUsers.result })
        }
        allUsers.onerror = (e) => {
            console.error('Failed to retrieve patients:', e.target.error)
        }
    }

    deleteUser = async (user) => {
        if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            return
        }

        const db = await openDB()

        const tx = db.transaction('users', 'readwrite')
        const store = tx.objectStore('users')

        const deleteRequest = store.delete(user.uuid)
        deleteRequest.onsuccess = () => {
            this.setState((prevState) => ({
                users: prevState.users.filter(u => u.uuid !== user.uuid),
                submitText: `Patient ${user.name} deleted successfully.`,
                submitTextType: 'success'
            }))
        }
        deleteRequest.onerror = (e) => {
            this.setState({
                submitText: `Failed to delete patient ${user.name}: ${e.target.error}`,
                submitTextType: 'error'
            })
        }
    }

    render() {
        return (
            <div id="existing-patient">
                <Title>Select Existing Patient</Title>
                <Link to="/new-patient" className="link text-decoration-underline"><h2>Create New Patient</h2></Link>
                <Title>Existing Patients</Title>
                {this.state.submitText && (
                    <Text value={this.state.submitText} type={this.state.submitTextType} />
                )}
                {this.state.users.map((user) => {
                    if (user.uuid === 'guest') {
                        return null
                    }

                    return (
                        <div className="link" key={user.uuid}>
                            <Link to={`/patient-home?uuid=${user.uuid}`}>
                                <h2>{user.name}</h2>
                                <p className="text-decoration-none">Created: {new Date(user.createdAt).toLocaleString()}</p>
                            </Link>
                            <h2>
                                <i className="bi bi-trash-fill text-danger ms-4 cursor-p" onClick={() => this.deleteUser(user)} aria-label={`Delete patient ${user.name}`}></i>
                            </h2>
                        </div>
                    )
                })}
            </div>
        )
    }
}

export default ExistingUser