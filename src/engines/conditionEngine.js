// Condition Engine
// General-purpose evaluator for declarative conditions from YAML.
// Evaluates conditions against a context containing formState, calculations, variables, and thresholds.

/**
 * Resolve a value from context based on a condition object.
 * Looks for from_measurement, from_calculation, or from_variable.
 * @returns the resolved numeric value, or null if missing/invalid
 */
function resolveValue(condition, context) {
    if (condition.from_measurement !== undefined) {
        return resolveMeasurement(condition.from_measurement, context)
    }
    if (condition.from_calculation !== undefined) {
        return resolveCalculation(condition.from_calculation, context)
    }
    if (condition.from_variable !== undefined) {
        return context.variables?.[condition.from_variable] ?? null
    }
    return null
}

function resolveMeasurement(path, context) {
    const { formState } = context
    if (!formState) return null

    // Support dotted paths like "vitalSigns.bloodPressure"
    const parts = path.split('.')

    if (parts.length === 1) {
        // Simple measurement: formState[key][0].value
        const measurement = formState[parts[0]]
        if (!measurement || !Array.isArray(measurement) || measurement.length === 0) return null
        const value = measurement[0].value
        if (value === null || value === undefined || value === '') return null
        return value
    }

    // Nested path for fields-type measurements
    // e.g., "vitalSigns.bloodPressure" or "vitalSigns.bloodPressure.systolic"
    const topKey = parts[0]
    const measurement = formState[topKey]
    if (!measurement || !Array.isArray(measurement) || measurement.length === 0) return null

    const topValue = measurement[0].value
    if (!topValue || !Array.isArray(topValue)) return null

    // Resolve the field index from the field name
    // Fields in vitalSigns are stored as an array: [restingPulseRate, bloodPressure, oxygenSaturation]
    // We need to know the field_names to resolve the index
    const fieldMapping = context.fieldMappings?.[topKey]
    if (!fieldMapping) return null

    const fieldName = parts[1]
    const fieldIndex = fieldMapping.indexOf(fieldName)
    if (fieldIndex === -1) return null

    const fieldValue = topValue[fieldIndex]

    if (parts.length === 2) {
        // Return the field value directly
        if (fieldValue === null || fieldValue === undefined || fieldValue === '') return null
        const parsed = parseFloat(fieldValue)
        return isNaN(parsed) ? fieldValue : parsed
    }

    // Sub-field (e.g., "vitalSigns.bloodPressure.systolic")
    // TODO: Sub-field extraction is hardcoded for blood pressure's "X/Y" format.
    // If more composite text formats need sub-field access, make this declarative in YAML.
    if (parts.length === 3 && typeof fieldValue === 'string') {
        const subField = parts[2]
        // Blood pressure parsing: "120/80" → systolic=120, diastolic=80
        const match = fieldValue.match(/^(\d+)\/(\d+)$/)
        if (!match) return null
        if (subField === 'systolic') return parseInt(match[1], 10)
        if (subField === 'diastolic') return parseInt(match[2], 10)
    }

    return null
}

function resolveCalculation(key, context) {
    const calcConfigs = context.calculationConfigs
    if (!calcConfigs || !calcConfigs[key]) return null
    const result = calcConfigs[key].valueFunction(context.formState)
    if (result === null) return null
    const parsed = parseFloat(result)
    return isNaN(parsed) ? null : parsed
}

/**
 * Evaluate a condition object against context.
 * @param {Object} condition - A condition object from YAML
 * @param {Object} context - { formState, calculationConfigs, variables, thresholds, fieldMappings, validations }
 * @returns {boolean}
 */
export function evaluate(condition, context) {
    if (!condition || typeof condition !== 'object') return false

    // Logical combinators
    if (condition.all_of) {
        return condition.all_of.every(sub => evaluate(sub, context))
    }
    if (condition.any_of) {
        return condition.any_of.some(sub => evaluate(sub, context))
    }
    if (condition.not) {
        return !evaluate(condition.not, context)
    }

    // Validations state check: true if measurement validations are incomplete/missing
    // Requires context.validations (the React component's validation state)
    if (condition.validations_incomplete !== undefined) {
        const key = condition.validations_incomplete
        const vals = context.validations?.[key]
        if (!vals || !Array.isArray(vals) || vals.length === 0) return true
        return !vals.every(v => Array.isArray(v) ? v.every(inner => inner === true) : v === true)
    }

    // Check all instances of a measurement: true only if every instance's value passes
    // Usage: { every_instance_of: "assistiveDevices", is_one_of: ["None", "Straight Cane"] }
    if (condition.every_instance_of !== undefined) {
        const key = condition.every_instance_of
        const measurements = context.formState?.[key]
        if (!measurements || !Array.isArray(measurements) || measurements.length === 0) return false
        return measurements.every(m => evaluateValueCondition(condition, m.value))
    }

    // Value-based conditions
    const value = resolveValue(condition, context)

    return evaluateValueCondition(condition, value)
}

/**
 * Evaluate value-based comparison conditions against a resolved value.
 */
function evaluateValueCondition(condition, value) {
    if (condition.is_missing !== undefined) {
        const isMissing = value === null || value === undefined || value === ''
        return condition.is_missing ? isMissing : !isMissing
    }
    if (condition.exists !== undefined) {
        const exists = value !== null && value !== undefined && value !== ''
        return condition.exists ? exists : !exists
    }
    if (condition.is_less_than !== undefined) {
        return value !== null && value < condition.is_less_than
    }
    if (condition.is_at_most !== undefined) {
        return value !== null && value <= condition.is_at_most
    }
    if (condition.is_greater_than !== undefined) {
        return value !== null && value > condition.is_greater_than
    }
    if (condition.is_at_least !== undefined) {
        return value !== null && value >= condition.is_at_least
    }
    if (condition.is_between !== undefined) {
        const [min, max] = condition.is_between
        return value !== null && value >= min && value <= max
    }
    if (condition.equals !== undefined) {
        return value === condition.equals
    }
    if (condition.is_one_of !== undefined) {
        return condition.is_one_of.includes(value)
    }
    if (condition.matches_pattern !== undefined) {
        return typeof value === 'string' && new RegExp(condition.matches_pattern).test(value)
    }

    return false
}
