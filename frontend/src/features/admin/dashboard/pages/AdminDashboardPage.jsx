import React, { useState } from 'react';
import { LayoutDashboard, RefreshCw, AlertCircle } from 'lucide-react';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import DashboardFilters from '../components/DashboardFilters';
import DashboardSummaryCards from '../components/DashboardSummaryCards';
import SalesChart from '../components/SalesChart';
import TopProducts from '../components/TopProducts';
import TopCategories from '../components/TopCategories';
import TopBrands from '../components/TopBrands';

function AdminDashboardPage() {
  const [filterParams, setFilterParams] = useState({ date_range: 'this_month' });
  const { analyticsData, loading, error, fetchAnalytics } = useDashboardAnalytics(filterParams);

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
    <div className="admin-page-container">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={28} style={{ color: 'var(--accent)' }} />
            Admin Dashboard Overview
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Real-time e-commerce analytics, sales revenue trends, and top performers.
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters onApply={handleFilterApply} loading={loading} />

      {/* Period Badge */}
      {period && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>Active Window:</span>
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
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Loading Dashboard Analytics...</span>
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
            <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 800 }}>Error Loading Analytics</h4>
            <p style={{ margin: 0, fontSize: '13.5px' }}>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(filterParams)}
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

      {/* Dashboard Analytics Content */}
      {!loading && !error && summary && (
        <>
          <DashboardSummaryCards summary={summary} />
          <SalesChart salesChart={salesChart} />

          {/* Top 10 Performers Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
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
