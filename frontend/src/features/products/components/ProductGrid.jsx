import React from 'react';
import ProductCard from './ProductCard';

/**
 * Responsive grid displaying lists of ProductCard elements.
 */
export function ProductGrid({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="customer-catalog-grid">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}

export default ProductGrid;
