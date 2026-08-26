import React from 'react';
import { CalendarX } from 'lucide-react';

function SalesReportEmptyState({ message = 'No sales data found for the selected period.' }) {
  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      boxShadow: 'var(--shadow)',
      marginBottom: '24px',
    }}>
      <div style={{
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--accent)',
        padding: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CalendarX size={36} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
          No Sales Found
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
          {message} Try selecting a different date range or preset.
        </p>
      </div>
    </div>
  );
}

export default SalesReportEmptyState;
