import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    Eye,
    RefreshCw,
    ShoppingBag,
    Calendar,
    User,
    CreditCard,
    DollarSign,
    Package,
} from "lucide-react";

import {
    fetchAdminOrdersAsync,
    updateAdminOrderStatusAsync,
    selectAdminOrders,
    selectAdminOrdersCount,
    selectAdminOrdersTotalPages,
    selectAdminOrdersCurrentPage,
    selectAdminPageSize,
    selectAdminSearchQuery,
    selectAdminSortOption,
    selectAdminOrderStatusFilter,
    selectAdminPaymentMethodFilter,
    selectAdminPaymentStatusFilter,
    selectAdminDateRangeFilter,
    selectAdminStartDate,
    selectAdminEndDate,
    selectAdminOrdersLoading,
    selectAdminOrdersUpdateLoading,
    setSearchQuery,
    setSortOption,
    setOrderStatusFilter,
    setPaymentMethodFilter,
    setPaymentStatusFilter,
    setDateRangeFilter,
    setCustomDateRange,
    setCurrentPage,
    setPageSize,
    resetFilters,
} from "../redux/adminOrdersSlice";

import AdminOrderFilterBar from "../components/AdminOrderFilterBar";
import AdminOrderStatusModal from "../components/AdminOrderStatusModal";
import Pagination from "../../../../pages/admin/Pagination";
import "../styles/AdminOrders.css";

export function AdminOrdersPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const orders = useSelector(selectAdminOrders);
    const count = useSelector(selectAdminOrdersCount);
    const totalPages = useSelector(selectAdminOrdersTotalPages);
    const currentPage = useSelector(selectAdminOrdersCurrentPage);
    const pageSize = useSelector(selectAdminPageSize);
    const searchQuery = useSelector(selectAdminSearchQuery);
    const sortOption = useSelector(selectAdminSortOption);
    const orderStatusFilter = useSelector(selectAdminOrderStatusFilter);
    const paymentMethodFilter = useSelector(selectAdminPaymentMethodFilter);
    const paymentStatusFilter = useSelector(selectAdminPaymentStatusFilter);
    const dateRangeFilter = useSelector(selectAdminDateRangeFilter);
    const startDate = useSelector(selectAdminStartDate);
    const endDate = useSelector(selectAdminEndDate);
    const loading = useSelector(selectAdminOrdersLoading);
    const updateLoading = useSelector(selectAdminOrdersUpdateLoading);

    // Local debounced search state
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);

    // Debounce search dispatcher
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setSearchQuery(searchInput));
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    // Fetch Orders API whenever query state changes
    const loadOrders = useCallback(() => {
        dispatch(
            fetchAdminOrdersAsync({
                search: searchQuery,
                sort: sortOption,
                order_status: orderStatusFilter,
                payment_method: paymentMethodFilter,
                payment_status: paymentStatusFilter,
                date_range: dateRangeFilter,
                start_date: startDate,
                end_date: endDate,
                page: currentPage,
                page_size: pageSize,
            })
        );
    }, [
        dispatch,
        searchQuery,
        sortOption,
        orderStatusFilter,
        paymentMethodFilter,
        paymentStatusFilter,
        dateRangeFilter,
        startDate,
        endDate,
        currentPage,
        pageSize,
    ]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const handleReset = () => {
        setSearchInput("");
        dispatch(resetFilters());
    };

    const handlePageChange = (newPage) => {
        dispatch(setCurrentPage(newPage));
    };

    const handlePageSizeChange = (newPageSize) => {
        dispatch(setPageSize(newPageSize));
    };

    const handleStatusConfirm = async (newStatus) => {
        if (!selectedOrderForStatus) return;
        try {
            await dispatch(
                updateAdminOrderStatusAsync({
                    orderId: selectedOrderForStatus.id,
                    orderStatus: newStatus,
                })
            ).unwrap();
            toast.success(`Order #${selectedOrderForStatus.order_number} status updated to '${newStatus.replace("_", " ")}'!`);
            setSelectedOrderForStatus(null);
            loadOrders();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update order status.");
        }
    };

    const renderStatusBadge = (status) => {
        let badgeClass = "badge-pending";
        switch (status) {
            case "CONFIRMED":
            case "PACKED":
                badgeClass = "badge-confirmed";
                break;
            case "SHIPPED":
                badgeClass = "badge-shipped";
                break;
            case "OUT_FOR_DELIVERY":
                badgeClass = "badge-out-for-delivery";
                break;
            case "DELIVERED":
                badgeClass = "badge-delivered";
                break;
            case "CANCELLED":
                badgeClass = "badge-cancelled";
                break;
            case "RETURN_REQUESTED":
            case "RETURNED":
                badgeClass = "badge-returned";
                break;
            default:
                badgeClass = "badge-pending";
        }

        return (
            <span className={`status-badge ${badgeClass}`}>
                {status ? status.replace(/_/g, " ") : "PENDING"}
            </span>
        );
    };

    return (
        <div className="admin-orders-page-container">
            {/* Header */}
            <div className="admin-orders-header">
                <div>
                    <h2>Admin Order Management</h2>
                    <p>Track, filter, and process customer orders across all fulfillment stages.</p>
                </div>
                <div className="orders-count-pill">
                    Total Orders: <strong>{count}</strong>
                </div>
            </div>

            {/* Multi-Filter Bar */}
            <AdminOrderFilterBar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                sortOption={sortOption}
                onSortChange={(val) => dispatch(setSortOption(val))}
                orderStatusFilter={orderStatusFilter}
                onOrderStatusChange={(val) => dispatch(setOrderStatusFilter(val))}
                paymentMethodFilter={paymentMethodFilter}
                onPaymentMethodChange={(val) => dispatch(setPaymentMethodFilter(val))}
                paymentStatusFilter={paymentStatusFilter}
                onPaymentStatusChange={(val) => dispatch(setPaymentStatusFilter(val))}
                dateRangeFilter={dateRangeFilter}
                onDateRangeChange={(val) => dispatch(setDateRangeFilter(val))}
                startDate={startDate}
                endDate={endDate}
                onCustomDateChange={(start, end) => dispatch(setCustomDateRange({ startDate: start, endDate: end }))}
                onResetFilters={handleReset}
            />

            {/* Orders Table Layout */}
            <div className="responsive-table-container">
                {loading ? (
                    <div className="table-loading-skeleton">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state-card">
                        <ShoppingBag size={48} className="empty-icon" />
                        <h3>No orders found</h3>
                        <p>Try adjusting your search query, status filters, or date range.</p>
                        <button type="button" onClick={handleReset} className="btn-reset-filters">
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <table className="responsive-table">
                        <thead>
                            <tr>
                                <th>ORDER #</th>
                                <th>DATE</th>
                                <th>CUSTOMER</th>
                                <th>PHONE</th>
                                <th>TOTAL</th>
                                <th>PAYMENT</th>
                                <th>ORDER STATUS</th>
                                <th>ITEMS</th>
                                <th style={{ textAlign: "right" }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((ord) => (
                                <tr key={ord.id}>
                                    <td data-label="ORDER #" style={{ fontWeight: 800, color: "var(--accent-color)" }}>
                                        #{ord.order_number}
                                    </td>
                                    <td data-label="DATE" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                        {new Date(ord.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td data-label="CUSTOMER">
                                        <div className="customer-cell-info">
                                            <strong style={{ color: "var(--text-primary)" }}>
                                                {ord.shipping_name || (ord.customer ? `${ord.customer.first_name} ${ord.customer.last_name}` : "Guest")}
                                            </strong>
                                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block" }}>
                                                {ord.customer?.email || "N/A"}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="PHONE" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                        {ord.shipping_phone || ord.customer?.phone || "N/A"}
                                    </td>
                                    <td data-label="TOTAL" style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                                        Rs. {parseFloat(ord.total_amount || 0).toFixed(2)}
                                    </td>
                                    <td data-label="PAYMENT">
                                        <div style={{ fontSize: "12.5px" }}>
                                            <span style={{ fontWeight: 700, display: "block" }}>{ord.payment_method}</span>
                                            <span style={{ fontSize: "11.5px", color: ord.payment_status === "PAID" ? "#10b981" : "#f59e0b" }}>
                                                {ord.payment_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="ORDER STATUS">
                                        {renderStatusBadge(ord.order_status)}
                                    </td>
                                    <td data-label="ITEMS" style={{ fontWeight: 700, textAlign: "center" }}>
                                        {ord.items_count || 0}
                                    </td>
                                    <td data-label="ACTIONS" style={{ textAlign: "right" }}>
                                        <div className="table-action-group">
                                            <button
                                                type="button"
                                                className="btn-table-action view"
                                                onClick={() => navigate(`/admin/orders/${ord.id}`)}
                                                title="View Full Order Details"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-table-action update"
                                                onClick={() => setSelectedOrderForStatus(ord)}
                                                title="Update Status"
                                            >
                                                <RefreshCw size={14} /> Status
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {count > 0 && (
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    count={count}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    itemLabel="Orders"
                />
            )}

            {/* Status Update Modal */}
            <AdminOrderStatusModal
                isOpen={!!selectedOrderForStatus}
                onClose={() => setSelectedOrderForStatus(null)}
                onConfirm={handleStatusConfirm}
                order={selectedOrderForStatus}
                isLoading={updateLoading}
            />
        </div>
    );
}

export default AdminOrdersPage;
