import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = {
            admin: '/admin',
            manager: '/manager',
            promoter: '/promoter',
        };
        return <Navigate to={redirectPath[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
