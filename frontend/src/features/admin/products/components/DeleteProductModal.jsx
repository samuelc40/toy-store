import React from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

/**
 * Delete confirmation dialog modal.
 */
export function DeleteProductModal({
    isOpen,
    onClose,
    onConfirm,
    product,
    isLoading = false,
}) {
    if (!isOpen || !product) return null;

    return (
        <div className="product-modal-backdrop-overlay modal-backdrop-danger">
            <div className="product-confirm-dialog-card animate-scale-in">
                {/* Warning Icon Banner */}
                <div className="confirm-dialog-icon-container bg-danger-light text-danger">
                    <AlertTriangle size={32} />
                </div>

                {/* Content */}
                <h3 className="confirm-dialog-title">Delete Product?</h3>
                <p className="confirm-dialog-message">
                    Are you sure you want to delete <strong>{product.name}</strong>? This action
                    performs a <strong>soft delete</strong>. The product will be marked as inactive
                    in the store directory, but its records remain archived.
                </p>

                {/* Footer Buttons */}
                <div className="confirm-dialog-actions-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="btn-dialog-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn-dialog-confirm btn-dialog-danger"
                    >
                        {isLoading ? (
                            <span className="btn-loading-flex">
                                <Loader size={16} className="spinner-icon-anim" />
                                Deleting...
                            </span>
                        ) : (
                            'Yes, Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteProductModal;
