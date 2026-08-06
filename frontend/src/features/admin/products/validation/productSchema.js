import * as yup from 'yup';

export const productSchema = yup.object().shape({
    category: yup
        .string()
        .required('Category is required'),
    name: yup
        .string()
        .trim()
        .required('Product name is required')
        .max(255, 'Product name cannot exceed 255 characters'),
    brand: yup
        .string()
        .trim()
        .max(150, 'Brand cannot exceed 150 characters'),
    description: yup
        .string()
        .trim()
        .required('Description is required'),
});

export default productSchema;
