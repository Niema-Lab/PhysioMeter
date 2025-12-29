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
            console.error('Failed to retrieve users:', e.target.error)
        }
    }

    deleteUser = async (user) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return
        }

        const db = await openDB()

        const tx = db.transaction('users', 'readwrite')
        const store = tx.objectStore('users')

        const deleteRequest = store.delete(user.uid)
        deleteRequest.onsuccess = () => {
            this.setState((prevState) => ({
                users: prevState.users.filter(u => u.uid !== user.uid),
                submitText: `User ${user.name} deleted successfully.`,
                submitTextType: 'success'
            }))
        }
        deleteRequest.onerror = (e) => {
            this.setState({
                submitText: `Failed to delete user ${user.name}: ${e.target.error}`,
                submitTextType: 'error'
            })
        }
    }

    render() {
        return (
            <div id="existing-user">
                <Title>Select Existing User</Title>
                <Link to="/new-user" className="link text-decoration-underline"><h2>Create New User</h2></Link>
                <Title>Existing Users</Title>
                {this.state.submitText && (
                    <Text value={this.state.submitText} type={this.state.submitTextType} />
                )}
                {this.state.users.map((user) => (
                    <div className="link" key={user.uid}>
                        <Link to={`/patient-home?uid=${user.uid}`} className="text-decoration-underline">
                            <h2>{user.name}</h2>
                        </Link>
                        <h2>
                            <i className="bi bi-trash-fill text-danger ms-4 cursor-p" onClick={() => this.deleteUser(user)}></i>
                        </h2>
                    </div>
                ))}
            </div>
        )
    }
}

export default ExistingUser