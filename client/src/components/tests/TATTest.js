import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import './TATTest.css';

function TATTest({ onBack }) {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('viewing'); // 'viewing' or 'writing'
  const [viewTimer, setViewTimer] = useState(30);
  const [writeTimer, setWriteTimer] = useState(240);
  const [testComplete, setTestComplete] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (phase === 'viewing' && viewTimer > 0) {
      const timer = setTimeout(() => setViewTimer(viewTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'viewing' && viewTimer === 0) {
      setPhase('writing');
      setWriteTimer(240);
    }
  }, [phase, viewTimer]);

  useEffect(() => {
    if (phase === 'writing' && writeTimer > 0) {
      const timer = setTimeout(() => setWriteTimer(writeTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'writing' && writeTimer === 0) {
      playAlertSound();
      if (currentIndex < images.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setPhase('viewing');
          setViewTimer(30);
        }, 1000);
      } else {
        setTestComplete(true);
      }
    }
  }, [phase, writeTimer, currentIndex, images.length]);

  const loadImages = async () => {
    try {
      const response = await api.get('/api/tat-images');
      let imageList = response.data;
      
      if (imageList.length >= 12) {
        // Randomly pick 12
        const shuffled = [...imageList].sort(() => 0.5 - Math.random());
        imageList = shuffled.slice(0, 12);
      }
      
      setImages(imageList);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const playAlertSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
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

  if (testComplete) {
    return (
      <div className="tat-test">
        <div className="test-complete">
          <h1>✅ TAT Complete</h1>
          <p>You have completed all {images.length} images.</p>
          <button className="back-btn" onClick={onBack}>Back to Tests</button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="tat-test">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="no-images">
          <p>No TAT images found. Please upload images first.</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="tat-test">
      <div className="test-header">
        <span>Image {currentIndex + 1} of {images.length}</span>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      <div className="test-content">
        {phase === 'viewing' ? (
          <div className="viewing-phase">
            <div className="timer-display viewing-timer">
              Viewing: {formatTime(viewTimer)}
            </div>
            <img 
              src={`${process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000')}${currentImage.path}`} 
              alt={`TAT ${currentIndex + 1}`}
              className="tat-image"
            />
          </div>
        ) : (
          <div className="writing-phase">
            <div className="timer-display writing-timer">
              Writing Time: {formatTime(writeTimer)}
            </div>
            <div className="blank-screen">
              <p>Write your story here...</p>
              <textarea 
                className="story-input"
                placeholder="Type your story..."
                rows="15"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TATTest;

