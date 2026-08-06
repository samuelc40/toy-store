import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import usePagination from '../hooks/usePagination';

/**
 * Pagination navigation for traversing catalog pages.
 */
export function ProductPagination({ currentPage, totalPages, onPageChange }) {
    const pages = usePagination(currentPage, totalPages);

    if (totalPages <= 1) return null;

    return (
        <nav className="catalog-pagination-nav-container" aria-label="Catalog pages">
            {/* Prev */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-pagination-nav-step"
                aria-label="Previous Page"
            >
                <ChevronLeft size={16} />
            </button>

            {/* Page Buttons list */}
            <div className="pagination-nav-pages-wrapper">
                {pages.map((page, idx) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${idx}`} className="pagination-nav-ellipsis">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`btn-pagination-nav-number-item ${currentPage === page ? 'active-page-item' : ''}`}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next */}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-pagination-nav-step"
                aria-label="Next Page"
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}

export default ProductPagination;
