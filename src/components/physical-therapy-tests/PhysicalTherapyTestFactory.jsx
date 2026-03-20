import { Component } from "react"
import PhysicalTherapyTest from "./PhysicalTherapyTest"

/**
 * 
 * @param {String} key the type of test to create (will be saved in the user object in indexedDB under this key)
 */
const createTest = (key) => {
    const testConfig = PT_TEST_CONFIG.find(config => config.testKey === key)

    if (!testConfig) {
        throw new Error(`Invalid test key: ${key}`)
    }

    return class extends Component {
        render() {
            return <PhysicalTherapyTest {...testConfig} {...this.props} />
        }
    }
}

export const PT_TEST_CONFIG = [
    {
        // freeform measurements session — all measurements available
        testKey: 'measurements',
        defaultTestName: 'Measurements',
        permittedMeasurements: null, // all measurements selected
    },
    {
        testKey: 'annualMobilityScreening',
        defaultTestName: 'Annual Mobility Screening',
        homePageComponent: null, // TODO: create this
        permittedMeasurements: [
            'Vital Signs',
            '5 Meter Usual Walking Speed',
            '5 Meter Fast Walking Speed',
            '30 Second Sit to Stand',
            'Assistive Device',
            'Four Square Step Test',
            'Modified Four Square Step Test',
            'Timed Up and Go',
            'Timed Up and Go Cognitive',
        ],
    }
];

for (const config of PT_TEST_CONFIG) {
    config.component = createTest(config.testKey)
}