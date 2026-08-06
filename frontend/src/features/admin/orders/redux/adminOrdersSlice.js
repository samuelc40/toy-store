import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getAdminOrders,
    getAdminOrderDetails,
    updateAdminOrderStatus,
} from "../services/adminOrderService";

export const fetchAdminOrdersAsync = createAsyncThunk(
    "adminOrders/fetchOrders",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getAdminOrders(params);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load admin orders.";
            return rejectWithValue(message);
        }
    }
);

export const fetchAdminOrderDetailAsync = createAsyncThunk(
    "adminOrders/fetchOrderDetail",
    async (orderId, { rejectWithValue }) => {
        try {
            const data = await getAdminOrderDetails(orderId);
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load order details.";
            return rejectWithValue(message);
        }
    }
);

export const updateAdminOrderStatusAsync = createAsyncThunk(
    "adminOrders/updateOrderStatus",
    async ({ orderId, orderStatus }, { rejectWithValue }) => {
        try {
            const data = await updateAdminOrderStatus(orderId, orderStatus);
            return data;
        } catch (error) {
            const message =
                error.response?.data?.order_status ||
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Failed to update order status.";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    orders: [],
    count: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    searchQuery: "",
    sortOption: "newest",
    orderStatusFilter: "ALL",
    paymentMethodFilter: "ALL",
    paymentStatusFilter: "ALL",
    dateRangeFilter: "ALL",
    startDate: "",
    endDate: "",
    activeOrder: null,
    loading: false,
    detailLoading: false,
    updateLoading: false,
    error: null,
};

const adminOrdersSlice = createSlice({
    name: "adminOrders",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setSortOption: (state, action) => {
            state.sortOption = action.payload;
            state.currentPage = 1;
        },
        setOrderStatusFilter: (state, action) => {
            state.orderStatusFilter = action.payload;
            state.currentPage = 1;
        },
        setPaymentMethodFilter: (state, action) => {
            state.paymentMethodFilter = action.payload;
            state.currentPage = 1;
        },
        setPaymentStatusFilter: (state, action) => {
            state.paymentStatusFilter = action.payload;
            state.currentPage = 1;
        },
        setDateRangeFilter: (state, action) => {
            state.dateRangeFilter = action.payload;
            state.currentPage = 1;
        },
        setCustomDateRange: (state, action) => {
            state.startDate = action.payload.startDate;
            state.endDate = action.payload.endDate;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.currentPage = 1;
        },
        resetFilters: (state) => {
            state.searchQuery = "";
            state.sortOption = "newest";
            state.orderStatusFilter = "ALL";
            state.paymentMethodFilter = "ALL";
            state.paymentStatusFilter = "ALL";
            state.dateRangeFilter = "ALL";
            state.startDate = "";
            state.endDate = "";
            state.currentPage = 1;
        },
        clearActiveOrder: (state) => {
            state.activeOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Orders List
            .addCase(fetchAdminOrdersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrdersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.totalPages = action.payload.total_pages || 1;
                state.currentPage = action.payload.current_page || 1;
            })
            .addCase(fetchAdminOrdersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Order Detail
            .addCase(fetchAdminOrderDetailAsync.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminOrderDetailAsync.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.activeOrder = action.payload;
            })
            .addCase(fetchAdminOrderDetailAsync.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateAdminOrderStatusAsync.pending, (state) => {
                state.updateLoading = true;
            })
            .addCase(updateAdminOrderStatusAsync.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.activeOrder = action.payload.data;
                const index = state.orders.findIndex((o) => o.id === action.payload.data.id);
                if (index !== -1) {
                    state.orders[index] = action.payload.data;
                }
            })
            .addCase(updateAdminOrderStatusAsync.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    setSearchQuery,
    setSortOption,
    setOrderStatusFilter,
    setPaymentMethodFilter,
    setPaymentStatusFilter,
    setDateRangeFilter,
    setCustomDateRange,
    setCurrentPage,
    setPageSize,
    resetFilters,
    clearActiveOrder,
} = adminOrdersSlice.actions;

export const selectAdminOrders = (state) => state.adminOrders.orders;
export const selectAdminOrdersCount = (state) => state.adminOrders.count;
export const selectAdminOrdersTotalPages = (state) => state.adminOrders.totalPages;
export const selectAdminOrdersCurrentPage = (state) => state.adminOrders.currentPage;
export const selectAdminPageSize = (state) => state.adminOrders.pageSize;
export const selectAdminSearchQuery = (state) => state.adminOrders.searchQuery;
export const selectAdminSortOption = (state) => state.adminOrders.sortOption;
export const selectAdminOrderStatusFilter = (state) => state.adminOrders.orderStatusFilter;
export const selectAdminPaymentMethodFilter = (state) => state.adminOrders.paymentMethodFilter;
export const selectAdminPaymentStatusFilter = (state) => state.adminOrders.paymentStatusFilter;
export const selectAdminDateRangeFilter = (state) => state.adminOrders.dateRangeFilter;
export const selectAdminStartDate = (state) => state.adminOrders.startDate;
export const selectAdminEndDate = (state) => state.adminOrders.endDate;
export const selectAdminActiveOrder = (state) => state.adminOrders.activeOrder;
export const selectAdminOrdersLoading = (state) => state.adminOrders.loading;
export const selectAdminOrderDetailLoading = (state) => state.adminOrders.detailLoading;
export const selectAdminOrdersUpdateLoading = (state) => state.adminOrders.updateLoading;
export const selectAdminOrdersError = (state) => state.adminOrders.error;

export default adminOrdersSlice.reducer;
