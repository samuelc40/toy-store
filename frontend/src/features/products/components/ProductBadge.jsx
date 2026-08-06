import React from 'react';

/**
 * Renders badges for discounts and stock alert statuses.
 */
export function ProductBadge({ product, type }) {
    if (type === 'discount') {
        if (!product.has_offer || !product.discount_percentage) return null;
        return (
            <span className="product-card-badge-el discount-badge">
                {Math.round(product.discount_percentage)}% OFF
            </span>
        );
    }

    if (type === 'stock') {
        const { total_stock, is_in_stock } = product;

        if (is_in_stock === false || total_stock === 0) {
            return <span className="product-card-badge-el stock-badge out-of-stock">Out of Stock</span>;
        }
        if (total_stock > 0 && total_stock <= 10) {
            return <span className="product-card-badge-el stock-badge low-stock">Only {total_stock} Left</span>;
        }
    }

    return null;
}

export default ProductBadge;
