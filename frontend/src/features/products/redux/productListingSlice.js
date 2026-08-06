import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProductsList, fetchProductCategories } from '../services/productListingService';

export const fetchProductsListAsync = createAsyncThunk(
    'productListing/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const data = await fetchProductsList(params);
            return data; // contains results, count, page, page_size, total_pages
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch products'
            );
        }
    }
);

export const fetchCategoriesAsync = createAsyncThunk(
    'productListing/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const data = await fetchProductCategories();
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch categories'
            );
        }
    }
);

const initialState = {
    products: [],
    categories: [],
    count: 0,
    totalPages: 1,
    next: null,
    previous: null,
    loading: false,
    categoriesLoading: false,
    error: null,
    
    // Global filter parameters synced with URL
    filters: {
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
    },
    search: '',
    sort: 'newest',
    page: 1,
};

const productListingSlice = createSlice({
    name: 'productListing',
    initialState,
    reducers: {
        setSearch: (state, action) => {
            state.search = action.payload;
            state.page = 1; // Reset to page 1
        },
        setSort: (state, action) => {
            state.sort = action.payload;
            state.page = 1;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            state.page = 1;
        },
        clearFilters: (state) => {
            state.filters = {
                category: '',
                minPrice: '',
                maxPrice: '',
                brand: '',
            };
            state.page = 1;
        },
        syncParamsFromUrl: (state, action) => {
            const { search, sort, page, category, minPrice, maxPrice, brand } = action.payload;
            if (search !== undefined) state.search = search;
            if (sort !== undefined) state.sort = sort;
            if (page !== undefined) state.page = Number(page) || 1;
            if (category !== undefined) state.filters.category = category;
            if (minPrice !== undefined) state.filters.minPrice = minPrice;
            if (maxPrice !== undefined) state.filters.maxPrice = maxPrice;
            if (brand !== undefined) state.filters.brand = brand;
        },
        clearListingError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProductsListAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsListAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.totalPages = action.payload.total_pages || 1;
                state.page = action.payload.current_page || 1;
                state.next = action.payload.next || null;
                state.previous = action.payload.previous || null;
            })
            .addCase(fetchProductsListAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Categories
            .addCase(fetchCategoriesAsync.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchCategoriesAsync.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categories = action.payload?.results || (Array.isArray(action.payload) ? action.payload : []);
            })
            .addCase(fetchCategoriesAsync.rejected, (state) => {
                state.categoriesLoading = false;
            });
    },
});

export const {
    setSearch,
    setSort,
    setPage,
    setFilter,
    clearFilters,
    syncParamsFromUrl,
    clearListingError,
} = productListingSlice.actions;

// Selectors
export const selectProducts = (state) => state.productListing.products;
export const selectCategories = (state) => state.productListing.categories;
export const selectProductsCount = (state) => state.productListing.count;
export const selectTotalPages = (state) => state.productListing.totalPages;
export const selectProductsLoading = (state) => state.productListing.loading;
export const selectCategoriesLoading = (state) => state.productListing.categoriesLoading;
export const selectProductsError = (state) => state.productListing.error;
export const selectSearchQuery = (state) => state.productListing.search;
export const selectSortOption = (state) => state.productListing.sort;
export const selectCurrentPage = (state) => state.productListing.page;
export const selectActiveFilters = (state) => state.productListing.filters;

export default productListingSlice.reducer;
