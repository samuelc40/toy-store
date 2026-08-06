import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import SearchBar from './SearchBar';
import ProductSorting from './ProductSorting';

/**
 * Grid-aligned toolbar supporting quick searches, product counts, sorting, and mobile filters sheet toggles.
 */
export function ProductToolbar({
    search,
    onSearchChange,
    sort,
    onSortChange,
    totalCount,
    startIndex,
    endIndex,
    loading,
    onOpenMobileFilters
}) {
    return (
        <div className="catalog-toolbar-container">
            {/* Search (Left) */}
            <div className="toolbar-left-block">
                <SearchBar
                    value={search}
                    onChange={onSearchChange}
                    loading={loading}
                />
            </div>

            {/* Results Count (Center) */}
            <div className="toolbar-center-block">
                <p className="toolbar-results-count-text">
                    {totalCount > 0 ? (
                        <>
                            Showing <span className="count-bold">{startIndex}–{endIndex}</span> of <span className="count-bold">{totalCount}</span> Products
                        </>
                    ) : (
                        '0 Products'
                    )}
                </p>
            </div>

            {/* Sort & Mobile Filters (Right) */}
            <div className="toolbar-right-block">
                <button
                    type="button"
                    onClick={onOpenMobileFilters}
                    className="btn-mobile-filters-drawer-trigger"
                >
                    <SlidersHorizontal size={14} />
                    <span>Filters</span>
                </button>

                <div className="desktop-sorting-block">
                    <ProductSorting
                        value={sort}
                        onChange={onSortChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default ProductToolbar;
