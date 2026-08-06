import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleBlockProduct,
} from '../services/productService';

const initialState = {
    products: [],
    selectedProduct: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    blocking: false,
    pagination: {
        page: 1,
        page_size: 10,
        total_pages: 1,
        count: 0,
    },
    search: '',
    error: null,
};

export const getProductsAsync = createAsyncThunk(
    'products/getProducts',
    async ({ page, page_size, search }, { rejectWithValue }) => {
        try {
            const data = await fetchProducts({ page, page_size, search });
            // API response: { success: true, message: "...", data: { results, count, page, page_size, total_pages } }
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to fetch products'
            );
        }
    }
);

export const createProductAsync = createAsyncThunk(
    'products/createProduct',
    async (productData, { rejectWithValue }) => {
        try {
            const data = await createProduct(productData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                // If there's field-level validation errors (e.g. name: ["error"])
                return rejectWithValue(errorData);
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create product'
            );
        }
    }
);

export const updateProductAsync = createAsyncThunk(
    'products/updateProduct',
    async ({ id, productData }, { rejectWithValue }) => {
        try {
            const data = await updateProduct(id, productData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                return rejectWithValue(errorData);
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update product'
            );
        }
    }
);

export const deleteProductAsync = createAsyncThunk(
    'products/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await deleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to delete product'
            );
        }
    }
);

export const toggleBlockProductAsync = createAsyncThunk(
    'products/toggleBlockProduct',
    async (id, { rejectWithValue }) => {
        try {
            const data = await toggleBlockProduct(id);
            return data.data; // { id: "...", blocked: true/false }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to toggle block status'
            );
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
            state.pagination.page = 1;
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        setPageSize: (state, action) => {
            state.pagination.page_size = action.payload;
            state.pagination.page = 1;
        },
        clearSearchState: (state) => {
            state.search = '';
            state.pagination.page = 1;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // getProductsAsync
            .addCase(getProductsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.results;
                state.pagination.count = action.payload.count;
                state.pagination.page = action.payload.page;
                state.pagination.page_size = action.payload.page_size;
                state.pagination.total_pages = action.payload.total_pages;
            })
            .addCase(getProductsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // createProductAsync
            .addCase(createProductAsync.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createProductAsync.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createProductAsync.rejected, (state, action) => {
                state.creating = false;
                state.error = typeof action.payload === 'string' ? action.payload : 'Failed to create product';
            })

            // updateProductAsync
            .addCase(updateProductAsync.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateProductAsync.fulfilled, (state, action) => {
                state.updating = false;
                const updated = action.payload;
                state.products = state.products.map((p) => (p.id === updated.id ? updated : p));
                if (state.selectedProduct?.id === updated.id) {
                    state.selectedProduct = updated;
                }
            })
            .addCase(updateProductAsync.rejected, (state, action) => {
                state.updating = false;
                state.error = typeof action.payload === 'string' ? action.payload : 'Failed to update product';
            })

            // deleteProductAsync
            .addCase(deleteProductAsync.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteProductAsync.fulfilled, (state, action) => {
                state.deleting = false;
                const id = action.payload;
                // Soft deleted items on backend might either stay with is_active = false or disappear.
                // We'll update the item is_active to false in our list, or filter it out.
                // The requirements say: "Refresh list automatically" and "soft delete".
                // Since pagination counts and page sets might shift, we'll let the component refresh the list from API,
                // but let's also update state locally for smooth immediate feedback.
                state.products = state.products.map((p) =>
                    p.id === id ? { ...p, is_active: false } : p
                );
            })
            .addCase(deleteProductAsync.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload;
            })

            // toggleBlockProductAsync
            .addCase(toggleBlockProductAsync.pending, (state) => {
                state.blocking = true;
                state.error = null;
            })
            .addCase(toggleBlockProductAsync.fulfilled, (state, action) => {
                state.blocking = false;
                const { id, blocked } = action.payload;
                state.products = state.products.map((p) =>
                    p.id === id ? { ...p, blocked } : p
                );
            })
            .addCase(toggleBlockProductAsync.rejected, (state, action) => {
                state.blocking = false;
                state.error = action.payload;
            });
    },
});

export const {
    setSearch,
    setPage,
    setPageSize,
    clearSearchState,
    setSelectedProduct,
    clearError,
} = productSlice.actions;

export const selectProducts = (state) => state.products.products;
export const selectSelectedProduct = (state) => state.products.selectedProduct;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsCreating = (state) => state.products.creating;
export const selectProductsUpdating = (state) => state.products.updating;
export const selectProductsDeleting = (state) => state.products.deleting;
export const selectProductsBlocking = (state) => state.products.blocking;
export const selectProductsPagination = (state) => state.products.pagination;
export const selectProductsSearch = (state) => state.products.search;
export const selectProductsError = (state) => state.products.error;

export default productSlice.reducer;
