import { Component } from 'react'
import Measurement from './Measurement'
import measurementsConfig from '../../config/measurements.yaml'
import { buildMeasurementConfigs } from '../../engines/measurementEngine'

// Auto-discover all instruction markdown files.
// To add a new instruction: create a .md file in ./instructions/
// and set instructions: "Filename" (without .md) in measurements.yaml.
const instructionFiles = import.meta.glob('./instructions/*.md', { eager: true, query: '?raw', import: 'default' })
const INSTRUCTIONS_MAP = {}
for (const [path, content] of Object.entries(instructionFiles)) {
    const key = path.split('/').pop().replace('.md', '')
    INSTRUCTIONS_MAP[key] = content
}

export const MAX_LENGTH = 1000
export const MAX_SECONDS = 3600

// Field mappings for resolving dotted measurement paths in conditions
// (e.g., "vitalSigns.bloodPressure" → index 1 in the fields array)
// Auto-derived from measurements with field_names.
export const FIELD_MAPPINGS = {}
for (const [key, config] of Object.entries(measurementsConfig)) {
    if (key.startsWith('_')) continue
    if (config.field_names) {
        FIELD_MAPPINGS[key] = config.field_names
    }
}

export const MEASUREMENT_CONFIGS = buildMeasurementConfigs(measurementsConfig, INSTRUCTIONS_MAP, FIELD_MAPPINGS)

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

export const createMeasurement = (configKey) => {
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
