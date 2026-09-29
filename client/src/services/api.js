import axios from 'axios';

// Static uploaded files (attachments) are served from the server's root,
// not under /api — e.g. http://localhost:5000/uploads/xyz.png
export const SERVER_ORIGIN = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${SERVER_ORIGIN}/api`, // Adjust if backend PORT changes
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle unauthorized errors
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
