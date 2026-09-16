import React from "react";
import { Tag } from "lucide-react";
import { formatCurrency } from "../../reports/utils/reportFormatters";

function TopBrands({ brands }) {
  if (!brands || brands.length === 0) {
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
        No brand sales data available for this period.
      </div>
    );
  }

  return (
    <div className="dashboard-card top-performer-card">
      <div className="top-performer-header">
        <Tag size={18} style={{ color: "#0284c7", flexShrink: 0 }} />
        <h3 className="top-performer-title">Top 10 Best Selling Brands</h3>
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
              <th>Brand Name</th>
              <th style={{ textAlign: "right" }}>Units</th>
              <th style={{ textAlign: "right" }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((item) => (
              <tr key={item.rank}>
                <td
                  style={{
                    fontWeight: 800,
                    color: item.rank <= 3 ? "#0284c7" : "var(--text-secondary)",
                  }}
                >
                  {item.rank}
                </td>
                <td className="top-performer-name-cell">{item.brand_name}</td>
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
                    color: "#0284c7",
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

export default TopBrands;
