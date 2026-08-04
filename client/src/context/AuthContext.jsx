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
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        const originalAdminToken = sessionStorage.getItem('admin_original_token');
        if (originalAdminToken) {
            setIsImpersonating(true);
        }
        checkAuth();

        // Idle Timeout Logic (15 minutes)
        let timeout;
        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            if (sessionStorage.getItem('token')) {
                timeout = setTimeout(logout, 15 * 60 * 1000);
            }
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer();

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
                sessionStorage.removeItem('admin_original_token');
                setIsImpersonating(false);
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

    // Super Admin Impersonation: Log in as a Manager
    const startImpersonation = (targetToken, targetUser) => {
        const currentAdminToken = sessionStorage.getItem('token');
        sessionStorage.setItem('admin_original_token', currentAdminToken);
        sessionStorage.setItem('token', targetToken);
        setUser(targetUser);
        setIsImpersonating(true);
    };

    // Exit Impersonation and return to Super Admin
    const stopImpersonation = async () => {
        const originalAdminToken = sessionStorage.getItem('admin_original_token');
        if (originalAdminToken) {
            sessionStorage.setItem('token', originalAdminToken);
            sessionStorage.removeItem('admin_original_token');
            setIsImpersonating(false);
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
                window.location.href = '/admin/managers';
            } catch (err) {
                logout();
            }
        } else {
            logout();
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('admin_original_token');
        setIsImpersonating(false);
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isImpersonating,
        startImpersonation,
        stopImpersonation,
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
