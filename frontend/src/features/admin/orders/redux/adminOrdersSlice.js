import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getAdminOrders,
    getAdminOrderDetails,
    updateAdminOrderStatus,
    getAdminReturnRequests,
    getAdminReturnDetail,
    approveReturnRequest,
    rejectReturnRequest,
    getAdminCancellationRequests,
    getAdminCancellationDetail,
    approveCancellationRequest,
    rejectCancellationRequest,
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

export const fetchAdminReturnsAsync = createAsyncThunk(
    "adminOrders/fetchReturns",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getAdminReturnRequests(params);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load return requests.";
            return rejectWithValue(message);
        }
    }
);

export const approveAdminReturnAsync = createAsyncThunk(
    "adminOrders/approveReturn",
    async ({ returnId, admin_remark }, { rejectWithValue }) => {
        try {
            const data = await approveReturnRequest(returnId, { admin_remark });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.status || "Failed to approve return.";
            return rejectWithValue(message);
        }
    }
);

export const rejectAdminReturnAsync = createAsyncThunk(
    "adminOrders/rejectReturn",
    async ({ returnId, admin_remark }, { rejectWithValue }) => {
        try {
            const data = await rejectReturnRequest(returnId, { admin_remark });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.status || "Failed to reject return.";
            return rejectWithValue(message);
        }
    }
);

export const fetchAdminCancellationsAsync = createAsyncThunk(
    "adminOrders/fetchCancellations",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getAdminCancellationRequests(params);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to load cancellation requests.";
            return rejectWithValue(message);
        }
    }
);

export const approveAdminCancellationAsync = createAsyncThunk(
    "adminOrders/approveCancellation",
    async ({ cancellationId, admin_remark }, { rejectWithValue }) => {
        try {
            const data = await approveCancellationRequest(cancellationId, { admin_remark });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.status || "Failed to approve cancellation.";
            return rejectWithValue(message);
        }
    }
);

export const rejectAdminCancellationAsync = createAsyncThunk(
    "adminOrders/rejectCancellation",
    async ({ cancellationId, admin_remark }, { rejectWithValue }) => {
        try {
            const data = await rejectCancellationRequest(cancellationId, { admin_remark });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.status || "Failed to reject cancellation.";
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

    // Return Requests state
    returns: [],
    returnsCount: 0,
    returnsTotalPages: 1,
    returnsCurrentPage: 1,
    returnsSearchQuery: "",
    returnsStatusFilter: "ALL",
    returnsLoading: false,
    processReturnLoading: false,

    // Cancellation Requests state
    cancellations: [],
    cancellationsCount: 0,
    cancellationsTotalPages: 1,
    cancellationsCurrentPage: 1,
    cancellationsSearchQuery: "",
    cancellationsStatusFilter: "ALL",
    cancellationsLoading: false,
    processCancellationLoading: false,

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

        // Returns reducers
        setReturnsSearchQuery: (state, action) => {
            state.returnsSearchQuery = action.payload;
            state.returnsCurrentPage = 1;
        },
        setReturnsStatusFilter: (state, action) => {
            state.returnsStatusFilter = action.payload;
            state.returnsCurrentPage = 1;
        },
        setReturnsCurrentPage: (state, action) => {
            state.returnsCurrentPage = action.payload;
        },

        // Cancellations reducers
        setCancellationsSearchQuery: (state, action) => {
            state.cancellationsSearchQuery = action.payload;
            state.cancellationsCurrentPage = 1;
        },
        setCancellationsStatusFilter: (state, action) => {
            state.cancellationsStatusFilter = action.payload;
            state.cancellationsCurrentPage = 1;
        },
        setCancellationsCurrentPage: (state, action) => {
            state.cancellationsCurrentPage = action.payload;
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

            // Update Order Status
            .addCase(updateAdminOrderStatusAsync.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
            })
            .addCase(updateAdminOrderStatusAsync.fulfilled, (state, action) => {
                state.updateLoading = false;
                if (state.activeOrder && state.activeOrder.id === action.payload.data?.id) {
                    state.activeOrder = action.payload.data;
                }
            })
            .addCase(updateAdminOrderStatusAsync.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // Fetch Returns List
            .addCase(fetchAdminReturnsAsync.pending, (state) => {
                state.returnsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminReturnsAsync.fulfilled, (state, action) => {
                state.returnsLoading = false;
                state.returns = action.payload.results || [];
                state.returnsCount = action.payload.count || 0;
                state.returnsTotalPages = action.payload.total_pages || 1;
                state.returnsCurrentPage = action.payload.current_page || 1;
            })
            .addCase(fetchAdminReturnsAsync.rejected, (state, action) => {
                state.returnsLoading = false;
                state.error = action.payload;
            })

            // Approve Return
            .addCase(approveAdminReturnAsync.pending, (state) => {
                state.processReturnLoading = true;
            })
            .addCase(approveAdminReturnAsync.fulfilled, (state, action) => {
                state.processReturnLoading = false;
                const updatedReq = action.payload.data;
                if (updatedReq) {
                    state.returns = state.returns.map((r) => (r.id === updatedReq.id ? updatedReq : r));
                }
            })
            .addCase(approveAdminReturnAsync.rejected, (state, action) => {
                state.processReturnLoading = false;
                state.error = action.payload;
            })

            // Reject Return
            .addCase(rejectAdminReturnAsync.pending, (state) => {
                state.processReturnLoading = true;
            })
            .addCase(rejectAdminReturnAsync.fulfilled, (state, action) => {
                state.processReturnLoading = false;
                const updatedReq = action.payload.data;
                if (updatedReq) {
                    state.returns = state.returns.map((r) => (r.id === updatedReq.id ? updatedReq : r));
                }
            })
            .addCase(rejectAdminReturnAsync.rejected, (state, action) => {
                state.processReturnLoading = false;
                state.error = action.payload;
            })

            // Fetch Cancellations List
            .addCase(fetchAdminCancellationsAsync.pending, (state) => {
                state.cancellationsLoading = true;
                state.error = null;
            })
            .addCase(fetchAdminCancellationsAsync.fulfilled, (state, action) => {
                state.cancellationsLoading = false;
                state.cancellations = action.payload.results || [];
                state.cancellationsCount = action.payload.count || 0;
                state.cancellationsTotalPages = action.payload.total_pages || 1;
                state.cancellationsCurrentPage = action.payload.current_page || 1;
            })
            .addCase(fetchAdminCancellationsAsync.rejected, (state, action) => {
                state.cancellationsLoading = false;
                state.error = action.payload;
            })

            // Approve Cancellation
            .addCase(approveAdminCancellationAsync.pending, (state) => {
                state.processCancellationLoading = true;
            })
            .addCase(approveAdminCancellationAsync.fulfilled, (state, action) => {
                state.processCancellationLoading = false;
                const updatedReq = action.payload.data;
                if (updatedReq) {
                    state.cancellations = state.cancellations.map((c) => (c.id === updatedReq.id ? updatedReq : c));
                }
            })
            .addCase(approveAdminCancellationAsync.rejected, (state, action) => {
                state.processCancellationLoading = false;
                state.error = action.payload;
            })

            // Reject Cancellation
            .addCase(rejectAdminCancellationAsync.pending, (state) => {
                state.processCancellationLoading = true;
            })
            .addCase(rejectAdminCancellationAsync.fulfilled, (state, action) => {
                state.processCancellationLoading = false;
                const updatedReq = action.payload.data;
                if (updatedReq) {
                    state.cancellations = state.cancellations.map((c) => (c.id === updatedReq.id ? updatedReq : c));
                }
            })
            .addCase(rejectAdminCancellationAsync.rejected, (state, action) => {
                state.processCancellationLoading = false;
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
    setReturnsSearchQuery,
    setReturnsStatusFilter,
    setReturnsCurrentPage,
    setCancellationsSearchQuery,
    setCancellationsStatusFilter,
    setCancellationsCurrentPage,
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

// Returns Selectors
export const selectAdminReturns = (state) => state.adminOrders.returns;
export const selectAdminReturnsCount = (state) => state.adminOrders.returnsCount;
export const selectAdminReturnsTotalPages = (state) => state.adminOrders.returnsTotalPages;
export const selectAdminReturnsCurrentPage = (state) => state.adminOrders.returnsCurrentPage;
export const selectAdminReturnsSearchQuery = (state) => state.adminOrders.returnsSearchQuery;
export const selectAdminReturnsStatusFilter = (state) => state.adminOrders.returnsStatusFilter;
export const selectAdminReturnsLoading = (state) => state.adminOrders.returnsLoading;
export const selectAdminProcessReturnLoading = (state) => state.adminOrders.processReturnLoading;

// Cancellations Selectors
export const selectAdminCancellations = (state) => state.adminOrders.cancellations;
export const selectAdminCancellationsCount = (state) => state.adminOrders.cancellationsCount;
export const selectAdminCancellationsTotalPages = (state) => state.adminOrders.cancellationsTotalPages;
export const selectAdminCancellationsCurrentPage = (state) => state.adminOrders.cancellationsCurrentPage;
export const selectAdminCancellationsSearchQuery = (state) => state.adminOrders.cancellationsSearchQuery;
export const selectAdminCancellationsStatusFilter = (state) => state.adminOrders.cancellationsStatusFilter;
export const selectAdminCancellationsLoading = (state) => state.adminOrders.cancellationsLoading;
export const selectAdminProcessCancellationLoading = (state) => state.adminOrders.processCancellationLoading;

export default adminOrdersSlice.reducer;
