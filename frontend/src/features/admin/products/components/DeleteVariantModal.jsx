import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Loader } from 'lucide-react';

/**
 * Delete confirmation dialog modal for product variants.
 */
export function DeleteVariantModal({
    isOpen,
    onClose,
    onConfirm,
    variant,
    isLoading = false,
}) {
    if (!isOpen || !variant) return null;

    return createPortal(
        <div className="variant-modal-backdrop-overlay variant-backdrop-danger">
            <div className="variant-confirm-dialog-card animate-scale-in">
                {/* Warning Icon Banner */}
                <div className="v-confirm-dialog-icon-container bg-danger-light text-danger">
                    <AlertTriangle size={28} />
                </div>

                {/* Content */}
                <h3 className="v-confirm-dialog-title">Delete Variant?</h3>
                <p className="v-confirm-dialog-message">
                    Are you sure you want to delete variant <strong>{variant.variant_name}</strong> (SKU: <em>{variant.sku}</em>)? 
                    This perform a <strong>soft delete</strong>. The variant will be hidden from customer catalogs, but its inventory record is archived.
                </p>

                {/* Footer Buttons */}
                <div className="v-confirm-dialog-actions-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="btn-v-dialog-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn-v-dialog-confirm btn-v-dialog-danger"
                    >
                        {isLoading ? (
                            <span className="v-btn-loading">
                                <Loader size={14} className="v-spinner-anim" />
                                Deleting...
                            </span>
                        ) : (
                            'Yes, Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default DeleteVariantModal;
