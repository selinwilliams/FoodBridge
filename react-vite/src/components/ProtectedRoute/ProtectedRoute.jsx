import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, userType }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const sessionUser = useSelector(state => state.session.user);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Check authentication and authorization
        const checkAuth = () => {
            if (!sessionUser) {
                setAuthorized(false);
                setIsLoading(false);
                return;
            }

            // If no specific role is required, user just needs to be logged in
            if (!userType) {
                setAuthorized(true);
                setIsLoading(false);
                return;
            }

            // Check if user has the required role
            const userRole = sessionUser.user_type?.toLowerCase();
            setAuthorized(userRole === userType.toLowerCase());
            setIsLoading(false);
        };

        checkAuth();
    }, [sessionUser, userType]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!sessionUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If not authorized but authenticated, redirect to appropriate dashboard
    if (!authorized && sessionUser) {
        const userRole = sessionUser.user_type?.toLowerCase();
        if (userRole) {
            return <Navigate to={`/dashboard/${userRole}`} replace />;
        }
        // If no role is found, redirect to home
        return <Navigate to="/" replace />;
    }

    // If authorized, render the protected content
    return children;
};

export default ProtectedRoute; 