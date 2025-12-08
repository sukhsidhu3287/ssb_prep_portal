import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import './WATTest.css';

function WATTest({ onBack }) {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [showSummary, setShowSummary] = useState(false);
  const [displayedWords, setDisplayedWords] = useState([]);

  useEffect(() => {
    loadAvailableTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showSummary && currentIndex < words.length && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (!showSummary && currentIndex < words.length && timer === 0) {
      playWordSound();
      if (currentIndex < words.length - 1) {
        setDisplayedWords(prev => [...prev, words[currentIndex]]);
        setCurrentIndex(currentIndex + 1);
        setTimer(15);
      } else {
        playFinalSound();
        setDisplayedWords(prev => [...prev, words[currentIndex]]);
        setShowSummary(true);
      }
    }
  }, [timer, currentIndex, words, showSummary]);

  const loadAvailableTests = async () => {
    try {
      const response = await api.get('/api/wat-tests');
      setAvailableTests(response.data);
    } catch (error) {
      console.error('Error loading available tests:', error);
    }
  };

  const loadWords = async (testNumber) => {
    try {
      const response = await api.get(`/api/wat-words/${testNumber}`);
      setWords(response.data);
      if (response.data.length > 0) {
        playWordSound();
      }
    } catch (error) {
      console.error('Error loading words:', error);
    }
  };

  const handleTestSelect = (testNumber) => {
    setSelectedTest(testNumber);
    setCurrentIndex(0);
    setTimer(15);
    setShowSummary(false);
    setDisplayedWords([]);
    loadWords(testNumber);
  };

  const playWordSound = () => {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play sound:', error);
    }
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

  // Show test selection screen
  if (!selectedTest) {
    return (
      <div className="wat-test">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="test-selection">
          <h2>Select WAT Test</h2>
          {availableTests.length === 0 ? (
            <div className="no-words">
              <p>No WAT tests available. Please upload words.txt file first.</p>
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
                    Test {test.testNumber} ({test.wordCount} words)
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="wat-test">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="no-words">
          <p>No WAT words found in this test.</p>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="wat-test">
        <div className="summary-screen">
          <h1>WAT Test Complete</h1>
          <p className="summary-info">All 60 words displayed</p>
          <div className="words-list">
            {displayedWords.map((word, index) => (
              <div key={index} className="word-item">
                {index + 1}. {word}
              </div>
            ))}
          </div>
          <button className="back-btn" onClick={onBack}>Back to Tests</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wat-test">
      <div className="test-header">
        <span>Word {currentIndex + 1} of {Math.min(words.length, 60)}</span>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      <div className="test-content">
        <div className="timer-display">
          {timer} seconds
        </div>
        <div className="word-display">
          <h1>{words[currentIndex]}</h1>
        </div>
      </div>
    </div>
  );
}

export default WATTest;

