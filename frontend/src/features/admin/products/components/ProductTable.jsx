import React from 'react';
import ProductRow from './ProductRow';

/**
 * Main Product Table component.
 * Renders loading skeletons, empty states, and product rows.
 */
export function ProductTable({
    products,
    loading,
    onView,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    if (loading && products.length === 0) {
        return (
            <div className="product-table-card responsive-table-container">
                <table className="product-table-el responsive-table">
                    <thead>
                        <tr>
                            <th>IMAGE</th>
                            <th>NAME</th>
                            <th>CATEGORY</th>
                            <th>BRAND</th>
                            <th>VARIANTS</th>
                            <th>STOCK</th>
                            <th>PRICE</th>
                            <th>STATUS</th>
                            <th>CREATED</th>
                            <th style={{ textAlign: 'left' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="product-table-row">
                                <td data-label="IMAGE">
                                    <div className="skeleton-shimmer skeleton-img" />
                                </td>
                                <td data-label="NAME">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '160px' }} />
                                </td>
                                <td data-label="CATEGORY">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '90px' }} />
                                </td>
                                <td data-label="BRAND">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '80px' }} />
                                </td>
                                <td data-label="VARIANTS">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '40px' }} />
                                </td>
                                <td data-label="STOCK">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '70px' }} />
                                </td>
                                <td data-label="PRICE">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '100px' }} />
                                </td>
                                <td data-label="STATUS">
                                    <div className="skeleton-shimmer skeleton-badge" />
                                </td>
                                <td data-label="CREATED">
                                    <div className="skeleton-shimmer skeleton-text" style={{ width: '80px' }} />
                                </td>
                                <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                                    <div className="skeleton-shimmer skeleton-actions" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!loading && products.length === 0) {
        return (
            <div className="product-table-card table-empty-card">
                <div className="table-empty-state">
                    <p className="empty-state-text">No products found matching your search criteria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="product-table-card responsive-table-container">
            <table className="product-table-el responsive-table">
                <thead>
                    <tr>
                        <th>IMAGE</th>
                        <th>NAME</th>
                        <th>CATEGORY</th>
                        <th>BRAND</th>
                        <th>VARIANTS</th>
                        <th>STOCK</th>
                        <th>PRICE</th>
                        <th>STATUS</th>
                        <th>CREATED</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <ProductRow
                            key={product.id}
                            product={product}
                            onView={onView}
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

export default ProductTable;
