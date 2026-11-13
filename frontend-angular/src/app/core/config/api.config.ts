const isLocalHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalHost ? 'http://localhost:8080' : '';
export const ANALYTICS_BASE_URL = isLocalHost ? 'http://localhost:8000' : '/py-analytics';
