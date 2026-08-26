import React from 'react';
import { formatDate, formatCurrency } from '../utils/reportFormatters';

function SalesReportTable({ breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Sales Breakdown History
        </h3>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {breakdown.length} {breakdown.length === 1 ? 'Period' : 'Periods'} Recorded
        </span>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary, rgba(0, 0, 0, 0.02))', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)' }}>Date / Period</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Orders</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Units Sold</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Gross Sales</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Offer Discount</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Coupon Discount</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Total Discount</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Shipping</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Cancelled</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-secondary)', textAlign: 'right' }}>Returned</th>
              <th style={{ padding: '14px 18px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>Net Sales</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx === breakdown.length - 1 ? 'none' : '1px solid var(--border-color)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {formatDate(row.date)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {row.order_count}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {row.units_sold}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.gross_sales)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#d97706', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.offer_discount)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#d97706', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.coupon_discount)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#d97706', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.total_discount)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.shipping)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#ef4444', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.cancelled_amount)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, color: '#f97316', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.returned_amount)}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                  {formatCurrency(row.net_sales)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesReportTable;
