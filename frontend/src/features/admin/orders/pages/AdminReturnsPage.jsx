import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
    RotateCcw,
    Search,
    RefreshCw,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    DollarSign,
    Filter,
} from "lucide-react";

import {
    fetchAdminReturnsAsync,
    approveAdminReturnAsync,
    rejectAdminReturnAsync,
    selectAdminReturns,
    selectAdminReturnsCount,
    selectAdminReturnsTotalPages,
    selectAdminReturnsCurrentPage,
    selectAdminReturnsSearchQuery,
    selectAdminReturnsStatusFilter,
    selectAdminReturnsLoading,
    selectAdminProcessReturnLoading,
    setReturnsSearchQuery,
    setReturnsStatusFilter,
    setReturnsCurrentPage,
} from "../redux/adminOrdersSlice";

import AdminReturnDetailModal from "../components/AdminReturnDetailModal";
import Pagination from "../../../../pages/admin/Pagination";
import "../styles/AdminOrders.css";

export function AdminReturnsPage() {
    const dispatch = useDispatch();

    const returnsList = useSelector(selectAdminReturns);
    const count = useSelector(selectAdminReturnsCount);
    const totalPages = useSelector(selectAdminReturnsTotalPages);
    const currentPage = useSelector(selectAdminReturnsCurrentPage);
    const searchQuery = useSelector(selectAdminReturnsSearchQuery);
    const statusFilter = useSelector(selectAdminReturnsStatusFilter);
    const loading = useSelector(selectAdminReturnsLoading);
    const processLoading = useSelector(selectAdminProcessReturnLoading);

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [selectedReturn, setSelectedReturn] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setReturnsSearchQuery(searchInput));
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    // Load Return Requests
    const loadReturns = useCallback(() => {
        dispatch(
            fetchAdminReturnsAsync({
                search: searchQuery,
                status: statusFilter,
                page: currentPage,
            })
        );
    }, [dispatch, searchQuery, statusFilter, currentPage]);

    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    const handleApprove = async (returnId, remark) => {
        try {
            const res = await dispatch(
                approveAdminReturnAsync({ returnId, admin_remark: remark })
            ).unwrap();
            toast.success(res.message || "Return request approved & wallet credited successfully!");
            setSelectedReturn(null);
            loadReturns();
        } catch (err) {
            toast.error(err || "Failed to approve return request.");
        }
    };

    const handleReject = async (returnId, remark) => {
        try {
            const res = await dispatch(
                rejectAdminReturnAsync({ returnId, admin_remark: remark })
            ).unwrap();
            toast.info(res.message || "Return request rejected.");
            setSelectedReturn(null);
            loadReturns();
        } catch (err) {
            toast.error(err || "Failed to reject return request.");
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case "PENDING":
                return <span className="status-badge warning"><Clock size={13} /> PENDING</span>;
            case "APPROVED":
            case "COMPLETED":
                return <span className="status-badge success"><CheckCircle2 size={13} /> APPROVED</span>;
            case "REJECTED":
                return <span className="status-badge danger"><XCircle size={13} /> REJECTED</span>;
            default:
                return <span className="status-badge">{st}</span>;
        }
    };

    const statusTabs = [
        { label: "All Returns", value: "ALL" },
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
                        <RotateCcw size={24} className="title-icon text-accent" />
                        Return Requests &amp; Wallet Refunds
                    </h1>
                    <p className="admin-page-subtitle">
                        Manage customer return requests, approve wallet refunds, and track item inventory replenishment.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn-secondary-pill"
                    onClick={loadReturns}
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
                        placeholder="Search by Order #, Customer, Reason, Return ID..."
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
                            onClick={() => dispatch(setReturnsStatusFilter(tab.value))}
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
                        <p>Loading return requests...</p>
                    </div>
                ) : returnsList.length === 0 ? (
                    <div className="admin-empty-state">
                        <RotateCcw size={42} className="empty-icon text-muted" />
                        <h3>No Return Requests Found</h3>
                        <p>Try adjusting your search query or status filter.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Reason</th>
                                <th>Refund Amount</th>
                                <th>Requested Date</th>
                                <th>Status</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returnsList.map((item) => {
                                const customer = item.customer || {};
                                const refundVal = item.refund_amount_val || item.order_details?.total_amount || "0.00";
                                return (
                                    <tr key={item.id}>
                                        <td className="font-bold text-accent">
                                            {item.order_number || "N/A"}
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
                                            {item.requested_at ? new Date(item.requested_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "N/A"}
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td className="text-right">
                                            <button
                                                type="button"
                                                className="btn-table-action"
                                                onClick={() => setSelectedReturn(item)}
                                                title="View Return Details"
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
                        onPageChange={(page) => dispatch(setReturnsCurrentPage(page))}
                    />
                </div>
            )}

            {/* Detail & Action Modal */}
            {selectedReturn && (
                <AdminReturnDetailModal
                    returnReq={selectedReturn}
                    onClose={() => setSelectedReturn(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={processLoading}
                />
            )}
        </div>
    );
}

export default AdminReturnsPage;
