import React from "react";
import { Package } from "lucide-react";
import { formatCurrency } from "../../reports/utils/reportFormatters";

function TopProducts({ products }) {
  if (!products || products.length === 0) {
    return (
      <div
        className="dashboard-card top-performer-card"
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "13.5px",
        }}
      >
        No product sales data available for this period.
      </div>
    );
  }

  return (
    <div className="dashboard-card top-performer-card">
      <div className="top-performer-header">
        <Package size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <h3 className="top-performer-title">Top 10 Best Selling Products</h3>
      </div>

      <div className="top-performer-table-wrapper">
        <table className="top-performer-table">
          <thead>
            <tr
              style={{
                backgroundColor: "var(--bg-secondary, rgba(0, 0, 0, 0.02))",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <th style={{ width: "40px" }}>#</th>
              <th>Product Name</th>
              <th style={{ textAlign: "right" }}>Units</th>
              <th style={{ textAlign: "right" }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.rank}>
                <td
                  style={{
                    fontWeight: 800,
                    color:
                      item.rank <= 3
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                  }}
                >
                  {item.rank}
                </td>
                <td className="top-performer-name-cell">{item.product_name}</td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.units_sold}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 800,
                    color: "var(--accent)",
                  }}
                >
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

export default TopProducts;
