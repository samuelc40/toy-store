import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

import VariantForm from './VariantForm';
import ImageGallery from './ImageGallery';
import ImageUploader from './ImageUploader';
import useImageUpload from '../hooks/useImageUpload';

import {
    getVariantImagesAsync,
    deleteVariantImageAsync,
    setVariantPrimaryImageAsync,
    clearGalleryImages,
    selectGalleryImages,
    selectLoadingImages,
    selectUploadingImages,
} from '../redux/variantSlice';

import '../styles/ImageUploader.css';

/**
 * Centered modal overlay that renders VariantForm and Milestone 3 Image Gallery/Uploader.
 */
export function VariantModal({
    isOpen,
    onClose,
    onSubmit,
    variant,
    isLoading = false,
    backendErrors = null,
}) {
    const dispatch = useDispatch();
    const galleryImages = useSelector(selectGalleryImages);
    const loadingImages = useSelector(selectLoadingImages);
    const uploadingImages = useSelector(selectUploadingImages);

    // Fetch variant images on mount or when the editing variant changes
    useEffect(() => {
        if (isOpen && variant && variant.id) {
            dispatch(getVariantImagesAsync(variant.id));
        }
        return () => {
            dispatch(clearGalleryImages());
        };
    }, [isOpen, variant, dispatch]);

    const handleUploadSuccess = () => {
        if (variant && variant.id) {
            dispatch(getVariantImagesAsync(variant.id));
        }
    };

    // Queue controller for either adding (controlled) or editing (autonomous backup)
    const queueController = useImageUpload(
        variant?.id || null,
        galleryImages.length,
        handleUploadSuccess
    );

    // Handle delete and primary image changes
    const handleDeleteImage = async (imageId) => {
        if (!variant) return;
        const confirmDelete = window.confirm('Are you sure you want to delete this image?');
        if (!confirmDelete) return;

        const resultAction = await dispatch(
            deleteVariantImageAsync({ variantId: variant.id, imageId })
        );
        if (deleteVariantImageAsync.fulfilled.match(resultAction)) {
            toast.success('Image deleted successfully.');
        }
    };

    const handleSetPrimaryImage = async (imageId) => {
        if (!variant) return;
        const resultAction = await dispatch(
            setVariantPrimaryImageAsync({ variantId: variant.id, imageId })
        );
        if (setVariantPrimaryImageAsync.fulfilled.match(resultAction)) {
            toast.success('Primary image updated successfully.');
        }
    };

    // Form submit wrapper to inject image files if creating
    const handleFormSubmit = async (formData) => {
        const files = queueController.queue.map((item) => item.file);

        if (!variant) {
            // Add variant validation: require at least 3 images
            if (files.length < 3) {
                toast.warning('A variant must have at least 3 images. Please select at least 3 images.');
                return;
            }
            if (files.length > 10) {
                toast.warning('Maximum 10 images allowed per variant.');
                return;
            }
        }

        await onSubmit(formData, files);

        if (!variant) {
            queueController.clearQueue();
        }
    };

    // Reset queues when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            queueController.clearQueue();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="variant-modal-backdrop-overlay">
            <div className="variant-modal-card-container variant-modal-wide">
                {/* Modal Header */}
                <div className="variant-modal-header">
                    <h3 className="variant-modal-title">
                        {variant ? 'Edit Variant' : 'Add New Variant'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading || uploadingImages}
                        className="variant-modal-close-btn"
                        title="Close Modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="variant-modal-body">
                    <VariantForm
                        variant={variant}
                        onSubmit={handleFormSubmit}
                        onCancel={onClose}
                        isLoading={isLoading || uploadingImages}
                        backendErrors={backendErrors}
                    />
                </div>

                {/* Variant Images Gallery (Show if variant exists) */}
                {variant && (
                    <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid var(--border-color)' }}>
                        <ImageGallery
                            images={galleryImages}
                            loading={loadingImages}
                            onDelete={handleDeleteImage}
                            onSetPrimary={handleSetPrimaryImage}
                            disabled={loadingImages || uploadingImages}
                        />
                    </div>
                )}
 
                {/* Image Dropzone & Uploader (Always visible for adding, or for editing) */}
                <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1.5px solid var(--border-color)' }}>
                    <ImageUploader
                        variantId={variant?.id || null}
                        existingImagesCount={variant ? galleryImages.length : 0}
                        onUploadSuccess={handleUploadSuccess}
                        hideUploadButton={!variant} // Hide upload button if adding (it's uploaded with form submit)
                        queueController={queueController}
                    />
                </div>
            </div>
        </div>
    );
}

export default VariantModal;


