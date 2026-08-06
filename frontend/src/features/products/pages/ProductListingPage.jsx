import React, { useState } from 'react';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import ProductToolbar from '../components/ProductToolbar';
import ProductPagination from '../components/ProductPagination';
import ProductEmptyState from '../components/ProductEmptyState';
import { ProductGridSkeleton } from '../components/ProductSkeleton';
import FilterDrawer from '../components/FilterDrawer';

// Import CSS styles
import '../styles/ProductListing.css';

/**
 * Main Customer-Facing Product Listing / Shopping Page.
 * Placed between the global header and footer, this page renders a premium Hero Banner,
 * a toolbar, a product grid, a sidebar for desktop filters, and an overlay drawer for mobile filters.
 */
export function ProductListingPage() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const {
        products,
        loading,
        error,
        search,
        sort,
        page,
        totalPages,
        totalCount,
        startIndex,
        endIndex,
        filters,

        // Handlers
        handlePageChange,
        handleFilterChange,
        handleSortChange,
        handleSearchChange,
        handleClearAllFilters,
        retryFetch
    } = useProducts();

    const handleRetry = () => {
        retryFetch();
    };

    const isInitialLoading = loading && products.length === 0;
    const isBackgroundUpdating = loading && products.length > 0;

    return (
        <div className="catalog-page-outer-container">
            {/* 1. Hero Banner Section */}
            <section className="catalog-hero-banner-section">
                <div className="hero-banner-glassmorphic-card">
                    <div className="hero-badge-container">
                        <Sparkles size={14} className="hero-badge-sparkle-icon" />
                        <span>Premium Collectibles Archive</span>
                    </div>
                    <h1 className="hero-main-title">
                        Discover Rare &amp; Limited Edition Toys
                    </h1>
                    <p className="hero-sub-description">
                        Curated selections from leading makers, built with details for dedicated collectors.
                    </p>
                </div>
                <div className="hero-background-gradient-circle" />
            </section>

            {/* 2. Controls Toolbar Section */}
            <section className="catalog-toolbar-section">
                <ProductToolbar
                    search={search}
                    onSearchChange={handleSearchChange}
                    sort={sort}
                    onSortChange={handleSortChange}
                    totalCount={totalCount}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    loading={loading}
                    onOpenMobileFilters={() => setMobileFiltersOpen(true)}
                />
            </section>

            {/* 3. Catalog Main Layout Block */}
            <div className="catalog-content-main-layout">
                {/* Desktop Filters Sidebar */}
                <div className="desktop-filters-sidebar-area">
                    <ProductFilters
                        activeFilters={filters}
                        onFilterChange={handleFilterChange}
                        onClearAll={handleClearAllFilters}
                    />
                </div>

                {/* Products Grid & Results Area */}
                <main className="catalog-products-results-container">
                    {isInitialLoading ? (
                        <ProductGridSkeleton count={8} />
                    ) : error && products.length === 0 ? (
                        <div className="catalog-error-state-box">
                            <AlertTriangle size={36} className="error-alert-icon" />
                            <h3 className="error-state-title">Unable to load catalog</h3>
                            <p className="error-state-message">{error}</p>
                            <button
                                type="button"
                                onClick={handleRetry}
                                className="btn-retry-catalog-fetch"
                            >
                                <RefreshCw size={14} />
                                <span>Try Again</span>
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <ProductEmptyState onClearFilters={handleClearAllFilters} />
                    ) : (
                        <div className={`catalog-results-grid-wrapper ${isBackgroundUpdating ? 'catalog-results-updating' : ''}`}>
                            <ProductGrid products={products} />

                            {/* 4. Pagination Section */}
                            <div className="catalog-pagination-row">
                                <ProductPagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Filters Drawer Overlay */}
            <FilterDrawer
                isOpen={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                activeFilters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAllFilters}
            />
        </div>
    );
}

export default ProductListingPage;
