import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearch, selectProductsSearch } from '../redux/productSlice';

/**
 * Custom hook to handle debounced search inputs.
 */
export const useProductSearch = (debounceMs = 300) => {
    const dispatch = useDispatch();
    const storeSearch = useSelector(selectProductsSearch);
    const [searchTerm, setSearchTerm] = useState(storeSearch || '');
    const timerRef = useRef(null);

    // Sync local state if store search is changed or cleared externally
    useEffect(() => {
        setSearchTerm(storeSearch);
    }, [storeSearch]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            dispatch(setSearch(value));
        }, debounceMs);
    };

    const handleClear = () => {
        setSearchTerm('');
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        dispatch(setSearch(''));
    };

    return {
        searchTerm,
        handleSearchChange,
        handleClear,
    };
};

export default useProductSearch;
