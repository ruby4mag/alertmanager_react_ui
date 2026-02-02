import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const { getToken } = useAuth();
        const token = getToken(); // Get the token from the AuthContext
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);




export default api;
