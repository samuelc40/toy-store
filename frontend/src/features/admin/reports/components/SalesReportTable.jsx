import React from "react";
import { formatDate, formatCurrency } from "../utils/reportFormatters";

function SalesReportTable({ breakdown }) {
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div className="sales-report-card sales-report-table-card">
      <div className="sales-report-table-header">
        <h3 className="sales-report-table-title">Sales Breakdown History</h3>
        <span className="sales-report-table-count">
          {breakdown.length} {breakdown.length === 1 ? "Period" : "Periods"}{" "}
          Recorded
        </span>
      </div>

      <div className="sales-report-table-wrapper">
        <table className="sales-report-table">
          <thead>
            <tr
              style={{
                backgroundColor: "var(--bg-secondary, rgba(0, 0, 0, 0.02))",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <th>Date / Period</th>
              <th style={{ textAlign: "right" }}>Orders</th>
              <th style={{ textAlign: "right" }}>Units Sold</th>
              <th style={{ textAlign: "right" }}>Gross Sales</th>
              <th style={{ textAlign: "right" }}>Offer Discount</th>
              <th style={{ textAlign: "right" }}>Coupon Discount</th>
              <th style={{ textAlign: "right" }}>Total Discount</th>
              <th style={{ textAlign: "right" }}>Shipping</th>
              <th style={{ textAlign: "right" }}>Cancelled</th>
              <th style={{ textAlign: "right" }}>Returned</th>
              <th style={{ textAlign: "right" }}>Net Sales</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {formatDate(row.date)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {row.order_count}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {row.units_sold}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {formatCurrency(row.gross_sales)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#d97706",
                  }}
                >
                  {formatCurrency(row.offer_discount)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#d97706",
                  }}
                >
                  {formatCurrency(row.coupon_discount)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: "#d97706",
                  }}
                >
                  {formatCurrency(row.total_discount)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {formatCurrency(row.shipping)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#ef4444",
                  }}
                >
                  {formatCurrency(row.cancelled_amount)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#f97316",
                  }}
                >
                  {formatCurrency(row.returned_amount)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 800,
                    color: "var(--accent)",
                  }}
                >
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
