import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Boxes,
    Pencil,
    Eye,
    Sparkles,
    AlertCircle,
    Package,
    ArrowRight,
    RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import {
    fetchInventoryAsync,
    fetchInventorySummaryAsync,
    updateVariantStockAsync,
    setSearchQuery,
    setSortOrder,
    setStockStatusFilter,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    clearFilters,
    selectInventoryItems,
    selectInventorySummary,
    selectInventoryCount,
    selectInventoryCurrentPage,
    selectInventoryPageSize,
    selectInventoryTotalPages,
    selectInventorySearchQuery,
    selectInventorySortOrder,
    selectInventoryStockStatusFilter,
    selectInventoryStatusFilter,
    selectInventoryLoading,
    selectInventorySummaryLoading,
    selectInventoryActionLoading,
    selectInventoryError,
} from "../redux/adminInventorySlice";

import InventorySummaryCards from "../components/InventorySummaryCards";
import InventoryFilterBar from "../components/InventoryFilterBar";
import UpdateStockModal from "../components/UpdateStockModal";
import InventoryDetailsModal from "../components/InventoryDetailsModal";
import Pagination from "../../../../pages/admin/Pagination";
import "../styles/AdminInventory.css";

export function AdminInventoryPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const items = useSelector(selectInventoryItems);
    const summary = useSelector(selectInventorySummary);
    const count = useSelector(selectInventoryCount);
    const currentPage = useSelector(selectInventoryCurrentPage);
    const pageSize = useSelector(selectInventoryPageSize);
    const totalPages = useSelector(selectInventoryTotalPages);
    const searchQuery = useSelector(selectInventorySearchQuery);
    const sortOrder = useSelector(selectInventorySortOrder);
    const stockStatusFilter = useSelector(selectInventoryStockStatusFilter);
    const statusFilter = useSelector(selectInventoryStatusFilter);
    const loading = useSelector(selectInventoryLoading);
    const summaryLoading = useSelector(selectInventorySummaryLoading);
    const actionLoading = useSelector(selectInventoryActionLoading);
    const error = useSelector(selectInventoryError);

    // Modal state for stock editing & detail viewing
    const [editingVariant, setEditingVariant] = useState(null);
    const [selectedDetailItem, setSelectedDetailItem] = useState(null);
    const [searchInput, setSearchInput] = useState(searchQuery);

    // Fetch Inventory Data
    const loadInventoryData = useCallback(() => {
        dispatch(
            fetchInventoryAsync({
                search: searchQuery,
                sort: sortOrder,
                stock_status: stockStatusFilter,
                status: statusFilter,
                page: currentPage,
                page_size: pageSize,
            })
        );
    }, [dispatch, searchQuery, sortOrder, stockStatusFilter, statusFilter, currentPage, pageSize]);

    useEffect(() => {
        loadInventoryData();
        dispatch(fetchInventorySummaryAsync());
    }, [loadInventoryData, dispatch]);

    // Search Debounce (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                dispatch(setSearchQuery(searchInput));
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery, dispatch]);

    // Handle Stock Update Submit
    const handleStockSubmit = async ({ variantId, stock_quantity, reason }) => {
        try {
            await dispatch(
                updateVariantStockAsync({ variantId, stock_quantity, reason })
            ).unwrap();
            toast.success("Stock quantity updated successfully!");
            setEditingVariant(null);
            dispatch(fetchInventorySummaryAsync());
            loadInventoryData();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update stock.");
        }
    };

    // Pagination Controls
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            dispatch(setCurrentPage(newPage));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handlePageSizeChange = (newPageSize) => {
        dispatch(setPageSize(newPageSize));
    };

    // Helper Badge Renderer for Stock Status
    const renderStockBadge = (status, qty) => {
        switch (status) {
            case "OUT_OF_STOCK":
                return <span className="stock-badge badge-out-of-stock">OUT OF STOCK ({qty})</span>;
            case "LOW_STOCK":
                return <span className="stock-badge badge-low-stock">LOW STOCK ({qty})</span>;
            default:
                return <span className="stock-badge badge-in-stock">IN STOCK ({qty})</span>;
        }
    };

    return (
        <div className="admin-inventory-page-container">
            {/* Header Banner */}
            <div className="admin-inventory-header-banner">
                <div className="header-title-group">
                    <div className="header-icon-badge">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <h1 className="admin-inventory-heading">Inventory &amp; Stock Management</h1>
                        <p className="admin-inventory-subheading">
                            Monitor stock levels, set inventory counts, track low stock, and manage variant availability.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        loadInventoryData();
                        dispatch(fetchInventorySummaryAsync());
                    }}
                    className="btn-refresh-inventory"
                    title="Refresh data"
                >
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* KPI Summary Cards Section */}
            <InventorySummaryCards summary={summary} loading={summaryLoading} />

            {/* Error Banner */}
            {error && (
                <div className="admin-inventory-error-banner">
                    <AlertCircle size={18} />
                    <span>{typeof error === "string" ? error : "An error occurred loading inventory."}</span>
                </div>
            )}

            {/* Search & Multi-Field Filters */}
            <InventoryFilterBar
                searchQuery={searchInput}
                onSearchChange={setSearchInput}
                sortOrder={sortOrder}
                onSortChange={(val) => dispatch(setSortOrder(val))}
                stockStatusFilter={stockStatusFilter}
                onStockStatusChange={(val) => dispatch(setStockStatusFilter(val))}
                statusFilter={statusFilter}
                onStatusChange={(val) => dispatch(setStatusFilter(val))}
                onClearFilters={() => {
                    setSearchInput("");
                    dispatch(clearFilters());
                }}
            />

            {/* Content Table / Skeleton / Empty State */}
            {loading && items.length === 0 ? (
                <InventorySkeleton />
            ) : items.length === 0 ? (
                <div className="admin-inventory-empty-card">
                    <Package size={56} className="empty-pkg-icon" />
                    <h2>No Inventory Variants Found</h2>
                    <p>No product variants match your filter criteria or search terms.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchInput("");
                            dispatch(clearFilters());
                        }}
                        className="btn-reset-filters-cta"
                    >
                        <span>Reset All Filters</span>
                    </button>
                </div>
            ) : (
                <div className="inventory-table-container-card">
                    <div className="inventory-table-responsive-wrapper">
                        <table className="admin-inventory-table">
                            <thead>
                                <tr>
                                    <th>Product Image</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Variant SKU</th>
                                    <th>Price</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const isBlocked = item.blocked || item.product_blocked;
                                    const isInactive = !item.is_active || !item.product_is_active;

                                    return (
                                        <tr key={item.id} className={isBlocked ? "row-blocked" : ""}>
                                            {/* Image */}
                                            <td>
                                                <div className="inventory-thumb-box">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.product_name} />
                                                    ) : (
                                                        <div className="thumb-placeholder">Toy</div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Product Name */}
                                            <td>
                                                <div className="product-title-cell">
                                                    <span className="product-main-name">{item.product_name}</span>
                                                    <span className="product-variant-subname">{item.variant_name}</span>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td>
                                                <span className="cell-category-tag">
                                                    {item.category_name || "Uncategorized"}
                                                </span>
                                            </td>

                                            {/* Brand */}
                                            <td>
                                                <span className="cell-brand-text">
                                                    {item.brand || "Generics"}
                                                </span>
                                            </td>

                                            {/* SKU */}
                                            <td>
                                                <code className="sku-code">{item.sku}</code>
                                            </td>

                                            {/* Price */}
                                            <td>
                                                <div className="price-cell-box">
                                                    {item.sale_price ? (
                                                        <>
                                                            <span className="sale-price-val">
                                                                Rs. {Number(item.sale_price).toFixed(2)}
                                                            </span>
                                                            <span className="original-price-val">
                                                                Rs. {Number(item.price).toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="regular-price-val">
                                                            Rs. {Number(item.price || 0).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Stock Badge */}
                                            <td>
                                                {renderStockBadge(item.stock_status, item.stock_quantity)}
                                            </td>

                                            {/* Status Badge */}
                                            <td>
                                                {isBlocked ? (
                                                    <span className="status-pill status-blocked">BLOCKED</span>
                                                ) : isInactive ? (
                                                    <span className="status-pill status-inactive">INACTIVE</span>
                                                ) : (
                                                    <span className="status-pill status-active">ACTIVE</span>
                                                )}
                                            </td>

                                            {/* Last Updated */}
                                            <td>
                                                <span className="cell-date-text">
                                                    {item.updated_at
                                                        ? new Date(item.updated_at).toLocaleDateString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "-"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="text-right">
                                                <div className="inventory-actions-cell">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingVariant(item)}
                                                        className="btn-table-action edit-stock"
                                                        title="Update Stock Quantity"
                                                    >
                                                        <Pencil size={14} />
                                                        <span>Edit Stock</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDetailItem(item)}
                                                        className="btn-table-action view-product"
                                                        title="View Inventory Item Details"
                                                    >
                                                        <Eye size={14} />
                                                        <span>View</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                            itemLabel="Inventory Items"
                        />
                    )}
                </div>
            )}

            {/* View Inventory Item Details Modal */}
            <InventoryDetailsModal
                isOpen={!!selectedDetailItem}
                onClose={() => setSelectedDetailItem(null)}
                item={selectedDetailItem}
                onEditStock={(itemToEdit) => setEditingVariant(itemToEdit)}
                onNavigateToProduct={() => navigate('/admin/products')}
            />

            {/* Edit Stock Quantity Modal */}
            <UpdateStockModal
                isOpen={!!editingVariant}
                onClose={() => setEditingVariant(null)}
                onSubmit={handleStockSubmit}
                variant={editingVariant}
                isLoading={actionLoading}
            />
        </div>
    );
}

function InventorySkeleton() {
    return (
        <div className="inventory-table-container-card">
            <div style={{ padding: "24px" }}>
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-shimmer"
                        style={{ height: "48px", marginBottom: "12px", borderRadius: "8px" }}
                    />
                ))}
            </div>
        </div>
    );
}

export default AdminInventoryPage;
