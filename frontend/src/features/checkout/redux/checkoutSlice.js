import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getCheckoutSummary,
    placeOrder,
    getOrderDetails,
} from "../services/checkoutService";

export const fetchCheckoutDataAsync = createAsyncThunk(
    "checkout/fetchCheckoutData",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getCheckoutSummary();
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load checkout details.";
            return rejectWithValue(message);
        }
    }
);

export const placeOrderAsync = createAsyncThunk(
    "checkout/placeOrder",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await placeOrder(payload);
            return response;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.response?.data?.cart ||
                error.response?.data?.address_id ||
                error.response?.data?.stock ||
                "Failed to place order.";
            return rejectWithValue(message);
        }
    }
);

export const fetchOrderDetailsAsync = createAsyncThunk(
    "checkout/fetchOrderDetails",
    async (orderId, { rejectWithValue }) => {
        try {
            const data = await getOrderDetails(orderId);
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load order details.";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    checkoutData: null,
    selectedAddressId: null,
    placingOrder: false,
    currentOrder: null,
    loading: false,
    error: null,
};

const checkoutSlice = createSlice({
    name: "checkout",
    initialState,
    reducers: {
        setSelectedAddressId: (state, action) => {
            state.selectedAddressId = action.payload;
        },
        clearCheckoutState: (state) => {
            state.checkoutData = null;
            state.selectedAddressId = null;
            state.placingOrder = false;
            state.currentOrder = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Checkout Data
            .addCase(fetchCheckoutDataAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCheckoutDataAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.checkoutData = action.payload;
                if (action.payload?.selected_address_id) {
                    state.selectedAddressId = action.payload.selected_address_id;
                } else if (action.payload?.addresses?.length > 0) {
                    state.selectedAddressId = action.payload.addresses[0].id;
                }
            })
            .addCase(fetchCheckoutDataAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Place Order
            .addCase(placeOrderAsync.pending, (state) => {
                state.placingOrder = true;
                state.error = null;
            })
            .addCase(placeOrderAsync.fulfilled, (state, action) => {
                state.placingOrder = false;
                state.currentOrder = action.payload?.order || null;
            })
            .addCase(placeOrderAsync.rejected, (state, action) => {
                state.placingOrder = false;
                state.error = action.payload;
            })

            // Fetch Order Details
            .addCase(fetchOrderDetailsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetailsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetailsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedAddressId, clearCheckoutState } = checkoutSlice.actions;

export const selectCheckoutData = (state) => state.checkout.checkoutData;
export const selectSelectedAddressId = (state) => state.checkout.selectedAddressId;
export const selectPlacingOrder = (state) => state.checkout.placingOrder;
export const selectCurrentOrder = (state) => state.checkout.currentOrder;
export const selectCheckoutLoading = (state) => state.checkout.loading;
export const selectCheckoutError = (state) => state.checkout.error;

export default checkoutSlice.reducer;
