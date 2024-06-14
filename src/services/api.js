import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.201:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const login = async (username, password) => {
    try {
        const response = await api.post('/login', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        setAuthToken(token);
        return token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
};

export default api;
