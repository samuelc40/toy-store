import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsers, toggleBlockUser, deleteUser } from './adminUserService';

const initialState = {
    users: [],
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
    search: '',
    loading: false,
    error: null,
};

export const getUsersAsync = createAsyncThunk(
    'adminUsers/getUsers',
    async ({ page, page_size, search }, { rejectWithValue }) => {
        try {
            const data = await fetchUsers({ page, page_size, search });
            return data.data; // The API returns { success: true, data: { results: [], count: 250, ... } }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch users');
        }
    }
);

export const toggleBlockUserAsync = createAsyncThunk(
    'adminUsers/toggleBlockUser',
    async (uuid, { rejectWithValue }) => {
        try {
            const data = await toggleBlockUser(uuid);
            return data.data; // The API returns updated user object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || 'Failed to update user status');
        }
    }
);

export const deleteUserAsync = createAsyncThunk(
    'adminUsers/deleteUser',
    async (uuid, { rejectWithValue }) => {
        try {
            const data = await deleteUser(uuid);
            return { uuid, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || 'Failed to delete user');
        }
    }
);

const adminUsersSlice = createSlice({
    name: 'adminUsers',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
            state.page = 1; // reset page to 1 on search change
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.page_size = action.payload;
            state.page = 1;
        },
        clearSearchState: (state) => {
            state.search = '';
            state.page = 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // getUsersAsync
            .addCase(getUsersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.results;
                state.count = action.payload.count;
                state.page = action.payload.page;
                state.page_size = action.payload.page_size;
                state.total_pages = action.payload.total_pages;
            })
            .addCase(getUsersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // toggleBlockUserAsync
            .addCase(toggleBlockUserAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(toggleBlockUserAsync.fulfilled, (state, action) => {
                const updatedUser = action.payload;
                state.users = state.users.map(u => u.id === updatedUser.id ? updatedUser : u);
            })
            .addCase(toggleBlockUserAsync.rejected, (state, action) => {
                state.error = action.payload;
            })
            // deleteUserAsync
            .addCase(deleteUserAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteUserAsync.fulfilled, (state, action) => {
                const { uuid } = action.payload;
                state.users = state.users.filter(u => u.id !== uuid);
                state.count = Math.max(0, state.count - 1);
                state.total_pages = Math.ceil(state.count / state.page_size) || 1;
            })
            .addCase(deleteUserAsync.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { setSearch, setPage, setPageSize, clearSearchState } = adminUsersSlice.actions;

export const selectAdminUsers = (state) => state.adminUsers.users;
export const selectAdminUsersCount = (state) => state.adminUsers.count;
export const selectAdminUsersPage = (state) => state.adminUsers.page;
export const selectAdminUsersPageSize = (state) => state.adminUsers.page_size;
export const selectAdminUsersTotalPages = (state) => state.adminUsers.total_pages;
export const selectAdminUsersSearch = (state) => state.adminUsers.search;
export const selectAdminUsersLoading = (state) => state.adminUsers.loading;
export const selectAdminUsersError = (state) => state.adminUsers.error;

export default adminUsersSlice.reducer;
