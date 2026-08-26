import React from 'react';
import { DollarSign, ShoppingBag, Tag, RotateCcw, XCircle, PackageCheck, Receipt } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/reportFormatters';

function DashboardSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: 'Net Sales',
      value: formatCurrency(summary.net_sales),
      icon: DollarSign,
      color: 'var(--accent)',
      bg: 'var(--accent-bg)',
      highlight: true,
      subtext: 'Net retained revenue',
    },
    {
      title: 'Gross Sales',
      value: formatCurrency(summary.gross_sales),
      icon: Receipt,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.12)',
      subtext: 'Pre-discount total value',
    },
    {
      title: 'Total Discounts',
      value: formatCurrency(summary.total_discount),
      icon: Tag,
      color: '#d97706',
      bg: 'var(--warning-bg)',
      subtext: `Offers: ${formatCurrency(summary.offer_discount)} | Coupons: ${formatCurrency(summary.coupon_discount)}`,
    },
    {
      title: 'Total Orders',
      value: summary.order_count.toLocaleString('en-IN'),
      icon: ShoppingBag,
      color: 'var(--success-color)',
      bg: 'var(--success-bg)',
      subtext: 'Fulfilled sales orders',
    },
    {
      title: 'Units Sold',
      value: summary.units_sold.toLocaleString('en-IN'),
      icon: PackageCheck,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.12)',
      subtext: 'Delivered / active items',
    },
    {
      title: 'Cancelled Amount',
      value: formatCurrency(summary.cancelled_amount),
      icon: XCircle,
      color: '#ef4444',
      bg: 'var(--error-bg)',
      subtext: 'Refunded via cancellations',
    },
    {
      title: 'Returned Amount',
      value: formatCurrency(summary.returned_amount),
      icon: RotateCcw,
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      subtext: 'Refunded via item returns',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--card-bg)',
              border: card.highlight ? `2px solid ${card.color}` : '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: card.highlight ? '0 6px 20px rgba(140, 82, 255, 0.12)' : 'var(--shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <div style={{
                backgroundColor: card.bg,
                color: card.color,
                padding: '7px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={18} />
              </div>
            </div>

            <h2 style={{
              margin: '0 0 4px 0',
              fontSize: '21px',
              fontWeight: 800,
              color: card.highlight ? card.color : 'var(--text-primary)',
              letterSpacing: '-0.4px',
            }}>
              {card.value}
            </h2>

            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {card.subtext}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardSummaryCards;
