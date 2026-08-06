import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Product Pagination component with page numbers, limits, and summary info.
 */
export function ProductPagination({
    page,
    pageSize,
    totalPages,
    count,
    onPageChange,
    onPageSizeChange,
}) {
    const startIndex = count === 0 ? 0 : (page - 1) * pageSize + 1;
    const endIndex = Math.min(page * pageSize, count);

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => onPageChange(i)}
                    className={`pagination-number-btn ${page === i ? 'btn-active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="product-pagination-container">
            {/* Range & Page Limit Selection */}
            <div className="pagination-info-group">
                <div className="page-limit-selector-wrapper">
                    <span className="pagination-label">Show</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="page-limit-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="pagination-label">entries per page</span>
                </div>
                <span className="pagination-summary">
                    Showing {startIndex}–{endIndex} of {count} Products
                </span>
            </div>

            {/* Navigation Buttons */}
            {totalPages > 1 && (
                <div className="pagination-nav-group">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="pagination-arrow-btn"
                        title="Previous Page"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Numeric Pages */}
                    <div className="pagination-numbers-list">
                        {renderPageNumbers()}
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page === totalPages}
                        className="pagination-arrow-btn"
                        title="Next Page"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductPagination;
