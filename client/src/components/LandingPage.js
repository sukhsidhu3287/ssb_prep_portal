import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  console.log('LandingPage component rendered'); // Debug log

  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1 className="app-title">SSB Prep Portal</h1>
        <p className="app-subtitle">Your Complete SSB Preparation Companion</p>
      </div>
      
      <div className="module-cards">
        <div className="module-card" onClick={() => navigate('/test')}>
          <div className="module-icon">📝</div>
          <h2>TEST</h2>
          <p>Practice TAT, WAT & SRT Tests</p>
        </div>
        
        <div className="module-card" onClick={() => navigate('/upload')}>
          <div className="module-icon">📤</div>
          <h2>UPLOAD</h2>
          <p>Upload Materials & Resources</p>
        </div>
        
        <div className="module-card" onClick={() => navigate('/read')}>
          <div className="module-icon">📖</div>
          <h2>READ</h2>
          <p>Read News & Study Materials</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;

