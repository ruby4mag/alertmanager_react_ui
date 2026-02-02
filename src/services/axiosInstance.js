// useAxios.js
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

const axiosInstance = () => {
    //const navigate = useNavigate()
    const { token } = useAuth();

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    api.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers.Authorization = token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        response => response,
        error => {
            const { status } = error.response || {};

            if (status === 401) {
                // Clear user session and redirect to login page
                localStorage.removeItem('token'); // Remove token from local storage
                localStorage.removeItem('userRole'); // Remove token from local storage
                //navigate('/login'); // Redirect to login page
            }

            return Promise.reject(error);
        }
    );

    return api;
};

export default axiosInstance;
