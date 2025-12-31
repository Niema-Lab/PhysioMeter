import React, { Component } from 'react'

import { Navigate } from "react-router-dom"
import { Name, DoB, Sex, VitalSigns, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed, ThirtySecondSitToStand, AssistiveDevice, FourSquareStepTest, ModifiedFourSquareStepTest, TimedUpAndGo, TimedUpAndGoCognitive, MEASUREMENT_CONFIGS } from './measurements/MeasurementFactory'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import { getCurrentUser, openDB } from '../DB'
import Text from './form/Text'
import Title from './form/Title'
import Submit from './form/Submit'
import LoadingPage from './LoadingPage'

const THROTTLE_TIMEOUT = 250;

export class Measurements extends Component {
    constructor(props) {
        super(props)

        const STATE_OBJECT = MEASUREMENT_PAGE_CONFIG.reduce((acc, curr) => {
            acc[curr.stateKey] = []
            return acc
        }, {})

        this.state = {
            loaded: false,
            user: null,
            submitText: '',
            submitTextType: '',
            formState: JSON.parse(JSON.stringify(STATE_OBJECT)),
            validations: JSON.parse(JSON.stringify(STATE_OBJECT)),
            disabledValues: JSON.parse(JSON.stringify(STATE_OBJECT)),
        }

        this.lastSaved = 0;
        this.saveQueued = false;
    }

    componentDidMount = async () => {
        const user = await getCurrentUser()
        this.setState({ user, loaded: true }, () => {
            if (this.state.user?.measurements?.formState && Object.keys(this.state.user.measurements.formState).length > 0) {
                this.setState({
                    formState: JSON.parse(JSON.stringify(this.state.user.measurements.formState)),
                    validations: JSON.parse(JSON.stringify(this.state.user.measurements.validations)),
                    disabledValues: JSON.parse(JSON.stringify(this.state.user.measurements.disabledValues)),
                })
            }
        })
    }

    updateValues = (key, value) => {
        this.setState(prevState => ({
            formState: {
                ...prevState.formState,
                [key]: value
            }
        }), () => {
            this.saveMeasurements()
        })
    }

    updateValidations = (key, validations) => {
        this.setState(prevState => ({
            validations: {
                ...prevState.validations,
                [key]: validations
            }
        }), () => {
            this.saveMeasurements()
        })
    }

    isDisabled = (measurementKey, index) => {
        const { formState, validations, disabledValues } = this.state;
        const disabledVals = [...disabledValues[measurementKey][index]];
        for (let i = 0; i < MEASUREMENT_CONFIGS[measurementKey]?.disabledCasesComputed?.length ?? 0; i++) {
            const disabledCaseComputed = MEASUREMENT_CONFIGS[measurementKey].disabledCasesComputed[i]
            // if the disabled case is not shown, set the disabled value to false
            if (!disabledCaseComputed.showOverride(formState, validations, disabledValues, measurementKey)) {
                disabledVals[i] = false
            }
        }
        return (disabledVals.some(val => val) || false)
    }

    // if the disabled case shouldn't be shown, return null for the text
    getDisableCaseComputedText = (measurementKey) => {
        const { formState, validations, disabledValues } = this.state;
        const result = []
        for (let i = 0; i < MEASUREMENT_CONFIGS[measurementKey]?.disabledCasesComputed?.length ?? 0; i++) {
            const disabledCaseComputed = MEASUREMENT_CONFIGS[measurementKey].disabledCasesComputed[i]
            result.push(disabledCaseComputed.showOverride(formState, validations, disabledValues, measurementKey) ? disabledCaseComputed.text : null)
        }
        return result
    }

    passesValidation = () => {
        let valid = true;
        // for every component type component:
        for (const key in this.state.validations) {
            // for every instance of that component:
            const validationsArray = [...this.state.validations[key]]
            for (let i = 0; i < validationsArray.length; i++) {
                // skip if disabled
                if (this.isDisabled(key, i)) {
                    continue
                }
                const isValid = validationsArray[i]
                // if the instance is composed of multiple fields, check each field
                if (Array.isArray(isValid)) {
                    for (const subValid of isValid) {
                        if (!subValid) {
                            valid = false
                        }
                    }
                } else {
                    if (!isValid) {
                        valid = false
                    }
                }
            }
        }

        return valid
    }

    updateDisabled = (key, disabledValue) => {
        this.setState(prevState => ({
            disabledValues: {
                ...prevState.disabledValues,
                [key]: disabledValue
            }
        }), () => {
            this.saveMeasurements()
        })
    }

    saveMeasurements = async (manual = false) => {
        if (this.saveQueued) {
            return;
        }

        const now = Date.now();
        const timeSinceLastSave = now - this.lastSaved;

        if (!manual && timeSinceLastSave < THROTTLE_TIMEOUT) {
            this.saveQueued = true;
            setTimeout(() => {
                this.saveQueued = false;
                this.saveMeasurements();
            }, THROTTLE_TIMEOUT);
            return;
        }

        this.lastSaved = now;

        const passesValidation = this.passesValidation()
        if (!passesValidation) {
            this.setState({
                submitText: 'Please correct the highlighted errors before saving.',
                submitTextType: 'danger'
            }, () => {
                manual && window.scrollTo(0, document.body.scrollHeight);
            })
        } else if (!manual) {
            this.setState({
                submitText: '',
                submitTextType: ''
            })
        }

        const db = await openDB()

        const tx = db.transaction('users', 'readwrite')
        const store = tx.objectStore('users')
        const getUserRequest = store.get(this.state.user.uuid)

        getUserRequest.onsuccess = () => {
            const user = getUserRequest.result

            user.measurements = {
                formState: JSON.parse(JSON.stringify(this.state.formState)),
                validations: JSON.parse(JSON.stringify(this.state.validations)),
                disabledValues: JSON.parse(JSON.stringify(this.state.disabledValues)),
            }

            const updateRequest = store.put(user)
            updateRequest.onsuccess = () => {
                if (manual && passesValidation) {
                    this.setState({
                        submitText: 'Measurements saved successfully!',
                        submitTextType: 'success'
                    }, () => {
                        window.scrollTo(0, document.body.scrollHeight)
                    })
                }
            }
            updateRequest.onerror = (e) => {
                this.setState({
                    submitText: `Error saving measurements: ${e.target.error}`,
                    submitTextType: 'danger'
                }, () => {
                    window.scrollTo(0, document.body.scrollHeight)
                })
            }
        }

        getUserRequest.onerror = (e) => {
            this.setState({
                submitText: `Error retrieving patient for saving measurements: ${e.target.error}`,
                submitTextType: 'danger'
            }, () => {
                window.scrollTo(0, document.body.scrollHeight)
            })
        }
    }

    render() {
        if (!this.state.user) {
            if (this.state.loaded) {
                return <Navigate to="/existing-patient" replace={true} />
            }
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
                                    measurementKey={stateKey}
                                    name={name}
                                    measurementConfig={MEASUREMENT_CONFIGS[stateKey]}
                                    component={component}
                                    onChange={(value) => this.updateValues(stateKey, value)}
                                    measurements={this.state.formState[stateKey]}
                                    validations={this.state.validations}
                                    disabledValues={this.state.disabledValues}
                                    onValidationChange={(validations) => this.updateValidations(stateKey, validations)}
                                    onDisabledChange={(disabledValues) => this.updateDisabled(stateKey, disabledValues)}
                                    isDisabled={this.isDisabled}
                                    getDisableCaseComputedText={this.getDisableCaseComputedText}
                                    oneMax={this.state.user.uuid !== 'guest' ? oneMax : false}
                                />
                            )
                        })}
                    </div>
                </div>
                <Submit label="Save Measurements" onClick={() => this.saveMeasurements(true)} />
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
        stateKey: 'name',
        guestOnly: true,
    },
    {
        name: 'Date of Birth',
        component: DoB,
        stateKey: 'dob',
        oneMax: true,
    },
    {
        name: 'Sex',
        component: Sex,
        stateKey: 'sex',
        oneMax: true,
    },
    {
        name: 'Vital Signs',
        component: VitalSigns,
        stateKey: 'vitalSigns',
    },
    {
        name: '5 Meter Usual Walking Speed',
        component: FiveMeterUsualWalkingSpeed,
        stateKey: 'fiveMeterUsualWalkingSpeed',
    },
    {
        name: '5 Meter Fast Walking Speed',
        component: FiveMeterFastWalkingSpeed,
        stateKey: 'fiveMeterFastWalkingSpeed',
    },
    {
        name: '30 Second Sit to Stand',
        component: ThirtySecondSitToStand,
        stateKey: 'thirtySecondSitToStand',
    },
    {
        name: 'Assistive Device',
        component: AssistiveDevice,
        stateKey: 'assistiveDevices',
    },
    {
        name: 'Four Square Step Test',
        component: FourSquareStepTest,
        stateKey: 'fourSquareStepTest'
    },
    {
        name: 'Modified Four Square Step Test',
        component: ModifiedFourSquareStepTest,
        stateKey: 'modifiedFourSquareStepTest'
    },
    {
        name: 'Timed Up and Go',
        component: TimedUpAndGo,
        stateKey: 'timedUpAndGo'
    },
    {
        name: 'Timed Up and Go Cognitive',
        component: TimedUpAndGoCognitive,
        stateKey: 'timedUpAndGosCognitive'
    },
]

export default Measurements