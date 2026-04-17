import React from 'react'
import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom'

import Home from './components/Home'
import PatientPage from './components/PatientPage'
import PatientEdit from './components/PatientEdit'
import NewSession from './components/NewSession'
import Presets from './components/Presets'
import { PT_TEST_MEASUREMENT_CONFIG, PT_TEST_HOME_PAGE, PT_TEST_FINAL_PAGE } from './components/physical-therapy-tests/PhysicalTherapyTest'
import { PT_TEST_CONFIG } from './components/physical-therapy-tests/PhysicalTherapyTestFactory'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'
import NotFound from './components/NotFound'
import UtilitiesPage from './components/utilities/UtilitiesPage'
import UserGuide from './components/UserGuide'

function HomeIcon() {
  return (
    <div id="home-icon" className="nav-icon p-2">
      <h1>
        <Link to="/">
          <i className="bi bi-house-fill text-primary"></i>
        </Link>
      </h1>
    </div>
  )
}

function AppContent() {
  const [navIcons, setNavIcons] = useState([])
  const [nav, setNav] = useState(null)

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
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/patient/edit" element={<PatientEdit />} />
          <Route path="/new-session" element={<NewSession />} />
          <Route path="/presets" element={<Presets />} />
          <Route path="/utilities" element={<UtilitiesPage />} />
          <Route path="/user-guide" element={<UserGuide />} />
          {PT_TEST_CONFIG.map(({ testKey, component, permittedMeasurements }) => {
            const permittedMeasurementConfigs = permittedMeasurements ? PT_TEST_MEASUREMENT_CONFIG.filter(m => permittedMeasurements.includes(m.stateKey)) : PT_TEST_MEASUREMENT_CONFIG;
            return (
              <>
                <Route path={`/${testKey}/home`} element={React.createElement(component, { setNavIcons, setNav, shownMeasurement: PT_TEST_HOME_PAGE, location: useLocation(), navigate: useNavigate() })} />
                <Route path={`/${testKey}/`} element={React.createElement(component, { setNavIcons, setNav, shownMeasurement: PT_TEST_HOME_PAGE, location: useLocation(), navigate: useNavigate() })} />
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
          <Route path="*" element={<NotFound />} />
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
