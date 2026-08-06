import React from 'react';
import VariantRow from './VariantRow';

/**
 * Table listing product variants.
 * Renders skeleton columns during initial load, and empty states.
 */
export function VariantTable({
    variants,
    loading,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    if (loading && variants.length === 0) {
        return (
            <div className="variant-table-container responsive-table-container">
                <table className="variant-table-el responsive-table">
                    <thead>
                        <tr>
                            <th>ORDER</th>
                            <th>VARIANT NAME</th>
                            <th>SKU</th>
                            <th>PRICE</th>
                            <th>SALE PRICE</th>
                            <th>STOCK</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(3)].map((_, i) => (
                            <tr key={i} className="variant-table-row">
                                <td data-label="ORDER">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '30px' }} />
                                </td>
                                <td data-label="VARIANT NAME">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '120px' }} />
                                </td>
                                <td data-label="SKU">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '80px' }} />
                                </td>
                                <td data-label="PRICE">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '60px' }} />
                                </td>
                                <td data-label="SALE PRICE">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '60px' }} />
                                </td>
                                <td data-label="STOCK">
                                    <div className="v-skeleton-shimmer v-skeleton-text" style={{ width: '70px' }} />
                                </td>
                                <td data-label="STATUS">
                                    <div className="v-skeleton-shimmer v-skeleton-badge" />
                                </td>
                                <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                                    <div className="v-skeleton-shimmer v-skeleton-actions" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!loading && variants.length === 0) {
        return (
            <div className="variant-table-container variant-table-empty-container">
                <div className="variant-empty-state">
                    <p className="variant-empty-text">No variants have been created for this product yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="variant-table-container responsive-table-container">
            <table className="variant-table-el responsive-table">
                <thead>
                    <tr>
                        <th>ORDER</th>
                        <th>VARIANT NAME</th>
                        <th>SKU</th>
                        <th>PRICE</th>
                        <th>SALE PRICE</th>
                        <th>STOCK</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map((variant) => (
                        <VariantRow
                            key={variant.id}
                            variant={variant}
                            onEdit={onEdit}
                            onBlock={onBlock}
                            onDelete={onDelete}
                            disabled={disabled}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default VariantTable;
