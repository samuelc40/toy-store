import { useState, useEffect, useRef } from 'react';

/**
 * Hook for managing debounced search inputs without re-render loops or layout flicker.
 */
export function useSearch(initialValue = '', delay = 350, onSearch) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const onSearchRef = useRef(onSearch);
    const isFirstRender = useRef(true);
    const prevInitialValue = useRef(initialValue);

    // Keep callback ref updated to prevent re-triggering timer on function reference change
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    // Sync external initialValue change without resetting internal state if user is typing
    useEffect(() => {
        if (prevInitialValue.current !== initialValue) {
            prevInitialValue.current = initialValue;
            setSearchTerm(initialValue);
        }
    }, [initialValue]);

    // Debounced effect for local searchTerm changes
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            if (onSearchRef.current) {
                onSearchRef.current(searchTerm);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, delay]);

    return [searchTerm, setSearchTerm];
}

export default useSearch;
