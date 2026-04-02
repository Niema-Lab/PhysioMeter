// Validation Engine
// Converts declarative validation rules from measurements.yaml into validationFunction(value) → boolean.

import { isValidDobForMeasurement } from '../utils/dateValidation'

/**
 * Build a validationFunction from a declarative validation config.
 * @param {Object} validation - The validation rules object from YAML
 * @returns {Function} (value) => boolean
 */
export function buildValidationFunction(validation) {
    if (!validation) return undefined

    // Named built-in rule
    if (validation.rule) {
        if (!BUILT_IN_RULES[validation.rule]) {
            throw new Error(`Unknown validation rule: "${validation.rule}". Available rules: ${Object.keys(BUILT_IN_RULES).join(', ')}`)
        }
        return BUILT_IN_RULES[validation.rule]
    }

    // Pattern matching with extracted values (e.g., blood pressure)
    if (validation.matches_pattern && validation.extracted_values) {
        return buildPatternValidation(validation)
    }

    // Compose multiple checks
    const checks = []

    if (validation.required) {
        checks.push((value) => typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined && value !== '')
    }

    if (validation.max_length !== undefined) {
        checks.push((value) => value.length <= validation.max_length)
    }

    if (validation.is_between) {
        const [min, max] = validation.is_between
        checks.push((value) => value >= min && value <= max)
    }

    if (validation.is_between_exclusive) {
        const [min, max] = validation.is_between_exclusive
        checks.push((value) => value > min && value < max)
    }

    if (validation.is_integer) {
        checks.push((value) => Number.isInteger(value))
    }

    if (validation.is_one_of) {
        checks.push((value) => validation.is_one_of.includes(value))
    }

    if (checks.length === 0) return undefined
    return (value) => checks.every(check => check(value))
}

function buildPatternValidation(validation) {
    const regex = new RegExp(validation.matches_pattern)
    const extractedValues = validation.extracted_values
    const rules = validation.rules || []

    return (value) => {
        const match = value.match(regex)
        if (!match) return false

        // Extract and validate each named group
        const extracted = {}
        for (const [name, config] of Object.entries(extractedValues)) {
            const raw = match[config.group]
            const num = parseInt(raw, 10)
            extracted[name] = num

            if (config.type === 'integer' && !Number.isInteger(num)) return false
            if (config.is_between) {
                const [min, max] = config.is_between
                if (num < min || num > max) return false
            }
        }

        // Apply inter-field rules
        for (const rule of rules) {
            if (rule.is_greater_than_field) {
                if (!(extracted[rule.field] > extracted[rule.is_greater_than_field])) return false
            }
        }

        return true
    }
}

const BUILT_IN_RULES = {
    valid_date_of_birth: isValidDobForMeasurement,
}
