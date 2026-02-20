import React from 'react'
import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

import Home from './components/Home'
import PatientHome from './components/PatientHome'
import PatientTests from './components/PatientTests'
import { PT_TEST_MEASUREMENT_CONFIG, PT_TEST_HOME_PAGE, PT_TEST_FINAL_PAGE } from './components/physical-therapy-tests/PhysicalTherapyTest'
import { PT_TEST_CONFIG } from './components/physical-therapy-tests/PhysicalTherapyTestFactory'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'
import { getGuestUser } from './DB'

function HomeIcon() {
  return (
    <a href="">
      <div id="home-icon" className="nav-icon p-2">
        <h1>
          <i className="bi bi-house-fill"></i>
        </h1>
      </div>
    </a>
  )
}

function AppContent() {
  const [navIcons, setNavIcons] = useState([])
  const [nav, setNav] = useState(null)

  // ensure guest user exists in indexedDB so that we can use it for storing measurements before the user creates an account or logs in
  getGuestUser()

  return (
    <div id="app">
      <div id="nav-overlay" className={`position-fixed start-0 top-0 ${nav ? "nav-overlay-active" : "pe-none"}`}>
        <div id="nav-icons-container" className="d-flex flex-row align-items-center mt-3">
          {[...[<HomeIcon key="home" />], ...navIcons]}
        </div>
        {nav}
      </div>

      <div id="app-content" style={{ opacity: nav ? 0.5 : 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient-home" element={<PatientHome />} />
          <Route path="/patient-tests" element={<PatientTests />} />
          {PT_TEST_CONFIG.map(({ testKey, component, permittedMeasurements }) => {
            const permittedMeasurementConfigs = permittedMeasurements ? PT_TEST_MEASUREMENT_CONFIG.filter(m => permittedMeasurements.includes(m.name)) : PT_TEST_MEASUREMENT_CONFIG;
            return (
              <>
                <Route path={`/${testKey}/home`} element={React.createElement(component, { setNavIcons, setNav, shownMeasurement: PT_TEST_HOME_PAGE, location: useLocation(), navigate: useNavigate() })} />
                <Route path={`/${testKey}/summary`} element={React.createElement(component, { setNavIcons, setNav, shownMeasurement: PT_TEST_FINAL_PAGE, location: useLocation(), navigate: useNavigate() })} />
                {permittedMeasurementConfigs.map(({ stateKey }) => (
                  <Route
                    key={stateKey}
                    path={`/${testKey}/${stateKey}`}
                    element={React.createElement(component, { setNavIcons, setNav, shownMeasurement: stateKey, location: useLocation(), navigate: useNavigate() })}
                  />
                ))}
              </>
            )
          })}
          <Route path="/new-patient" element={<NewUser />} />
          <Route path="/existing-patient" element={<ExistingUser />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}
