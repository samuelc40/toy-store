import React from 'react';
import VariantStatusBadge from './VariantStatusBadge';
import VariantActionButtons from './VariantActionButtons';

/**
 * Table row representing a single Product Variant.
 */
export function VariantRow({
    variant,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    // Format individual prices nicely
    const formatPrice = (value) => {
        if (value === null || value === undefined) return '—';
        const num = parseFloat(value);
        if (isNaN(num)) return '—';
        const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
        return `₹${Number(formatted).toLocaleString('en-IN')}`;
    };

    // Stock cell color class
    const getStockClass = (qty) => {
        if (qty === 0) return 'v-stock-empty';
        if (qty <= 10) return 'v-stock-low';
        return 'v-stock-sufficient';
    };

    const hasSalePrice = variant.sale_price !== null && variant.sale_price !== undefined && variant.sale_price !== '';

    return (
        <tr className={`variant-table-row ${!variant.is_active ? 'v-row-deleted' : ''}`}>
            {/* Display Order */}
            <td data-label="ORDER">
                <span className="variant-cell-order">{variant.display_order}</span>
            </td>

            {/* Variant Name */}
            <td data-label="VARIANT NAME">
                <span className="variant-cell-name">{variant.variant_name}</span>
            </td>

            {/* SKU */}
            <td data-label="SKU">
                <span className="variant-cell-sku" title={variant.sku}>
                    {variant.sku}
                </span>
            </td>

            {/* Price Column */}
            <td data-label="PRICE">
                {hasSalePrice ? (
                    <span className="variant-cell-price-strike">
                        {formatPrice(variant.price)}
                    </span>
                ) : (
                    <span className="variant-cell-price-normal">
                        {formatPrice(variant.price)}
                    </span>
                )}
            </td>

            {/* Sale Price Column */}
            <td data-label="SALE PRICE">
                {hasSalePrice ? (
                    <span className="variant-cell-price-sale">
                        {formatPrice(variant.sale_price)}
                    </span>
                ) : (
                    <span className="variant-cell-price-none">—</span>
                )}
            </td>

            {/* Stock Column */}
            <td data-label="STOCK">
                <span className={`variant-cell-stock ${getStockClass(variant.stock_quantity)}`}>
                    {variant.stock_quantity === 0 ? 'Out of Stock' : `${variant.stock_quantity} units`}
                </span>
            </td>

            {/* Status Column */}
            <td data-label="STATUS">
                <VariantStatusBadge
                    isActive={variant.is_active}
                    blocked={variant.blocked}
                    stockQuantity={variant.stock_quantity}
                />
            </td>

            {/* Actions Column */}
            <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                <VariantActionButtons
                    variant={variant}
                    onEdit={onEdit}
                    onBlock={onBlock}
                    onDelete={onDelete}
                    disabled={disabled}
                />
            </td>
        </tr>
    );
}

export default VariantRow;
