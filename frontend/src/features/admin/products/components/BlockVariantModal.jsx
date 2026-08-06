import React from 'react';
import { ShieldAlert, Loader } from 'lucide-react';

/**
 * Block/Unblock confirmation dialog modal for product variants.
 */
export function BlockVariantModal({
    isOpen,
    onClose,
    onConfirm,
    variant,
    isLoading = false,
}) {
    if (!isOpen || !variant) return null;

    const isBlocking = !variant.blocked;

    return (
        <div className="variant-modal-backdrop-overlay">
            <div className="variant-confirm-dialog-card animate-scale-in">
                {/* Shield Alert Icon Banner */}
                <div className={`v-confirm-dialog-icon-container ${isBlocking ? 'bg-warning-light text-warning' : 'bg-success-light text-success'}`}>
                    <ShieldAlert size={28} />
                </div>

                {/* Content */}
                <h3 className="v-confirm-dialog-title">
                    {isBlocking ? 'Block Variant?' : 'Unblock Variant?'}
                </h3>
                <p className="v-confirm-dialog-message">
                    {isBlocking ? (
                        <>
                            Are you sure you want to block variant <strong>{variant.variant_name}</strong> (SKU: <em>{variant.sku}</em>)? 
                            Customers will not be able to purchase or view this specific variant selection.
                        </>
                    ) : (
                        <>
                            Are you sure you want to unblock variant <strong>{variant.variant_name}</strong> (SKU: <em>{variant.sku}</em>)? 
                            This restores item visibility and purchasing in the shop interface.
                        </>
                    )}
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
                        className={`btn-v-dialog-confirm ${isBlocking ? 'btn-v-dialog-warning' : 'btn-v-dialog-success'}`}
                    >
                        {isLoading ? (
                            <span className="v-btn-loading">
                                <Loader size={14} className="v-spinner-anim" />
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

export default BlockVariantModal;
