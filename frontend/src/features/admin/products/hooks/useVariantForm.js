import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import variantSchema from '../validation/variantSchema';

/**
 * Custom hook wrapping react-hook-form + yup validation for variants.
 */
export const useVariantForm = (variant) => {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(variantSchema),
        defaultValues: {
            variant_name: '',
            sku: '',
            price: '',
            sale_price: '',
            stock_quantity: 0,
            display_order: 1,
        },
    });

    // Prefill form values when the selected variant changes
    useEffect(() => {
        if (variant) {
            reset({
                variant_name: variant.variant_name || '',
                sku: variant.sku || '',
                price: variant.price || '',
                sale_price: variant.sale_price !== null && variant.sale_price !== undefined ? variant.sale_price : '',
                stock_quantity: variant.stock_quantity !== undefined ? variant.stock_quantity : 0,
                display_order: variant.display_order !== undefined ? variant.display_order : 1,
            });
        } else {
            reset({
                variant_name: '',
                sku: '',
                price: '',
                sale_price: '',
                stock_quantity: 0,
                display_order: 1,
            });
        }
    }, [variant, reset]);

    return {
        register,
        handleSubmit,
        reset,
        setError,
        errors,
    };
};

export default useVariantForm;
