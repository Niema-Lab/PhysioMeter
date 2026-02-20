# pt-web-app

A React web application for physical therapy measurements, interpretations, and assessments. Deployed at https://daniel-ji.github.io/pt-web-app.

## Roadmap

Next day:

- [ ] Implement Four Square Step Test "does not clear apparatus" to Modified Four Square Step Test (add a confirm prompt and then convert to Modified if selected)

Next week:

- [ ] Build Calculations page
- [ ] Build Interpretations page
- [ ] Build Patient Tests page
- [ ] Implement sessions for the measurements / tests?
- [ ] Implement multiple tabs open for one / multiple patients?

Final chores:

- [ ] Add Playwright E2E tests
- [ ] Improve design? Branding? UI?
- [ ] Add documentation to everything, especially:
  - [ ] Measurement components and how to create new ones
  - [ ] Custom measurement components
  - [ ] Measurements component
- [ ] Dark mode?
- [ ] 404 Page and proper checking of url params (uuid, testUUID)

## Potential future features

- [ ] Full computedValues support with counter value for all measurements (and counter + time for Stopwatch and Countdown Timer)
- [ ] Add tabular component form (and transition Existing Patients view to use it)

## Questions

- [ ] When a new patient is created should I redirect automatically?
- [ ] Should reset reset the input number?