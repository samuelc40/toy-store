import React, { useState } from "react";
import {
  FileText,
  Download,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSalesReport } from "../hooks/useSalesReport";
import {
  downloadSalesReportPDF,
  downloadSalesReportExcel,
} from "../services/salesReportService";
import SalesReportFilters from "../components/SalesReportFilters";
import SalesReportSummary from "../components/SalesReportSummary";
import SalesReportTable from "../components/SalesReportTable";
import SalesReportEmptyState from "../components/SalesReportEmptyState";
import "../styles/SalesReport.css";

function AdminSalesReportPage() {
  const [filterParams, setFilterParams] = useState({
    date_range: "this_month",
    group_by: "day",
  });
  const { reportData, loading, error, fetchReport } =
    useSalesReport(filterParams);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const handleFilterApply = (newParams) => {
    setFilterParams(newParams);
    fetchReport(newParams);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      await downloadSalesReportPDF(filterParams);
      toast.success("PDF report downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to generate PDF report. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    try {
      await downloadSalesReportExcel(filterParams);
      toast.success("Excel report downloaded successfully!");
    } catch (err) {
      console.error("Excel download error:", err);
      toast.error("Failed to generate Excel report. Please try again.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const summary = reportData?.summary;
  const breakdown = reportData?.breakdown || [];
  const period = reportData?.period;
  const hasNoData =
    summary && summary.order_count === 0 && breakdown.length === 0;

  return (
    <div className="admin-page-container sales-report-page-container">
      {/* Page Header */}
      <div className="sales-report-header-row">
        <div>
          <h1 className="sales-report-page-title">
            <FileText size={26} style={{ color: "var(--accent)" }} />
            Sales Reports
          </h1>
          <p className="sales-report-page-subtitle">
            Comprehensive sales performance, revenue breakdowns, and discount
            metrics.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="sales-report-actions">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={loading || downloadingPdf}
            className="sales-report-download-btn-pdf"
          >
            {downloadingPdf ? (
              <RefreshCw
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Download size={15} />
            )}
            <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={loading || downloadingExcel}
            className="sales-report-download-btn-excel"
          >
            {downloadingExcel ? (
              <RefreshCw
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <FileSpreadsheet size={15} />
            )}
            <span>{downloadingExcel ? "Generating..." : "Download Excel"}</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <SalesReportFilters onApply={handleFilterApply} loading={loading} />

      {/* Period Badge */}
      {period && (
        <div className="sales-report-period-badge-wrapper">
          <span>Active Period:</span>
          <span className="sales-report-period-badge">
            {period.start_date} to {period.end_date}
          </span>
          <span>(Grouped by {period.group_by || "day"})</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="sales-report-card sales-report-loading-card">
          <RefreshCw
            size={28}
            style={{
              animation: "spin 1s linear infinite",
              color: "var(--accent)",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "14.5px" }}>
            Loading Sales Report...
          </span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          className="sales-report-card"
          style={{
            backgroundColor: "var(--error-bg)",
            color: "var(--error-color)",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4
              style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: 800 }}
            >
              Error Loading Report
            </h4>
            <p style={{ margin: 0, fontSize: "13px" }}>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchReport(filterParams)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              backgroundColor: "var(--error-color)",
              color: "#ffffff",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State vs Data Render */}
      {!loading && !error && hasNoData && <SalesReportEmptyState />}

      {!loading && !error && summary && !hasNoData && (
        <>
          <SalesReportSummary summary={summary} />
          <SalesReportTable breakdown={breakdown} />
        </>
      )}
    </div>
  );
}

export default AdminSalesReportPage;
