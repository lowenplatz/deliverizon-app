import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Hub from './Hub'
import App from './App'
import FleetDashboard from './FleetDashboard'
import FleetIntelligence from './FleetIntelligence'
import EdgeCases from './EdgeCases'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/demo" element={<App />} />
        <Route path="/fleet" element={<FleetIntelligence />} />
        <Route path="/dashboard" element={<FleetDashboard />} />
        <Route path="/edge-cases" element={<EdgeCases />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)