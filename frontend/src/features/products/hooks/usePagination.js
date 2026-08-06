import { useMemo } from 'react';

/**
 * Custom hook to generate page sequences for pagination arrays,
 * introducing ellipsis boundaries when count is large.
 */
export function usePagination(currentPage, totalPages) {
    return useMemo(() => {
        const pages = [];
        const range = 1; // Show 1 page before/after active page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - range && i <= currentPage + range)
            ) {
                pages.push(i);
            } else if (
                i === currentPage - range - 1 ||
                i === currentPage + range + 1
            ) {
                pages.push('...');
            }
        }

        // Filter consecutive ellipsis
        return pages.filter((page, index, arr) => {
            return page !== '...' || arr[index - 1] !== '...';
        });
    }, [currentPage, totalPages]);
}

export default usePagination;
