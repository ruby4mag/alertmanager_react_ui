import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const api = axios.create({
    baseURL: 'http://192.168.1.201:8080',
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
