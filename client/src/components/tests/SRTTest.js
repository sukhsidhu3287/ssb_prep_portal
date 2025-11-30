import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import './SRTTest.css';

function SRTTest({ onBack }) {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [srts, setSrts] = useState([]);
  const [timer, setTimer] = useState(1800); // 30 minutes
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);

  useEffect(() => {
    loadAvailableTests();
  }, []);

  useEffect(() => {
    if (testStarted && !testComplete && timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (testStarted && timer === 0) {
      playFinalSound();
      setTestComplete(true);
    }
  }, [timer, testStarted, testComplete]);

  const loadAvailableTests = async () => {
    try {
      const response = await api.get('/api/srt-tests');
      setAvailableTests(response.data);
    } catch (error) {
      console.error('Error loading available tests:', error);
    }
  };

  const loadSRTs = async (testNumber) => {
    try {
      const response = await api.get(`/api/srt-list/${testNumber}`);
      let srtList = response.data;
      
      if (srtList.length > 60) {
        srtList = srtList.slice(0, 60);
      }
      
      setSrts(srtList);
    } catch (error) {
      console.error('Error loading SRTs:', error);
    }
  };

  const handleTestSelect = (testNumber) => {
    setSelectedTest(testNumber);
    setTimer(1800);
    setTestStarted(false);
    setTestComplete(false);
    loadSRTs(testNumber);
  };

  const playFinalSound = () => {
    try {
      // Create a final "tong" sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play sound:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setTestStarted(true);
  };

  // Show test selection screen
  if (!selectedTest) {
    return (
      <div className="srt-test">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="test-selection">
          <h2>Select SRT Test</h2>
          {availableTests.length === 0 ? (
            <div className="no-srts">
              <p>No SRT tests available. Please upload SRT list first.</p>
            </div>
          ) : (
            <>
              <p className="test-info">Available Tests: {availableTests.length}</p>
              <div className="test-options">
                {availableTests.map(test => (
                  <button
                    key={test.testNumber}
                    className="test-option-btn"
                    onClick={() => handleTestSelect(test.testNumber)}
                  >
                    Test {test.testNumber} ({test.itemCount} items)
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (srts.length === 0) {
    return (
      <div className="srt-test">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="no-srts">
          <p>No SRT list found in this test.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="srt-test">
      <div className="test-header">
        <div className="timer-display">
          {testStarted ? formatTime(timer) : '30:00'}
        </div>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      {!testStarted ? (
        <div className="test-content">
          <h2>SRT Test</h2>
          <p className="test-info">You will have 30 minutes to complete all {srts.length} SRTs.</p>
          <button className="start-btn" onClick={startTest}>Start Test</button>
        </div>
      ) : (
        <div className="test-content">
          {testComplete ? (
            <div className="review-section">
              <h2>Time's Up! Review Your SRTs</h2>
              <div className="srts-list">
                {srts.map((srt, index) => (
                  <div key={index} className="srt-item">
                    <div className="srt-number">{srt.number}.</div>
                    <div className="srt-text">{srt.text}</div>
                  </div>
                ))}
              </div>
              <button className="back-btn" onClick={onBack}>Back to Tests</button>
            </div>
          ) : (
            <div className="srts-list">
              {srts.map((srt, index) => (
                <div key={index} className="srt-item">
                  <div className="srt-number">{srt.number}.</div>
                  <div className="srt-text">{srt.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SRTTest;

