import React, { useState } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';

function SalesReportFilters({ onApply, loading }) {
  const [selectedRange, setSelectedRange] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [validationError, setValidationError] = useState('');

  const presetButtons = [
    { label: 'Daily', value: 'today', defaultGroup: 'day' },
    { label: 'Weekly', value: 'this_week', defaultGroup: 'day' },
    { label: 'Monthly', value: 'this_month', defaultGroup: 'day' },
    { label: 'Yearly', value: 'this_year', defaultGroup: 'month' },
    { label: 'Custom', value: 'custom', defaultGroup: 'day' },
  ];

  const handlePresetChange = (preset) => {
    setSelectedRange(preset.value);
    setGroupBy(preset.defaultGroup);
    setValidationError('');
    
    if (preset.value !== 'custom') {
      setStartDate('');
      setEndDate('');
      onApply({
        date_range: preset.value,
        group_by: preset.defaultGroup,
      });
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    setValidationError('');

    if (selectedRange === 'custom') {
      if (!startDate || !endDate) {
        setValidationError('Please select both Start Date and End Date for custom range.');
        return;
      }
      if (startDate > endDate) {
        setValidationError('Start Date cannot be after End Date.');
        return;
      }
      onApply({
        date_range: 'custom',
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
      });
    } else {
      onApply({
        date_range: selectedRange,
        group_by: groupBy,
      });
    }
  };

  const handleClear = () => {
    setSelectedRange('this_month');
    setStartDate('');
    setEndDate('');
    setGroupBy('day');
    setValidationError('');
    onApply({
      date_range: 'this_month',
      group_by: 'day',
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} style={{ color: 'var(--accent)' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Report Period Filters
          </h3>
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {presetButtons.map((btn) => {
            const isActive = selectedRange === btn.value;
            return (
              <button
                key={btn.value}
                type="button"
                onClick={() => handlePresetChange(btn)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Options Controls */}
      <form onSubmit={handleApplyCustom} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
        {selectedRange === 'custom' && (
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input, var(--card-bg))',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <Filter size={15} />
            <span>{loading ? 'Applying...' : 'Apply Filter'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
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

      {validationError && (
        <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
          {validationError}
        </div>
      )}
    </div>
  );
}

export default SalesReportFilters;
