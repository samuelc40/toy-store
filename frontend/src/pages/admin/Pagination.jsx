import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({
  page = 1,
  pageSize = 10,
  totalPages = 1,
  count = 0,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'entries'
}) {
  const startIndex = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, count);

  const renderPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const delta = 2;
      const range = [];
      for (
        let i = Math.max(2, page - delta);
        i <= Math.min(totalPages - 1, page + delta);
        i++
      ) {
        range.push(i);
      }

      if (page - delta > 2) {
        range.unshift('...');
      }
      if (page + delta < totalPages - 1) {
        range.push('...');
      }

      range.unshift(1);
      if (totalPages > 1) {
        range.push(totalPages);
      }
      pages.push(...range);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`ellipsis-${idx}`} style={{ padding: '0 6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            ...
          </span>
        );
      }

      return (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange && onPageChange(p)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: page === p ? 'var(--accent-color)' : 'var(--border-color)',
            backgroundColor: page === p ? 'var(--accent-color)' : 'var(--bg-secondary)',
            color: page === p ? '#ffffff' : 'var(--text-primary)',
            fontWeight: page === p ? '700' : '500',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s',
          }}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '24px', padding: '0 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>entries per page</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Showing {startIndex}–{endIndex} of {count} {itemLabel}
        </span>
      </div>

      {totalPages > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page === 1}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {renderPageNumbers()}
          </div>

          <button
            type="button"
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
