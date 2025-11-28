import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import UploadModule from './components/UploadModule';
import TestModule from './components/TestModule';
import ReadModule from './components/ReadModule';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadModule />} />
          <Route path="/test" element={<TestModule />} />
          <Route path="/read" element={<ReadModule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

