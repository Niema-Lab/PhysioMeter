# pt-web-app

A React web application for physical therapy measurements, interpretations, and assessments. Deployed at https://daniel-ji.github.io/pt-web-app.

## Measurement Group Map

Each measurement is grouped with its related calculations and interpretations. Interpretations are listed under their **primary** measurement only (not all measurements they depend on). This mapping is defined in `src/utils/measurementGroupMapping.js`.

| Measurement | Calculations | Interpretations |
|---|---|---|
| Name | — | — |
| Date of Birth | Age | — |
| Sex | — | — |
| Vital Signs | — | Vital Signs, Annual Mobility Screening |
| 5 Meter Usual Walking Speed | 5M Usual Walking Speed Mean | Usual Walking Speed |
| 5 Meter Fast Walking Speed | 5M Fast Walking Speed Mean | Fast Walking Speed |
| 30 Second Chair Stand | 30 Second Chair Stand Mean | — |
| Assistive Device | — | — |
| Four Square Step Test | Four Square Step Test Mean | Four Square Step Test |
| Modified Four Square Step Test | Modified Four Square Step Test Mean | — |
| Timed Up and Go | TUG Mean | Timed Up and Go |
| Timed Up and Go Cognitive | TUG Cognitive Mean | TUG Cognitive Dual Task |

## Adding New Measurements, Calculations, or Interpretations

When adding new components, update these files:

1. **New Measurement:**
   - Add config to `MEASUREMENT_CONFIGS` in `src/components/measurements/MeasurementFactory.jsx`
   - Add `createMeasurement()` export in the same file
   - Add entry to `PT_TEST_MEASUREMENT_CONFIG` in `src/components/physical-therapy-tests/PhysicalTherapyTest.jsx`
   - Add entry to `MEASUREMENT_GROUP_MAP` in `src/utils/measurementGroupMapping.js`

2. **New Calculation:**
   - Add config to `CALCULATION_SECTION_CONFIGS` in `src/components/calculations/CalculationFactory.jsx`
   - Add its key to the parent measurement's `calculationKeys` in `MEASUREMENT_GROUP_MAP`

3. **New Interpretation:**
   - Add config to `INTERPRETATION_SECTION_CONFIGS` in `src/components/interpretations/InterpretationFactory.jsx`
   - Add its key to the PRIMARY measurement's `interpretationKeys` in `MEASUREMENT_GROUP_MAP`
   - Primary = the measurement most directly associated, not all measurements it depends on

4. **New Preset/Test:**
   - Add config to `PT_TEST_CONFIG` in `src/components/physical-therapy-tests/PhysicalTherapyTestFactory.jsx`

## Roadmap

Next week:

- [ ] Implement sessions for the measurements / tests?
- [ ] Implement multiple tabs open for one / multiple patients?
- [ ] 404 Page and proper checking of url params (uuid, testUUID)
- [ ] Import data feature?

Final chores:

- [ ] Add Playwright E2E tests
- [ ] Improve design? Branding? UI?
- [ ] Dark mode?

## Potential future features

- [ ] Full computedValues support with counter value for all measurements (and counter + time for Stopwatch and Countdown Timer)
- [ ] Add tabular component form (and transition Existing Patients view to use it)

## Questions

- [ ] When a new patient is created should I redirect automatically?
- [ ] Should reset reset the input number?
