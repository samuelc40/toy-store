import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getProductOffers,
    createProductOffer,
    updateProductOffer,
    toggleProductOfferStatus,
    deleteProductOffer,
    getCategoryOffers,
    createCategoryOffer,
    updateCategoryOffer,
    toggleCategoryOfferStatus,
    deleteCategoryOffer,
    getReferralConfig,
    updateReferralConfig,
} from "../services/adminOfferService";

// Async Thunks for Product Offers
export const fetchProductOffersAsync = createAsyncThunk(
    "adminOffers/fetchProductOffers",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getProductOffers(params);
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to fetch product offers.";
            return rejectWithValue(msg);
        }
    }
);

export const createProductOfferAsync = createAsyncThunk(
    "adminOffers/createProductOffer",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await createProductOffer(payload);
            return data;
        } catch (error) {
            const errData = error.response?.data;
            let msg = "Failed to create product offer.";
            if (errData) {
                if (typeof errData === "string") msg = errData;
                else if (errData.message) msg = errData.message;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) msg = `${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`;
                }
            }
            return rejectWithValue(msg);
        }
    }
);

export const updateProductOfferAsync = createAsyncThunk(
    "adminOffers/updateProductOffer",
    async ({ offerId, payload }, { rejectWithValue }) => {
        try {
            const data = await updateProductOffer(offerId, payload);
            return data;
        } catch (error) {
            const errData = error.response?.data;
            let msg = "Failed to update product offer.";
            if (errData) {
                if (typeof errData === "string") msg = errData;
                else if (errData.message) msg = errData.message;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) msg = `${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`;
                }
            }
            return rejectWithValue(msg);
        }
    }
);

export const toggleProductOfferStatusAsync = createAsyncThunk(
    "adminOffers/toggleProductOfferStatus",
    async ({ offerId, isActive }, { rejectWithValue }) => {
        try {
            const data = await toggleProductOfferStatus(offerId, isActive);
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to toggle offer status.";
            return rejectWithValue(msg);
        }
    }
);

export const deleteProductOfferAsync = createAsyncThunk(
    "adminOffers/deleteProductOffer",
    async (offerId, { rejectWithValue }) => {
        try {
            await deleteProductOffer(offerId);
            return offerId;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to delete product offer.";
            return rejectWithValue(msg);
        }
    }
);

// Async Thunks for Category Offers
export const fetchCategoryOffersAsync = createAsyncThunk(
    "adminOffers/fetchCategoryOffers",
    async (params = {}, { rejectWithValue }) => {
        try {
            const data = await getCategoryOffers(params);
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to fetch category offers.";
            return rejectWithValue(msg);
        }
    }
);

export const createCategoryOfferAsync = createAsyncThunk(
    "adminOffers/createCategoryOffer",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await createCategoryOffer(payload);
            return data;
        } catch (error) {
            const errData = error.response?.data;
            let msg = "Failed to create category offer.";
            if (errData) {
                if (typeof errData === "string") msg = errData;
                else if (errData.message) msg = errData.message;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) msg = `${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`;
                }
            }
            return rejectWithValue(msg);
        }
    }
);

export const updateCategoryOfferAsync = createAsyncThunk(
    "adminOffers/updateCategoryOffer",
    async ({ offerId, payload }, { rejectWithValue }) => {
        try {
            const data = await updateCategoryOffer(offerId, payload);
            return data;
        } catch (error) {
            const errData = error.response?.data;
            let msg = "Failed to update category offer.";
            if (errData) {
                if (typeof errData === "string") msg = errData;
                else if (errData.message) msg = errData.message;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) msg = `${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`;
                }
            }
            return rejectWithValue(msg);
        }
    }
);

export const toggleCategoryOfferStatusAsync = createAsyncThunk(
    "adminOffers/toggleCategoryOfferStatus",
    async ({ offerId, isActive }, { rejectWithValue }) => {
        try {
            const data = await toggleCategoryOfferStatus(offerId, isActive);
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to toggle category offer status.";
            return rejectWithValue(msg);
        }
    }
);

export const deleteCategoryOfferAsync = createAsyncThunk(
    "adminOffers/deleteCategoryOffer",
    async (offerId, { rejectWithValue }) => {
        try {
            await deleteCategoryOffer(offerId);
            return offerId;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to delete category offer.";
            return rejectWithValue(msg);
        }
    }
);

// Async Thunks for Referral Offer Configuration
export const fetchReferralConfigAsync = createAsyncThunk(
    "adminOffers/fetchReferralConfig",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getReferralConfig();
            return data.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to fetch referral offer configuration.";
            return rejectWithValue(msg);
        }
    }
);

export const updateReferralConfigAsync = createAsyncThunk(
    "adminOffers/updateReferralConfig",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await updateReferralConfig(payload);
            return data.data;
        } catch (error) {
            const errData = error.response?.data;
            let msg = "Failed to update referral configuration.";
            if (errData) {
                if (typeof errData === "string") msg = errData;
                else if (errData.message) msg = errData.message;
                else {
                    const firstKey = Object.keys(errData)[0];
                    if (firstKey) msg = `${firstKey}: ${Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey]}`;
                }
            }
            return rejectWithValue(msg);
        }
    }
);

const initialState = {
    activeTab: "products", // "products" | "categories" | "referrals"
    productOffers: [],
    categoryOffers: [],
    referralConfig: null,
    count: 0,
    totalPages: 1,
    currentPage: 1,
    statusFilter: "ALL",
    searchQuery: "",
    loading: false,
    actionLoading: false,
    error: null,
};

const adminOffersSlice = createSlice({
    name: "adminOffers",
    initialState,
    reducers: {
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
            state.currentPage = 1;
            state.searchQuery = "";
            state.statusFilter = "ALL";
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
            state.currentPage = 1;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Product Offers
            .addCase(fetchProductOffersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductOffersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.productOffers = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.totalPages = action.payload.total_pages || 1;
                state.currentPage = action.payload.current_page || 1;
            })
            .addCase(fetchProductOffersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Category Offers
            .addCase(fetchCategoryOffersAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryOffersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryOffers = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.totalPages = action.payload.total_pages || 1;
                state.currentPage = action.payload.current_page || 1;
            })
            .addCase(fetchCategoryOffersAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Referral Config
            .addCase(fetchReferralConfigAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReferralConfigAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.referralConfig = action.payload;
            })
            .addCase(fetchReferralConfigAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Referral Config
            .addCase(updateReferralConfigAsync.fulfilled, (state, action) => {
                state.referralConfig = action.payload;
            })

            // Actions (Create / Update / Delete) Loading States
            .addMatcher(
                (action) => action.type.endsWith("/pending") && action.type.includes("adminOffers/") && !action.type.includes("fetch"),
                (state) => {
                    state.actionLoading = true;
                }
            )
            .addMatcher(
                (action) => (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")) && action.type.includes("adminOffers/") && !action.type.includes("fetch"),
                (state) => {
                    state.actionLoading = false;
                }
            );
    },
});

export const { setActiveTab, setStatusFilter, setSearchQuery, setCurrentPage } = adminOffersSlice.actions;

export const selectAdminOffers = (state) => state.adminOffers;

export default adminOffersSlice.reducer;
