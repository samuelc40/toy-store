import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    toggleBlockVariant,
} from '../services/variantService';
import {
    fetchVariantImages,
    uploadVariantImages,
    deleteVariantImage,
    setVariantPrimaryImage,
} from '../services/imageService';

const initialState = {
    variants: [],
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    blocking: false,
    selectedVariant: null,
    error: null,

    // Image upload and gallery states (Milestone 3)
    galleryImages: [],
    loadingImages: false,
    uploadingImages: false,
};

export const getVariantsAsync = createAsyncThunk(
    'variants/getVariants',
    async (productId, { rejectWithValue }) => {
        try {
            const data = await fetchVariants(productId);
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to fetch variants'
            );
        }
    }
);

export const createVariantAsync = createAsyncThunk(
    'variants/createVariant',
    async ({ productId, variantData }, { rejectWithValue }) => {
        try {
            const data = await createVariant(productId, variantData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                return rejectWithValue(errorData);
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create variant'
            );
        }
    }
);

export const updateVariantAsync = createAsyncThunk(
    'variants/updateVariant',
    async ({ id, variantData }, { rejectWithValue }) => {
        try {
            const data = await updateVariant(id, variantData);
            return data.data;
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                return rejectWithValue(errorData);
            }
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update variant'
            );
        }
    }
);

export const deleteVariantAsync = createAsyncThunk(
    'variants/deleteVariant',
    async (id, { rejectWithValue }) => {
        try {
            await deleteVariant(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to delete variant'
            );
        }
    }
);

export const toggleBlockVariantAsync = createAsyncThunk(
    'variants/toggleBlockVariant',
    async (id, { rejectWithValue }) => {
        try {
            const data = await toggleBlockVariant(id);
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                'Failed to toggle block status'
            );
        }
    }
);

// Milestone 3 Image Async Thunks
export const getVariantImagesAsync = createAsyncThunk(
    'variants/getVariantImages',
    async (variantId, { rejectWithValue }) => {
        try {
            const data = await fetchVariantImages(variantId);
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch variant images'
            );
        }
    }
);

export const uploadVariantImagesAsync = createAsyncThunk(
    'variants/uploadVariantImages',
    async ({ variantId, files, onUploadProgress }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images', file);
            });
            formData.append('alt_text', ''); // alt_text default blank
            const data = await uploadVariantImages(variantId, formData, onUploadProgress);
            return data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || error.response?.data?.message || 'Failed to upload images'
            );
        }
    }
);

export const deleteVariantImageAsync = createAsyncThunk(
    'variants/deleteVariantImage',
    async ({ variantId, imageId }, { rejectWithValue }) => {
        try {
            await deleteVariantImage(variantId, imageId);
            return imageId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete variant image'
            );
        }
    }
);

export const setVariantPrimaryImageAsync = createAsyncThunk(
    'variants/setVariantPrimaryImage',
    async ({ variantId, imageId }, { rejectWithValue }) => {
        try {
            await setVariantPrimaryImage(variantId, imageId);
            return imageId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to set primary variant image'
            );
        }
    }
);

const variantSlice = createSlice({
    name: 'variants',
    initialState,
    reducers: {
        setSelectedVariant: (state, action) => {
            state.selectedVariant = action.payload;
        },
        clearVariantError: (state) => {
            state.error = null;
        },
        clearVariantsState: (state) => {
            state.variants = [];
            state.selectedVariant = null;
            state.error = null;
            state.galleryImages = [];
        },
        clearGalleryImages: (state) => {
            state.galleryImages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // getVariantsAsync
            .addCase(getVariantsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVariantsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.variants = action.payload || [];
            })
            .addCase(getVariantsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // createVariantAsync
            .addCase(createVariantAsync.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createVariantAsync.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createVariantAsync.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })

            // updateVariantAsync
            .addCase(updateVariantAsync.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateVariantAsync.fulfilled, (state, action) => {
                state.updating = false;
                const updated = action.payload;
                state.variants = state.variants.map((v) => (v.id === updated.id ? updated : v));
            })
            .addCase(updateVariantAsync.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })

            // deleteVariantAsync
            .addCase(deleteVariantAsync.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteVariantAsync.fulfilled, (state, action) => {
                state.deleting = false;
                const id = action.payload;
                state.variants = state.variants.map((v) =>
                    v.id === id ? { ...v, is_active: false } : v
                );
            })
            .addCase(deleteVariantAsync.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload;
            })

            // toggleBlockVariantAsync
            .addCase(toggleBlockVariantAsync.pending, (state) => {
                state.blocking = true;
                state.error = null;
            })
            .addCase(toggleBlockVariantAsync.fulfilled, (state, action) => {
                state.blocking = false;
                const { id, blocked } = action.payload;
                state.variants = state.variants.map((v) =>
                    v.id === id ? { ...v, blocked } : v
                );
            })
            .addCase(toggleBlockVariantAsync.rejected, (state, action) => {
                state.blocking = false;
                state.error = action.payload;
            })

            // getVariantImagesAsync
            .addCase(getVariantImagesAsync.pending, (state) => {
                state.loadingImages = true;
                state.error = null;
            })
            .addCase(getVariantImagesAsync.fulfilled, (state, action) => {
                state.loadingImages = false;
                state.galleryImages = action.payload || [];
            })
            .addCase(getVariantImagesAsync.rejected, (state, action) => {
                state.loadingImages = false;
                state.error = action.payload;
            })

            // uploadVariantImagesAsync
            .addCase(uploadVariantImagesAsync.pending, (state) => {
                state.uploadingImages = true;
                state.error = null;
            })
            .addCase(uploadVariantImagesAsync.fulfilled, (state, action) => {
                state.uploadingImages = false;
                // Prepend or set the new full list
                state.galleryImages = action.payload || [];
            })
            .addCase(uploadVariantImagesAsync.rejected, (state, action) => {
                state.uploadingImages = false;
                state.error = action.payload;
            })

            // deleteVariantImageAsync
            .addCase(deleteVariantImageAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteVariantImageAsync.fulfilled, (state, action) => {
                const deletedImageId = action.payload;
                state.galleryImages = state.galleryImages.filter((img) => img.id !== deletedImageId);
            })
            .addCase(deleteVariantImageAsync.rejected, (state, action) => {
                state.error = action.payload;
            })

            // setVariantPrimaryImageAsync
            .addCase(setVariantPrimaryImageAsync.pending, (state) => {
                state.error = null;
            })
            .addCase(setVariantPrimaryImageAsync.fulfilled, (state, action) => {
                const primaryImageId = action.payload;
                state.galleryImages = state.galleryImages.map((img) => ({
                    ...img,
                    is_primary: img.id === primaryImageId,
                }));
            })
            .addCase(setVariantPrimaryImageAsync.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    setSelectedVariant,
    clearVariantError,
    clearVariantsState,
    clearGalleryImages,
} = variantSlice.actions;

export const selectVariants = (state) => state.variants.variants;
export const selectSelectedVariant = (state) => state.variants.selectedVariant;
export const selectVariantsLoading = (state) => state.variants.loading;
export const selectVariantsCreating = (state) => state.variants.creating;
export const selectVariantsUpdating = (state) => state.variants.updating;
export const selectVariantsDeleting = (state) => state.variants.deleting;
export const selectVariantsBlocking = (state) => state.variants.blocking;
export const selectVariantsError = (state) => state.variants.error;

// Milestone 3 selectors
export const selectGalleryImages = (state) => state.variants.galleryImages;
export const selectLoadingImages = (state) => state.variants.loadingImages;
export const selectUploadingImages = (state) => state.variants.uploadingImages;

export default variantSlice.reducer;

