import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectIsAuthenticated, selectIsInitialized } from '../features/auth/authSlice';

// ---------------------------------------------------------------------------
// PrivateRoute — protects routes that require authentication.
//
// Auth source of truth: Redux state hydrated from /auth/me/ on app startup.
// Tokens are never read from localStorage or JS-accessible storage.
// ---------------------------------------------------------------------------
function RestricedRoute() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isInitialized = useSelector(selectIsInitialized);

    // Still bootstrapping (App.jsx is calling /auth/me/) — don't redirect yet
    if (!isInitialized) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
            }}>
                <div style={{
                    width: 36,
                    height: 36,
                    border: '3px solid #e6e4eb',
                    borderTop: '3px solid #8c52ff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default RestricedRoute;
