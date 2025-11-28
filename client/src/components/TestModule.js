import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TATTest from './tests/TATTest';
import WATTest from './tests/WATTest';
import SRTTest from './tests/SRTTest';
import './TestModule.css';

function TestModule() {
  const navigate = useNavigate();
  const [testType, setTestType] = useState(null);

  if (testType === 'tat') {
    return <TATTest onBack={() => setTestType(null)} />;
  }
  if (testType === 'wat') {
    return <WATTest onBack={() => setTestType(null)} />;
  }
  if (testType === 'srt') {
    return <SRTTest onBack={() => setTestType(null)} />;
  }

  return (
    <div className="test-module">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      
      <h1 className="module-title">TEST</h1>

      <div className="test-options">
        <button
          className="test-option-btn"
          onClick={() => setTestType('tat')}
        >
          🖼️ TAT Test
        </button>
        <button
          className="test-option-btn"
          onClick={() => setTestType('wat')}
        >
          📝 WAT Test
        </button>
        <button
          className="test-option-btn"
          onClick={() => setTestType('srt')}
        >
          📋 SRT Test
        </button>
      </div>
    </div>
  );
}

export default TestModule;

