import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/spinner';

const ProtectedRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#ffffff' }}>
                <Spinner size={24} />
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
