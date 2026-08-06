import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from './adminCategoryService';

const initialState = {
    categories: [],
    count: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
    search: '',
    loading: false,
    error: null,
};

export const getCategoriesAsync = createAsyncThunk(
    'adminCategories/getCategories',
    async ({ page, page_size, search, sort }, { rejectWithValue }) => {
        try {
            const data = await fetchCategories({ page, page_size, search, sort });
            return data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || 'Failed to fetch categories');
        }
    }
);

export const createCategoryAsync = createAsyncThunk(
    'adminCategories/createCategory',
    async (formData, { rejectWithValue }) => {
        try {
            const data = await createCategory(formData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            return rejectWithValue(errorData || 'Failed to create category');
        }
    }
);

export const updateCategoryAsync = createAsyncThunk(
    'adminCategories/updateCategory',
    async ({ uuid, formData }, { rejectWithValue }) => {
        try {
            const data = await updateCategory(uuid, formData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            return rejectWithValue(errorData || 'Failed to update category');
        }
    }
);

export const deleteCategoryAsync = createAsyncThunk(
    'adminCategories/deleteCategory',
    async (uuid, { rejectWithValue }) => {
        try {
            const data = await deleteCategory(uuid);
            return { uuid, ...data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.response?.data?.detail || 'Failed to delete category');
        }
    }
);

const adminCategoriesSlice = createSlice({
    name: 'adminCategories',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
            state.page = 1;
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
            // getCategoriesAsync
            .addCase(getCategoriesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategoriesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.results;
                state.count = action.payload.count;
                state.page = action.payload.page;
                state.page_size = action.payload.page_size;
                state.total_pages = action.payload.total_pages;
            })
            .addCase(getCategoriesAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // createCategoryAsync
            .addCase(createCategoryAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategoryAsync.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createCategoryAsync.rejected, (state, action) => {
                state.loading = false;
            })
            // updateCategoryAsync
            .addCase(updateCategoryAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategoryAsync.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload;
                state.categories = state.categories.map(c => c.id === updated.id ? updated : c);
            })
            .addCase(updateCategoryAsync.rejected, (state, action) => {
                state.loading = false;
            })
            // deleteCategoryAsync
            .addCase(deleteCategoryAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
                const { uuid } = action.payload;
                state.categories = state.categories.filter(c => c.id !== uuid);
                state.count = Math.max(0, state.count - 1);
                state.total_pages = Math.ceil(state.count / state.page_size) || 1;
            })
            .addCase(deleteCategoryAsync.rejected, (state, action) => {
                // Handled locally by unwrap() in component
            });
    }
});

export const { setSearch, setPage, setPageSize, clearSearchState } = adminCategoriesSlice.actions;

export const selectAdminCategories = (state) => state.adminCategories.categories;
export const selectAdminCategoriesCount = (state) => state.adminCategories.count;
export const selectAdminCategoriesPage = (state) => state.adminCategories.page;
export const selectAdminCategoriesPageSize = (state) => state.adminCategories.page_size;
export const selectAdminCategoriesTotalPages = (state) => state.adminCategories.total_pages;
export const selectAdminCategoriesSearch = (state) => state.adminCategories.search;
export const selectAdminCategoriesLoading = (state) => state.adminCategories.loading;
export const selectAdminCategoriesError = (state) => state.adminCategories.error;

export default adminCategoriesSlice.reducer;
