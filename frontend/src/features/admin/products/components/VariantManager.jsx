import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

import {
    getVariantsAsync,
    createVariantAsync,
    updateVariantAsync,
    deleteVariantAsync,
    toggleBlockVariantAsync,
    uploadVariantImagesAsync,
    setSelectedVariant,
    clearVariantError,
    clearVariantsState,
    selectVariants,
    selectSelectedVariant,
    selectVariantsLoading,
    selectVariantsCreating,
    selectVariantsUpdating,
    selectVariantsDeleting,
    selectVariantsBlocking,
    selectVariantsError,
} from '../redux/variantSlice';

import VariantTable from './VariantTable';
import VariantModal from './VariantModal';
import DeleteVariantModal from './DeleteVariantModal';
import BlockVariantModal from './BlockVariantModal';

import '../styles/VariantManagement.css';

/**
 * Controller component for Variant Management, embedded in ProductModal.
 */
export function VariantManager({ product, isReadOnly = false }) {
    const dispatch = useDispatch();

    // Redux selectors
    const variants = useSelector(selectVariants);
    const selectedVariant = useSelector(selectSelectedVariant);
    const loading = useSelector(selectVariantsLoading);
    const creating = useSelector(selectVariantsCreating);
    const updating = useSelector(selectVariantsUpdating);
    const deleting = useSelector(selectVariantsDeleting);
    const blocking = useSelector(selectVariantsBlocking);
    const error = useSelector(selectVariantsError);

    // Local states
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [backendErrors, setBackendErrors] = useState(null);

    // Load product variants when product ID changes
    useEffect(() => {
        if (product && product.id) {
            dispatch(getVariantsAsync(product.id));
        }
        return () => {
            dispatch(clearVariantsState());
        };
    }, [dispatch, product]);

    // Handle API errors
    useEffect(() => {
        if (error) {
            if (typeof error === 'string') {
                toast.error(error);
                dispatch(clearVariantError());
            } else if (typeof error === 'object') {
                // If they are field validation errors (like SKU duplicate)
                setBackendErrors(error);
                // Keep the error in state for the form, but clear it from Redux
                dispatch(clearVariantError());
            }
        }
    }, [error, dispatch]);

    // Add Variant triggers
    const handleAddClick = () => {
        setBackendErrors(null);
        dispatch(setSelectedVariant(null));
        setFormModalOpen(true);
    };

    // Edit Variant triggers
    const handleEditClick = (variant) => {
        setBackendErrors(null);
        dispatch(setSelectedVariant(variant));
        setFormModalOpen(true);
    };

    // Submit save/edit
    const handleSaveSubmit = async (formData, files = []) => {
        setBackendErrors(null);
        if (selectedVariant) {
            // Edit existing variant
            const resultAction = await dispatch(
                updateVariantAsync({ id: selectedVariant.id, variantData: formData })
            );
            if (updateVariantAsync.fulfilled.match(resultAction)) {
                toast.success('Variant updated successfully.');
                setFormModalOpen(false);
                dispatch(getVariantsAsync(product.id));
            }
        } else {
            // Create new variant
            const resultAction = await dispatch(
                createVariantAsync({ productId: product.id, variantData: formData })
            );
            if (createVariantAsync.fulfilled.match(resultAction)) {
                const newVariantId = resultAction.payload.id;

                if (files.length > 0) {
                    const uploadResult = await dispatch(
                        uploadVariantImagesAsync({ variantId: newVariantId, files })
                    );
                    if (uploadVariantImagesAsync.fulfilled.match(uploadResult)) {
                        toast.success('Variant created and images uploaded successfully.');
                    } else {
                        toast.error('Variant created, but image upload failed.');
                    }
                } else {
                    toast.success('Variant created successfully.');
                }

                setFormModalOpen(false);
                dispatch(getVariantsAsync(product.id));
            }
        }
    };

    // Delete triggers
    const handleDeleteClick = (variant) => {
        dispatch(setSelectedVariant(variant));
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedVariant) return;
        const resultAction = await dispatch(deleteVariantAsync(selectedVariant.id));
        if (deleteVariantAsync.fulfilled.match(resultAction)) {
            toast.success('Variant deleted successfully (soft deleted).');
            setDeleteModalOpen(false);
            dispatch(getVariantsAsync(product.id));
        }
    };

    // Block triggers
    const handleBlockClick = (variant) => {
        dispatch(setSelectedVariant(variant));
        setBlockModalOpen(true);
    };

    const handleConfirmBlock = async () => {
        if (!selectedVariant) return;
        const resultAction = await dispatch(toggleBlockVariantAsync(selectedVariant.id));
        if (toggleBlockVariantAsync.fulfilled.match(resultAction)) {
            const blocked = resultAction.payload.blocked;
            toast.success(
                blocked
                    ? 'Variant blocked successfully.'
                    : 'Variant unblocked successfully.'
            );
            setBlockModalOpen(false);
            dispatch(getVariantsAsync(product.id));
        }
    };

    const activeVariants = variants.filter(v => v.is_active !== false);

    return (
        <div className="variant-manager-card">
            {/* Header section */}
            <div className="variant-manager-header">
                <div className="variant-manager-title-group">
                    <h4>Variants</h4>
                    <p className="variant-manager-subtitle">
                        Manage different options (size, color) and stock details.
                    </p>
                </div>
                {!isReadOnly && (
                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="btn-v-add"
                        disabled={loading}
                    >
                        <Plus size={14} /> Add Variant
                    </button>
                )}
            </div>

            {/* Table */}
            <VariantTable
                variants={activeVariants}
                loading={loading}
                onEdit={handleEditClick}
                onBlock={handleBlockClick}
                onDelete={handleDeleteClick}
                disabled={creating || updating || deleting || blocking || isReadOnly}
            />

            {/* Modals */}
            <VariantModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSaveSubmit}
                variant={selectedVariant}
                isLoading={creating || updating}
                backendErrors={backendErrors}
            />

            <DeleteVariantModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                variant={selectedVariant}
                isLoading={deleting}
            />

            <BlockVariantModal
                isOpen={blockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                onConfirm={handleConfirmBlock}
                variant={selectedVariant}
                isLoading={blocking}
            />
        </div>
    );
}

export default VariantManager;
