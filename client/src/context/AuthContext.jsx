import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();

        // Idle Timeout Logic (5 minutes)
        let timeout;
        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            if (sessionStorage.getItem('token')) {
                timeout = setTimeout(logout, 5 * 60 * 1000); // 5 minutes
            }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer(); // Initialize

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, []);

    const checkAuth = async () => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
            } catch (error) {
                sessionStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = (token, userData) => {
        sessionStorage.setItem('token', token);
        setUser(userData);
    };

    const register = (token, userData) => {
        sessionStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login'; // Force redirect
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager',
        isPromoter: user?.role === 'promoter',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
