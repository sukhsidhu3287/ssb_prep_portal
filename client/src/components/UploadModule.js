import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './UploadModule.css';

function UploadModule() {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState(null);
  const [filename, setFilename] = useState('');
  const [folder, setFolder] = useState('reading_material');
  const [date, setDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', type);

    if (type === 'lecture') {
      formData.append('filename', filename || file.name);
      formData.append('folder', folder);
      if (folder === 'newspaper') {
        formData.append('date', date || new Date().toISOString().split('T')[0]);
      }
    }

    try {
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`✅ ${response.data.message}`);
      e.target.value = ''; // Reset input
      setFilename('');
      setDate('');
    } catch (error) {
      setMessage(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const renderUploadForm = () => {
    switch (uploadType) {
      case 'lecture':
        return (
          <div className="upload-form">
            <h3>Upload Lecture Material</h3>
            <input
              type="text"
              placeholder="Enter filename (optional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="input-field"
            />
            <div className="folder-selector">
              <label>
                <input
                  type="radio"
                  value="reading_material"
                  checked={folder === 'reading_material'}
                  onChange={(e) => setFolder(e.target.value)}
                />
                Reading Material
              </label>
              <label>
                <input
                  type="radio"
                  value="newspaper"
                  checked={folder === 'newspaper'}
                  onChange={(e) => setFolder(e.target.value)}
                />
                Newspaper
              </label>
            </div>
            {folder === 'newspaper' && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            )}
            <label className="file-upload-label">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'lecture')}
                disabled={uploading}
              />
              Choose File (PDF, DOC, DOCX, TXT)
            </label>
          </div>
        );

      case 'tat':
        return (
          <div className="upload-form">
            <h3>Upload TAT Images</h3>
            <p className="info-text">Images will be auto-numbered as TAT_1.png, TAT_2.png...</p>
            <label className="file-upload-label">
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => handleFileUpload(e, 'tat')}
                disabled={uploading}
              />
              Choose Image (PNG, JPG, JPEG)
            </label>
          </div>
        );

      case 'wat':
        return (
          <div className="upload-form">
            <h3>Upload Words for WAT</h3>
            <p className="info-text">Format: One word per line</p>
            <label className="file-upload-label">
              <input
                type="file"
                accept=".txt"
                onChange={(e) => handleFileUpload(e, 'wat')}
                disabled={uploading}
              />
              Choose TXT File
            </label>
          </div>
        );

      case 'srt':
        return (
          <div className="upload-form">
            <h3>Upload SRT List</h3>
            <p className="info-text">Format: Numbered items (1. You are walking...)</p>
            <label className="file-upload-label">
              <input
                type="file"
                accept=".txt"
                onChange={(e) => handleFileUpload(e, 'srt')}
                disabled={uploading}
              />
              Choose TXT File
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="upload-module">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      
      <h1 className="module-title">UPLOAD</h1>

      {!uploadType ? (
        <div className="upload-options">
          <button
            className="upload-option-btn"
            onClick={() => setUploadType('lecture')}
          >
            📄 Upload Lecture Material
          </button>
          <button
            className="upload-option-btn"
            onClick={() => setUploadType('tat')}
          >
            🖼️ Upload TAT Images
          </button>
          <button
            className="upload-option-btn"
            onClick={() => setUploadType('wat')}
          >
            📝 Upload Words for WAT
          </button>
          <button
            className="upload-option-btn"
            onClick={() => setUploadType('srt')}
          >
            📋 Upload SRT List
          </button>
        </div>
      ) : (
        <div>
          <button
            className="back-to-options"
            onClick={() => {
              setUploadType(null);
              setMessage('');
            }}
          >
            ← Back to Options
          </button>
          {renderUploadForm()}
          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          {uploading && <div className="loading">Uploading...</div>}
        </div>
      )}
    </div>
  );
}

export default UploadModule;

