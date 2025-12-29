import React, { Component } from 'react'

import { Name, DoB, Sex, VitalSigns, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed, ThirtySecondSitToStand, AssistiveDevice, FourSquareStepTest, ModifiedFourSquareStepTest, TimedUpAndGo, TimedUpAndGoCognitive } from './measurements/MeasurementFactory'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import { getCurrentUser, openDB } from '../DB'
import Text from './form/Text'
import Title from './form/Title'
import Submit from './form/Submit'
import LoadingPage from './LoadingPage'

export class Measurements extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: null,
            submitText: '',
            submitTextType: '',
            formState: {
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
    }

    componentDidMount = async () => {
        this.setState({ user: await getCurrentUser() }, () => {
            if (this.state.user.measurements && Object.keys(this.state.user.measurements).length > 0) {
                this.setState({ formState: JSON.parse(JSON.stringify(this.state.user.measurements)) })
            }
        })
    }

    updateFormState = (key, value) => {
        this.setState(prevState => ({
            formState: {
                ...prevState.formState,
                [key]: value
            }
        }))
    }

    saveMeasurements = async () => {
        const db = await openDB()

        const tx = db.transaction('users', 'readwrite')
        const store = tx.objectStore('users')
        const getUserRequest = store.get(this.state.user.uuid)

        getUserRequest.onsuccess = () => {
            const user = getUserRequest.result

            user.measurements = JSON.parse(JSON.stringify(this.state.formState))

            const updateRequest = store.put(user)
            updateRequest.onsuccess = () => {
                this.setState({
                    submitText: 'Measurements saved successfully!',
                    submitTextType: 'success'
                })
                window.scrollTo(0, document.body.scrollHeight);
            }
            updateRequest.onerror = (e) => {
                this.setState({
                    submitText: `Error saving measurements: ${e.target.error}`,
                    submitTextType: 'error'
                })
                window.scrollTo(0, document.body.scrollHeight);
            }
        }

        getUserRequest.onerror = (e) => {
            this.setState({
                submitText: `Error retrieving user for saving measurements: ${e.target.error}`,
                submitTextType: 'error'
            })
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    render() {
        if (!this.state.user) {
            return <LoadingPage />
        }

        return (
            <div id="measurements">
                <Title>Measurements {this.state.user.uuid !== 'guest' && `(${this.state.user.name})`}</Title>
                <div className="measurements-list d-flex flex-column align-items-center">
                    <div className="utility-item w-100">
                        {MEASUREMENT_PAGE_CONFIG.map(({ name, component, stateKey, guestOnly, oneMax }) => {
                            if (guestOnly && this.state.user.uuid !== 'guest') return null
                            return (
                                <MultipleMeasurements
                                    key={stateKey}
                                    name={name}
                                    component={component}
                                    onChange={(value) => this.updateFormState(stateKey, value)}
                                    measurements={this.state.formState[stateKey]}
                                    formState={this.state.formState}
                                    oneMax={oneMax ? this.state.user.uuid : undefined}
                                />
                            )
                        })}
                    </div>
                </div>
                <Submit label="Save Measurements" onClick={this.saveMeasurements} />
                {this.state.submitText &&
                    <Text value={this.state.submitText} type={this.state.submitTextType} />
                }
            </div>
        )
    }
}

const MEASUREMENT_PAGE_CONFIG = [
    {
        name: 'Name',
        component: Name,
        stateKey: 'names',
        guestOnly: true
    },
    {
        name: 'Date of Birth',
        component: DoB,
        stateKey: 'dates',
        oneMax: true
    },
    {
        name: 'Sex',
        component: Sex,
        stateKey: 'sexes',
        oneMax: true
    },
    {
        name: 'Vital Signs',
        component: VitalSigns,
        stateKey: 'vitals'
    },
    {
        name: '5 Meter Usual Walking Speed',
        component: FiveMeterUsualWalkingSpeed,
        stateKey: 'usualSpeeds'
    },
    {
        name: '5 Meter Fast Walking Speed',
        component: FiveMeterFastWalkingSpeed,
        stateKey: 'fastSpeeds'
    },
    {
        name: '30 Second Sit to Stand',
        component: ThirtySecondSitToStand,
        stateKey: 'sitToStands'
    },
    {
        name: 'Assistive Device',
        component: AssistiveDevice,
        stateKey: 'assistiveDevices'
    },
    {
        name: 'Four Square Step Test',
        component: FourSquareStepTest,
        stateKey: 'fourSquareStepTests'
    },
    {
        name: 'Modified Four Square Step Test',
        component: ModifiedFourSquareStepTest,
        stateKey: 'modifiedFourSquareStepTests'
    },
    {
        name: 'Timed Up and Go',
        component: TimedUpAndGo,
        stateKey: 'timedUpAndGos'
    },
    {
        name: 'Timed Up and Go Cognitive',
        component: TimedUpAndGoCognitive,
        stateKey: 'timedUpAndGosCognitive'
    },
]

export default Measurements