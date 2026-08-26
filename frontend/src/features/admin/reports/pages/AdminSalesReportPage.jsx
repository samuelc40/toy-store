import React, { useState } from 'react';
import { FileText, Download, AlertCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSalesReport } from '../hooks/useSalesReport';
import { downloadSalesReportPDF, downloadSalesReportExcel } from '../services/salesReportService';
import SalesReportFilters from '../components/SalesReportFilters';
import SalesReportSummary from '../components/SalesReportSummary';
import SalesReportTable from '../components/SalesReportTable';
import SalesReportEmptyState from '../components/SalesReportEmptyState';

function AdminSalesReportPage() {
  const [filterParams, setFilterParams] = useState({ date_range: 'this_month', group_by: 'day' });
  const { reportData, loading, error, fetchReport } = useSalesReport(filterParams);

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
  const hasNoData = summary && summary.order_count === 0 && breakdown.length === 0;

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} style={{ color: 'var(--accent)' }} />
            Sales Reports
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Comprehensive sales performance, revenue breakdowns, and discount metrics.
          </p>
        </div>

        {/* Download Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={loading || downloadingPdf}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1.5px solid var(--accent)',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: (loading || downloadingPdf) ? 'not-allowed' : 'pointer',
              opacity: (loading || downloadingPdf) ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {downloadingPdf ? (
              <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Download size={15} />
            )}
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={loading || downloadingExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1.5px solid var(--success-color, #16a34a)',
              backgroundColor: 'var(--success-bg, #e2fbe8)',
              color: 'var(--success-color, #16a34a)',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: (loading || downloadingExcel) ? 'not-allowed' : 'pointer',
              opacity: (loading || downloadingExcel) ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {downloadingExcel ? (
              <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <FileSpreadsheet size={15} />
            )}
            <span>{downloadingExcel ? 'Generating Excel...' : 'Download Excel'}</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <SalesReportFilters onApply={handleFilterApply} loading={loading} />

      {/* Period Badge */}
      {period && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Active Period:</span>
          <span style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
            {period.start_date} to {period.end_date}
          </span>
          <span>(Grouped by {period.group_by || 'day'})</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow)',
          marginBottom: '24px',
        }}>
          <RefreshCw size={28} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Loading Sales Report...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={{
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <AlertCircle size={24} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 800 }}>Error Loading Report</h4>
            <p style={{ margin: 0, fontSize: '13.5px' }}>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchReport(filterParams)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--error-color)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State vs Data Render */}
      {!loading && !error && hasNoData && (
        <SalesReportEmptyState />
      )}

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
