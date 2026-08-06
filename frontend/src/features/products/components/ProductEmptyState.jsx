import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

/**
 * Beautiful empty state for products search misses.
 */
export function ProductEmptyState({ onClearFilters }) {
    return (
        <div className="catalog-empty-state-container">
            <div className="empty-state-illustration-box">
                <SearchX size={48} className="empty-state-search-icon-symbol" />
            </div>
            <h3 className="empty-state-title-text">No products found</h3>
            <p className="empty-state-description-text">
                We couldn't find any premium collectible toys matching your search or filter parameters.
            </p>
            <button
                type="button"
                onClick={onClearFilters}
                className="btn-empty-state-reset-filters"
            >
                <RotateCcw size={14} />
                <span>Clear Filters</span>
            </button>
        </div>
    );
}

export default ProductEmptyState;
