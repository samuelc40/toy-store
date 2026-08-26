import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    XCircle,
    Search,
    RefreshCw,
    Eye,
    CheckCircle2,
    Clock,
} from "lucide-react";

import {
    fetchAdminCancellationsAsync,
    approveAdminCancellationAsync,
    rejectAdminCancellationAsync,
    selectAdminCancellations,
    selectAdminCancellationsCount,
    selectAdminCancellationsTotalPages,
    selectAdminCancellationsCurrentPage,
    selectAdminCancellationsSearchQuery,
    selectAdminCancellationsStatusFilter,
    selectAdminCancellationsLoading,
    selectAdminProcessCancellationLoading,
    setCancellationsSearchQuery,
    setCancellationsStatusFilter,
    setCancellationsCurrentPage,
} from "../redux/adminOrdersSlice";

import AdminCancellationDetailModal from "../components/AdminCancellationDetailModal";
import Pagination from "../../../../pages/admin/Pagination";
import "../styles/AdminOrders.css";

export function AdminCancellationsPage() {
    const dispatch = useDispatch();

    const cancellationsList = useSelector(selectAdminCancellations);
    const count = useSelector(selectAdminCancellationsCount);
    const totalPages = useSelector(selectAdminCancellationsTotalPages);
    const currentPage = useSelector(selectAdminCancellationsCurrentPage);
    const searchQuery = useSelector(selectAdminCancellationsSearchQuery);
    const statusFilter = useSelector(selectAdminCancellationsStatusFilter);
    const loading = useSelector(selectAdminCancellationsLoading);
    const processLoading = useSelector(selectAdminProcessCancellationLoading);

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [selectedCancellation, setSelectedCancellation] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setCancellationsSearchQuery(searchInput));
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    // Load Cancellation Requests
    const loadCancellations = useCallback(() => {
        dispatch(
            fetchAdminCancellationsAsync({
                search: searchQuery,
                status: statusFilter,
                page: currentPage,
            })
        );
    }, [dispatch, searchQuery, statusFilter, currentPage]);

    useEffect(() => {
        loadCancellations();
    }, [loadCancellations]);

    const handleApprove = async (cancellationId, remark) => {
        try {
            const res = await dispatch(
                approveAdminCancellationAsync({ cancellationId, admin_remark: remark })
            ).unwrap();
            toast.success(res.message || "Cancellation request approved, stock restored, and refund processed!");
            setSelectedCancellation(null);
            loadCancellations();
        } catch (err) {
            toast.error(err || "Failed to approve cancellation request.");
        }
    };

    const handleReject = async (cancellationId, remark) => {
        try {
            const res = await dispatch(
                rejectAdminCancellationAsync({ cancellationId, admin_remark: remark })
            ).unwrap();
            toast.info(res.message || "Cancellation request rejected.");
            setSelectedCancellation(null);
            loadCancellations();
        } catch (err) {
            toast.error(err || "Failed to reject cancellation request.");
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case "PENDING":
                return <span className="status-badge warning"><Clock size={13} /> PENDING</span>;
            case "APPROVED":
                return <span className="status-badge success"><CheckCircle2 size={13} /> APPROVED</span>;
            case "REJECTED":
                return <span className="status-badge danger"><XCircle size={13} /> REJECTED</span>;
            default:
                return <span className="status-badge">{st}</span>;
        }
    };

    const statusTabs = [
        { label: "All Cancellations", value: "ALL" },
        { label: "Pending", value: "PENDING" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
    ];

    return (
        <div className="admin-orders-page-container">
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">
                        <XCircle size={24} className="title-icon text-accent" />
                        Cancellation Requests Management
                    </h1>
                    <p className="admin-page-subtitle">
                        Review customer cancellation requests, approve stock replenishment, and process refunds safely.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-secondary-pill"
                    onClick={loadCancellations}
                    disabled={loading}
                    title="Refresh List"
                >
                    <RefreshCw size={16} className={loading ? "spinner-icon" : ""} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="admin-filter-bar">
                {/* Search Input */}
                <div className="search-input-group">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by Order #, Customer, Reason, Request ID..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                {/* Status Tabs */}
                <div className="status-tabs-list">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            className={`status-tab-btn ${statusFilter === tab.value ? "active" : ""}`}
                            onClick={() => dispatch(setCancellationsStatusFilter(tab.value))}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Table Area */}
            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-table-loading-state">
                        <RefreshCw size={28} className="spinner-icon text-accent" />
                        <p>Loading cancellation requests...</p>
                    </div>
                ) : cancellationsList.length === 0 ? (
                    <div className="admin-empty-state">
                        <XCircle size={42} className="empty-icon text-muted" />
                        <h3>No Cancellation Requests Found</h3>
                        <p>Try adjusting your search query or status filter.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Type</th>
                                <th>Customer</th>
                                <th>Reason</th>
                                <th>Refund Amount</th>
                                <th>Requested Date</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cancellationsList.map((item) => {
                                const customer = item.customer || {};
                                const refundVal = item.refund_amount_val || item.order_details?.total_amount || "0.00";
                                return (
                                    <tr key={item.id}>
                                        <td className="font-bold text-accent">
                                            {item.order_number || "N/A"}
                                        </td>
                                        <td>
                                            <span className="reason-pill text-xs font-semibold">
                                                {item.is_item_cancellation ? "Item Level" : "Full Order"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="customer-info-cell">
                                                <span className="customer-name font-semibold">
                                                    {customer.first_name} {customer.last_name}
                                                </span>
                                                <span className="customer-email text-muted">
                                                    {customer.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="reason-pill">{item.reason}</span>
                                        </td>
                                        <td className="font-bold text-success">
                                            Rs. {Number(refundVal).toFixed(2)}
                                        </td>
                                        <td className="text-muted text-sm">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "N/A"}
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td className="text-right">
                                            <button
                                                type="button"
                                                className="btn-table-action"
                                                onClick={() => setSelectedCancellation(item)}
                                                title="View Cancellation Details"
                                            >
                                                <Eye size={16} />
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="admin-pagination-wrapper">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => dispatch(setCancellationsCurrentPage(page))}
                    />
                </div>
            )}

            {/* Detail & Action Modal */}
            {selectedCancellation && (
                <AdminCancellationDetailModal
                    cancellationReq={selectedCancellation}
                    onClose={() => setSelectedCancellation(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={processLoading}
                />
            )}
        </div>
    );
}

export default AdminCancellationsPage;
