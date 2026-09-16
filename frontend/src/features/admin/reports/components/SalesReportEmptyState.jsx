import React from "react";
import { CalendarX } from "lucide-react";

function SalesReportEmptyState({
  message = "No sales data found for the selected period.",
}) {
  return (
    <div className="sales-report-card sales-report-empty-card">
      <div className="sales-report-empty-icon-badge">
        <CalendarX size={32} />
      </div>
      <div>
        <h3 className="sales-report-empty-title">No Sales Found</h3>
        <p className="sales-report-empty-desc">
          {message} Try selecting a different date range or preset.
        </p>
      </div>
    </div>
  );
}

export default SalesReportEmptyState;
