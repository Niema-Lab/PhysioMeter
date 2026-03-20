const computeTrialMean = (formState, measurementKey) => {
    const measurements = formState[measurementKey]
    if (!measurements || measurements.length === 0) return null

    const allTrials = []
    for (const measurement of measurements) {
        const value = measurement.value
        if (Array.isArray(value)) {
            for (const trial of value) {
                if (trial !== null && trial !== undefined && trial !== '') {
                    allTrials.push(parseFloat(trial))
                }
            }
        }
    }

    if (allTrials.length === 0) return null
    const sum = allTrials.reduce((a, b) => a + b, 0)
    return (sum / allTrials.length).toFixed(2)
}

const computeTrialBest = (formState, measurementKey) => {
    const measurements = formState[measurementKey]
    if (!measurements || measurements.length === 0) return null

    const allTrials = []
    for (const measurement of measurements) {
        const value = measurement.value
        if (Array.isArray(value)) {
            for (const trial of value) {
                if (trial !== null && trial !== undefined && trial !== '') {
                    allTrials.push(parseFloat(trial))
                }
            }
        }
    }

    if (allTrials.length === 0) return null
    return Math.min(...allTrials).toFixed(2)
}

const computeFieldBest = (formState, measurementKey, fieldIndex) => {
    const measurements = formState[measurementKey]
    if (!measurements || measurements.length === 0) return null

    const values = []
    for (const measurement of measurements) {
        const value = measurement.value
        if (Array.isArray(value) && value[fieldIndex] !== null && value[fieldIndex] !== undefined && value[fieldIndex] !== '') {
            values.push(parseFloat(value[fieldIndex]))
        }
    }

    if (values.length === 0) return null
    return Math.min(...values).toFixed(2)
}

export const CALCULATION_SECTION_CONFIGS = {
    age: {
        label: 'Age',
        unit: 'years',
        valueFunction: (formState) => {
            const dob = formState.dob?.[0]?.value
            if (!dob || !Date.parse(dob)) return null
            const today = new Date()
            const birthDate = new Date(dob)
            let age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            return age
        }
    },
    fiveMeterUsualWalkingSpeedMean: {
        label: '5 Meter Usual Walking Speed - Mean',
        unit: 's',
        valueFunction: (formState) => computeTrialMean(formState, 'fiveMeterUsualWalkingSpeed')
    },
    fiveMeterFastWalkingSpeedBest: {
        label: '5 Meter Fast Walking Speed - Best',
        unit: 's',
        valueFunction: (formState) => computeTrialBest(formState, 'fiveMeterFastWalkingSpeed')
    },
    fourSquareStepTestBest: {
        label: 'Four Square Step Test - Best',
        unit: 's',
        valueFunction: (formState) => computeTrialBest(formState, 'fourSquareStepTest')
    },
    modifiedFourSquareStepTestBest: {
        label: 'Modified Four Square Step Test - Best',
        unit: 's',
        valueFunction: (formState) => computeTrialBest(formState, 'modifiedFourSquareStepTest')
    },
    timedUpAndGoBest: {
        label: 'Timed Up and Go (TUG) - Best',
        unit: 's',
        valueFunction: (formState) => computeTrialBest(formState, 'timedUpAndGo')
    },
    timedUpAndGoCognitiveBest: {
        label: 'Timed Up and Go Cognitive Dual Task - Best',
        unit: 's',
        valueFunction: (formState) => computeFieldBest(formState, 'timedUpAndGoCognitive', 0)
    },
}
