import { CALCULATION_SECTION_CONFIGS } from '../calculations/CalculationFactory'
// TODO: After guidelines are fully updated by PTs:
// - Add interpretations: Assistive Device (?), Berg Balance Scale, 30 Second Sit to Stand, Modified Four Square Step Test
// - Fix the numbers to match the updated spec
// - Refactor so this logic goes in a YAML file instead of harcoded, for easier maintenance by non-developers

// ========== Helper Functions ==========

function getAgeBracket(age) {
    if (age === null || age === undefined) return null
    if (age >= 90) return '90+'
    if (age >= 80) return '80-89'
    if (age >= 70) return '70-79'
    if (age >= 60) return '60-69'
    if (age >= 50) return '50-59'
    return null
}

function getSex(formState) {
    return formState.sex?.[0]?.value || null
}

function getAge(formState) {
    return CALCULATION_SECTION_CONFIGS.age.valueFunction(formState)
}

export function getVitalSigns(formState) {
    const vitals = formState.vitalSigns?.[0]?.value
    if (!vitals || !Array.isArray(vitals)) return null

    const [restingPulseRate, bloodPressure, oxygenSaturation] = vitals

    let systolic = null, diastolic = null
    if (bloodPressure && typeof bloodPressure === 'string') {
        const match = bloodPressure.match(/^(\d+)\/(\d+)$/)
        if (match) {
            systolic = parseInt(match[1], 10)
            diastolic = parseInt(match[2], 10)
        }
    }

    return {
        restingPulseRate: restingPulseRate !== null && restingPulseRate !== undefined && restingPulseRate !== '' ? parseFloat(restingPulseRate) : null,
        systolic,
        diastolic,
        oxygenSaturation: oxygenSaturation !== null && oxygenSaturation !== undefined && oxygenSaturation !== '' ? parseFloat(oxygenSaturation) : null,
    }
}

export function isIneligibleForPhysicalActivity(formState) {
    const vitals = getVitalSigns(formState)
    if (!vitals) return false

    const { restingPulseRate, systolic, diastolic, oxygenSaturation } = vitals
    if (restingPulseRate === null || systolic === null || diastolic === null || oxygenSaturation === null) return false

    return (
        restingPulseRate > 100 ||
        oxygenSaturation < 90 ||
        systolic > 180 || diastolic > 110 ||
        systolic < 90 || diastolic < 60
    )
}

function getWalkingSpeedMps(formState, calculationKey) {
    const timeSec = CALCULATION_SECTION_CONFIGS[calculationKey].valueFunction(formState)
    if (timeSec === null) return null
    const time = parseFloat(timeSec)
    if (isNaN(time) || time <= 0) return null
    return 5 / time
}

function getCalculatedValue(formState, calculationKey) {
    const result = CALCULATION_SECTION_CONFIGS[calculationKey].valueFunction(formState)
    if (result === null) return null
    const parsed = parseFloat(result)
    if (isNaN(parsed)) return null
    return parsed
}

// ========== Threshold Data ==========
// Entry: (noPcml, pcml, ml, mean, sd)
// "Lower is better" (speeds): noPcml uses >=, pcml uses <=, ml uses <=
// "Higher is worse" (times): noPcml uses <=, pcml uses >=, ml uses >=

const t = (noPcml, pcml, ml, mean, sd) => ({ noPcml, pcml, ml, mean, sd })

const USUAL_WALKING_SPEED_THRESHOLDS = {
    Male: {
        '50-59': t(1.23, 1.22, 1.15, 1.31, 0.16),
        '60-69': t(1.19, 1.18, 1.10, 1.27, 0.71),
        '70-79': t(1.09, 1.08, 0.98, 1.18, 0.20),
        '80-89': t(0.93, 0.92, 0.82, 1.02, 0.20),
        '90+': t(0.83, 0.82, 0.74, 0.91, 0.17),
    },
    Female: {
        '50-59': t(1.18, 1.17, 1.09, 1.26, 0.17),
        '60-69': t(1.15, 1.14, 1.06, 1.22, 0.16),
        '70-79': t(1.03, 1.02, 0.92, 1.12, 0.2),
        '80-89': t(0.89, 0.88, 0.77, 0.98, 0.21),
        '90+': t(0.66, 0.65, 0.55, 0.76, 0.21),
    },
}

const FAST_WALKING_SPEED_THRESHOLDS = {
    Male: {
        '50-59': t(1.26, 1.25, 0.78, 1.33, 0.55),
        '60-69': t(1.26, 1.25, 1.10, 1.40, 0.3),
        '70-79': t(1.34, 1.33, 1.07, 1.58, 0.51),
        '80-89': t(1.18, 1.17, 0.98, 1.36, 0.38),
        '90+': t(1.04, 1.03, 0.87, 1.19, 0.32),
    },
    Female: {
        '50-59': t(1.60, 1.59, 1.16, 1.67, 0.51),
        '60-69': t(1.42, 1.41, 1.22, 1.59, 0.37),
        '70-79': t(1.37, 1.36, 1.19, 1.52, 0.33),
        '80-89': t(1.05, 1.04, 0.87, 1.20, 0.33),
        '90+': t(0.90, 0.89, 0.75, 1.02, 0.27),
    },
}

const FOUR_SQUARE_STEP_TEST_THRESHOLDS = {
    Male: {
        '50-59': t(11.8, 11.9, 13.5, 10.2, 3.3),
        '60-69': t(10.3, 10.4, 11.3, 9.4, 1.9),
        '70-79': t(12.9, 13.0, 15.1, 10.9, 4.2),
        '80-89': t(19.7, 19.8, 23.8, 15.8, 8),
        '90+': t(14.6, 14.7, 16.4, 13.0, 3.4),
    },
    Female: {
        '50-59': t(12.6, 12.7, 15.0, 10.3, 4.7),
        '60-69': t(10.8, 10.9, 12.1, 9.7, 2.4),
        '70-79': t(12.6, 12.7, 14.5, 10.9, 3.6),
        '80-89': t(17.6, 17.7, 20.6, 14.9, 5.7),
        '90+': t(28.2, 28.3, 36.7, 20.0, 16.7),
    },
}

const TUG_THRESHOLDS = {
    Male: {
        '50-59': t(8.3, 8.4, 9.0, 7.5, 1.5),
        '60-69': t(13.8, 13.8, 17.0, 10.6, 6.4),
        '70-79': t(10.0, 10.1, 11.4, 8.6, 2.8),
        '80-89': t(13.3, 13.4, 15.1, 11.5, 3.6),
        '90+': t(16.9, 17.0, 20.3, 13.4, 6.9),
    },
    Female: {
        '50-59': t(10.4, 10.5, 12, 8.7, 3.3),
        '60-69': t(9.0, 9.1, 9.9, 8.1, 1.8),
        '70-79': t(10.6, 10.7, 11.9, 9.2, 2.7),
        '80-89': t(12.9, 13, 14.4, 11.4, 3.0),
        '90+': t(17.9, 18.0, 21.0, 14.7, 6.3),
    },
}

const TUG_COGNITIVE_THRESHOLDS = {
    Male: {
        '50-59': t(11.2, 11.3, 12.2, 10.1, 2.1),
        '60-69': t(16.7, 16.8, 20.5, 13.2, 7.3),
        '70-79': t(13.5, 13.6, 15.7, 11.6, 4.1),
        '80-89': t(19.4, 19.5, 22.8, 16.2, 6.6),
        '90+': t(24.9, 25.0, 29.8, 20.2, 9.6),
    },
    Female: {
        '50-59': t(14.9, 15.0, 17.8, 11.9, 5.9),
        '60-69': t(15.4, 15.5, 18.0, 13.0, 5.0),
        '70-79': t(15.3, 15.4, 17.9, 12.9, 5.0),
        '80-89': t(19.5, 19.6, 22.0, 17.3, 4.7),
        '90+': t(29.3, 29.4, 34.5, 24.3, 10.2),
    },
}

// ========== Mobility Message Generators ==========

// For walking speeds: higher value = better (speed in m/sec)
function getSpeedMobilityMessages(value, sex, ageBracket, thresholds) {
    const entry = thresholds[sex]?.[ageBracket]
    if (!entry) return []

    const messages = []
    const refLine = `Reference Mean ${entry.mean} (Ages ${ageBracket}) Standard Deviation ${entry.sd}`

    if (value >= entry.noPcml) {
        messages.push({ text: `No Preclinical Mobility Limitation (No PCML) \u2265 ${entry.noPcml}\n${refLine}`, type: 'success' })
    }
    if (value <= entry.pcml) {
        messages.push({ text: `Preclinical Mobility Limitation (PCML) \u2264 ${entry.pcml}\n${refLine}`, type: 'warning' })
    }
    if (value <= entry.ml) {
        messages.push({ text: `Mobility Limitation (ML) \u2264 ${entry.ml}\n${refLine}`, type: 'danger' })
    }

    return messages
}

// For timed tests: higher value = worse (time in seconds)
function getTimeMobilityMessages(value, sex, ageBracket, thresholds) {
    const entry = thresholds[sex]?.[ageBracket]
    if (!entry) return []

    const messages = []
    const refLine = `Reference Mean ${entry.mean} (Ages ${ageBracket}) Standard Deviation ${entry.sd}`

    if (value <= entry.noPcml) {
        messages.push({ text: `No Preclinical Mobility Limitation (No PCML) \u2264 ${entry.noPcml}\n${refLine}`, type: 'success' })
    }
    if (value >= entry.pcml) {
        messages.push({ text: `Preclinical Mobility Limitation (PCML) \u2265 ${entry.pcml}\n${refLine}`, type: 'warning' })
    }
    if (value >= entry.ml) {
        messages.push({ text: `Mobility Limitation (ML) \u2265 ${entry.ml}\n${refLine}`, type: 'danger' })
    }

    return messages
}

// ========== Interpretation Configs ==========

const DEFAULT_CITATION = '<a href="https://aptageriatrics.org/wp-content/uploads/2026/02/AMA-InterpChartsFinalv2.1.pdf" target="_blank" rel="noopener noreferrer">Annual Mobility Assessment</a>'

export const INTERPRETATION_SECTION_CONFIGS = {
    vitalSigns: {
        label: 'Vital Signs',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const vitals = getVitalSigns(formState)
            if (!vitals) return null

            const { restingPulseRate, systolic, diastolic, oxygenSaturation } = vitals
            if (restingPulseRate === null || systolic === null || diastolic === null || oxygenSaturation === null) return null

            if (isIneligibleForPhysicalActivity(formState)) {
                return [{ text: 'This patient is ineligible for physical activity.', type: 'danger' }]
            }
            return [{ text: 'This patient is eligible for physical activity.', type: 'success' }]
        }
    },

    usualWalkingSpeed: {
        label: '5 Meter Usual Walking Speed',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const speed = getWalkingSpeedMps(formState, 'fiveMeterUsualWalkingSpeedMean')
            if (speed === null) return null

            const messages = []
            const sex = getSex(formState)
            const age = getAge(formState)
            const ageBracket = getAgeBracket(age)

            if (speed < 0.76) {
                messages.push({ text: 'Fall Risk, <0.76m/sec (Sn .65, Sp .71)', type: 'danger' })
            }
            if (speed < 0.63) {
                messages.push({ text: 'Frailty Risk, <0.63 m/sec (Sn .90, Sp .90)', type: 'danger' })
            }

            if (sex && ageBracket) {
                messages.push(...getSpeedMobilityMessages(speed, sex, ageBracket, USUAL_WALKING_SPEED_THRESHOLDS))
            }

            return messages.length > 0 ? messages : null
        }
    },

    fastWalkingSpeed: {
        label: '5 Meter Fast Walking Speed',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const speed = getWalkingSpeedMps(formState, 'fiveMeterFastWalkingSpeedBest')
            if (speed === null) return null

            const messages = []
            const sex = getSex(formState)
            const age = getAge(formState)
            const ageBracket = getAgeBracket(age)

            if (speed < 1.10) {
                messages.push({ text: 'Fall Risk, <1.10 m/sec (Sn .76, Sp .60)', type: 'danger' })
            }

            if (sex && ageBracket) {
                messages.push(...getSpeedMobilityMessages(speed, sex, ageBracket, FAST_WALKING_SPEED_THRESHOLDS))
            }

            return messages.length > 0 ? messages : null
        }
    },

    fourSquareStepTest: {
        label: 'Four Square Step Test',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const value = getCalculatedValue(formState, 'fourSquareStepTestBest')
            if (value === null) return null

            const messages = []
            const sex = getSex(formState)
            const age = getAge(formState)
            const ageBracket = getAgeBracket(age)

            if (value >= 15) {
                messages.push({ text: 'Multiple Fall risk \u226515 (Sn .85, Sp .88)', type: 'danger' })
            }

            if (sex && ageBracket) {
                messages.push(...getTimeMobilityMessages(value, sex, ageBracket, FOUR_SQUARE_STEP_TEST_THRESHOLDS))
            }

            return messages.length > 0 ? messages : null
        }
    },

    timedUpAndGo: {
        label: 'Timed Up and Go (TUG)',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const value = getCalculatedValue(formState, 'timedUpAndGoBest')
            if (value === null) return null

            const messages = []
            const sex = getSex(formState)
            const age = getAge(formState)
            const ageBracket = getAgeBracket(age)

            // Fall risk (sex and age specific)
            if (sex === 'Male') {
                if (value > 12.0) {
                    if (age !== null && age > 80) {
                        messages.push({ text: 'Fall risk >12.0 sec (Sn .78, Sp .52)', type: 'danger' })
                    } else {
                        messages.push({ text: 'Fall risk >12.0 sec (Sn .74, Sp .31)', type: 'danger' })
                    }
                }
            } else if (sex === 'Female') {
                if (age !== null && age > 80 && value > 12.0) {
                    messages.push({ text: 'Fall risk >12.0 sec (Sn .78, Sp .52)', type: 'danger' })
                } else if (value > 13.5) {
                    messages.push({ text: 'Fall risk >13.5 sec (Sn .74, Sp .31)', type: 'danger' })
                }
            }

            // Frailty
            if (value >= 17.8) {
                messages.push({ text: 'Frailty \u226517.8 (Sn .93, Sp .98)', type: 'danger' })
            }

            if (sex && ageBracket) {
                messages.push(...getTimeMobilityMessages(value, sex, ageBracket, TUG_THRESHOLDS))
            }

            return messages.length > 0 ? messages : null
        }
    },

    timedUpAndGoCognitive: {
        label: 'Timed Up and Go Cognitive Dual Task',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const value = getCalculatedValue(formState, 'timedUpAndGoCognitiveBest')
            if (value === null) return null

            const messages = []
            const sex = getSex(formState)
            const age = getAge(formState)
            const ageBracket = getAgeBracket(age)

            if (value > 15) {
                messages.push({ text: 'Fall risk >15 (Sn 1.00, Sp .66)', type: 'danger' })
            }

            if (sex && ageBracket) {
                messages.push(...getTimeMobilityMessages(value, sex, ageBracket, TUG_COGNITIVE_THRESHOLDS))
            }

            return messages.length > 0 ? messages : null
        }
    },

    annualMobilityScreening: {
        label: 'Annual Mobility Screening',
        citation: DEFAULT_CITATION,
        messageFunction: (formState) => {
            const vitalSignsMessages = INTERPRETATION_SECTION_CONFIGS.vitalSigns.messageFunction(formState)
            if (!vitalSignsMessages) return null

            const isIneligible = vitalSignsMessages.some(msg => msg.text === 'This patient is ineligible for physical activity.')
            if (isIneligible) {
                return [{
                    text: 'Participants with the following vital sign findings on vital sign testing may not tolerate the intensity of functional testing. Instead of proceeding, thank them for coming to screening, and refer to their primary care provider, cardiologist, or emergency department for follow-up care.',
                    type: 'warning'
                }]
            }

            return null
        }
    },
}
