// MEASUREMENT_GROUP_MAP: Defines which calculations and interpretations belong to each measurement.
//
// IMPORTANT: When adding a new measurement, calculation, or interpretation, you must update this map:
// 1. New measurement → add a new entry with its stateKey
// 2. New calculation → add its key to the parent measurement's calculationKeys
// 3. New interpretation → add its key to the PRIMARY measurement's interpretationKeys
//    (the measurement most directly associated — NOT all measurements it depends on)
//
// Every calculation and interpretation must appear in exactly one measurement's group.

export const MEASUREMENT_GROUP_MAP = [
    // name is now a patient-level attribute only (not in formState for sessions)
    // dob and sex are patient-level attributes, but their calculations/interpretations
    // still need to appear in the summary. patientLevel: true tells GroupedSummary to
    // skip rendering a measurement card but still show calculations/interpretations.
    { stateKey: 'dob', calculationKeys: ['age'], interpretationKeys: [], patientLevel: true },
    { stateKey: 'sex', calculationKeys: [], interpretationKeys: [], patientLevel: true },
    { stateKey: 'vitalSigns', calculationKeys: [], interpretationKeys: ['vitalSigns', 'annualMobilityScreening'] },
    { stateKey: 'fiveMeterUsualWalkingSpeed', calculationKeys: ['fiveMeterUsualWalkingSpeedMean'], interpretationKeys: ['usualWalkingSpeed'] },
    { stateKey: 'fiveMeterFastWalkingSpeed', calculationKeys: ['fiveMeterFastWalkingSpeedBest'], interpretationKeys: ['fastWalkingSpeed'] },
    { stateKey: 'thirtySecondSitToStand', calculationKeys: [], interpretationKeys: [] },
    { stateKey: 'assistiveDevices', calculationKeys: [], interpretationKeys: [] },
    { stateKey: 'fourSquareStepTest', calculationKeys: ['fourSquareStepTestBest'], interpretationKeys: ['fourSquareStepTest'] },
    { stateKey: 'modifiedFourSquareStepTest', calculationKeys: ['modifiedFourSquareStepTestBest'], interpretationKeys: [] },
    { stateKey: 'timedUpAndGo', calculationKeys: ['timedUpAndGoBest'], interpretationKeys: ['timedUpAndGo'] },
    { stateKey: 'timedUpAndGoCognitive', calculationKeys: ['timedUpAndGoCognitiveBest'], interpretationKeys: ['timedUpAndGoCognitive'] },
]

export const getInterpretationKeysForMeasurement = (stateKey) => {
    return MEASUREMENT_GROUP_MAP.find(m => m.stateKey === stateKey)?.interpretationKeys || []
}
