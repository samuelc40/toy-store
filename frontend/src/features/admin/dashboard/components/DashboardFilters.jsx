import React, { useState } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

function DashboardFilters({ onApply, loading }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [mode, setMode] = useState('this_month');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  const years = [currentYear, currentYear - 1, currentYear - 2];

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValidationError('');

    if (newMode === 'this_month') {
      onApply({ date_range: 'this_month' });
    } else if (newMode === 'this_year') {
      onApply({ date_range: 'this_year' });
    } else if (newMode === 'yearly_trend') {
      onApply({ year: selectedYear });
    } else if (newMode === 'monthly_view') {
      onApply({ year: selectedYear, month: selectedMonth });
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    setValidationError('');

    if (mode === 'custom') {
      if (!startDate || !endDate) {
        setValidationError('Please select both From Date and To Date.');
        return;
      }
      if (startDate > endDate) {
        setValidationError('From Date cannot be after To Date.');
        return;
      }
      onApply({ date_range: 'custom', start_date: startDate, end_date: endDate });
    } else if (mode === 'yearly_trend') {
      onApply({ year: selectedYear });
    } else if (mode === 'monthly_view') {
      onApply({ year: selectedYear, month: selectedMonth });
    } else {
      onApply({ date_range: mode });
    }
  };

  const handleReset = () => {
    setMode('this_month');
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setStartDate('');
    setEndDate('');
    setValidationError('');
    onApply({ date_range: 'this_month' });
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Dashboard Filters
          </h3>
        </div>

        {/* Mode Selector Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleModeChange('this_month')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: mode === 'this_month' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'this_month' ? 'var(--accent-bg)' : 'transparent',
              color: mode === 'this_month' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: mode === 'this_month' ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            This Month
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('this_year')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: mode === 'this_year' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'this_year' ? 'var(--accent-bg)' : 'transparent',
              color: mode === 'this_year' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: mode === 'this_year' ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            This Year
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('yearly_trend')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: mode === 'yearly_trend' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'yearly_trend' ? 'var(--accent-bg)' : 'transparent',
              color: mode === 'yearly_trend' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: mode === 'yearly_trend' ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Yearly Trend
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('monthly_view')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: mode === 'monthly_view' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'monthly_view' ? 'var(--accent-bg)' : 'transparent',
              color: mode === 'monthly_view' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: mode === 'monthly_view' ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Monthly View
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: mode === 'custom' ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
              backgroundColor: mode === 'custom' ? 'var(--accent-bg)' : 'transparent',
              color: mode === 'custom' ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: mode === 'custom' ? 800 : 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Form inputs depending on mode */}
      {(mode === 'yearly_trend' || mode === 'monthly_view' || mode === 'custom') && (
        <form onSubmit={handleApply} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px', marginTop: '16px' }}>
          {(mode === 'yearly_trend' || mode === 'monthly_view') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input, var(--card-bg))',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'monthly_view' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-input, var(--card-bg))',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'custom' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setValidationError(''); }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-input, var(--card-bg))',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setValidationError(''); }}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-input, var(--card-bg))',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Filter size={15} />
              <span>{loading ? 'Applying...' : 'Apply Filter'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </form>
      )}

      {validationError && (
        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
          {validationError}
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;
