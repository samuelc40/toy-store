import React from 'react';
import { X } from 'lucide-react';
import ProductForm from './ProductForm';
import ProductDetailsView from './ProductDetailsView';

/**
 * Centered modal overlay that coordinates Product details and unified editing workflows.
 */
export function ProductModal({
    isOpen,
    onClose,
    onSubmit,
    product,
    categories,
    isLoading = false,
    isReadOnly = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="product-modal-backdrop-overlay">
            <div className="product-modal-card-container modal-width-wide">
                {/* Modal Header */}
                <div className="product-modal-header-el">
                    <h3 className="product-modal-title">
                        {isReadOnly ? 'Product Details' : product ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="product-modal-close-btn"
                        title="Close Modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="product-modal-body-el">
                    {isReadOnly ? (
                        <ProductDetailsView
                            product={product}
                            categories={categories}
                            onClose={onClose}
                        />
                    ) : (
                        <ProductForm
                            product={product}
                            categories={categories}
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isLoading={isLoading}
                            isReadOnly={isReadOnly}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductModal;
