import React from 'react';
import ProductSearch from './ProductSearch';

/**
 * Toolbar container wrapping the search bar.
 */
export function ProductToolbar() {
    return (
        <div className="product-toolbar-container">
            <ProductSearch />
        </div>
    );
}

export default ProductToolbar;
