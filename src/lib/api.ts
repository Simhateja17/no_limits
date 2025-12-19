import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 API Request:', config.method?.toUpperCase(), config.url, '- Authenticated');
    } else {
      console.log('📡 API Request:', config.method?.toUpperCase(), config.url, '- No token');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.error('🚫 Authentication failed - redirecting to login');
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } else if (error.response.status === 403) {
        console.error('🚫 Access denied - insufficient permissions');
      }
    } else {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);
