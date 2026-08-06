import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectProducts, selectCategories } from '../redux/productListingSlice';

/**
 * Custom hook to manage catalog filters lists dynamically,
 * parsing all unique brand categories from active products.
 */
export function useFilters() {
    const products = useSelector(selectProducts);
    const categories = useSelector(selectCategories);

    const brands = useMemo(() => {
        if (!products) return [];
        const unique = new Set(
            products
                .map((p) => p.brand)
                .filter((b) => b && b.trim() !== '')
        );
        return Array.from(unique).sort();
    }, [products]);

    return {
        categories,
        brands,
    };
}

export default useFilters;
