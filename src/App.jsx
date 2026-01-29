import { useState } from 'react'
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

import Home from './components/Home'
import PatientHome from './components/PatientHome'
import PatientTests from './components/PatientTests'
import { AllMeasurementsPage, MEASUREMENT_PAGE_CONFIG, MEASUREMENT_HOME_PAGE, MEASUREMENT_FINAL_PAGE } from './components/AllMeasurementsPage'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'

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
          <Route path="/measurements/home" element={<AllMeasurementsPage setNavIcons={setNavIcons} setNav={setNav} shownMeasurement={MEASUREMENT_HOME_PAGE} location={useLocation()} navigate={useNavigate()} />} />
          <Route path="/measurements/summary" element={<AllMeasurementsPage setNavIcons={setNavIcons} setNav={setNav} shownMeasurement={MEASUREMENT_FINAL_PAGE} location={useLocation()} navigate={useNavigate()} />} />
          {MEASUREMENT_PAGE_CONFIG.map(({ stateKey }) => (
            <Route
              key={stateKey}
              path={`/measurements/${stateKey}`}
              element={<AllMeasurementsPage setNavIcons={setNavIcons} setNav={setNav} shownMeasurement={stateKey} location={useLocation()} navigate={useNavigate()} />}
            />
          ))}
          <Route path="/measurements/final" element={<AllMeasurementsPage setNavIcons={setNavIcons} setNav={setNav} shownMeasurement={MEASUREMENT_FINAL_PAGE} location={useLocation()} navigate={useNavigate()} />} />
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
