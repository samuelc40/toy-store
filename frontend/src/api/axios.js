import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// ---------------------------------------------------------------------------
// Axios instance — cookies carry JWT tokens, no Authorization headers needed
// ---------------------------------------------------------------------------
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // send HttpOnly cookies on every cross-origin request
    timeout: 10000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach CSRF token only (no JS token reading)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
    (config) => {
        // Django requires the CSRF token for non-safe methods.
        // csrftoken cookie is NOT HttpOnly, so JS can read it safely.
        const csrfToken = getCookie('csrftoken');
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — silent token refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Attempt refresh only on 401, once, and never for the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token/')
        ) {
            if (isRefreshing) {
                // Queue subsequent 401s while a refresh is already in flight
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // The refresh_token HttpOnly cookie is sent automatically
                await api.post('/auth/refresh-token/');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                store.dispatch(logout());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ---------------------------------------------------------------------------
// Helper — read a non-HttpOnly cookie by name
// ---------------------------------------------------------------------------
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export default api;