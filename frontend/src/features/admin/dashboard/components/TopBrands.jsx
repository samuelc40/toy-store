import React from 'react';
import { Tag } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/reportFormatters';

function TopBrands({ brands }) {
  if (!brands || brands.length === 0) {
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
        No brand sales data available for this period.
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
        <Tag size={18} style={{ color: '#0284c7' }} />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Top 10 Best Selling Brands
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary, rgba(0, 0, 0, 0.02))', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)', width: '48px' }}>#</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)' }}>Brand Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Units Sold</th>
              <th style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((item) => (
              <tr key={item.rank} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: item.rank <= 3 ? '#0284c7' : 'var(--text-secondary)' }}>
                  {item.rank}
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.brand_name}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.units_sold}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
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

export default TopBrands;
