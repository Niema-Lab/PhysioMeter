import React, { Component } from 'react'

import { Navigate } from "react-router-dom"
import { Name, DoB, Sex, VitalSigns, FiveMeterUsualWalkingSpeed, FiveMeterFastWalkingSpeed, ThirtySecondSitToStand, AssistiveDevice, FourSquareStepTest, ModifiedFourSquareStepTest, TimedUpAndGo, TimedUpAndGoCognitive, MEASUREMENT_CONFIGS } from './measurements/MeasurementFactory'
import MultipleMeasurements from './measurements/MultipleMeasurements'
import SummaryPage from './SummaryPage'
import { getCurrentUser, openDB } from '../DB'
import Title from './form/Title'
import LoadingPage from './LoadingPage'

const THROTTLE_TIMEOUT = 250;
export const MEASUREMENT_HOME_PAGE = 'home';
export const MEASUREMENT_FINAL_PAGE = 'summary';

export class AllMeasurementsPage extends Component {
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
            formState: JSON.parse(JSON.stringify(STATE_OBJECT)), // the form state but just the labels, values, lastModified, lastStarted (for timer-based measurements)
            validations: JSON.parse(JSON.stringify(STATE_OBJECT)), // the form state but just the validation info
            disabledValues: JSON.parse(JSON.stringify(STATE_OBJECT)), // the form state but just the disabled cases info
            navShown: false,
        }

        this.lastSaved = 0;
        this.saveQueued = false;
    }

    componentDidMount = async () => {
        const user = await getCurrentUser()
        this.setState({ user, loaded: true }, () => {
            if (this.state.user?.measurements?.formState && Object.keys(this.state.user.measurements.formState).length > 0) {
                const formState = JSON.parse(JSON.stringify(this.state.user.measurements.formState))
                if (this.props.shownMeasurement !== MEASUREMENT_FINAL_PAGE && (formState[this.props.shownMeasurement] === undefined || formState[this.props.shownMeasurement].length === 0)) {
                    this.setMeasurementShown(MEASUREMENT_HOME_PAGE)
                }
                this.setState({
                    formState,
                    validations: JSON.parse(JSON.stringify(this.state.user.measurements.validations)),
                    disabledValues: JSON.parse(JSON.stringify(this.state.user.measurements.disabledValues)),
                })
            }
        })

        this.props.setNavIcons([this.renderNavIcon()])
        this.props.setNav(this.renderNav())
    }

    componentDidUpdate = (previousProps) => {
        if (this.props.location !== previousProps.location) {
            console.log(this.props.location);
            console.log(previousProps.location);
        }
    }

    componentWillUnmount = () => {
        this.props.setNavIcons([])
        this.props.setNav(null)
    }

    toggleNav = (forcedState = undefined) => {
        this.setState(prevState => ({ navShown: forcedState !== undefined ? forcedState : !prevState.navShown }), () => {
            this.props.setNavIcons([this.renderNavIcon()])
            this.props.setNav(this.renderNav())
        })
    }

    setMeasurementShown = (measurementKey) => {
        const uuid = this.state.user?.uuid;
        const search = uuid && uuid !== "guest" ? `?uuid=${uuid}` : "";

        window.scrollTo(0, 0);
        this.props.navigate(`/measurements/${measurementKey}${search}`, { replace: false });
        this.toggleNav(false);
    }

    getMeasurementIndexByKey = (measurementKey) => {
        return measurementKey === MEASUREMENT_HOME_PAGE ? 0 : (measurementKey === MEASUREMENT_FINAL_PAGE ? MEASUREMENT_PAGE_CONFIG.length + 1 : MEASUREMENT_PAGE_CONFIG.findIndex(m => m.stateKey === measurementKey) + 1);
    }

    // similar to getMeasurementIndexByKey but removes any measurements that have not been selected
    getRelativeMeasurementIndexByKey = (measurementKey) => {
        let filteredMeasurements = [...MEASUREMENT_PAGE_CONFIG].filter(m => this.state.formState[m.stateKey].length > 0);
        if (measurementKey === MEASUREMENT_HOME_PAGE) {
            return [0, filteredMeasurements.length + 1];
        } else if (measurementKey === MEASUREMENT_FINAL_PAGE) {
            return [filteredMeasurements.length + 1, filteredMeasurements.length + 1];
        } else {
            return [filteredMeasurements.findIndex(m => m.stateKey === measurementKey) + 1, filteredMeasurements.length + 1];
        }
    }

    previousMeasurement = () => {
        const measurementIndex = this.getMeasurementIndexByKey(this.props.shownMeasurement);
        if (measurementIndex === 0) {
            return;
        }

        let filteredMeasurements = [...MEASUREMENT_PAGE_CONFIG];
        filteredMeasurements = filteredMeasurements.splice(0, measurementIndex - 1);
        filteredMeasurements = filteredMeasurements.filter(m => this.state.formState[m.stateKey].length > 0);

        if (filteredMeasurements.length === 0) {
            this.setMeasurementShown(MEASUREMENT_HOME_PAGE);
        } else {
            this.setMeasurementShown(filteredMeasurements[filteredMeasurements.length - 1].stateKey);
        }
    }

    nextMeasurement = () => {
        const measurementIndex = this.getMeasurementIndexByKey(this.props.shownMeasurement);
        if (measurementIndex >= MEASUREMENT_PAGE_CONFIG.length + 1) {
            return;
        }

        let filteredMeasurements = [...MEASUREMENT_PAGE_CONFIG];
        filteredMeasurements.splice(0, measurementIndex);
        filteredMeasurements = filteredMeasurements.filter(m => this.state.formState[m.stateKey].length > 0);

        if (filteredMeasurements.length === 0) {
            this.setMeasurementShown(MEASUREMENT_FINAL_PAGE);
        } else {
            this.setMeasurementShown(filteredMeasurements[0].stateKey);
        }
    }

    updateIndividualMeasurement = (index, value, additionalValues) => {
        const measurementKey = this.props.shownMeasurement;
        const measurements = [...this.state.formState[measurementKey]]
        const originalMeasurement = JSON.stringify(measurements[index])
        measurements[index].value = value
        Object.entries(additionalValues ?? {}).map(([key, value]) => {
            measurements[index][key] = value;
        })
        const updatedMeasurement = JSON.stringify(measurements[index])
        if (originalMeasurement !== updatedMeasurement) {
            measurements[index].lastModified = new Date().toISOString();
        }

        this.updateValues(measurementKey, measurements)
    }

    updateIndividualValidation = (index, isValid) => {
        const measurementKey = this.props.shownMeasurement;
        const validations = [...this.state.validations[measurementKey]]
        validations[index] = isValid
        this.updateValidations(measurementKey, validations)
    }

    updatedIndividualDisabledValues = (index, disabledValue) => {
        const measurementKey = this.props.shownMeasurement;
        const disabledValues = [...this.state.disabledValues[measurementKey]]
        disabledValues[index] = disabledValue
        this.updateDisabled(measurementKey, disabledValues)
    }

    updateIndividualMeasurementLabel = (index, label) => {
        const measurementKey = this.props.shownMeasurement;
        const measurements = [...this.state.formState[measurementKey]]
        measurements[index].label = label
        this.updateValues(measurementKey, measurements)
    }

    deleteIndividualMeasurement = (index) => {
        if (!confirm(`Are you sure you want to delete this measurement? This action cannot be undone.`)) {
            return
        }

        const measurementKey = this.props.shownMeasurement;
        const measurements = [...this.state.formState[measurementKey]]
        measurements.splice(index, 1)
        this.updateValues(measurementKey, measurements)

        const validations = [...this.state.validations[measurementKey]]
        validations.splice(index, 1)
        this.updateValidations(measurementKey, validations)

        const disabledValues = [...this.state.disabledValues[measurementKey]]
        disabledValues.splice(index, 1)
        this.updateDisabled(measurementKey, disabledValues)

        this.setMeasurementShown(MEASUREMENT_HOME_PAGE)
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

            const nowISO = new Date().toISOString();
            user.lastMeasurementsModified = nowISO;

            if (manual && passesValidation) {
                user.lastMeasurementsSaved = nowISO;
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

    renderNavIcon = () => {
        return (
            <div id="measurements-nav-icon" key="measurements-nav" className="nav-icon p-2" onClick={() => this.toggleNav()}>
                <h1>
                    <i className={`bi bi-${this.state.navShown ? 'x' : 'list'}`}></i>
                </h1>
            </div>
        )
    }

    renderNav = () => {
        if (!this.state.navShown) {
            return null
        }

        return (
            <div id="measurements-nav" className="w-100 pb-5 overflow-auto user-select-none" style={{ height: window.innerHeight - document.getElementById('nav-icons-container').getBoundingClientRect().bottom }}>
                <h2 className="nav-entry-link text-center mt-5 cursor-p text-decoration-underline" onClick={() => this.setMeasurementShown(MEASUREMENT_HOME_PAGE)}>Measurement Selection</h2>
                {Object.entries(this.state.formState).map(([key, measurements]) => {
                    if (measurements.length === 0) {
                        return null
                    }

                    const disabled = measurements.every((m, i) => this.isDisabled(key, i))
                    const valid = this.state.validations[key].every((v, i) => this.isDisabled(key, i) || v === true || (Array.isArray(v) && v.every(sv => sv === true)))

                    return <h3 key={`nav-entry-${key}`} className={`nav-entry-link text-center mt-5 cursor-p text-decoration-underline ${disabled ? 'text-warning' : (valid ? 'text-success' : 'text-danger')}`} onClick={() => this.setMeasurementShown(key)}>{MEASUREMENT_CONFIGS[key]?.defaultLabel || key}</h3>
                })}
                <h2 className="nav-entry-link text-center mt-5 cursor-p text-decoration-underline" onClick={() => this.setMeasurementShown(MEASUREMENT_FINAL_PAGE)}>Summary</h2>
            </div>
        )
    }

    renderMeasurementPage = () => {
        const name = this.state.user.uuid !== 'guest' ? `(${this.state.user.name})` : '';
        const measurementKey = this.props.shownMeasurement;
        if (measurementKey === MEASUREMENT_HOME_PAGE) {
            return this.renderMeasurementSelection()
        } else if (measurementKey === MEASUREMENT_FINAL_PAGE) {
            return (
                <SummaryPage
                    name={name}
                    patientName={this.state.user?.name || 'guest'}
                    submitText={this.state.submitText}
                    submitTextType={this.state.submitTextType}
                    formState={this.state.formState}
                    validations={this.state.validations}
                    disabledValues={this.state.disabledValues}
                    isDisabled={this.isDisabled}
                />
            )
        }

        const MeasurementComponent = MEASUREMENT_PAGE_CONFIG.find(m => m.stateKey === measurementKey)?.component;

        return (
            <>
                <Title>{MEASUREMENT_CONFIGS[measurementKey]?.defaultLabel || measurementKey} {name}</Title>
                {
                    this.state.formState[measurementKey].map((measurement, index) => {
                        const disabledValues = this.state.disabledValues?.[measurementKey] ? this.state.disabledValues[measurementKey][index] : [];
                        return (
                            <MeasurementComponent
                                key={`${measurementKey}-multiple-${index}`}
                                value={measurement.value || ''}
                                label={measurement.label || ''}
                                valid={this.state.validations?.[measurementKey]?.[index] ?? true}
                                disabledValues={disabledValues}
                                onChange={(value, additionalValues) => this.updateIndividualMeasurement(index, value, additionalValues)}
                                onValidationChange={(isValid) => this.updateIndividualValidation(index, isValid)}
                                onDisabledChange={(disabledValue) => this.updatedIndividualDisabledValues(index, disabledValue)}
                                onLabelChange={(label) => this.updateIndividualMeasurementLabel(index, label)}
                                onDelete={() => this.deleteIndividualMeasurement(index)}
                                isDisabled={() => this.isDisabled(measurementKey, index)}
                                getDisableCaseComputedText={() => this.getDisableCaseComputedText(measurementKey)}
                            />
                        )
                    })
                }
            </>
        )
    }

    renderMeasurementSelection = () => {
        const name = this.state.user.uuid !== 'guest' ? `(${this.state.user.name})` : '';

        return (<>
            <Title>Measurement Selection {name}</Title>
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
                                // oneMax={this.state.user.uuid !== 'guest' ? oneMax : false}
                                // for now, only one measurement of each type is allowed
                                oneMax={true}
                            />
                        )
                    })}
                </div>
            </div>
        </>)
    }

    render() {
        if (!this.state.user) {
            if (this.state.loaded) {
                return <Navigate to="/existing-patient" replace={true} />
            }
            return <LoadingPage />
        }

        const measurementIndex = this.getMeasurementIndexByKey(this.props.shownMeasurement);
        const [relativeMeasurementIndex, relativeMeasurementLength] = this.getRelativeMeasurementIndexByKey(this.props.shownMeasurement);

        const dontShowBack = measurementIndex === 0;
        const dontShowNext = relativeMeasurementLength === 1 || this.props.shownMeasurement === MEASUREMENT_FINAL_PAGE;

        return (
            <div id="measurements" className={`${this.state.navShown ? 'user-select-none pe-none' : ''}`}>
                {this.renderMeasurementPage()}
                <div id="measurements-previous-next" className={`d-flex ${dontShowBack || dontShowNext ? 'justify-content-center' : 'justify-content-between'}`}>
                    <button className={`btn btn-secondary m-4 ${dontShowBack ? 'd-none' : ''}`} onClick={() => this.previousMeasurement()}>
                        {relativeMeasurementIndex === 1 ? 'Back to Measurement Selection' : this.props.shownMeasurement === MEASUREMENT_FINAL_PAGE ? 'Back to Measurements' : 'Previous Measurement'}
                    </button>
                    <button className={`btn btn-primary m-4 ${dontShowNext ? 'd-none' : ''}`} onClick={() => this.nextMeasurement()}>
                        {relativeMeasurementIndex === relativeMeasurementLength - 1 ? 'Finish' : this.props.shownMeasurement === MEASUREMENT_HOME_PAGE ? 'Proceed to Measurements' : 'Next Measurement'}
                    </button>
                </div>
            </div>
        )
    }
}

export const MEASUREMENT_PAGE_CONFIG = [
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
        stateKey: 'timedUpAndGoCognitive'
    },
]

export default AllMeasurementsPage