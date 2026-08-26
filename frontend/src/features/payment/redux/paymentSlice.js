import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    createPaymentOrder,
    verifyPayment,
    retryPayment,
    getPaymentDetails,
} from "../services/paymentService";
import { toast } from "react-toastify";

export const createPaymentOrderAsync = createAsyncThunk(
    "payment/createPaymentOrder",
    async (addressId, { rejectWithValue }) => {
        try {
            const data = await createPaymentOrder(addressId);
            return data.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.detail || "Failed to create payment order.";
            toast.error(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
            return rejectWithValue(msg);
        }
    }
);

export const verifyPaymentAsync = createAsyncThunk(
    "payment/verifyPayment",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await verifyPayment(payload);
            return data.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.detail || "Payment verification failed.";
            toast.error(typeof msg === "object" ? Object.values(msg).flat().join(" ") : msg);
            return rejectWithValue(msg);
        }
    }
);

export const retryPaymentAsync = createAsyncThunk(
    "payment/retryPayment",
    async (addressId, { rejectWithValue }) => {
        try {
            const data = await retryPayment(addressId);
            return data.data;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to retry payment.";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const fetchPaymentDetailsAsync = createAsyncThunk(
    "payment/fetchPaymentDetails",
    async (paymentId, { rejectWithValue }) => {
        try {
            const data = await getPaymentDetails(paymentId);
            return data.data;
        } catch (err) {
            return rejectWithValue("Failed to fetch payment details.");
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        paymentOrder: null,
        activePayment: null,
        paymentDetails: null,
        loading: false,
        verifying: false,
        error: null,
    },
    reducers: {
        clearPaymentState: (state) => {
            state.paymentOrder = null;
            state.activePayment = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createPaymentOrderAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentOrderAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentOrder = action.payload;
            })
            .addCase(createPaymentOrderAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Verify Payment
            .addCase(verifyPaymentAsync.pending, (state) => {
                state.verifying = true;
                state.error = null;
            })
            .addCase(verifyPaymentAsync.fulfilled, (state, action) => {
                state.verifying = false;
                state.activePayment = action.payload;
            })
            .addCase(verifyPaymentAsync.rejected, (state, action) => {
                state.verifying = false;
                state.error = action.payload;
            })
            // Fetch Details
            .addCase(fetchPaymentDetailsAsync.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPaymentDetailsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentDetails = action.payload;
            })
            .addCase(fetchPaymentDetailsAsync.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
