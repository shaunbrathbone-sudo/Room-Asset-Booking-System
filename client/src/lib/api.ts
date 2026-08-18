import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Configured Axios instance for API calls.
 * Automatically attaches JWT from localStorage.
 */
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
            try {
                const parsed = JSON.parse(tokens);
                config.headers.Authorization = `Bearer ${parsed.accessToken}`;
            } catch {
                // Invalid token format — continue without auth
            }
        }
    }
    return config;
});

// Response interceptor — handle 401 (expired token)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = localStorage.getItem('auth_tokens');
                if (tokens) {
                    const parsed = JSON.parse(tokens);
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken: parsed.refreshToken,
                    });

                    localStorage.setItem('auth_tokens', JSON.stringify(response.data));
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch {
                localStorage.removeItem('auth_tokens');
                localStorage.removeItem('auth_user');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;