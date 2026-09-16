import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Tag,
  RotateCcw,
  XCircle,
  PackageCheck,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "../../reports/utils/reportFormatters";

function DashboardSummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Net Sales",
      value: formatCurrency(summary.net_sales),
      icon: DollarSign,
      color: "var(--accent)",
      bg: "var(--accent-bg)",
      highlight: true,
      subtext: "Net retained revenue",
    },
    {
      title: "Gross Sales",
      value: formatCurrency(summary.gross_sales),
      icon: Receipt,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.12)",
      subtext: "Pre-discount total value",
    },
    {
      title: "Total Discounts",
      value: formatCurrency(summary.total_discount),
      icon: Tag,
      color: "#d97706",
      bg: "var(--warning-bg)",
      subtext: `Offers: ${formatCurrency(summary.offer_discount)} | Coupons: ${formatCurrency(summary.coupon_discount)}`,
    },
    {
      title: "Total Orders",
      value: summary.order_count.toLocaleString("en-IN"),
      icon: ShoppingBag,
      color: "var(--success-color)",
      bg: "var(--success-bg)",
      subtext: "Fulfilled sales orders",
    },
    {
      title: "Units Sold",
      value: summary.units_sold.toLocaleString("en-IN"),
      icon: PackageCheck,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.12)",
      subtext: "Delivered / active items",
    },
    {
      title: "Cancelled Amount",
      value: formatCurrency(summary.cancelled_amount),
      icon: XCircle,
      color: "#ef4444",
      bg: "var(--error-bg)",
      subtext: "Refunded via cancellations",
    },
    {
      title: "Returned Amount",
      value: formatCurrency(summary.returned_amount),
      icon: RotateCcw,
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.12)",
      subtext: "Refunded via item returns",
    },
  ];

  return (
    <div className="dashboard-summary-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`dashboard-summary-card ${card.highlight ? "highlight" : ""}`}
            style={{ "--card-accent-color": card.color }}
          >
            <div className="dashboard-summary-card-header">
              <span className="dashboard-summary-title">{card.title}</span>
              <div
                className="dashboard-summary-icon-badge"
                style={{
                  backgroundColor: card.bg,
                  color: card.color,
                }}
              >
                <Icon size={18} />
              </div>
            </div>

            <h2
              className="dashboard-summary-value"
              style={{
                color: card.highlight ? card.color : "var(--text-primary)",
              }}
            >
              {card.value}
            </h2>

            <span className="dashboard-summary-subtext">{card.subtext}</span>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardSummaryCards;
