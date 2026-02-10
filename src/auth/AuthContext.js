// AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const roles = {
    admin: ['viewDashboard', 'manageUsers', 'viewReports'],
    user: ['viewDashboard', 'viewReports'],
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [role, setRole] = useState(localStorage.getItem('userRole') || '');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    const login = (newToken, role, user) => {
        setToken(newToken);
        setRole(role)
        setUsername(user)
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', user);
    };

    const logout = () => {
        setToken('');
        setRole('');
        setUsername('');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
    };

    const getToken = () => {
        return token;
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, getToken, role, username }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
