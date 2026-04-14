/**
 * API Configuration
 * 
 * Local Development: Fallback to http://localhost:8000
 * Production: Uses the VITE_API_URL environment variable
 */

let base_url = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Sonunda slash varsa temizle
if (base_url.endsWith('/')) {
  base_url = base_url.slice(0, -1);
}

const API_BASE_URL = base_url;

export default API_BASE_URL;
