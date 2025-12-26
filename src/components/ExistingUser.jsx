import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { openDB } from '../DB.js'
import Text from './form/Text'
import Title from './form/Title'

export class ExistingUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    async componentDidMount() {
        const db = await openDB()

        const tx = db.transaction('users', 'readonly')
        const store = tx.objectStore('users')

        const allUsers = store.getAll()
        allUsers.onsuccess = () => {
            console.log('Existing users:', allUsers.result)
            this.setState({ users: allUsers.result })
        }
        allUsers.onerror = (e) => {
            console.error('Failed to retrieve users:', e.target.error)
        }
    }

    render() {
        return (
            <div id="existing-user">
                <Title tag="h1" value="Select Existing User" />
                {this.state.users.map((user) => (
                    <Link key={user.uid} to={`/patient-home?uid=${user.uid}`} className="link text-decoration-underline">
                        <h2>{user.name}</h2>
                    </Link>
                ))}
            </div>
        )
    }
}

export default ExistingUser