import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: `${API_URL}/user`,
});

// Auto-attach current JWT token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('eventify_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Global 401 handler: purge stale session and redirect to /auth
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[AUTH INTERCEPTOR] Received 401 Unauthorized. Purging stale session.');
            localStorage.removeItem('eventify_token');
            localStorage.removeItem('eventify_user');
            if (window.location.pathname.startsWith('/admin') || window.location.pathname === '/profile') {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// Global Axios configuration for any direct axios calls in pages
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const path = window.location.pathname;
            if (path.startsWith('/admin') || path === '/profile') {
                localStorage.removeItem('eventify_token');
                localStorage.removeItem('eventify_user');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

