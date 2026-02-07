import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '', // Use same URL as your API (or env var)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log a warning if API URL is missing in production
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.warn("VITE_API_URL is not set. API requests may fail with 404/405.");
}

export default api;
