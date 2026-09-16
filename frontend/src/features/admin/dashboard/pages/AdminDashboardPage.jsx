import React, { useState } from "react";
import { LayoutDashboard, RefreshCw, AlertCircle } from "lucide-react";
import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import DashboardFilters from "../components/DashboardFilters";
import DashboardSummaryCards from "../components/DashboardSummaryCards";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import TopCategories from "../components/TopCategories";
import TopBrands from "../components/TopBrands";
import "../styles/AdminDashboard.css";

function AdminDashboardPage() {
  const [filterParams, setFilterParams] = useState({
    date_range: "this_month",
  });
  const { analyticsData, loading, error, fetchAnalytics } =
    useDashboardAnalytics(filterParams);

  const handleFilterApply = (newParams) => {
    setFilterParams(newParams);
    fetchAnalytics(newParams);
  };

  const summary = analyticsData?.summary;
  const salesChart = analyticsData?.sales_chart;
  const topProducts = analyticsData?.top_products || [];
  const topCategories = analyticsData?.top_categories || [];
  const topBrands = analyticsData?.top_brands || [];
  const period = analyticsData?.period;

  return (
    <div className="admin-page-container dashboard-page-container">
      {/* Header */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-page-title">
            <LayoutDashboard size={26} style={{ color: "var(--accent)" }} />
            Admin Dashboard Overview
          </h1>
          <p className="dashboard-page-subtitle">
            Real-time e-commerce analytics, sales revenue trends, and top
            performers.
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters onApply={handleFilterApply} loading={loading} />

      {/* Period Badge */}
      {period && (
        <div className="dashboard-period-badge-wrapper">
          <span>Active Window:</span>
          <span className="dashboard-period-badge">
            {period.start_date} to {period.end_date}
          </span>
          <span>(Grouped by {period.group_by || "day"})</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="dashboard-card dashboard-loading-card">
          <RefreshCw
            size={28}
            style={{
              animation: "spin 1s linear infinite",
              color: "var(--accent)",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "14.5px" }}>
            Loading Dashboard Analytics...
          </span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="dashboard-card dashboard-error-card">
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <div className="dashboard-error-card-body">
            <h4 className="dashboard-error-card-title">
              Error Loading Analytics
            </h4>
            <p className="dashboard-error-card-desc">{error}</p>
          </div>
          <button
            type="button"
            className="dashboard-retry-btn"
            onClick={() => fetchAnalytics(filterParams)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Dashboard Analytics Content */}
      {!loading && !error && summary && (
        <>
          <DashboardSummaryCards summary={summary} />
          <SalesChart salesChart={salesChart} />

          {/* Top 10 Performers Tables Grid */}
          <div className="dashboard-performers-grid">
            <TopProducts products={topProducts} />
            <TopCategories categories={topCategories} />
            <TopBrands brands={topBrands} />
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;
