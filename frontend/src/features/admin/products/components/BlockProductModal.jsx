import React from 'react';
import { ShieldAlert, Loader } from 'lucide-react';

/**
 * Block/Unblock confirmation dialog modal.
 */
export function BlockProductModal({
    isOpen,
    onClose,
    onConfirm,
    product,
    isLoading = false,
}) {
    if (!isOpen || !product) return null;

    const isBlocking = !product.blocked;

    return (
        <div className="product-modal-backdrop-overlay">
            <div className="product-confirm-dialog-card animate-scale-in">
                {/* Shield Alert Icon Banner */}
                <div className={`confirm-dialog-icon-container ${isBlocking ? 'bg-warning-light text-warning' : 'bg-success-light text-success'}`}>
                    <ShieldAlert size={32} />
                </div>

                {/* Content */}
                <h3 className="confirm-dialog-title">
                    {isBlocking ? 'Block Product?' : 'Unblock Product?'}
                </h3>
                <p className="confirm-dialog-message">
                    {isBlocking ? (
                        <>
                            Are you sure you want to block <strong>{product.name}</strong>?
                            Blocking this product will hide all its listings and variants from customer views.
                        </>
                    ) : (
                        <>
                            Are you sure you want to unblock <strong>{product.name}</strong>?
                            This will restore the product and its active variants back to customer pages.
                        </>
                    )}
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
                        className={`btn-dialog-confirm ${isBlocking ? 'btn-dialog-warning' : 'btn-dialog-success'}`}
                    >
                        {isLoading ? (
                            <span className="btn-loading-flex">
                                <Loader size={16} className="spinner-icon-anim" />
                                Saving...
                            </span>
                        ) : isBlocking ? (
                            'Yes, Block'
                        ) : (
                            'Yes, Unblock'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlockProductModal;
