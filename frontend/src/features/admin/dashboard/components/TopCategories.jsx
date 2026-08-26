import React from 'react';
import { FolderOpen } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/reportFormatters';

function TopCategories({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '13.5px',
      }}>
        No category sales data available for this period.
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FolderOpen size={18} style={{ color: '#8b5cf6' }} />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Top 10 Best Selling Categories
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary, rgba(0, 0, 0, 0.02))', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)', width: '48px' }}>#</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)' }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Units Sold</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item.rank} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: item.rank <= 3 ? '#8b5cf6' : 'var(--text-secondary)' }}>
                  {item.rank}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.category_name}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.units_sold}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#8b5cf6' }}>
                  {formatCurrency(item.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopCategories;
