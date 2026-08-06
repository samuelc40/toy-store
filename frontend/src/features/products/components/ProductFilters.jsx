import React from 'react';
import { RotateCcw } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import BrandFilter from './BrandFilter';
import useFilters from '../hooks/useFilters';

/**
 * Sticky filters sidebar displaying category, brand, and price boundaries.
 */
export function ProductFilters({ activeFilters, onFilterChange, onClearAll }) {
    const { categories, brands } = useFilters();

    const hasActiveFilters =
        activeFilters.category ||
        activeFilters.brand ||
        activeFilters.minPrice ||
        activeFilters.maxPrice;

    return (
        <aside className="catalog-filters-sidebar-container">
            <div className="filters-sidebar-header-box">
                <h4 className="filters-main-heading">Filters</h4>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="btn-clear-all-active-filters"
                    >
                        <RotateCcw size={12} />
                        <span>Clear All</span>
                    </button>
                )}
            </div>

            <div className="filters-sidebar-scroller">
                <CategoryFilter
                    categories={categories}
                    activeCategory={activeFilters.category}
                    onChange={(val) => onFilterChange('category', val)}
                />

                <PriceFilter
                    minPrice={activeFilters.minPrice}
                    maxPrice={activeFilters.maxPrice}
                    onChange={onFilterChange}
                />

                <BrandFilter
                    brands={brands}
                    activeBrand={activeFilters.brand}
                    onChange={(val) => onFilterChange('brand', val)}
                />
            </div>
        </aside>
    );
}

export default ProductFilters;
