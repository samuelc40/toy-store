import React from 'react';

/**
 * Status Badge for Product Variants.
 * Follows priority: Inactive (Deleted) > Blocked > Out of Stock > Available.
 */
export function VariantStatusBadge({ isActive, blocked, stockQuantity }) {
    let label = 'Available';
    let statusClass = 'v-status-available';

    if (!isActive) {
        label = 'Deleted';
        statusClass = 'v-status-deleted';
    } else if (blocked) {
        label = 'Blocked';
        statusClass = 'v-status-blocked';
    } else if (stockQuantity === 0) {
        label = 'Out of Stock';
        statusClass = 'v-status-out-of-stock';
    }

    return (
        <span className={`variant-status-badge ${statusClass}`}>
            <span className="v-status-dot"></span>
            {label}
        </span>
    );
}

export default VariantStatusBadge;
