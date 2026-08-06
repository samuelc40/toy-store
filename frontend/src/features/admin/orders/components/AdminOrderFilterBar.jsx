import React from "react";
import { Search, Filter, RotateCcw, Calendar, ArrowUpDown } from "lucide-react";

export function AdminOrderFilterBar({
    searchInput,
    onSearchChange,
    sortOption,
    onSortChange,
    orderStatusFilter,
    onOrderStatusChange,
    paymentMethodFilter,
    onPaymentMethodChange,
    paymentStatusFilter,
    onPaymentStatusChange,
    dateRangeFilter,
    onDateRangeChange,
    startDate,
    endDate,
    onCustomDateChange,
    onResetFilters,
}) {
    return (
        <div className="admin-orders-filter-bar">
            {/* Top Search & Reset Row */}
            <div className="filter-top-row">
                <div className="admin-search-input-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Order #, Customer name, email, phone, product..."
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => onSearchChange("")}
                        >
                            &times;
                        </button>
                    )}
                </div>

                <div className="filter-actions-right">
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="btn-reset-filters"
                        title="Reset All Filters"
                    >
                        <RotateCcw size={14} />
                        <span>Clear Filters</span>
                    </button>
                </div>
            </div>

            {/* Bottom Multi-Filter Dropdowns Grid */}
            <div className="filter-dropdowns-grid">
                {/* Order Status Filter */}
                <div className="filter-control-item">
                    <label>Order Status</label>
                    <select
                        value={orderStatusFilter}
                        onChange={(e) => onOrderStatusChange(e.target.value)}
                    >
                        <option value="ALL">All Order Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="RETURN_REQUESTED">Return Requested</option>
                        <option value="RETURNED">Returned</option>
                    </select>
                </div>

                {/* Payment Method Filter */}
                <div className="filter-control-item">
                    <label>Payment Method</label>
                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                    >
                        <option value="ALL">All Payment Methods</option>
                        <option value="COD">Cash On Delivery (COD)</option>
                    </select>
                </div>

                {/* Payment Status Filter */}
                <div className="filter-control-item">
                    <label>Payment Status</label>
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => onPaymentStatusChange(e.target.value)}
                    >
                        <option value="ALL">All Payment Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>

                {/* Date Range Filter */}
                <div className="filter-control-item">
                    <label>Date Range</label>
                    <select
                        value={dateRangeFilter}
                        onChange={(e) => onDateRangeChange(e.target.value)}
                    >
                        <option value="ALL">All Dates</option>
                        <option value="today">Today</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                        <option value="custom">Custom Date Range</option>
                    </select>
                </div>

                {/* Sort Option */}
                <div className="filter-control-item">
                    <label>Sort By</label>
                    <select
                        value={sortOption}
                        onChange={(e) => onSortChange(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest_total">Highest Amount</option>
                        <option value="lowest_total">Lowest Amount</option>
                        <option value="name_asc">Customer (A - Z)</option>
                        <option value="name_desc">Customer (Z - A)</option>
                    </select>
                </div>
            </div>

            {/* Custom Date Inputs (if custom date range selected) */}
            {dateRangeFilter === "custom" && (
                <div className="custom-date-inputs-row">
                    <div className="date-input-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onCustomDateChange(e.target.value, endDate)}
                        />
                    </div>
                    <div className="date-input-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onCustomDateChange(startDate, e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOrderFilterBar;
