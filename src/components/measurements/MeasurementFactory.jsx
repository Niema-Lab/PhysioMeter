import { Component } from 'react'
import Measurement from './Measurement'
import { isValidDobForMeasurement } from '../../utils/dateValidation'
import BloodPressureText from './instructions/BloodPressure.md?raw'
import OxygenSaturationText from './instructions/OxygenSaturation.md?raw'
import FiveMeterUsualWalkingSpeedText from './instructions/FiveMeterUsualWalkingSpeed.md?raw'
import FiveMeterFastWalkingSpeedText from './instructions/FiveMeterFastWalkingSpeed.md?raw'
import ThirtySecondSitToStandText from './instructions/ThirtySecondSitToStand.md?raw'
import FourSquareStepTestText from './instructions/FourSquareStepTest.md?raw'
import ModifiedFourSquareStepTestText from './instructions/ModifiedFourSquareStepTest.md?raw'
import TimedUpAndGoText from './instructions/TimedUpAndGo.md?raw'
import TimedUpAndGoCognitiveText from './instructions/TimedUpAndGoCognitive.md?raw'
import { isIneligibleForPhysicalActivity } from '../interpretations/InterpretationFactory'

export const MAX_LENGTH = 1000
export const MAX_SECONDS = 3600

const SEX_OPTIONS = ['Male', 'Female']
const ASSISTIVE_DEVICE_OPTIONS = ['None', 'Straight Cane', 'Small Based Quad Cane', 'Large Based Quad Cane', 'Hemi Walker', 'Front Wheeled Walker', 'Four Wheeled Walker']

const PHYSICAL_ACTIVITY_DISABLED_CASE = {
    text: "This patient is ineligible for physical activity. Uncheck this box to bypass the Vital Signs requirement.",
    // when to show the checkbox to the user to override the disabled state (otherwise the disabled case is not applied) 
    showOverride: (formState, validations, disabledValues, measurementKey) => {
        const vitals = validations['vitalSigns']
        const validVitals = vitals && Array.isArray(vitals) && vitals.length > 0 && vitals.every(vital => Array.isArray(vital) && vital.every(v => v === true))
        // show if vitals are not valid (missing/incomplete) or if vitals indicate ineligibility
        return !validVitals || isIneligibleForPhysicalActivity(formState)
    }
}

const ASSISTIVE_DEVICE_FOUR_SQUARE_STEP_TEST_DISABLED_CASE = {
    text: "Select an assistive device. If an assistive device is selected, but is not 'None' or 'Straight Cane', the participant should perform the Modified Four Square Step Test instead. Uncheck this box to bypass this recommendation.",
    showOverride: (formState, validations, disabledValues, measurementKey) => {
        const assistiveDevices = formState['assistiveDevices']
        const validAssistiveDevices = assistiveDevices && Array.isArray(assistiveDevices) && assistiveDevices.length > 0
            && assistiveDevices.every(device => ['None', 'Straight Cane'].includes(device.value))
        return !validAssistiveDevices
    }
}

const ASSISTIVE_DEVICE_MODIFIED_FOUR_SQUARE_STEP_TEST_DISABLED_CASE = {
    text: "Select an assistive device. If an assistive device is selected, but is 'None' or 'Straight Cane', the participant should perform the Four Square Step Test instead. Uncheck this box to bypass this recommendation.",
    showOverride: (formState, validations, disabledValues, measurementKey, index, value) => {
        const assistiveDevices = formState['assistiveDevices']
        const validAssistiveDevices = assistiveDevices && Array.isArray(assistiveDevices) && assistiveDevices.length > 0
            && assistiveDevices.every(device => ['Small Based Quad Cane', 'Large Based Quad Cane', 'Hemi Walker', 'Front Wheeled Walker', 'Four Wheeled Walker'].includes(device.value))
        return !validAssistiveDevices
    }
}


export const MEASUREMENT_CONFIGS = {
    name: {
        type: 'text',
        defaultLabel: 'Name',
        placeholder: 'Enter name',
        validationFunction: (value) => {
            return value.trim().length > 0 && value.length <= MAX_LENGTH
        }
    },
    dob: {
        type: 'date',
        defaultLabel: 'Date of Birth',
        placeholder: 'mm/dd/yyyy',
        validationFunction: isValidDobForMeasurement
    },
    sex: {
        type: 'radio',
        defaultLabel: 'Sex',
        options: SEX_OPTIONS,
        validationFunction: (value) => {
            return SEX_OPTIONS.includes(value)
        }
    },

    bloodPressure: {
        type: 'text',
        defaultLabel: 'Blood Pressure',
        placeholder: 'blood pressure (XX/YY)',
        instructions: BloodPressureText,
        validationFunction: (value) => {
            const regex = /^(\d{1,3})\/(\d{1,3})$/
            const match = value.match(regex)
            if (!match) {
                return false
            }
            const systolic = parseInt(match[1], 10)
            const diastolic = parseInt(match[2], 10)
            return systolic > diastolic && systolic >= 0 && systolic <= 200 && diastolic >= 0 && diastolic <= 200
        }
    },

    oxygenSaturation: {
        type: 'decimal',
        defaultLabel: 'Oxygen Saturation',
        placeholder: 'oxygen saturation (%)',
        min: 0,
        max: 100,
        unit: '%',
        instructions: OxygenSaturationText,
        validationFunction: (value) => {
            return value >= 0 && value <= 100
        }
    },

    restingPulseRate: {
        type: 'integer',
        defaultLabel: 'Resting Pulse Rate',
        placeholder: 'resting pulse rate (bpm)',
        min: 0,
        max: 300,
        validationFunction: (value) => {
            return value >= 0 && value <= 300 && Number.isInteger(value)
        }
    },

    vitalSigns: {
        type: 'fields',
        defaultLabel: 'Vital Signs',
        fieldNames: ['restingPulseRate', 'bloodPressure', 'oxygenSaturation'],
    },

    fiveMeterUsualWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Usual Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterUsualWalkingSpeedText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE],
        numTrials: 2,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        },
        validationFunction: (value) => {
            return value > 0 && value < MAX_SECONDS
        }
    },

    fiveMeterFastWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Fast Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterFastWalkingSpeedText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE],
        numTrials: 2,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        },
        validationFunction: (value) => {
            return value > 0 && value < MAX_SECONDS
        }
    },

    thirtySecondSitToStand: {
        type: 'fields',
        defaultLabel: '30 Second Chair Stand',
        instructions: ThirtySecondSitToStandText,
        disabledCases: ['Participant cannot stand without using their hands'],
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE],
        fields: [
            {
                type: 'countdown',
                duration: 30,
            },
            {
                type: 'integer',
                defaultLabel: 'Count',
                placeholder: 'Number of sit to stands',
                min: 0,
                counterButtons: true,
                validationFunction: (value) => {
                    return value >= 0 && value <= 100 && Number.isInteger(value)
                }
            },
        ],
    },

    assistiveDevices: {
        type: 'radio',
        defaultLabel: 'Assistive Device Used',
        options: ASSISTIVE_DEVICE_OPTIONS,
        validationFunction: (value) => {
            return ASSISTIVE_DEVICE_OPTIONS.includes(value)
        },
    },

    fourSquareStepTest: {
        type: 'stopwatch',
        defaultLabel: 'Four Square Step Test',
        placeholder: 'Time to complete test (seconds)',
        instructions: FourSquareStepTestText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE, ASSISTIVE_DEVICE_FOUR_SQUARE_STEP_TEST_DISABLED_CASE],
        numTrials: 2,
        validationFunction: (value) => {
            return value > 0 && value < MAX_SECONDS
        },
        // actionButton: Renders a navigation button on this measurement's page.
        // targetMeasurement: the stateKey of the measurement to navigate to
        // bypassDisabledCaseIndices: indices of disabledCasesComputed on the target to set to false (bypass)
        actionButton: {
            text: 'Patient does not clear apparatus, navigate to modified 4 square step protocol',
            targetMeasurement: 'modifiedFourSquareStepTest',
            bypassDisabledCaseIndices: [1], // index 1 = assistive device disabled case on modified FSST
        },
    },

    modifiedFourSquareStepTest: {
        type: 'stopwatch',
        defaultLabel: 'Modified Four Square Step Test',
        placeholder: 'Time to complete test (seconds)',
        instructions: ModifiedFourSquareStepTestText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE, ASSISTIVE_DEVICE_MODIFIED_FOUR_SQUARE_STEP_TEST_DISABLED_CASE],
        numTrials: 2,
        validationFunction: (value) => {
            return value > 0 && value < MAX_SECONDS
        }
    },

    timedUpAndGo: {
        type: 'stopwatch',
        defaultLabel: 'Timed Up and Go (TUG)',
        placeholder: 'Time to complete test (seconds)',
        instructions: TimedUpAndGoText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE],
        numTrials: 2,
        validationFunction: (value) => {
            return value > 0 && value < MAX_SECONDS
        }
    },

    timedUpAndGoCognitive: {
        type: 'fields',
        defaultLabel: 'Timed Up and Go Cognitive Dual Task',
        instructions: TimedUpAndGoCognitiveText,
        disabledCasesComputed: [PHYSICAL_ACTIVITY_DISABLED_CASE],
        fields: [
            {
                type: 'stopwatch',
                defaultLabel: 'Time',
                placeholder: 'Time to complete test (seconds)',
                validationFunction: (value) => {
                    return value > 0 && value < MAX_SECONDS
                }
            },
            {
                type: 'integer',
                defaultLabel: 'Error Count',
                placeholder: 'Number of errors',
                min: 0,
                counterButtons: true,
                validationFunction: (value) => {
                    return value >= 0 && value <= 50 && Number.isInteger(value)
                }
            },
        ],
    },
}

// Creates a new measurement instance (entry, validation, disabledValues) for a given measurement key.
// Used by MultipleMeasurements.addMeasurement and PhysicalTherapyTest.handleActionButton.
export function createMeasurementInstance(measurementKey, existingCount = 0) {
    const config = MEASUREMENT_CONFIGS[measurementKey]
    const label = `${config?.defaultLabel || measurementKey} ${existingCount === 0 ? '' : existingCount + 1}`
    const entry = { label, value: '', lastModified: new Date().toISOString() }
    const validation = false
    const disabledEntry = [
        ...(new Array(config?.disabledCasesComputed?.length ?? 0).fill(true)),
        ...(new Array(config?.disabledCases?.length ?? 0).fill(false)),
    ]
    return { entry, validation, disabledEntry }
}

const createMeasurement = (configKey) => {
    const config = MEASUREMENT_CONFIGS[configKey]

    if (!config) {
        console.error(`Measurement configuration for key "${configKey}" not found.`)
        return null
    }

    return class extends Component {
        render() {
            return <Measurement {...config} {...this.props} />
        }
    }
}

export const Name = createMeasurement('name')
export const DoB = createMeasurement('dob')
export const Sex = createMeasurement('sex')
export const BloodPressure = createMeasurement('bloodPressure')
export const OxygenSaturation = createMeasurement('oxygenSaturation')
export const RestingPulseRate = createMeasurement('restingPulseRate')
export const VitalSigns = createMeasurement('vitalSigns')
export const FiveMeterUsualWalkingSpeed = createMeasurement('fiveMeterUsualWalkingSpeed')
export const FiveMeterFastWalkingSpeed = createMeasurement('fiveMeterFastWalkingSpeed')
export const ThirtySecondSitToStand = createMeasurement('thirtySecondSitToStand')
export const AssistiveDevice = createMeasurement('assistiveDevices')
export const FourSquareStepTest = createMeasurement('fourSquareStepTest')
export const ModifiedFourSquareStepTest = createMeasurement('modifiedFourSquareStepTest')
export const TimedUpAndGo = createMeasurement('timedUpAndGo')
export const TimedUpAndGoCognitive = createMeasurement('timedUpAndGoCognitive')
