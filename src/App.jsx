import React, { Component } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import PatientHome from './components/PatientHome'
import PatientTests from './components/PatientTests'
import Utilities from './components/Utilities'
import NewUser from './components/NewUser'
import ExistingUser from './components/ExistingUser'

export class App extends Component {
  render() {
    return (
      <div id="app">
        <div id="home-icon" className="position-fixed top-0 start-0 mt-3">
          <a href="#/">
            <h1>
              <i className="bi bi-house-fill"></i>
            </h1>
          </a>
        </div>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patient-home" element={<PatientHome />} />
            <Route path="/patient-tests" element={<PatientTests />} />
            <Route path="/utilities" element={<Utilities />} />
            <Route path="/new-user" element={<NewUser />} />
            <Route path="/existing-user" element={<ExistingUser />} />
          </Routes>
        </HashRouter>
      </div>
    )
  }
}

export default App