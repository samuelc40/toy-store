import React from 'react';
import { X } from 'lucide-react';
import ProductFilters from './ProductFilters';

/**
 * Slide-over overlay sheet for mobile category/brand/price filtering.
 */
export function FilterDrawer({ isOpen, onClose, activeFilters, onFilterChange, onClearAll }) {
    if (!isOpen) return null;

    return (
        <div className="mobile-filter-drawer-backdrop" onClick={onClose}>
            <div className="mobile-filter-drawer-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-filter-drawer-header">
                    <h3 className="mobile-filter-drawer-title">Filter Options</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-close-mobile-filter-drawer"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="mobile-filter-drawer-content-box">
                    <ProductFilters
                        activeFilters={activeFilters}
                        onFilterChange={onFilterChange}
                        onClearAll={onClearAll}
                    />
                </div>
            </div>
        </div>
    );
}

export default FilterDrawer;
