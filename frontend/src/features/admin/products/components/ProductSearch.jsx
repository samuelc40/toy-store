import React from 'react';
import { Search, X } from 'lucide-react';
import useProductSearch from '../hooks/useProductSearch';

/**
 * Product Search component containing the text input and clear trigger.
 */
export function ProductSearch() {
    const { searchTerm, handleSearchChange, handleClear } = useProductSearch(300);

    return (
        <div className="product-search-wrapper">
            <Search size={18} className="product-search-icon" />
            <input
                type="text"
                placeholder="Search by name, brand, or category..."
                value={searchTerm || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="product-search-input"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="product-search-clear-btn"
                    title="Clear Search"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
}

export default ProductSearch;
