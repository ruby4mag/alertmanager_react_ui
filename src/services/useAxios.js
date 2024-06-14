// useAxios.js
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const useAxios = () => {
    const { token } = useAuth();

    const api = axios.create({
        baseURL: 'http://192.168.1.201:8080',
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

    return api;
};

export default useAxios;
