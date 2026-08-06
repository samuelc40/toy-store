"use no memo";
import React from 'react';
import { Loader } from 'lucide-react';
import useVariantForm from '../hooks/useVariantForm';

/**
 * Inner Form for creating or editing product variants.
 */
export function VariantForm({
    variant,
    onSubmit,
    onCancel,
    isLoading = false,
    backendErrors = null,
}) {
    const { register, handleSubmit, errors, setError } = useVariantForm(variant);

    // Apply backend SKU error if returned by API
    React.useEffect(() => {
        if (backendErrors && backendErrors.sku) {
            setError('sku', {
                type: 'manual',
                message: Array.isArray(backendErrors.sku) ? backendErrors.sku[0] : backendErrors.sku,
            });
        }
    }, [backendErrors, setError]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="variant-form-el">
            <div className="variant-form-grid">
                {/* Variant Name */}
                <div className="v-form-group span-2">
                    <label htmlFor="variant_name" className="v-form-label">
                        Variant Name <span className="v-label-required">*</span>
                    </label>
                    <input
                        id="variant_name"
                        type="text"
                        placeholder="e.g. Red / Large"
                        className={`v-form-input ${errors.variant_name ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('variant_name')}
                    />
                    {errors.variant_name && <p className="v-form-error">{errors.variant_name.message}</p>}
                </div>

                {/* SKU */}
                <div className="v-form-group span-2">
                    <label htmlFor="sku" className="v-form-label">
                        SKU <span className="v-label-required">*</span>
                    </label>
                    <input
                        id="sku"
                        type="text"
                        placeholder="e.g. TOY-ROBOT-RED"
                        className={`v-form-input ${errors.sku ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('sku')}
                    />
                    {errors.sku && <p className="v-form-error">{errors.sku.message}</p>}
                </div>

                {/* Price */}
                <div className="v-form-group">
                    <label htmlFor="price" className="v-form-label">
                        Price (₹) <span className="v-label-required">*</span>
                    </label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={`v-form-input ${errors.price ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('price')}
                    />
                    {errors.price && <p className="v-form-error">{errors.price.message}</p>}
                </div>

                {/* Sale Price */}
                <div className="v-form-group">
                    <label htmlFor="sale_price" className="v-form-label">
                        Sale Price (₹)
                    </label>
                    <input
                        id="sale_price"
                        type="number"
                        step="0.01"
                        placeholder="Optional"
                        className={`v-form-input ${errors.sale_price ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('sale_price')}
                    />
                    {errors.sale_price && <p className="v-form-error">{errors.sale_price.message}</p>}
                </div>

                {/* Stock Quantity */}
                <div className="v-form-group">
                    <label htmlFor="stock_quantity" className="v-form-label">
                        Stock Quantity <span className="v-label-required">*</span>
                    </label>
                    <input
                        id="stock_quantity"
                        type="number"
                        placeholder="0"
                        className={`v-form-input ${errors.stock_quantity ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('stock_quantity')}
                    />
                    {errors.stock_quantity && <p className="v-form-error">{errors.stock_quantity.message}</p>}
                </div>

                {/* Display Order */}
                <div className="v-form-group">
                    <label htmlFor="display_order" className="v-form-label">
                        Display Order <span className="v-label-required">*</span>
                    </label>
                    <input
                        id="display_order"
                        type="number"
                        placeholder="1"
                        className={`v-form-input ${errors.display_order ? 'v-input-error' : ''}`}
                        disabled={isLoading}
                        {...register('display_order')}
                    />
                    {errors.display_order && <p className="v-form-error">{errors.display_order.message}</p>}
                </div>
            </div>

            {/* Form Actions Footer */}
            <div className="v-form-actions-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="btn-v-form-cancel"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-v-form-submit"
                >
                    {isLoading ? (
                        <span className="v-btn-loading">
                            <Loader size={14} className="v-spinner-anim" />
                            Saving...
                        </span>
                    ) : variant ? (
                        'Save Changes'
                    ) : (
                        'Add Variant'
                    )}
                </button>
            </div>
        </form>
    );
}

export default VariantForm;
