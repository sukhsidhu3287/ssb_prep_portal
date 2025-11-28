import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import './ReadModule.css';

function ReadModule() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [readingMaterial, setReadingMaterial] = useState([]);
  const [newspapers, setNewspapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [newsRes, readingRes, papersRes] = await Promise.all([
        api.get('/api/news'),
        api.get('/api/reading-material'),
        api.get('/api/newspapers')
      ]);
      
      setNews(newsRes.data);
      setReadingMaterial(readingRes.data);
      setNewspapers(papersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openFile = (filePath) => {
    const baseUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
    window.open(`${baseUrl}${filePath}`, '_blank');
  };

  return (
    <div className="read-module">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      
      <h1 className="module-title">READ</h1>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="read-content">
          <section className="news-section">
            <h2>📰 Latest Defence & National News</h2>
            <div className="news-list">
              {news.length > 0 ? (
                news.map((article, index) => (
                  <div key={index} className="news-item">
                    <h3>{article.title}</h3>
                    <p className="news-description">{article.description || 'No description available'}</p>
                    {article.source && article.source.name && (
                      <p className="news-source">Source: {article.source.name}</p>
                    )}
                    {article.url && article.url !== '#' && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-link">
                        Read Full Article →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-data">No news available</p>
              )}
            </div>
          </section>

          <section className="materials-section">
            <h2>📚 Reading Material</h2>
            <div className="files-list">
              {readingMaterial.length > 0 ? (
                readingMaterial.map((file, index) => (
                  <div key={index} className="file-item" onClick={() => openFile(file.path)}>
                    <span className="file-icon">📄</span>
                    <span className="file-name">{file.filename}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No reading material available</p>
              )}
            </div>
          </section>

          <section className="newspapers-section">
            <h2>📰 Newspapers</h2>
            <div className="files-list">
              {newspapers.length > 0 ? (
                newspapers.map((file, index) => (
                  <div key={index} className="file-item" onClick={() => openFile(file.path)}>
                    <span className="file-icon">📰</span>
                    <div className="file-info">
                      <span className="file-name">{file.filename}</span>
                      {file.date && (
                        <span className="file-date">{file.date}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No newspapers available</p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ReadModule;

