import * as yup from 'yup';

export const variantSchema = yup.object().shape({
    variant_name: yup
        .string()
        .trim()
        .required('Variant name is required')
        .max(100, 'Variant name cannot exceed 100 characters'),
    sku: yup
        .string()
        .trim()
        .required('SKU is required')
        .max(100, 'SKU cannot exceed 100 characters'),
    price: yup
        .number()
        .typeError('Price must be a number')
        .required('Original price is required')
        .positive('Price must be greater than 0'),
    sale_price: yup
        .number()
        .typeError('Sale price must be a number')
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .nullable()
        .positive('Sale price must be greater than 0')
        .test('is-less-than-price', 'Sale price cannot be greater than original price', function (value) {
            const { price } = this.parent;
            if (value === null || value === undefined || isNaN(value)) return true;
            if (price === null || price === undefined || isNaN(price)) return true;
            return value <= price;
        }),
    stock_quantity: yup
        .number()
        .typeError('Stock quantity must be a number')
        .required('Stock quantity is required')
        .integer('Stock quantity must be an integer')
        .min(0, 'Stock quantity cannot be negative'),
    display_order: yup
        .number()
        .typeError('Display order must be a number')
        .required('Display order is required')
        .integer('Display order must be an integer')
        .min(1, 'Display order must be at least 1'),
});

export default variantSchema;
