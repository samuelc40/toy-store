import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { loginSuccess, logout, selectIsInitialized } from './features/auth/authSlice';
import { getMe } from './features/auth/services/authService';
import ToyCarScrollIndicator from './components/common/ToyCarScrollIndicator';

function App() {
    const dispatch = useDispatch();
    const isInitialized = useSelector(selectIsInitialized);

    useEffect(() => {
        // On every app load, check if a valid HttpOnly access cookie exists.
        // This keeps the user logged in across hard refreshes without touching localStorage.
        const bootstrapAuth = async () => {
            try {
                const user = await getMe();
                dispatch(loginSuccess({ user: user.data }));
            } catch {
                // 401 = no valid cookie; treat as logged out (silent, no error toast)
                dispatch(logout());
            }
        };

        bootstrapAuth();
    }, [dispatch]);

    // Prevent a flash of the login page for already-authenticated users
    if (!isInitialized) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100svh',
                background: 'var(--bg)',
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid var(--border)',
                    borderTop: '3px solid var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            <AppRoutes />
            <ToyCarScrollIndicator />
        </>
    );
}

export default App;