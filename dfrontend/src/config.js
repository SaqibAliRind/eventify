const isBrowser = typeof window !== 'undefined';
const defaultBaseUrl = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? window.location.origin
    : 'http://localhost:9000';

export const API_URL = import.meta.env.VITE_API_URL || defaultBaseUrl;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultBaseUrl;

