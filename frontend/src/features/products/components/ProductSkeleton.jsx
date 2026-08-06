import React from 'react';

/**
 * Shimmering skeleton cards loader.
 */
export function ProductSkeleton() {
    return (
        <div className="catalog-skeleton-card-item catalog-shimmer-animation">
            <div className="skeleton-media-box-element" />
            <div className="skeleton-details-box-element">
                <div className="skeleton-metadata-row">
                    <div className="skeleton-lbl-element" />
                    <div className="skeleton-lbl-element small" />
                </div>
                <div className="skeleton-title-element" />
                <div className="skeleton-title-element short" />
                <div className="skeleton-footer-row">
                    <div className="skeleton-price-element" />
                    <div className="skeleton-btn-element" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }) {
    const items = Array.from({ length: count });

    return (
        <div className="customer-catalog-grid">
            {items.map((_, idx) => (
                <ProductSkeleton key={idx} />
            ))}
        </div>
    );
}

export default ProductSkeleton;
