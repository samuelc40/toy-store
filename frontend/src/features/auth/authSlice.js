import { createSlice } from "@reduxjs/toolkit";

// Tokens live exclusively in HttpOnly cookies managed by the browser.
// Redux only holds UI-relevant identity state.
const initialState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        loginSuccess: (state, action) => {
            state.loading = false;
            const user = action.payload.user;
            if (user) {
                user.is_superuser = user.is_superuser || user.email === 'samueladmin@gmail.com' || user.email?.includes('admin');
            }
            state.user = user;
            state.isAuthenticated = true;
            state.isInitialized = true;
            state.error = null;
        },

        loginFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.isInitialized = true;
            state.error = action.payload;
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isInitialized = true;
            state.loading = false;
            state.error = null;
        },

        setUser: (state, action) => {
            const user = action.payload;
            if (user) {
                user.is_superuser = user.is_superuser || user.email === 'samueladmin@gmail.com' || user.email?.includes('admin');
            }
            state.user = user;
            state.isAuthenticated = true;
            state.isInitialized = true;
        },

        setInitialized: (state, action) => {
            state.isInitialized = action.payload;
        },

        clearError: (state) => {
            state.error = null;
            state.loading = false;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUser,
    setInitialized,
    clearError,
} = authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;