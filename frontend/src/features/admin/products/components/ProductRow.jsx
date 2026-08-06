import React from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductStatusBadge from './ProductStatusBadge';
import ProductActionButtons from './ProductActionButtons';

/**
 * Table row representing a single Product.
 */
export function ProductRow({
    product,
    onView,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    // Format creation date
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const imageUrl = product.primary_image;

    // Format price range: ₹lowest - ₹highest or ₹price
    const formatPriceRange = (lowest, highest) => {
        if (lowest === null || lowest === undefined) return '—';
        const low = parseFloat(lowest);
        const high = parseFloat(highest);

        if (isNaN(low)) return '—';
        
        // Helper to format individual prices without unnecessary trailing decimals
        const formatVal = (val) => {
            return val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
        };

        if (isNaN(high) || low === high) {
            return `₹${Number(formatVal(low)).toLocaleString('en-IN')}`;
        }
        
        return `₹${Number(formatVal(low)).toLocaleString('en-IN')} - ₹${Number(formatVal(high)).toLocaleString('en-IN')}`;
    };
    console.log(product);
    console.log(product.primary_image);

    return (
        <tr className={`product-table-row ${!product.is_active ? 'row-deleted' : ''}`}>
            {/* Image Column */}
            <td data-label="IMAGE">
                <div className="product-image-container">
                    {product.primary_image ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="product-cell-image"
                        />
                    ) : (
                        <ShoppingBag size={20} className="product-image-placeholder-icon" />
                    )}
                </div>
            </td>

            {/* Name Column */}
            <td data-label="NAME">
                <div className="product-cell-name-container" title={product.name}>
                    <span className="product-cell-name">{product.name}</span>
                </div>
            </td>

            {/* Category Column */}
            <td data-label="CATEGORY">
                <span className="product-cell-category">{product.category_name || 'Uncategorized'}</span>
            </td>

            {/* Brand Column */}
            <td data-label="BRAND">
                <span className="product-cell-brand">{product.brand || '—'}</span>
            </td>

            {/* Variants Column */}
            <td data-label="VARIANTS">
                <span className="product-cell-variants">{product.variants_count}</span>
            </td>

            {/* Stock Column */}
            <td data-label="STOCK">
                <span className={`product-cell-stock ${product.total_stock <= 5 && product.total_stock > 0 ? 'stock-low' : product.total_stock === 0 ? 'stock-empty' : ''}`}>
                    {product.total_stock === 0 ? 'Out of Stock' : `${product.total_stock} Units`}
                </span>
            </td>

            {/* Price Column */}
            <td data-label="PRICE">
                <span className="product-cell-price">
                    {formatPriceRange(product.lowest_price, product.highest_price)}
                </span>
            </td>

            {/* Status Column */}
            <td data-label="STATUS">
                <ProductStatusBadge isActive={product.is_active} blocked={product.blocked} />
            </td>

            {/* Created Column */}
            <td data-label="CREATED">
                <span className="product-cell-created">{formatDate(product.created_at)}</span>
            </td>

            {/* Actions Column */}
            <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                <ProductActionButtons
                    product={product}
                    onView={onView}
                    onEdit={onEdit}
                    onBlock={onBlock}
                    onDelete={onDelete}
                    disabled={disabled}
                />
            </td>
        </tr>
    );
}

export default ProductRow;
