import React, { Component } from 'react'

import { Name } from './measurements/Name'
import { Date } from './measurements/Date'
import { getCurrentUser } from '../DB.js'
import MultipleMeasurements from './MultipleMeasurements'

export class Utilities extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            names: null,
            dates: null
        }
    }

    componentDidMount = async () => {
        this.setState({ user: await getCurrentUser() })
    }

    render() {
        return (
            <div id="utilities">
                <h1 className="text-center w-100 my-5">Utilities {this.state.user && `(${this.state.user.name})`}</h1>
                <div className="utilities-list d-flex flex-column align-items-center">
                    <div className="utility-item w-100">
                        {!this.state.user &&
                            <MultipleMeasurements name="Name" component={Name} onChange={(names) => this.setState({ names })} />
                        }
                        <MultipleMeasurements name="Date of Birth" component={Date} onChange={(dates) => this.setState({ dates })} />
                    </div>
                </div>
            </div>
        )
    }
}

export default Utilities