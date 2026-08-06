import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../services/wishlistService';
import { addToCartAsync } from '../../cart/redux/cartSlice';

export const getWishlistAsync = createAsyncThunk(
    'wishlist/getWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const data = await wishlistService.getWishlist();
            return data.results || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch wishlist'
            );
        }
    }
);

export const addToWishlistAsync = createAsyncThunk(
    'wishlist/addToWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            const data = await wishlistService.addToWishlist(productId);
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to add item to wishlist'
            );
        }
    }
);

export const removeFromWishlistAsync = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            await wishlistService.removeFromWishlist(productId);
            return productId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to remove item from wishlist'
            );
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlistError: (state) => {
            state.error = null;
        },
        removeWishlistItemByProductId: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(
                (item) => item.product?.id !== productId && item.product !== productId
            );
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Wishlist
            .addCase(getWishlistAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
            })
            .addCase(getWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add to Wishlist
            .addCase(addToWishlistAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(addToWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                const newItem = action.payload;
                if (newItem && newItem.product) {
                    const exists = state.items.some(
                        (item) => item.product?.id === newItem.product.id
                    );
                    if (!exists) {
                        state.items.unshift(newItem);
                    }
                }
            })
            .addCase(addToWishlistAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove from Wishlist
            .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
                state.loading = false;
                const productId = action.payload;
                state.items = state.items.filter(
                    (item) => item.product?.id !== productId && item.product !== productId
                );
            })

            // Synchronize Wishlist when Cart Add succeeds
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                if (action.payload && action.payload.items) {
                    const cartProductIds = new Set(
                        action.payload.items
                            .map((cartItem) => {
                                const v = cartItem.variant;
                                return v?.product?.id || v?.product_id || cartItem.product_id;
                            })
                            .filter(Boolean)
                    );

                    state.items = state.items.filter((wishItem) => {
                        const wishProdId = wishItem.product?.id || wishItem.product;
                        return !cartProductIds.has(wishProdId);
                    });
                }
            });
    },
});

export const { clearWishlistError, removeWishlistItemByProductId } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist?.items || [];
export const selectWishlistLoading = (state) => state.wishlist?.loading || false;
export const selectWishlistError = (state) => state.wishlist?.error || null;

export default wishlistSlice.reducer;
