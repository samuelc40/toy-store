import React from 'react';
import { Eye, Edit, Ban, Trash2 } from 'lucide-react';

/**
 * Row actions component displaying View, Edit, Block, and Delete rounded icon buttons.
 */
export function ProductActionButtons({
    product,
    onView,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    return (
        <div className="product-action-buttons-group">
            {/* View Action */}
            <button
                type="button"
                className="btn-action-round btn-action-view"
                title="View Product Details"
                onClick={() => onView(product)}
                disabled={disabled}
            >
                <Eye size={16} />
            </button>

            {/* Edit Action */}
            <button
                type="button"
                className="btn-action-round btn-action-edit"
                title="Edit Product"
                onClick={() => onEdit(product)}
                disabled={disabled || !product.is_active}
            >
                <Edit size={16} />
            </button>

            {/* Block/Unblock Action */}
            <button
                type="button"
                className={`btn-action-round ${
                    product.blocked ? 'btn-action-unblock' : 'btn-action-block'
                }`}
                title={product.blocked ? 'Unblock Product' : 'Block Product'}
                onClick={() => onBlock(product)}
                disabled={disabled || !product.is_active}
            >
                <Ban size={16} />
            </button>

            {/* Delete Action */}
            <button
                type="button"
                className="btn-action-round btn-action-delete"
                title="Delete Product"
                onClick={() => onDelete(product)}
                disabled={disabled || !product.is_active}
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

export default ProductActionButtons;
