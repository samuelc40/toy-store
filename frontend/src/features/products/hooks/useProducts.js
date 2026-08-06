import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    fetchProductsListAsync,
    fetchCategoriesAsync,
    syncParamsFromUrl,
    selectProducts,
    selectProductsLoading,
    selectProductsError,
    selectTotalPages,
    selectProductsCount,
} from '../redux/productListingSlice';

const PAGE_SIZE = 8;

/**
 * Custom hook for managing customer catalog state, URL parameters,
 * filtering, pagination, search, and sorting seamlessly.
 */
export function useProducts() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    // Redux state selectors
    const products = useSelector(selectProducts);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);
    const totalCount = useSelector(selectProductsCount);
    const totalPages = useSelector(selectTotalPages);

    // Derive URL query params on EVERY render frame (Single Source of Truth)
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Number(searchParams.get('page')) || 1;
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const brand = searchParams.get('brand') || '';

    const filters = useMemo(() => ({
        category,
        minPrice,
        maxPrice,
        brand,
    }), [category, minPrice, maxPrice, brand]);

    // 1. Sync URL query params to Redux store for UI selectors
    useEffect(() => {
        dispatch(syncParamsFromUrl({
            search,
            sort,
            page,
            category,
            minPrice,
            maxPrice,
            brand,
        }));
    }, [dispatch, search, sort, page, category, minPrice, maxPrice, brand]);

    // 2. Fetch categories on mount
    useEffect(() => {
        dispatch(fetchCategoriesAsync());
    }, [dispatch]);

    // 3. Fetch products IMMEDIATELY whenever URL query params change (No first-click delays!)
    useEffect(() => {
        dispatch(fetchProductsListAsync({
            page,
            search,
            sort,
            category,
            min_price: minPrice,
            max_price: maxPrice,
            brand,
            page_size: PAGE_SIZE
        }));
    }, [dispatch, page, search, sort, category, minPrice, maxPrice, brand]);

    // Update URL Search Params helper
    const updateUrlParams = useCallback((paramUpdates) => {
        const nextParams = new URLSearchParams(searchParams);

        Object.entries(paramUpdates).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                nextParams.set(key, String(val));
            } else {
                nextParams.delete(key);
            }
        });

        // Reset page to 1 if not explicitly updating page
        if (!('page' in paramUpdates)) {
            nextParams.delete('page');
        }

        setSearchParams(nextParams);
    }, [searchParams, setSearchParams]);

    const activePage = page;
    const startIndex = (activePage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, totalCount);

    // Callbacks for UI components
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            updateUrlParams({ page: newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [totalPages, updateUrlParams]);

    const handleFilterChange = useCallback((key, value) => {
        updateUrlParams({ [key]: value });
    }, [updateUrlParams]);

    const handleSortChange = useCallback((newSort) => {
        updateUrlParams({ sort: newSort });
    }, [updateUrlParams]);

    const handleSearchChange = useCallback((query) => {
        updateUrlParams({ search: query });
    }, [updateUrlParams]);

    const handleClearAllFilters = useCallback(() => {
        setSearchParams({});
    }, [setSearchParams]);

    const retryFetch = useCallback(() => {
        dispatch(fetchProductsListAsync({
            page,
            search,
            sort,
            category,
            min_price: minPrice,
            max_price: maxPrice,
            brand,
            page_size: PAGE_SIZE
        }));
    }, [dispatch, page, search, sort, category, minPrice, maxPrice, brand]);

    return {
        products,
        loading,
        error,
        search,
        sort,
        page: activePage,
        totalPages,
        totalCount,
        startIndex: totalCount > 0 ? startIndex + 1 : 0,
        endIndex,
        filters,
        
        // Operations
        handlePageChange,
        handleFilterChange,
        handleSortChange,
        handleSearchChange,
        handleClearAllFilters,
        retryFetch,
    };
}

export default useProducts;
