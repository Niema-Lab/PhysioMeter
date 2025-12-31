# pt-web-app

A React web application for physical therapy measurements, interpretations, and assessments. Deployed at https://daniel-ji.github.io/pt-web-app.

## Roadmap

Next day:

- [ ] Refactor AllMeasurementsPage to be in the previous / next format (as opposed to showing all measurements at once)
- [ ] Build navigation pane after refactor
- [ ] Timestamp patient creation date, measurement start dates, save dates
- [ ] Implement Four Square Step Test "does not clear apparatus" to Modified Four Square Step Test (add a confirm prompt and then convert to Modified if selected)

Next week:

- [ ] Build Calculations page
- [ ] Build Interpretations page
- [ ] Build Patient Tests page

Final chores:

- [ ] Add Playwright E2E tests
- [ ] Improve design? Branding? UI?
- [ ] Add documentation to everything, especially:
  - [ ] Measurement components and how to create new ones
  - [ ] Custom measurement components
  - [ ] Measurements component
- [ ] Dark mode?

## Potential future features

- [ ] Full computedValues support with counter value for all measurements (and counter + time for Stopwatch and Countdown Timer)
- [ ] Add tabular component form (and transition Existing Patients view to use it)
