// API Configuration
const API_CONFIG = {
  // Use environment variable for production, fallback to localhost for development
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // API endpoints
  ENDPOINTS: {
    AI: '/proxy/ai',
    EXECUTE: '/proxy/ai/execute',
    PROXY: '/proxy',
    STREAM: '/proxy/stream'
  }
};

export default API_CONFIG;
