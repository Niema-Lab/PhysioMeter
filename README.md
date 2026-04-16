# PhysioMeter

PhysioMeter is a clinical tool for recording physical therapy measurements, computing derived values, and generating evidence-based interpretations. Visit https://niema-lab.github.io/PhysioMeter/.

For an end-user walkthrough of the app with annotated screenshots of every step in the Annual Mobility Screening workflow, see [`docs/user-guide.md`](docs/user-guide.md).

## Features

- **Fully client-side** — all data is stored in the browser via IndexedDB; no patient data is sent to or stored on any server
- **YAML-driven configuration** — all clinical logic (measurements, calculations, interpretations, thresholds) is defined in YAML files, no code changes needed
- **Declarative validation** — input validation rules are defined alongside measurements
- **Automated interpretations** — rule-based interpretation engine with threshold table lookups, cross-interpretation references, and severity classifications
- **PDF export** — generate summary reports with measurements, calculations, and interpretations
- **Test presets** — configurable subsets of measurements for specific assessment protocols

## Overview

### Home Page

The home page provides four entry points: **New Patient**, **Existing Patient**, **Presets**, and **Utilities**.

### Patients and Sessions

Each patient has a name, date of birth, and sex. Patient data is stored locally in the browser via IndexedDB. From a patient's page, you can create new sessions or revisit previous ones.

### Test Presets

When creating a session, you choose a test preset that determines which measurements are available. Currently there are two presets: **Measurements** (all measurements) and **Annual Mobility Screening** (a curated subset of 10 measurements).

### Measurements

Each measurement is an input form — ranging from simple single-field entries (vital signs) to multi-trial timed tests (5-meter walking speed with 3 trials and a built-in stopwatch). Measurements can have conditional logic that disables them based on other inputs (e.g., Four Square Step Test is disabled if the patient uses a walker).

### Calculations and Interpretations

**Calculations** are values derived automatically from measurements (e.g., mean walking speed across trials, age from date of birth). **Interpretations** compare calculated values against age/sex normative threshold tables to produce clinical assessments with severity classifications (normal, caution, concern).

### Summary and Export

The summary page displays all measurements, calculations, and interpretations grouped by category with color-coded status indicators. From here, you can export to CSV (three separate files) or a single PDF report.

### Utilities

Standalone tools accessible from the home page — stopwatch, countdown timer, tally counter, calculator, and metronome. These are independent of patient data and don't persist any information.

## Project Structure

```
src/
├── config/                  # YAML configuration files
│   ├── measurements.yaml        # Input field definitions
│   ├── calculations.yaml        # Derived value formulas
│   ├── interpretations.yaml     # Clinical interpretation rules
│   ├── thresholds.yaml          # Age/sex normative data tables
│   ├── measurement_groups.yaml  # Groups measurements with their calculations/interpretations
│   ├── tests.yaml               # Test preset definitions
│   └── schemas/                 # JSON Schemas for config validation
├── engines/                 # YAML-to-runtime config converters
│   ├── measurementEngine.js     # Builds measurement configs
│   ├── calculationEngine.js     # Builds calculation configs
│   ├── interpretationEngine.js  # Builds interpretation configs
│   ├── validationEngine.js      # Builds validation functions
│   └── conditionEngine.js       # Evaluates declarative conditions
├── components/              # React components
│   ├── measurements/            # Measurement input components + instructions
│   ├── calculations/            # Calculation display components
│   ├── interpretations/         # Interpretation display components
│   ├── physical-therapy-tests/  # Test preset selection + execution
│   ├── form/                    # Shared form components
│   └── utilities/               # Timer, stopwatch, etc.
├── utils/                   # Helpers (PDF export, group mapping, date validation)
├── __tests__/               # Vitest tests (migration parity, fixtures)
└── scss/                    # Custom styles
scripts/                     # Config validation scripts
e2e/                         # Playwright golden-path walkthrough (also generates user-guide screenshots)
docs/                        # User guide + configuration guide
```

## Configuration

All clinical logic is defined in 6 YAML files in `src/config/`. To add or modify measurements, calculations, interpretations, or test presets, edit these files — no code changes required.

See [`docs/configuration-guide.md`](docs/configuration-guide.md) for full documentation on the configuration format, available options, and examples.

## Local Development

Prerequisites: [Node.js](https://nodejs.org/) (v22+)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing and Validation

```bash
# Run all tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Run the end-to-end walkthrough (Playwright). Also regenerates the
# screenshots used in docs/user-guide.md.
npm run test:e2e

# Validate YAML configs against JSON Schemas + cross-file reference checks
npm run validate:config
```

CI (GitHub Actions) runs tests and config validation on push/PR against Node 22 and 25.

## Deployment

The app is deployed to GitHub Pages at https://niema-lab.github.io/PhysioMeter/. Production builds are generated with `npm run build` and output to `dist/`.
