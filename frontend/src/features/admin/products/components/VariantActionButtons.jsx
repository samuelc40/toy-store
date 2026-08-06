import React from 'react';
import { Edit, Ban, Trash2 } from 'lucide-react';

/**
 * Row actions component displaying Edit, Block, and Delete rounded icon buttons for a variant.
 */
export function VariantActionButtons({
    variant,
    onEdit,
    onBlock,
    onDelete,
    disabled = false,
}) {
    return (
        <div className="variant-action-buttons-group">
            {/* Edit Action */}
            <button
                type="button"
                className="btn-v-action-round btn-v-action-edit"
                title="Edit Variant"
                onClick={() => onEdit(variant)}
                disabled={disabled || !variant.is_active}
            >
                <Edit size={14} />
            </button>

            {/* Block/Unblock Action */}
            <button
                type="button"
                className={`btn-v-action-round ${
                    variant.blocked ? 'btn-v-action-unblock' : 'btn-v-action-block'
                }`}
                title={variant.blocked ? 'Unblock Variant' : 'Block Variant'}
                onClick={() => onBlock(variant)}
                disabled={disabled || !variant.is_active}
            >
                <Ban size={14} />
            </button>

            {/* Delete Action */}
            <button
                type="button"
                className="btn-v-action-round btn-v-action-delete"
                title="Delete Variant"
                onClick={() => onDelete(variant)}
                disabled={disabled || !variant.is_active}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}

export default VariantActionButtons;
