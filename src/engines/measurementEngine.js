// Measurement Engine
// Converts declarative measurement configs from measurements.yaml into the
// runtime MEASUREMENT_CONFIGS shape expected by existing components.

import { buildValidationFunction } from './validationEngine'
import { evaluate } from './conditionEngine'

// ========== Computed Display ==========

function buildComputedFields(computedDisplayConfig) {
    if (!computedDisplayConfig || computedDisplayConfig.length === 0) return undefined

    // Currently only supports the "divide" formula
    return (value) => {
        const results = {}
        for (const display of computedDisplayConfig) {
            if (!value) {
                results[display.label] = 'N/A'
                continue
            }
            if (display.formula === 'divide' && display.denominator_from === 'value') {
                const denominator = parseFloat(value)
                if (!denominator || isNaN(denominator)) {
                    results[display.label] = 'N/A'
                } else {
                    results[display.label] = `${(display.numerator / denominator).toFixed(display.decimal_places)} ${display.unit}`
                }
            }
        }
        return results
    }
}

// ========== Disabled Cases ==========

/**
 * Build disabled cases from YAML config.
 * Each disabled_cases item with show_when conditions generates a disabledCasesComputed entry
 * whose showOverride function evaluates the conditions via the condition engine.
 * @param {Object} yamlConfig - A single measurement's YAML config
 * @param {Object} fieldMappings - Field mappings for resolving dotted measurement paths
 */
function buildDisabledCases(yamlConfig, fieldMappings) {
    const disabledCasesComputed = []
    const disabledCases = []

    if (yamlConfig.disabled_cases) {
        for (const dc of yamlConfig.disabled_cases) {
            if (!dc.show_when) {
                throw new Error(`disabled_cases entry missing "show_when" conditions: "${dc.text}"`)
            }
            disabledCasesComputed.push({
                text: dc.text,
                showOverride: (formState, validations) => {
                    const context = { formState, validations, fieldMappings }
                    return evaluate(dc.show_when, context)
                }
            })
        }
    }

    if (yamlConfig.static_disabled_cases) {
        disabledCases.push(...yamlConfig.static_disabled_cases)
    }

    return { disabledCasesComputed, disabledCases }
}

// ========== Inline Fields ==========

function buildInlineField(fieldYaml) {
    const field = {
        type: fieldYaml.type,
    }
    if (fieldYaml.label) field.defaultLabel = fieldYaml.label
    if (fieldYaml.placeholder) field.placeholder = fieldYaml.placeholder
    if (fieldYaml.min !== undefined) field.min = fieldYaml.min
    if (fieldYaml.max !== undefined) field.max = fieldYaml.max
    if (fieldYaml.unit) field.unit = fieldYaml.unit
    if (fieldYaml.counter_buttons) field.counterButtons = fieldYaml.counter_buttons
    if (fieldYaml.duration) field.duration = fieldYaml.duration
    if (fieldYaml.display_only) field.displayOnly = true

    const validationFn = buildValidationFunction(fieldYaml.validation)
    if (validationFn) field.validationFunction = validationFn

    return field
}

// ========== Main Build Function ==========

/**
 * Build MEASUREMENT_CONFIGS from YAML config + instruction markdown map.
 * @param {Object} yamlConfig - The parsed measurements.yaml
 * @param {Object} instructionsMap - { filename: markdownString } mapping
 * @param {Object} fieldMappings - { measurementKey: [fieldName, ...] } for resolving dotted paths
 * @returns {Object} MEASUREMENT_CONFIGS matching the original hardcoded shape
 */
export function buildMeasurementConfigs(yamlConfig, instructionsMap, fieldMappings) {
    const configs = {}

    for (const [key, yaml] of Object.entries(yamlConfig)) {
        // Skip YAML anchor definitions (keys starting with _)
        if (key.startsWith('_')) continue
        const config = {
            type: yaml.type,
            defaultLabel: yaml.label,
        }

        // Optional simple properties
        if (yaml.placeholder) config.placeholder = yaml.placeholder
        if (yaml.min !== undefined) config.min = yaml.min
        if (yaml.max !== undefined) config.max = yaml.max
        if (yaml.unit) config.unit = yaml.unit
        if (yaml.options) config.options = yaml.options
        if (yaml.num_trials) config.numTrials = yaml.num_trials
        if (yaml.trial_names) config.trialNames = yaml.trial_names

        // Instructions (resolve filename to markdown string)
        if (yaml.instructions && instructionsMap[yaml.instructions]) {
            config.instructions = instructionsMap[yaml.instructions]
        }

        // Validation (for non-fields types or when the config has direct validation)
        if (yaml.validation) {
            const validationFn = buildValidationFunction(yaml.validation)
            if (validationFn) config.validationFunction = validationFn
        } else if (yaml.options) {
            // Radio/select: auto-generate includes validation
            config.validationFunction = (value) => yaml.options.includes(value)
        }

        // Composite fields (fieldNames references)
        if (yaml.field_names) {
            config.fieldNames = yaml.field_names
        }

        // Inline fields
        if (yaml.fields) {
            config.fields = yaml.fields.map(buildInlineField)
        }

        // Computed display
        const computedFields = buildComputedFields(yaml.computed_display)
        if (computedFields) config.computedFields = computedFields

        // Disabled cases
        const { disabledCasesComputed, disabledCases } = buildDisabledCases(yaml, fieldMappings)
        if (disabledCasesComputed.length > 0) config.disabledCasesComputed = disabledCasesComputed
        if (disabledCases.length > 0) config.disabledCases = disabledCases

        // Action button
        if (yaml.action_button) {
            config.actionButton = {
                text: yaml.action_button.text,
                targetMeasurement: yaml.action_button.navigate_to,
                bypassDisabledCaseIndices: yaml.action_button.bypass_disabled_indices,
            }
        }

        configs[key] = config
    }

    return configs
}
