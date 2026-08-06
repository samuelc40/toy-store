import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/axios";

export const getCategories = createAsyncThunk(
    "customerCategory/getCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(
                "/customers/categories/"
            );

            return response.data.results || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
);

const categoryListingSlice = createSlice({
    name: "customerCategory",
    initialState: {
        categories: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload || [];
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default categoryListingSlice.reducer;