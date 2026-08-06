import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../services/cartService';

export const fetchCartAsync = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            return await cartService.getCart();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCart',
    async ({ variantId, quantity }, { rejectWithValue }) => {
        try {
            return await cartService.addToCart(variantId, quantity);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
        }
    }
);

export const updateCartItemAsync = createAsyncThunk(
    'cart/updateCartItem',
    async ({ itemId, quantity, action }, { rejectWithValue }) => {
        try {
            return await cartService.updateCartItem(itemId, quantity, action);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update item quantity');
        }
    }
);

export const removeCartItemAsync = createAsyncThunk(
    'cart/removeCartItem',
    async (itemId, { rejectWithValue }) => {
        try {
            return await cartService.removeCartItem(itemId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            return await cartService.clearCart();
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const initialState = {
    items: [],
    summary: {
        cart_total: 0,
        savings: 0,
        total_items: 0
    },
    loading: false,
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        const setPending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const setRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload;
        };
        const setFulfilled = (state, action) => {
            state.loading = false;
            state.items = action.payload.items || [];
            state.summary = {
                cart_total: action.payload.cart_total || 0,
                savings: action.payload.savings || 0,
                total_items: action.payload.total_items || 0
            };
        };

        builder
            .addCase(fetchCartAsync.pending, setPending)
            .addCase(fetchCartAsync.fulfilled, setFulfilled)
            .addCase(fetchCartAsync.rejected, setRejected)

            .addCase(addToCartAsync.pending, setPending)
            .addCase(addToCartAsync.fulfilled, setFulfilled)
            .addCase(addToCartAsync.rejected, setRejected)

            .addCase(updateCartItemAsync.pending, setPending)
            .addCase(updateCartItemAsync.fulfilled, setFulfilled)
            .addCase(updateCartItemAsync.rejected, setRejected)

            .addCase(removeCartItemAsync.pending, setPending)
            .addCase(removeCartItemAsync.fulfilled, setFulfilled)
            .addCase(removeCartItemAsync.rejected, setRejected)

            .addCase(clearCartAsync.pending, setPending)
            .addCase(clearCartAsync.fulfilled, setFulfilled)
            .addCase(clearCartAsync.rejected, setRejected);
    }
});

export const { clearCartError } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartSummary = (state) => state.cart.summary;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export default cartSlice.reducer;
