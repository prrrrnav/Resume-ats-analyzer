import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import OptimizedResume from './components/OptimizedResume';
import Status from './components/Status';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <div className="nav-brand">Resume Analyzer</div>
          <ul className="nav-links">
            <li>
              <Link to="/">Analyze Resume</Link>
            </li>
            <li>
              <Link to="/optimize">Optimize Resume</Link>
            </li>
            <li>
              <Link to="/status">API Status</Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ResumeAnalyzer />} />
            <Route path="/optimize" element={<OptimizedResume />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 Resume Analyzer. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
