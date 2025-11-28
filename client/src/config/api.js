// API configuration for different environments
import axios from 'axios';

const getApiBaseUrl = () => {
  // In production (GitHub Pages), use environment variable or default backend URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com';
  }
  // In development, use proxy or localhost
  return process.env.REACT_APP_API_URL || '';
};

export const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

