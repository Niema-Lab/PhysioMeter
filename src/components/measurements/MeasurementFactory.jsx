import { Component } from 'react'
import Measurement from './Measurement'
import BloodPressureText from './instructions/BloodPressure.md?raw'
import OxygenSaturationText from './instructions/OxygenSaturation.md?raw'
import FiveMeterUsualWalkingSpeedText from './instructions/FiveMeterUsualWalkingSpeed.md?raw'
import FiveMeterFastWalkingSpeedText from './instructions/FiveMeterFastWalkingSpeed.md?raw'
import ThirtySecondSitToStandText from './instructions/ThirtySecondSitToStand.md?raw'
import FourSquareStepTestText from './instructions/FourSquareStepTest.md?raw'
import ModifiedFourSquareStepTestText from './instructions/ModifiedFourSquareStepTest.md?raw'
import TimedUpAndGoText from './instructions/TimedUpAndGo.md?raw'
import TimedUpAndGoCognitiveText from './instructions/TimedUpAndGoCognitive.md?raw'

const MEASUREMENT_CONFIGS = {
    name: {
        type: 'text',
        defaultLabel: 'Name',
        placeholder: 'Enter name'
    },
    dob: {
        type: 'date',
        defaultLabel: 'Date of Birth',
        placeholder: 'mm/dd/yyyy'
    },
    sex: {
        type: 'radio',
        defaultLabel: 'Sex',
        options: ['Male', 'Female']
    },
    bloodPressure: {
        type: 'text',
        defaultLabel: 'Blood Pressure',
        placeholder: 'Enter blood pressure (e.g., 120/80 systolic/diastolic mmHg)',
        instructions: BloodPressureText,
    },
    oxygenSaturation: {
        type: 'decimal',
        defaultLabel: 'Oxygen Saturation',
        placeholder: 'Enter oxygen saturation (%)',
        min: 0,
        max: 100,
        unit: '%',
        instructions: OxygenSaturationText,
    },
    restingPulseRate: {
        type: 'integer',
        defaultLabel: 'Resting Pulse Rate',
        placeholder: 'Enter resting pulse rate (bpm)',
        min: 0,
        max: 300,
    },
    vitalSigns: {
        type: 'fields',
        defaultLabel: 'Vital Signs',
        fields: [
            {
                type: 'integer',
                defaultLabel: 'Resting Pulse Rate',
                placeholder: 'Enter resting pulse rate (bpm)',
                min: 0,
                max: 300,
            },
            {
                type: 'text',
                defaultLabel: 'Blood Pressure',
                placeholder: 'Enter blood pressure (e.g., 120/80 systolic/diastolic mmHg)',
                instructions: BloodPressureText,
            },
            {
                type: 'decimal',
                defaultLabel: 'Oxygen Saturation',
                placeholder: 'Enter oxygen saturation (%)',
                min: 0,
                max: 100,
                unit: '%',
                instructions: OxygenSaturationText,
            },
        ],
    },
    fiveMeterUsualWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Usual Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterUsualWalkingSpeedText,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        }
    },
    fiveMeterFastWalkingSpeed: {
        type: 'stopwatch',
        defaultLabel: '5 Meter Fast Walking Speed',
        placeholder: 'Time to walk 5 meters (seconds)',
        instructions: FiveMeterFastWalkingSpeedText,
        computedFields: (value) => {
            if (!value) {
                return {
                    'Walking Speed': 'N/A'
                }
            }

            return {
                'Walking Speed': `${(5 / parseFloat(value)).toFixed(3)} m/s`
            }
        }
    },
    thirtySecondSitToStand: {
        type: 'fields',
        defaultLabel: '30 Second Chair Stand',
        instructions: ThirtySecondSitToStandText,
        disabledCases: ['Participant cannot stand without using their hands'],
        fields: [
            {
                type: 'countdown',
                duration: 30,
                noCounter: true,
            },
            {
                type: 'integer',
                defaultLabel: 'Count',
                placeholder: 'Number of sit to stands',
                min: 0,
                counterButtons: true,
            },
        ],
    },
    assistiveDevice: {
        type: 'radio',
        defaultLabel: 'Assistive Device Used',
        options: ['None', 'Straight Cane', 'Small Based Quad Cane', 'Large Based Quad Cane', 'Hemi Walker', 'Front Wheeled Walker', 'Four Wheeled Walker',],
    },
    fourSquareStepTest: {
        type: 'stopwatch',
        defaultLabel: 'Four Square Step Test',
        placeholder: 'Time to complete test (seconds)',
        instructions: FourSquareStepTestText,
        numTrials: 2,
    },
    modifiedFourSquareStepTest: {
        type: 'stopwatch',
        defaultLabel: 'Modified Four Square Step Test',
        placeholder: 'Time to complete test (seconds)',
        instructions: ModifiedFourSquareStepTestText,
        numTrials: 2,
    },
    timedUpAndGo: {
        type: 'stopwatch',
        defaultLabel: 'Timed Up and Go (TUG)',
        placeholder: 'Time to complete test (seconds)',
        instructions: TimedUpAndGoText,
        numTrials: 2,
    },
    timedUpAndGoCognitive: {
        type: 'fields',
        defaultLabel: 'Timed Up and Go Cognitive Dual Task',
        instructions: TimedUpAndGoCognitiveText,
        fields: [
            {
                type: 'stopwatch',
                defaultLabel: 'Time',
                placeholder: 'Time to complete test (seconds)',
            },
            {
                type: 'integer',
                defaultLabel: 'Error Count',
                placeholder: 'Number of errors',
                min: 0,
                counterButtons: true,
            },
        ],
    },
}

const createMeasurement = (configKey) => {
    const config = MEASUREMENT_CONFIGS[configKey]
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
export const AssistiveDevice = createMeasurement('assistiveDevice')
export const FourSquareStepTest = createMeasurement('fourSquareStepTest')
export const ModifiedFourSquareStepTest = createMeasurement('modifiedFourSquareStepTest')
export const TimedUpAndGo = createMeasurement('timedUpAndGo')
export const TimedUpAndGoCognitive = createMeasurement('timedUpAndGoCognitive')
