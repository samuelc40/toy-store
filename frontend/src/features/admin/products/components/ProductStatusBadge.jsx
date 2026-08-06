import React from 'react';

/**
 * Status Badge for Products
 */
export function ProductStatusBadge({ isActive, blocked }) {
    let label = 'Active';
    let statusClass = 'status-active';

    if (!isActive) {
        label = 'Deleted';
        statusClass = 'status-deleted';
    } else if (blocked) {
        label = 'Blocked';
        statusClass = 'status-blocked';
    }

    return (
        <span className={`product-status-badge ${statusClass}`}>
            <span className="status-dot"></span>
            {label}
        </span>
    );
}

export default ProductStatusBadge;
