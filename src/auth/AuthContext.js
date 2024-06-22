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

    const login = (newToken, role) => {
        setToken(newToken);
        setRole(role)
        localStorage.setItem('token', newToken);
        localStorage.setItem('userRole', role);
    };

    const logout = () => {
        setToken('');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    };

    const getToken = () => {
        return token;
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, getToken, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
