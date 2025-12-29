import React, { Component } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import PatientHome from './components/PatientHome'
import PatientTests from './components/PatientTests'
import AllMeasurementsPage from './components/AllMeasurementsPage'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'

export class App extends Component {
  render() {
    return (
      <div id="app">
        <a href="#/">
          <div id="home-icon" className="position-fixed top-0 start-0 mt-3 p-2">
            <h1>
              <i className="bi bi-house-fill"></i>
            </h1>
          </div>
        </a>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient-home" element={<PatientHome />} />
            <Route path="/patient-tests" element={<PatientTests />} />
            <Route path="/measurements" element={<AllMeasurementsPage />} />
            <Route path="/new-user" element={<NewUser />} />
            <Route path="/existing-user" element={<ExistingUser />} />
          </Routes>
        </HashRouter>
      </div>
    )
  }
}

export default App