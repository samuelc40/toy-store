import React from 'react';
import { ShoppingBag } from 'lucide-react';

/**
 * Renders the product image using helper resolution, falling back to a custom placeholder.
 */
export function ProductImage({ product }) {
    const imageUrl = product.primary_image;

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={product.name}
                className="product-card-img-element"
                loading="lazy"
            />
        );
    }

    return (
        <div className="product-card-placeholder-wrapper">
            <ShoppingBag size={28} className="placeholder-icon-element" />
        </div>
    );
}

export default ProductImage;
