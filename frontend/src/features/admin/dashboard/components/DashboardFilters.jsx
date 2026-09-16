import React, { useState } from "react";
import { Filter, RefreshCw } from "lucide-react";

function DashboardFilters({ onApply, loading }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [mode, setMode] = useState("this_month");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validationError, setValidationError] = useState("");

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const years = [currentYear, currentYear - 1, currentYear - 2];

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setValidationError("");

    if (newMode === "this_month") {
      onApply({ date_range: "this_month" });
    } else if (newMode === "this_year") {
      onApply({ date_range: "this_year" });
    } else if (newMode === "yearly_trend") {
      onApply({ year: selectedYear });
    } else if (newMode === "monthly_view") {
      onApply({ year: selectedYear, month: selectedMonth });
    }
  };

  const handleApply = (e) => {
    e.preventDefault();
    setValidationError("");

    if (mode === "custom") {
      if (!startDate || !endDate) {
        setValidationError("Please select both From Date and To Date.");
        return;
      }
      if (startDate > endDate) {
        setValidationError("From Date cannot be after To Date.");
        return;
      }
      onApply({
        date_range: "custom",
        start_date: startDate,
        end_date: endDate,
      });
    } else if (mode === "yearly_trend") {
      onApply({ year: selectedYear });
    } else if (mode === "monthly_view") {
      onApply({ year: selectedYear, month: selectedMonth });
    } else {
      onApply({ date_range: mode });
    }
  };

  const handleReset = () => {
    setMode("this_month");
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setStartDate("");
    setEndDate("");
    setValidationError("");
    onApply({ date_range: "this_month" });
  };

  return (
    <div className="dashboard-card dashboard-filters-card">
      <div className="dashboard-filters-header">
        <div className="dashboard-filters-title-group">
          <Filter size={18} style={{ color: "var(--accent)" }} />
          <h3 className="dashboard-filters-title">Dashboard Filters</h3>
        </div>

        {/* Mode Selector Buttons */}
        <div className="dashboard-filter-modes">
          <button
            type="button"
            onClick={() => handleModeChange("this_month")}
            className={`dashboard-filter-mode-btn ${mode === "this_month" ? "active" : "inactive"}`}
          >
            This Month
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("this_year")}
            className={`dashboard-filter-mode-btn ${mode === "this_year" ? "active" : "inactive"}`}
          >
            This Year
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("yearly_trend")}
            className={`dashboard-filter-mode-btn ${mode === "yearly_trend" ? "active" : "inactive"}`}
          >
            Yearly Trend
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("monthly_view")}
            className={`dashboard-filter-mode-btn ${mode === "monthly_view" ? "active" : "inactive"}`}
          >
            Monthly View
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("custom")}
            className={`dashboard-filter-mode-btn ${mode === "custom" ? "active" : "inactive"}`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {/* Form inputs depending on mode */}
      {(mode === "yearly_trend" ||
        mode === "monthly_view" ||
        mode === "custom") && (
        <form onSubmit={handleApply} className="dashboard-filter-form">
          {(mode === "yearly_trend" || mode === "monthly_view") && (
            <div className="dashboard-filter-field">
              <label className="dashboard-filter-label">Select Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="dashboard-filter-select"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "monthly_view" && (
            <div className="dashboard-filter-field">
              <label className="dashboard-filter-label">Select Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="dashboard-filter-select"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "custom" && (
            <>
              <div className="dashboard-filter-field">
                <label className="dashboard-filter-label">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setValidationError("");
                  }}
                  className="dashboard-filter-input"
                />
              </div>

              <div className="dashboard-filter-field">
                <label className="dashboard-filter-label">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setValidationError("");
                  }}
                  className="dashboard-filter-input"
                />
              </div>
            </>
          )}

          <div className="dashboard-filter-actions">
            <button
              type="submit"
              disabled={loading}
              className="dashboard-btn-primary"
            >
              <Filter size={15} />
              <span>{loading ? "Applying..." : "Apply Filter"}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="dashboard-btn-secondary"
            >
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </form>
      )}

      {validationError && (
        <div className="dashboard-filter-error">{validationError}</div>
      )}
    </div>
  );
}

export default DashboardFilters;
