import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getOrders,
    getOrderDetails,
    cancelOrder,
    cancelOrderItem,
    requestReturn,
} from "../services/orderService";

export const fetchOrdersAsync = createAsyncThunk(
    "orders/fetchOrders",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getOrders(params);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load orders.";
            return rejectWithValue(message);
        }
    }
);

export const fetchOrderDetailAsync = createAsyncThunk(
    "orders/fetchOrderDetail",
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

export const cancelOrderAsync = createAsyncThunk(
    "orders/cancelOrder",
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            const data = await cancelOrder(orderId, reason);
            return data.data;
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to cancel order.";
            return rejectWithValue(message);
        }
    }
);

export const cancelOrderItemAsync = createAsyncThunk(
    "orders/cancelOrderItem",
    async ({ itemId, reason }, { rejectWithValue }) => {
        try {
            const data = await cancelOrderItem(itemId, reason);
            return data.data;
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to cancel order item.";
            return rejectWithValue(message);
        }
    }
);

export const requestReturnAsync = createAsyncThunk(
    "orders/requestReturn",
    async ({ orderId, reason, description }, { rejectWithValue }) => {
        try {
            const data = await requestReturn(orderId, { reason, description });
            return data;
        } catch (error) {
            const message =
                error.response?.data?.reason ||
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Failed to submit return request.";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    orders: [],
    count: 0,
    totalPages: 1,
    currentPage: 1,
    activeStatusFilter: "ALL",
    searchQuery: "",
    activeOrder: null,
    loading: false,
    detailLoading: false,
    actionLoading: false,
    error: null,
};

const ordersSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        setActiveStatusFilter: (state, action) => {
            state.activeStatusFilter = action.payload;
            state.currentPage = 1;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        clearActiveOrder: (state) => {
            state.activeOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders List
            .addCase(fetchOrdersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrdersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.totalPages = action.payload.total_pages || 1;
                state.currentPage = action.payload.current_page || 1;
            })
            .addCase(fetchOrdersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Order Detail
            .addCase(fetchOrderDetailAsync.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetailAsync.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.activeOrder = action.payload;
            })
            .addCase(fetchOrderDetailAsync.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload;
            })

            // Cancel Entire Order
            .addCase(cancelOrderAsync.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(cancelOrderAsync.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.activeOrder = action.payload;
                // Update in orders list
                const index = state.orders.findIndex((o) => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(cancelOrderAsync.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Cancel Order Item
            .addCase(cancelOrderItemAsync.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(cancelOrderItemAsync.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.activeOrder = action.payload;
                const index = state.orders.findIndex((o) => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
            })
            .addCase(cancelOrderItemAsync.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            })

            // Request Return
            .addCase(requestReturnAsync.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(requestReturnAsync.fulfilled, (state) => {
                state.actionLoading = false;
            })
            .addCase(requestReturnAsync.rejected, (state, action) => {
                state.actionLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setActiveStatusFilter,
    setSearchQuery,
    setCurrentPage,
    clearActiveOrder,
} = ordersSlice.actions;

export const selectOrders = (state) => state.orders.orders;
export const selectOrdersCount = (state) => state.orders.count;
export const selectOrdersTotalPages = (state) => state.orders.totalPages;
export const selectOrdersCurrentPage = (state) => state.orders.currentPage;
export const selectActiveStatusFilter = (state) => state.orders.activeStatusFilter;
export const selectSearchQuery = (state) => state.orders.searchQuery;
export const selectActiveOrder = (state) => state.orders.activeOrder;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrderDetailLoading = (state) => state.orders.detailLoading;
export const selectOrdersActionLoading = (state) => state.orders.actionLoading;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer;
