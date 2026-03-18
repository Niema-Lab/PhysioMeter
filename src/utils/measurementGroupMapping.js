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
    { stateKey: 'name', calculationKeys: [], interpretationKeys: [] },
    { stateKey: 'dob', calculationKeys: ['age'], interpretationKeys: [] },
    { stateKey: 'sex', calculationKeys: [], interpretationKeys: [] },
    { stateKey: 'vitalSigns', calculationKeys: [], interpretationKeys: ['vitalSigns', 'annualMobilityScreening'] },
    { stateKey: 'fiveMeterUsualWalkingSpeed', calculationKeys: ['fiveMeterUsualWalkingSpeedMean'], interpretationKeys: ['usualWalkingSpeed'] },
    { stateKey: 'fiveMeterFastWalkingSpeed', calculationKeys: ['fiveMeterFastWalkingSpeedMean'], interpretationKeys: ['fastWalkingSpeed'] },
    { stateKey: 'thirtySecondSitToStand', calculationKeys: ['thirtySecondChairStandMean'], interpretationKeys: [] },
    { stateKey: 'assistiveDevices', calculationKeys: [], interpretationKeys: [] },
    { stateKey: 'fourSquareStepTest', calculationKeys: ['fourSquareStepTestMean'], interpretationKeys: ['fourSquareStepTest'] },
    { stateKey: 'modifiedFourSquareStepTest', calculationKeys: ['modifiedFourSquareStepTestMean'], interpretationKeys: [] },
    { stateKey: 'timedUpAndGo', calculationKeys: ['timedUpAndGoMean'], interpretationKeys: ['timedUpAndGo'] },
    { stateKey: 'timedUpAndGoCognitive', calculationKeys: ['timedUpAndGoCognitiveMean'], interpretationKeys: ['timedUpAndGoCognitive'] },
]

export const getInterpretationKeysForMeasurement = (stateKey) => {
    return MEASUREMENT_GROUP_MAP.find(m => m.stateKey === stateKey)?.interpretationKeys || []
}
