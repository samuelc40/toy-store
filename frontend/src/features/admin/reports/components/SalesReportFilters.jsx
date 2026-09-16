import React, { useState } from "react";
import { Filter, RefreshCw } from "lucide-react";

function SalesReportFilters({ onApply, loading }) {
  const [selectedRange, setSelectedRange] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState("day");
  const [validationError, setValidationError] = useState("");

  const presetButtons = [
    { label: "Daily", value: "today", defaultGroup: "day" },
    { label: "Weekly", value: "this_week", defaultGroup: "day" },
    { label: "Monthly", value: "this_month", defaultGroup: "day" },
    { label: "Yearly", value: "this_year", defaultGroup: "month" },
    { label: "Custom", value: "custom", defaultGroup: "day" },
  ];

  const handlePresetChange = (preset) => {
    setSelectedRange(preset.value);
    setGroupBy(preset.defaultGroup);
    setValidationError("");

    if (preset.value !== "custom") {
      setStartDate("");
      setEndDate("");
      onApply({
        date_range: preset.value,
        group_by: preset.defaultGroup,
      });
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    setValidationError("");

    if (selectedRange === "custom") {
      if (!startDate || !endDate) {
        setValidationError(
          "Please select both Start Date and End Date for custom range.",
        );
        return;
      }
      if (startDate > endDate) {
        setValidationError("Start Date cannot be after End Date.");
        return;
      }
      onApply({
        date_range: "custom",
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
    setSelectedRange("this_month");
    setStartDate("");
    setEndDate("");
    setGroupBy("day");
    setValidationError("");
    onApply({
      date_range: "this_month",
      group_by: "day",
    });
  };

  return (
    <div className="sales-report-card sales-report-filters-card">
      <div className="sales-report-filters-header">
        <div className="sales-report-filters-title-group">
          <Filter size={18} style={{ color: "var(--accent)" }} />
          <h3 className="sales-report-filters-title">Report Period Filters</h3>
        </div>

        {/* Preset Buttons */}
        <div className="sales-report-preset-buttons">
          {presetButtons.map((btn) => {
            const isActive = selectedRange === btn.value;
            return (
              <button
                key={btn.value}
                type="button"
                onClick={() => handlePresetChange(btn)}
                className={`sales-report-preset-btn ${isActive ? "active" : "inactive"}`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Options Controls */}
      <form onSubmit={handleApplyCustom} className="sales-report-filter-form">
        {selectedRange === "custom" && (
          <>
            <div className="sales-report-filter-field">
              <label className="sales-report-filter-label">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setValidationError("");
                }}
                className="sales-report-filter-input"
              />
            </div>

            <div className="sales-report-filter-field">
              <label className="sales-report-filter-label">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setValidationError("");
                }}
                className="sales-report-filter-input"
              />
            </div>
          </>
        )}

        <div className="sales-report-filter-field">
          <label className="sales-report-filter-label">Group By</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="sales-report-filter-select"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="sales-report-filter-actions">
          <button
            type="submit"
            disabled={loading}
            className="sales-report-btn-primary"
          >
            <Filter size={15} />
            <span>{loading ? "Applying..." : "Apply Filter"}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="sales-report-btn-secondary"
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {validationError && (
        <div className="sales-report-filter-error">{validationError}</div>
      )}
    </div>
  );
}

export default SalesReportFilters;
