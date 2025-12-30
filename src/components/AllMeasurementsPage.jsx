import React, { Component } from 'react'

import { Name, DoB, Sex, VitalSigns, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed, ThirtySecondSitToStand, AssistiveDevice, FourSquareStepTest, ModifiedFourSquareStepTest, TimedUpAndGo, TimedUpAndGoCognitive } from './measurements/MeasurementFactory'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import { getCurrentUser, openDB } from '../DB'
import Text from './form/Text'
import Title from './form/Title'
import Submit from './form/Submit'
import LoadingPage from './LoadingPage'

const THROTTLE_TIMEOUT = 500;

export class Measurements extends Component {
    constructor(props) {
        super(props)

        const STATE_OBJECT = MEASUREMENT_PAGE_CONFIG.reduce((acc, curr) => {
            acc[curr.stateKey] = []
            return acc
        }, {})

        this.state = {
            user: null,
            submitText: '',
            submitTextType: '',
            formState: JSON.parse(JSON.stringify(STATE_OBJECT)),
            validations: JSON.parse(JSON.stringify(STATE_OBJECT)),
            disabledValues: JSON.parse(JSON.stringify(STATE_OBJECT)),
            saveMeasurementsThrottled: false,
            saveMeasurementsLastCalled: 0,
        }
    }

    componentDidMount = async () => {
        const user = await getCurrentUser()
        this.setState({ user }, () => {
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

    checkValidVitals = () => {
        const vitalsValidations = this.state.validations['vitals']
        if (vitalsValidations.length === 0) {
            return false
        }
        for (const vitalValidation of vitalsValidations) {
            if (!Array.isArray(vitalValidation)) {
                return false
            }
            if (vitalValidation.some(v => !v)) {
                return false
            }
        }
        return true
    }

    passesValidation = () => {
        let valid = true;
        // for every component type component:
        for (const key in this.state.validations) {
            // for every instance of that component:
            const validationsArray = this.state.validations[key]
            for (let i = 0; i < validationsArray.length; i++) {
                // skip if disabled
                const isDisabled = [...this.state.disabledValues[key][i]]
                isDisabled.shift() // remove the vitals + physical activity disabled case
                if (isDisabled.length > 0 && isDisabled.some(v => v)) {
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

        // hard-coded additional validation: no empty labels or values allowed (and update validations accordingly)
        const validations = JSON.parse(JSON.stringify(this.state.validations))
        // for every component type component:
        for (const key in this.state.formState) {
            const measurementsArray = this.state.formState[key]
            // for every instance of that component:
            for (let i = 0; i < measurementsArray.length; i++) {
                // check label
                const measurement = measurementsArray[i]
                if (measurement.label.trim() === '') {
                    valid = false
                }
                // skip if disabled
                const isDisabled = [...this.state.disabledValues[key][i]]
                isDisabled.shift() // remove the vitals + physical activity disabled case
                if (isDisabled.length > 0 && isDisabled.some(v => v)) {
                    continue
                }
                // if the instance is composed of multiple fields, check each field
                if (Array.isArray(measurement.value)) {
                    if (!Array.isArray(validations[key][i])) {
                        validations[key][i] = []
                    }
                    for (let j = 0; j < measurement.value.length; j++) {
                        const val = measurement.value[j]
                        // check valid value (not empty)
                        if ((val === null || val === undefined || val.toString().trim() === '')) {
                            validations[key][i][j] = false
                            valid = false
                        }
                    }
                } else if ((measurement.value === null || measurement.value === undefined || measurement.value.toString().trim() === '')) {
                    validations[key][i] = false
                    valid = false
                }
            }
        }
        this.setState({ validations })

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

    saveMeasurements = async (manual = false, lastCalled = -1) => {
        if (lastCalled !== -1 && lastCalled < this.state.saveMeasurementsLastCalled) {
            return
        }

        if (this.state.saveMeasurementsThrottled && Date.now() - this.state.saveMeasurementsLastCalled < THROTTLE_TIMEOUT && !manual) {
            setTimeout(() => {
                this.saveMeasurements(false, Date.now())
            }, THROTTLE_TIMEOUT)
            return
        }

        this.setState({
            saveMeasurementsThrottled: true,
            saveMeasurementsLastCalled: Date.now(),
        })

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
                                    onChange={(value) => this.updateValues(stateKey, value)}
                                    measurements={this.state.formState[stateKey]}
                                    formState={this.state.formState}
                                    validations={this.state.validations[stateKey]}
                                    checkValidVitals={this.checkValidVitals}
                                    disabledValues={this.state.disabledValues[stateKey]}
                                    onValidationChange={(validations) => this.updateValidations(stateKey, validations)}
                                    onDisabledChange={(disabledValues) => this.updateDisabled(stateKey, disabledValues)}
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