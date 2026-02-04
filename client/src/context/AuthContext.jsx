import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/user');
                    setUser(res.data);
                } catch (err) {
                    console.error('Auth Error', err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (rollNumberObj, password) => {
        // Support either object { rollNumber: ... } or string if changed
        const res = await api.post('/auth/login', { rollNumber: rollNumberObj.rollNumber, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (name, email, password, role, rollNumber, secretKey) => {
        const res = await api.post('/auth/register', { name, email, password, role, rollNumber, secretKey });
        // Maybe auto-login or just return
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
