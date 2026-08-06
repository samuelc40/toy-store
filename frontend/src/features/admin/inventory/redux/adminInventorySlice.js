import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminInventoryService from "../services/adminInventoryService";

export const fetchInventoryAsync = createAsyncThunk(
    "adminInventory/fetchInventory",
    async (params, { rejectWithValue }) => {
        try {
            const data = await adminInventoryService.getInventory(params);
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch inventory.";
            return rejectWithValue(message);
        }
    }
);

export const fetchInventorySummaryAsync = createAsyncThunk(
    "adminInventory/fetchSummary",
    async (_, { rejectWithValue }) => {
        try {
            const data = await adminInventoryService.getInventorySummary();
            return data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to fetch inventory summary.";
            return rejectWithValue(message);
        }
    }
);

export const updateVariantStockAsync = createAsyncThunk(
    "adminInventory/updateStock",
    async ({ variantId, stock_quantity, reason }, { rejectWithValue }) => {
        try {
            const data = await adminInventoryService.updateVariantStock(variantId, {
                stock_quantity,
                reason,
            });
            return data.data;
        } catch (error) {
            const message =
                error.response?.data?.stock_quantity?.[0] ||
                error.response?.data?.message ||
                "Failed to update stock quantity.";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    items: [],
    summary: {
        total_products: 0,
        total_variants: 0,
        in_stock: 0,
        low_stock: 0,
        out_of_stock: 0,
    },
    count: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    searchQuery: "",
    sortOrder: "newest",
    categoryFilter: "ALL",
    brandFilter: "ALL",
    stockStatusFilter: "ALL",
    statusFilter: "ALL",
    loading: false,
    summaryLoading: false,
    actionLoading: false,
    error: null,
};

const adminInventorySlice = createSlice({
    name: "adminInventory",
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
            state.currentPage = 1;
        },
        setCategoryFilter: (state, action) => {
            state.categoryFilter = action.payload;
            state.currentPage = 1;
        },
        setBrandFilter: (state, action) => {
            state.brandFilter = action.payload;
            state.currentPage = 1;
        },
        setStockStatusFilter: (state, action) => {
            state.stockStatusFilter = action.payload;
            state.currentPage = 1;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.currentPage = 1;
        },
        clearFilters: (state) => {
            state.searchQuery = "";
            state.sortOrder = "newest";
            state.categoryFilter = "ALL";
            state.brandFilter = "ALL";
            state.stockStatusFilter = "ALL";
            state.statusFilter = "ALL";
            state.currentPage = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Inventory List
            .addCase(fetchInventoryAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInventoryAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.currentPage = action.payload.page || 1;
                state.pageSize = action.payload.page_size || 10;
                state.totalPages = action.payload.total_pages || 1;
            })
            .addCase(fetchInventoryAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Summary
            .addCase(fetchInventorySummaryAsync.pending, (state) => {
                state.summaryLoading = true;
            })
            .addCase(fetchInventorySummaryAsync.fulfilled, (state, action) => {
                state.summaryLoading = false;
                state.summary = action.payload || initialState.summary;
            })
            .addCase(fetchInventorySummaryAsync.rejected, (state) => {
                state.summaryLoading = false;
            })

            // Update Stock
            .addCase(updateVariantStockAsync.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(updateVariantStockAsync.fulfilled, (state, action) => {
                state.actionLoading = false;
                const updatedItem = action.payload;
                if (updatedItem?.id) {
                    const idx = state.items.findIndex((item) => item.id === updatedItem.id);
                    if (idx !== -1) {
                        state.items[idx] = updatedItem;
                    }
                }
            })
            .addCase(updateVariantStockAsync.rejected, (state) => {
                state.actionLoading = false;
            });
    },
});

export const {
    setSearchQuery,
    setSortOrder,
    setCategoryFilter,
    setBrandFilter,
    setStockStatusFilter,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    clearFilters,
} = adminInventorySlice.actions;

export const selectInventoryItems = (state) => state.adminInventory.items;
export const selectInventorySummary = (state) => state.adminInventory.summary;
export const selectInventoryCount = (state) => state.adminInventory.count;
export const selectInventoryCurrentPage = (state) => state.adminInventory.currentPage;
export const selectInventoryPageSize = (state) => state.adminInventory.pageSize;
export const selectInventoryTotalPages = (state) => state.adminInventory.totalPages;
export const selectInventorySearchQuery = (state) => state.adminInventory.searchQuery;
export const selectInventorySortOrder = (state) => state.adminInventory.sortOrder;
export const selectInventoryCategoryFilter = (state) => state.adminInventory.categoryFilter;
export const selectInventoryBrandFilter = (state) => state.adminInventory.brandFilter;
export const selectInventoryStockStatusFilter = (state) => state.adminInventory.stockStatusFilter;
export const selectInventoryStatusFilter = (state) => state.adminInventory.statusFilter;
export const selectInventoryLoading = (state) => state.adminInventory.loading;
export const selectInventorySummaryLoading = (state) => state.adminInventory.summaryLoading;
export const selectInventoryActionLoading = (state) => state.adminInventory.actionLoading;
export const selectInventoryError = (state) => state.adminInventory.error;

export default adminInventorySlice.reducer;
