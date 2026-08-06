"use no memo";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader, Plus, Trash2, ChevronDown, ChevronUp, Star, HelpCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { productSchema } from '../validation/productSchema';
import ImageGallery from './ImageGallery';
import ImageUploader from './ImageUploader';
import DeleteVariantModal from './DeleteVariantModal';

import {
    getVariantsAsync,
    deleteVariantAsync,
    deleteVariantImageAsync,
    setVariantPrimaryImageAsync,
    selectVariants,
    selectVariantsLoading,
} from '../redux/variantSlice';

import '../styles/ImageUploader.css';
import '../styles/VariantManagement.css';

/**
 * Enhanced ProductForm featuring a unified workflow.
 * Manages Product fields and a dynamic list of Expandable Variant Cards.
 * Queues new variant image files locally and validates constraints inline.
 */
export function ProductForm({
    product,
    categories,
    onSubmit,
    onCancel,
    isLoading = false,
    isReadOnly = false,
}) {
    const dispatch = useDispatch();
    const fetchedVariants = useSelector(selectVariants);
    const loadingVariants = useSelector(selectVariantsLoading);

    // Local variants array representing the unified edit workspace
    const [localVariants, setLocalVariants] = useState([]);
    
    // Tracks which file in which variant queue is currently being cropped: { vIndex, fileIndex }
    const [activeCropInfo, setActiveCropInfo] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: {
            category: '',
            name: '',
            brand: '',
            description: '',
        },
    });

    // Load product fields on mount/change
    useEffect(() => {
        if (product) {
            reset({
                category: product.category || '',
                name: product.name || '',
                brand: product.brand || '',
                description: product.description || '',
            });
            // Fetch variants if editing
            dispatch(getVariantsAsync(product.id));
        } else {
            reset({
                category: '',
                name: '',
                brand: '',
                description: '',
            });
            setLocalVariants([]);
        }
    }, [product, reset, dispatch]);

    // Map fetched variants into local state structure
    useEffect(() => {
        if (product && fetchedVariants) {
            setLocalVariants(
                fetchedVariants.map((v) => ({
                    id: v.id,
                    variant_name: v.variant_name || '',
                    sku: v.sku || '',
                    price: v.price || '',
                    sale_price: v.sale_price || '',
                    stock_quantity: v.stock_quantity !== undefined ? v.stock_quantity : 0,
                    display_order: v.display_order || 1,
                    is_active: v.is_active !== false,
                    blocked: !!v.blocked,
                    images: v.images || [],
                    newImagesQueue: [],
                    deletedImageIds: [],
                    errors: {},
                    expanded: false,
                }))
            );
        }
    }, [fetchedVariants, product]);

    // Add new variant card draft
    const handleAddVariantDraft = () => {
        const newDraft = {
            id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            variant_name: '',
            sku: '',
            price: '',
            sale_price: '',
            stock_quantity: 0,
            display_order: localVariants.length + 1,
            is_active: true,
            blocked: false,
            images: [],
            newImagesQueue: [],
            deletedImageIds: [],
            errors: {},
            expanded: true, // Auto-expand new item
        };
        setLocalVariants((prev) => [...prev, newDraft]);
    };

    const [variantToDelete, setVariantToDelete] = useState(null);
    const [isDeletingVariant, setIsDeletingVariant] = useState(false);

    // Remove or soft delete variant card
    const handleRemoveVariant = (vIndex, id, variantName, sku) => {
        if (String(id).startsWith('draft-')) {
            // Remove draft locally
            setLocalVariants((prev) => prev.filter((_, idx) => idx !== vIndex));
        } else {
            // Setup details to confirm via DeleteVariantModal
            setVariantToDelete({
                vIndex,
                id,
                variant_name: variantName || 'Untitled Variant',
                sku: sku || 'No SKU'
            });
        }
    };

    const handleConfirmDeleteVariant = async () => {
        if (!variantToDelete) return;
        const { vIndex, id } = variantToDelete;
        setIsDeletingVariant(true);
        try {
            const result = await dispatch(deleteVariantAsync(id));
            if (deleteVariantAsync.fulfilled.match(result)) {
                toast.success('Variant deleted successfully.');
                setLocalVariants((prev) => prev.filter((_, idx) => idx !== vIndex));
                setVariantToDelete(null);
            }
        } catch (err) {
            console.error('Delete Variant Error:', err);
            toast.error('Failed to delete variant.');
        } finally {
            setIsDeletingVariant(false);
        }
    };

    // Toggle expand/collapse card
    const toggleCardExpansion = (vIndex) => {
        setLocalVariants((prev) =>
            prev.map((v, idx) => (idx === vIndex ? { ...v, expanded: !v.expanded } : v))
        );
    };

    // Update form input field inside a specific variant card
    const updateVariantField = (vIndex, field, value) => {
        setLocalVariants((prev) =>
            prev.map((v, idx) => {
                if (idx === vIndex) {
                    const updated = { ...v, [field]: value };
                    // Clear error for this field
                    if (updated.errors[field]) {
                        updated.errors = { ...updated.errors, [field]: null };
                    }
                    return updated;
                }
                return v;
            })
        );
    };

    // Add selected files to a variant's queue
    const handleFilesAddedForVariant = (vIndex, files) => {
        const fileList = Array.from(files);
        const validItems = fileList
            .filter((file) => {
                const isValid =
                    file.size <= 5 * 1024 * 1024 &&
                    ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type);
                if (!isValid) {
                    toast.warning(`File "${file.name}" is rejected (max 5MB, PNG/JPG/WebP only).`);
                }
                return isValid;
            })
            .map((file) => ({
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                previewUrl: URL.createObjectURL(file),
                croppedBlob: null,
                status: 'queued',
            }));

        setLocalVariants((prev) =>
            prev.map((v, idx) => {
                if (idx === vIndex) {
                    const totalImagesCount = v.images.length + v.newImagesQueue.length + validItems.length;
                    if (totalImagesCount > 10) {
                        toast.warning('A variant cannot have more than 10 images.');
                        return v;
                    }
                    return {
                        ...v,
                        newImagesQueue: [...v.newImagesQueue, ...validItems],
                        errors: { ...v.errors, images: null }, // Clear image error
                    };
                }
                return v;
            })
        );
    };

    // Remove queued file from variant
    const handleRemoveQueuedFile = (vIndex, fileId) => {
        setLocalVariants((prev) =>
            prev.map((v, idx) => {
                if (idx === vIndex) {
                    const item = v.newImagesQueue.find((i) => i.id === fileId);
                    if (item && item.previewUrl) {
                        URL.revokeObjectURL(item.previewUrl);
                    }
                    return {
                        ...v,
                        newImagesQueue: v.newImagesQueue.filter((i) => i.id !== fileId),
                    };
                }
                return v;
            })
        );
    };

    // Save cropped file back into the queue
    const handleCropSave = (index, croppedBlob) => {
        // Handle argument mismatch: check if the first argument is the Blob
        let actualBlob = croppedBlob;
        if (index instanceof Blob) {
            actualBlob = index;
        }

        if (!actualBlob) return;
        if (!activeCropInfo) return;
        const { vIndex, fileIndex } = activeCropInfo;

        setLocalVariants((prev) =>
            prev.map((v, idx) => {
                if (idx === vIndex) {
                    const updatedQueue = v.newImagesQueue.map((item, fIdx) => {
                        if (fIdx === fileIndex) {
                            if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                            
                            // Convert Blob to File object to preserve name and extension for backend upload
                            const nameWithoutExt = item.file.name.substring(0, item.file.name.lastIndexOf('.'));
                            const extension = item.file.type === 'image/webp' ? '.webp' : '.jpg';
                            const croppedFile = new File([actualBlob], `${nameWithoutExt}-cropped${extension}`, {
                                type: item.file.type,
                                lastModified: Date.now(),
                            });

                            return {
                                ...item,
                                croppedBlob: croppedFile,
                                previewUrl: URL.createObjectURL(croppedFile),
                            };
                        }
                        return item;
                    });
                    return { ...v, newImagesQueue: updatedQueue };
                }
                return v;
            })
        );
        setActiveCropInfo(null);
    };

    // Delete uploaded image from variant locally (deferred until form submission)
    const handleDeleteImage = (vIndex, imageId) => {
        setLocalVariants((prev) =>
            prev.map((v, idx) => {
                if (idx === vIndex) {
                    const imageToDelete = v.images.find((img) => img.id === imageId);
                    const updatedDeletedIds = Array.from(new Set([...(v.deletedImageIds || []), imageId]));
                    let updatedImages = v.images.filter((img) => img.id !== imageId);

                    // Reassign primary image locally if deleted image was primary
                    if (imageToDelete && imageToDelete.is_primary && updatedImages.length > 0) {
                        updatedImages = updatedImages.map((img, i) => (i === 0 ? { ...img, is_primary: true } : img));
                    }

                    return {
                        ...v,
                        images: updatedImages,
                        deletedImageIds: updatedDeletedIds,
                        errors: { ...v.errors, images: null },
                    };
                }
                return v;
            })
        );
    };

    // Set uploaded image as primary immediately
    const handleSetPrimaryImage = async (vIndex, imageId, variantId) => {
        if (String(variantId).startsWith('draft-')) return;

        const result = await dispatch(setVariantPrimaryImageAsync({ variantId, imageId }));
        if (setVariantPrimaryImageAsync.fulfilled.match(result)) {
            toast.success('Primary image updated.');
            setLocalVariants((prev) =>
                prev.map((v, idx) => {
                    if (idx === vIndex) {
                        return {
                            ...v,
                            images: v.images.map((img) => ({
                                ...img,
                                is_primary: img.id === imageId,
                            })),
                        };
                    }
                    return v;
                })
            );
        }
    };

    // Perform client-side validations for all variant cards
    const validateVariantsData = () => {
        let hasErrors = false;
        const updated = localVariants.map((v) => {
            const errs = {};

            if (!v.variant_name.trim()) {
                errs.variant_name = 'Variant name is required.';
                hasErrors = true;
            }

            if (!v.sku.trim()) {
                errs.sku = 'SKU is required.';
                hasErrors = true;
            }

            if (v.price === '' || isNaN(Number(v.price)) || Number(v.price) <= 0) {
                errs.price = 'Price must be greater than 0.';
                hasErrors = true;
            }

            if (v.sale_price !== '' && v.sale_price !== null && !isNaN(Number(v.sale_price))) {
                if (Number(v.sale_price) > Number(v.price)) {
                    errs.sale_price = 'Sale price cannot be greater than original price.';
                    hasErrors = true;
                }
                if (Number(v.sale_price) <= 0) {
                    errs.sale_price = 'Sale price must be greater than 0.';
                    hasErrors = true;
                }
            }

            if (v.stock_quantity === '' || isNaN(Number(v.stock_quantity)) || Number(v.stock_quantity) < 0) {
                errs.stock_quantity = 'Stock cannot be negative.';
                hasErrors = true;
            }

            if (v.display_order === '' || isNaN(Number(v.display_order)) || Number(v.display_order) <= 0) {
                errs.display_order = 'Display order must be 1 or greater.';
                hasErrors = true;
            }

            // A newly created/existing variant must have between 3 and 10 images total
            const totalImages = v.images.length + v.newImagesQueue.length;
            if (totalImages < 3) {
                errs.images = 'At least 3 images are required for every variant.';
                hasErrors = true;
            }
            if (totalImages > 10) {
                errs.images = 'A maximum of 10 images are allowed per variant.';
                hasErrors = true;
            }

            return { ...v, errors: errs };
        });

        if (hasErrors) {
            // Find first card with errors and expand it
            const errIndex = updated.findIndex((v) => Object.keys(v.errors).length > 0);
            const finalVariants = updated.map((v, idx) => ({
                ...v,
                expanded: idx === errIndex ? true : v.expanded,
            }));
            setLocalVariants(finalVariants);
            toast.error('Please correct the validation errors in the product variant cards.');
            return false;
        }

        return true;
    };

    // Submits the main product form and the details of all variant cards
    const handleFormSubmit = (productFormData) => {
        // Enforce variants validation
        if (localVariants.length === 0) {
            toast.warning('Please add at least one variant for this product.');
            return;
        }

        const isValid = validateVariantsData();
        if (!isValid) return;

        // Propagate product details and the local variants array (which contains queued files)
        onSubmit(productFormData, localVariants);
    };

    return (
        <>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="product-form-el unified-product-workflow-form">
            <div className="product-info-fields-section">
                <h4 className="section-title-label">Product Catalog Entry</h4>
                <div className="form-fields-grid-layout">
                    {/* Name Field */}
                    <div className="form-group-field">
                        <label htmlFor="name" className="form-label-el">
                            Product Name <span className="label-required">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter product name (e.g., Robot Toy)"
                            className={`form-input-el ${errors.name ? 'input-error' : ''}`}
                            disabled={isLoading || isReadOnly}
                            {...register('name')}
                        />
                        {errors.name && <p className="form-field-error">{errors.name.message}</p>}
                    </div>

                    {/* Category Field */}
                    <div className="form-group-field">
                        <label htmlFor="category" className="form-label-el">
                            Category <span className="label-required">*</span>
                        </label>
                        <select
                            id="category"
                            className={`form-select-el ${errors.category ? 'input-error' : ''}`}
                            disabled={isLoading || isReadOnly}
                            {...register('category')}
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="form-field-error">{errors.category.message}</p>}
                    </div>

                    {/* Brand Field */}
                    <div className="form-group-field">
                        <label htmlFor="brand" className="form-label-el">
                            Brand
                        </label>
                        <input
                            id="brand"
                            type="text"
                            placeholder="Enter brand name (e.g., Lego)"
                            className={`form-input-el ${errors.brand ? 'input-error' : ''}`}
                            disabled={isLoading || isReadOnly}
                            {...register('brand')}
                        />
                        {errors.brand && <p className="form-field-error">{errors.brand.message}</p>}
                    </div>
                </div>

                {/* Description Field */}
                <div className="form-group-field text-area-row">
                    <label htmlFor="description" className="form-label-el">
                        Description <span className="label-required">*</span>
                    </label>
                    <textarea
                        id="description"
                        placeholder="Describe this product catalog entry..."
                        rows={3}
                        className={`form-textarea-el ${errors.description ? 'input-error' : ''}`}
                        disabled={isLoading || isReadOnly}
                        {...register('description')}
                    />
                    {errors.description && (
                        <p className="form-field-error">{errors.description.message}</p>
                    )}
                </div>
            </div>

            {/* Expandable Variants Section */}
            <div className="product-form-variants-section-block">
                <div className="variants-section-header-el">
                    <div className="variants-section-title-wrapper">
                        <h4 className="section-title-label">Product Variants</h4>
                        <span className="info-helper-tooltip" title="Every variant requires 3-10 product images. Price, Sale Price, and Stock will be validated before saving.">
                            <HelpCircle size={14} />
                        </span>
                    </div>
                    {!isReadOnly && (
                        <button
                            type="button"
                            onClick={handleAddVariantDraft}
                            disabled={isLoading}
                            className="btn-add-variant-draft-el"
                        >
                            <Plus size={15} /> Add Variant Card
                        </button>
                    )}
                </div>

                {loadingVariants && localVariants.length === 0 ? (
                    <div className="variants-fetching-loader">
                        <Loader size={20} className="spinner-icon-anim" />
                        <span>Loading variant list...</span>
                    </div>
                ) : localVariants.length === 0 ? (
                    <div className="variants-empty-state-card">
                        <p className="empty-text">No variants added to this product form yet.</p>
                        <button
                            type="button"
                            onClick={handleAddVariantDraft}
                            disabled={isLoading}
                            className="btn-add-variant-empty-state"
                        >
                            Create First Variant Card
                        </button>
                    </div>
                ) : (
                    <div className="expandable-variants-cards-stack">
                        {localVariants.map((v, vIndex) => {
                            const hasCardErrors = v.errors && Object.keys(v.errors).length > 0;
                            return (
                                <div
                                    key={v.id}
                                    className={`variant-expandable-card-item ${v.expanded ? 'is-expanded' : ''} ${v.blocked ? 'is-blocked' : ''} ${hasCardErrors ? 'has-validation-errors' : ''}`}
                                >
                                    {/* Card Header Toggler */}
                                    <div
                                        className="variant-card-header-bar"
                                        onClick={() => toggleCardExpansion(vIndex)}
                                    >
                                        <div className="variant-header-info-box">
                                            <span className="v-card-chevron-indicator">
                                                <ChevronDown size={16} />
                                            </span>
                                            <span className="v-card-name-title">
                                                {v.variant_name || <em className="untitled-text-dim">Untitled Variant Card</em>}
                                            </span>
                                            {v.sku && <span className="v-card-sku-badge">{v.sku}</span>}
                                        </div>
                                        <div className="variant-header-actions-box" onClick={(e) => e.stopPropagation()}>
                                            {v.blocked && <span className="badge-status-v blocked">Blocked</span>}
                                            {!v.is_active && <span className="badge-status-v inactive">Inactive</span>}
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariant(vIndex, v.id, v.variant_name, v.sku)}
                                                    className="btn-delete-card-v"
                                                    title="Delete Variant Card"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Content Panel */}
                                    {v.expanded && (
                                        <div className="variant-card-expanded-content">
                                            <div className="variant-inputs-grid-layout">
                                                {/* Variant Name */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">
                                                        Variant Name <span className="label-required">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={v.variant_name}
                                                        onChange={(e) => updateVariantField(vIndex, 'variant_name', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. Cherry Red Edition"
                                                        className={`form-input-el ${v.errors?.variant_name ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.variant_name && <p className="form-field-error">{v.errors.variant_name}</p>}
                                                </div>

                                                {/* SKU */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">
                                                        SKU <span className="label-required">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={v.sku}
                                                        onChange={(e) => updateVariantField(vIndex, 'sku', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. TOY-RED-01"
                                                        className={`form-input-el ${v.errors?.sku ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.sku && <p className="form-field-error">{v.errors.sku}</p>}
                                                </div>

                                                {/* Original Price */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">
                                                        Original Price <span className="label-required">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.price}
                                                        onChange={(e) => updateVariantField(vIndex, 'price', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. 29.99"
                                                        className={`form-input-el ${v.errors?.price ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.price && <p className="form-field-error">{v.errors.price}</p>}
                                                </div>

                                                {/* Sale Price */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">Sale Price (Optional)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={v.sale_price}
                                                        onChange={(e) => updateVariantField(vIndex, 'sale_price', e.target.value)}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. 19.99"
                                                        className={`form-input-el ${v.errors?.sale_price ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.sale_price && <p className="form-field-error">{v.errors.sale_price}</p>}
                                                </div>

                                                {/* Stock */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">
                                                        Stock Quantity <span className="label-required">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={v.stock_quantity}
                                                        onChange={(e) => updateVariantField(vIndex, 'stock_quantity', Number(e.target.value))}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. 50"
                                                        className={`form-input-el ${v.errors?.stock_quantity ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.stock_quantity && <p className="form-field-error">{v.errors.stock_quantity}</p>}
                                                </div>

                                                {/* Display Order */}
                                                <div className="form-group-field">
                                                    <label className="form-label-el">
                                                        Display Order <span className="label-required">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={v.display_order}
                                                        onChange={(e) => updateVariantField(vIndex, 'display_order', Number(e.target.value))}
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. 1"
                                                        className={`form-input-el ${v.errors?.display_order ? 'input-error' : ''}`}
                                                    />
                                                    {v.errors?.display_order && <p className="form-field-error">{v.errors.display_order}</p>}
                                                </div>
                                            </div>

                                            {/* Block / Active Controls */}
                                            {!isReadOnly && (
                                                <div className="variant-status-toggles-row">
                                                    <label className="toggle-switch-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={v.is_active}
                                                            onChange={(e) => updateVariantField(vIndex, 'is_active', e.target.checked)}
                                                        />
                                                        <span className="toggle-label-text">Variant Active</span>
                                                    </label>

                                                    <label className="toggle-switch-container">
                                                        <input
                                                            type="checkbox"
                                                            checked={v.blocked}
                                                            onChange={(e) => updateVariantField(vIndex, 'blocked', e.target.checked)}
                                                        />
                                                        <span className="toggle-label-text">Variant Blocked</span>
                                                    </label>
                                                </div>
                                            )}

                                            {/* Image upload gallery workspace */}
                                            <div className="variant-inline-images-workspace">
                                                {v.errors?.images && (
                                                    <div className="images-error-banner-el">
                                                        {v.errors.images}
                                                    </div>
                                                )}

                                                {/* Existing Gallery */}
                                                {v.images && v.images.length > 0 && (
                                                    <div className="v-inline-images-gallery">
                                                        <ImageGallery
                                                            images={v.images}
                                                            onDelete={(imgId) => handleDeleteImage(vIndex, imgId, v.id)}
                                                            onSetPrimary={(imgId) => handleSetPrimaryImage(vIndex, imgId, v.id)}
                                                            disabled={isReadOnly}
                                                        />
                                                    </div>
                                                )}

                                                {/* Local Files Dropzone Selector (Add/Edit) */}
                                                {!isReadOnly && (
                                                    <div className="v-inline-images-uploader">
                                                        <ImageUploader
                                                            variantId={v.id && !String(v.id).startsWith('draft-') ? v.id : null}
                                                            existingImagesCount={v.images.length}
                                                            hideUploadButton={true}
                                                            queueController={{
                                                                queue: v.newImagesQueue,
                                                                uploading: false,
                                                                overallProgress: 0,
                                                                activeCropIndex: activeCropInfo && activeCropInfo.vIndex === vIndex ? activeCropInfo.fileIndex : null,
                                                                handleFilesAdded: (files) => handleFilesAddedForVariant(vIndex, files),
                                                                removeFile: (fileId) => handleRemoveQueuedFile(vIndex, fileId),
                                                                openCropper: (fileIndex) => setActiveCropInfo({ vIndex, fileIndex }),
                                                                closeCropper: () => setActiveCropInfo(null),
                                                                saveCroppedImage: handleCropSave,
                                                                uploadImages: () => {},
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="form-actions-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="btn-form-cancel"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-form-submit"
                >
                    {isLoading ? (
                        <span className="btn-loading-flex">
                            <Loader size={16} className="spinner-icon-anim" />
                            Saving Product Workflow...
                        </span>
                    ) : product ? (
                        'Save Changes'
                    ) : (
                        'Add Product'
                    )}
                </button>
            </div>
        </form>

        {/* Custom Delete Variant Modal */}
        <DeleteVariantModal
            isOpen={!!variantToDelete}
            onClose={() => setVariantToDelete(null)}
            onConfirm={handleConfirmDeleteVariant}
            variant={variantToDelete}
            isLoading={isDeletingVariant}
        />
        </>
    );
}

export default ProductForm;
