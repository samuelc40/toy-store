import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Package, Search, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";

import {
    fetchOrdersAsync,
    cancelOrderAsync,
    setActiveStatusFilter,
    setSearchQuery,
    setCurrentPage,
    selectOrders,
    selectOrdersCount,
    selectOrdersTotalPages,
    selectOrdersCurrentPage,
    selectActiveStatusFilter,
    selectSearchQuery,
    selectOrdersLoading,
    selectOrdersError,
    selectOrdersActionLoading,
} from "../redux/ordersSlice";
import OrderCard from "../components/OrderCard";
import CancelOrderModal from "../components/CancelOrderModal";
import "../styles/Orders.css";

export function OrdersPage() {
    const dispatch = useDispatch();

    const orders = useSelector(selectOrders);
    const count = useSelector(selectOrdersCount);
    const totalPages = useSelector(selectOrdersTotalPages);
    const currentPage = useSelector(selectOrdersCurrentPage);
    const activeStatusFilter = useSelector(selectActiveStatusFilter);
    const searchQuery = useSelector(selectSearchQuery);
    const loading = useSelector(selectOrdersLoading);
    const error = useSelector(selectOrdersError);
    const actionLoading = useSelector(selectOrdersActionLoading);

    // Local state for debounced search input
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [cancellingOrder, setCancellingOrder] = useState(null);

    // Status filter tabs list
    const statusTabs = [
        { key: "ALL", label: "All Orders" },
        { key: "PENDING", label: "Pending" },
        { key: "CONFIRMED", label: "Confirmed" },
        { key: "SHIPPED", label: "Shipped" },
        { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
        { key: "DELIVERED", label: "Delivered" },
        { key: "CANCELLED", label: "Cancelled" },
    ];

    // Fetch orders function
    const loadOrdersData = useCallback(() => {
        dispatch(
            fetchOrdersAsync({
                search: searchQuery,
                status: activeStatusFilter,
                page: currentPage,
            })
        );
    }, [dispatch, searchQuery, activeStatusFilter, currentPage]);

    useEffect(() => {
        loadOrdersData();
    }, [loadOrdersData]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setSearchQuery(searchInput));
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    const handleTabChange = (tabKey) => {
        dispatch(setActiveStatusFilter(tabKey));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setCurrentPage(newPage));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleConfirmCancel = async (reason) => {
        if (!cancellingOrder) return;
        try {
            await dispatch(
                cancelOrderAsync({ orderId: cancellingOrder.id, reason })
            ).unwrap();
            toast.success(`Order #${cancellingOrder.order_number} cancelled successfully.`);
            setCancellingOrder(null);
            loadOrdersData();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to cancel order.");
        }
    };

    return (
        <div className="orders-page-outer-container">
            {/* Top Banner Header */}
            <div className="orders-header-banner">
                <div className="orders-title-group">
                    <div className="orders-title-icon-badge">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="orders-page-heading">My Orders</h1>
                        <p className="orders-page-subheading">
                            Track shipments, view details, manage returns, and download invoices.
                        </p>
                    </div>
                </div>

                {count > 0 && (
                    <div className="orders-count-badge">
                        <Sparkles size={14} />
                        <span>{count} Total {count === 1 ? "Order" : "Orders"}</span>
                    </div>
                )}
            </div>

            {/* Error Notice */}
            {error && (
                <div className="orders-error-banner">
                    <AlertCircle size={18} />
                    <span>{typeof error === "string" ? error : "An error occurred loading orders."}</span>
                </div>
            )}

            {/* Toolbar: Debounced Search & Status Filter Tabs */}
            <div className="orders-toolbar-card">
                <div className="orders-search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by order number, product, or variant..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        aria-label="Search orders by number, product, or variant"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => setSearchInput("")}
                            aria-label="Clear search query"
                        >
                            &times;
                        </button>
                    )}
                </div>

                <div className="orders-status-tabs" role="tablist" aria-label="Filter orders by status">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={activeStatusFilter === tab.key}
                            className={`status-tab-btn ${activeStatusFilter === tab.key ? "active" : ""}`}
                            onClick={() => handleTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List / Skeleton / Empty State */}
            {loading && orders.length === 0 ? (
                <OrdersSkeleton />
            ) : orders.length === 0 ? (
                <div className="orders-empty-state-card">
                    <Package size={60} className="empty-package-icon" />
                    <h2>No Orders Found</h2>
                    <p>
                        {searchQuery || activeStatusFilter !== "ALL"
                            ? "No orders match your search criteria. Try adjusting filters or search terms."
                            : "You haven't placed any orders yet. Explore our toys collection!"}
                    </p>
                    <Link to="/products" className="btn-explore-toys-orders">
                        <span>Explore Toys Catalog</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <>
                    <div className="orders-list-grid">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onCancelClick={(ord) => setCancellingOrder(ord)}
                            />
                        ))}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <nav className="orders-pagination-row" aria-label="Orders pagination navigation">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="btn-pagination-step"
                                aria-label="Go to previous page"
                            >
                                &laquo; Previous
                            </button>
                            <span className="pagination-info-text">
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>
                            <button
                                type="button"
                                disabled={currentPage >= totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="btn-pagination-step"
                                aria-label="Go to next page"
                            >
                                Next &raquo;
                            </button>
                        </nav>
                    )}
                </>
            )}

            {/* Cancel Entire Order Modal */}
            <CancelOrderModal
                isOpen={!!cancellingOrder}
                onClose={() => setCancellingOrder(null)}
                onConfirm={handleConfirmCancel}
                title={`Cancel Order #${cancellingOrder?.order_number || ""}`}
                isLoading={actionLoading}
            />
        </div>
    );
}

function OrdersSkeleton() {
    return (
        <div className="orders-list-grid">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="customer-order-card" style={{ padding: "20px" }}>
                    <div className="skeleton-shimmer" style={{ width: "60%", height: "20px", marginBottom: "16px", borderRadius: "6px" }} />
                    <div className="skeleton-shimmer" style={{ width: "100%", height: "80px", marginBottom: "16px", borderRadius: "12px" }} />
                    <div className="skeleton-shimmer" style={{ width: "40%", height: "24px", borderRadius: "6px" }} />
                </div>
            ))}
        </div>
    );
}

export default OrdersPage;
