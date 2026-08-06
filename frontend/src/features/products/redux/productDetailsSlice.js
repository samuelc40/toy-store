import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProductDetails } from '../services/productDetailsService';

export const fetchProductDetailsAsync = createAsyncThunk(
    'productDetails/fetchProductDetails',
    async (productId, { rejectWithValue }) => {
        try {
            const data = await fetchProductDetails(productId);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.status || 'Failed to fetch product details'
            );
        }
    }
);

const initialState = {
    product: null,
    loading: false,
    error: null,
};

const productDetailsSlice = createSlice({
    name: 'productDetails',
    initialState,
    reducers: {
        clearProductDetails: (state) => {
            state.product = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductDetailsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductDetailsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload;
            })
            .addCase(fetchProductDetailsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearProductDetails } = productDetailsSlice.actions;

export const selectProductDetail = (state) => state.productDetails.product;
export const selectProductDetailLoading = (state) => state.productDetails.loading;
export const selectProductDetailError = (state) => state.productDetails.error;

export default productDetailsSlice.reducer;
