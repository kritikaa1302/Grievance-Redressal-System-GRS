import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'student' or 'admin'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const storedRole = localStorage.getItem('role');
            const storedUser = JSON.parse(localStorage.getItem('user'));
            
            if (token && storedRole && storedUser) {
                setUser(storedUser);
                setRole(storedRole);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = (token, userData, userRole) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', userRole);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setRole(userRole);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
