import { Component } from "react"
import PhysicalTherapyTest from "./PhysicalTherapyTest"
import testsConfig from '../../config/tests.yaml'

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

// Transform YAML config into the runtime shape expected by consumers.
export const PT_TEST_CONFIG = testsConfig.map(t => ({
    testKey: t.key,
    defaultTestName: t.name,
    permittedMeasurements: t.permitted_measurements || null,
}))

for (const config of PT_TEST_CONFIG) {
    config.component = createTest(config.testKey)
}
