import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAdminCoupons,
    createAdminCoupon,
    updateAdminCoupon,
    deleteAdminCoupon,
} from "../../../coupons/services/couponService";
import { toast } from "react-toastify";

export const getAdminCoupons = createAsyncThunk(
    "adminCoupons/getAdminCoupons",
    async (params, { rejectWithValue }) => {
        try {
            const data = await fetchAdminCoupons(params);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch coupons.");
        }
    }
);

export const createCouponThunk = createAsyncThunk(
    "adminCoupons/createCouponThunk",
    async (couponData, { rejectWithValue }) => {
        try {
            const data = await createAdminCoupon(couponData);
            toast.success(data.message || "Coupon created successfully!");
            return data.data;
        } catch (err) {
            const errData = err.response?.data;
            if (errData && typeof errData === "object") {
                return rejectWithValue(errData);
            }
            const msg = err.response?.data?.message || err.response?.data?.detail || "Failed to create coupon.";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateCouponThunk = createAsyncThunk(
    "adminCoupons/updateCouponThunk",
    async ({ id, data: updateData }, { rejectWithValue }) => {
        try {
            const data = await updateAdminCoupon(id, updateData);
            toast.success(data.message || "Coupon updated successfully!");
            return data.data;
        } catch (err) {
            const errData = err.response?.data;
            if (errData && typeof errData === "object") {
                return rejectWithValue(errData);
            }
            const msg = err.response?.data?.message || err.response?.data?.detail || "Failed to update coupon.";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deleteCouponThunk = createAsyncThunk(
    "adminCoupons/deleteCouponThunk",
    async (id, { rejectWithValue }) => {
        try {
            const data = await deleteAdminCoupon(id);
            toast.success(data.message || "Coupon deleted successfully!");
            return id;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete coupon.";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

const adminCouponsSlice = createSlice({
    name: "adminCoupons",
    initialState: {
        coupons: [],
        count: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        loading: false,
        actionLoading: false,
        error: null,
    },
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get Admin Coupons
            .addCase(getAdminCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAdminCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload.results || [];
                state.count = action.payload.count || 0;
                state.page = action.payload.page || 1;
                state.pageSize = action.payload.page_size || 10;
                state.totalPages = action.payload.total_pages || 1;
            })
            .addCase(getAdminCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Coupon
            .addCase(createCouponThunk.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(createCouponThunk.fulfilled, (state) => {
                state.actionLoading = false;
            })
            .addCase(createCouponThunk.rejected, (state) => {
                state.actionLoading = false;
            })
            // Update Coupon
            .addCase(updateCouponThunk.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(updateCouponThunk.fulfilled, (state) => {
                state.actionLoading = false;
            })
            .addCase(updateCouponThunk.rejected, (state) => {
                state.actionLoading = false;
            })
            // Delete Coupon
            .addCase(deleteCouponThunk.pending, (state) => {
                state.actionLoading = true;
            })
            .addCase(deleteCouponThunk.fulfilled, (state, action) => {
                state.actionLoading = false;
                state.coupons = state.coupons.filter((c) => c.id !== action.payload);
            })
            .addCase(deleteCouponThunk.rejected, (state) => {
                state.actionLoading = false;
            });
    },
});

export const { setPage } = adminCouponsSlice.actions;
export default adminCouponsSlice.reducer;
