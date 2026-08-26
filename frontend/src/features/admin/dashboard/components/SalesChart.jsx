import React, { useState } from 'react';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/reportFormatters';

function SalesChart({ salesChart }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!salesChart || !salesChart.labels || salesChart.labels.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        marginBottom: '28px',
      }}>
        No sales chart data available for the selected period.
      </div>
    );
  }

  const { labels, sales, orders } = salesChart;
  const numSales = sales.map((s) => parseFloat(s) || 0);
  const maxSales = Math.max(...numSales, 100);

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Sales Revenue Trend
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent)' }}></span>
            <span>Net Sales (INR)</span>
          </div>
        </div>
      </div>

      {/* Interactive Responsive SVG / Bar Chart Container */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: labels.length > 15 ? `${labels.length * 32}px` : '100%', height: '240px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: '30px', position: 'relative' }}>
          {labels.map((label, idx) => {
            const val = numSales[idx];
            const orderCnt = orders[idx] || 0;
            const heightPct = Math.max((val / maxSales) * 100, val > 0 ? 4 : 1);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: `${heightPct + 10}%`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--text-primary)',
                    color: 'var(--card-bg)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>{label}</div>
                    <div style={{ fontSize: '13px', margin: '2px 0', color: '#a5b4fc' }}>{formatCurrency(val)}</div>
                    <div style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShoppingBag size={11} /> {orderCnt} {orderCnt === 1 ? 'Order' : 'Orders'}
                    </div>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{
                    width: '80%',
                    maxWidth: '36px',
                    height: `${heightPct}%`,
                    backgroundColor: isHovered ? '#6366f1' : 'var(--accent)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.2s ease',
                    opacity: isHovered ? 1 : 0.85,
                  }}
                />

                {/* X Axis Label */}
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: isHovered ? 'var(--accent)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  transform: labels.length > 20 ? 'rotate(-45deg)' : 'none',
                  transformOrigin: 'top left',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SalesChart;
