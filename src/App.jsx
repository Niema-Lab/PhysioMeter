import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import PatientHome from './components/PatientHome'
import PatientTests from './components/PatientTests'
import AllMeasurementsPage from './components/AllMeasurementsPage'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'

function HomeIcon() {
  return (
    <div id="home-icon" className="nav-icon p-2">
      <a href="">
        <h1>
          <i className="bi bi-house-fill"></i>
        </h1>
      </a>
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

      <div id="app-content" style={{opacity: nav ? 0.5 : 1}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient-home" element={<PatientHome />} />
          <Route path="/patient-tests" element={<PatientTests />} />
          <Route path="/measurements" element={<AllMeasurementsPage setNavIcons={setNavIcons} setNav={setNav} />} />
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
