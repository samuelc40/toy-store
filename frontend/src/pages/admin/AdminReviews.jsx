import React, { useEffect, useState } from "react";
import { Star, Eye, EyeOff, Trash2, Search, Filter, RefreshCw, X } from "lucide-react";
import { toast } from "react-toastify";

import {
    fetchAdminReviews,
    toggleAdminReviewVisibility,
    deleteAdminReview,
} from "../../features/admin/reviews/services/adminReviewService";
import Pagination from "./Pagination";
import ConfirmationDialog from "./ConfirmationDialog";
import "./UserTable.css";

function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("");

    // Detail Modal State
    const [selectedReview, setSelectedReview] = useState(null);

    // Confirmation Dialog State
    const [deleteTargetReview, setDeleteTargetReview] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await fetchAdminReviews({
                page: currentPage,
                page_size: pageSize,
                search: searchQuery,
                rating: ratingFilter,
                is_visible: visibilityFilter,
            });
            setReviews(data.results || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            console.error("Failed to load reviews:", err);
            toast.error("Failed to load product reviews.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [currentPage, pageSize, ratingFilter, visibilityFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadReviews();
    };

    const handleToggleVisibility = async (review) => {
        try {
            setActionLoading(true);
            const updatedState = !review.is_visible;
            await toggleAdminReviewVisibility(review.id, updatedState);
            toast.success(`Review set to ${updatedState ? "Visible" : "Hidden"}.`);
            loadReviews();
        } catch (err) {
            console.error("Failed to toggle visibility:", err);
            toast.error("Failed to update review visibility.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!deleteTargetReview) return;
        try {
            setActionLoading(true);
            await deleteAdminReview(deleteTargetReview.id);
            toast.success("Review permanently deleted.");
            setDeleteTargetReview(null);
            loadReviews();
        } catch (err) {
            console.error("Failed to delete review:", err);
            toast.error("Failed to delete review.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>Product Reviews Moderation</h1>
                    <p style={{ fontSize: "14px", color: "var(--text-muted, #64748b)", margin: "4px 0 0 0" }}>
                        Manage customer reviews, toggle visibility, and moderate product feedback.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="admin-filter-card" style={{ background: "var(--card-bg, #ffffff)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px", flex: "1 1 300px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search reviewer, product, or comment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: "70%", padding: "9px 12px 9px 36px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", fontSize: "14px", background: "var(--input-bg, #ffffff)", color: "var(--text-color, #1e293b)" }}
                        />
                    </div>
                    <button type="submit" className="btn-copy-ref-link" style={{ padding: "8px 16px" }}>
                        Search
                    </button>
                </form>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Filter size={16} style={{ color: "#94a3b8" }} />
                        <select
                            value={ratingFilter}
                            onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", fontSize: "14px", background: "var(--input-bg, #ffffff)", color: "var(--text-color, #1e293b)" }}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <select
                            value={visibilityFilter}
                            onChange={(e) => { setVisibilityFilter(e.target.value); setCurrentPage(1); }}
                            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", fontSize: "14px", background: "var(--input-bg, #ffffff)", color: "var(--text-color, #1e293b)" }}
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={loadReviews}
                        style={{ background: "none", border: "1px solid var(--border-color, #cbd5e1)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", color: "var(--text-color, #1e293b)" }}
                    >
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="table-responsive" style={{ background: "var(--card-bg, #ffffff)", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", overflow: "hidden" }}>
                <table className="user-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "var(--header-bg, #3d3d3e)", borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Reviewer</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Product / Variant</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Rating</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Comment Preview</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Status</th>
                            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Date</th>
                            <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: "600" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    Loading product reviews...
                                </td>
                            </tr>
                        ) : reviews.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    No reviews found matching your filter criteria.
                                </td>
                            </tr>
                        ) : (
                            reviews.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color, #f1f5f9)" }}>
                                    <td style={{ padding: "12px 16px", fontSize: "13.5px" }}>
                                        <div style={{ fontWeight: "600" }}>{item.user_name}</div>
                                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{item.user_email}</div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13.5px" }}>
                                        <div style={{ fontWeight: "600" }}>{item.product_name || "N/A"}</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>{item.variant_name}</div>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b", fontWeight: "700" }}>
                                            <Star size={14} fill="#f59e0b" />
                                            <span>{item.rating}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", maxWidth: "260px" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-color, #334155)" }}>
                                            {item.comment || <em style={{ color: "#94a3b8" }}>No comment provided</em>}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span
                                            style={{
                                                padding: "3px 10px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                background: item.is_visible ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                                color: item.is_visible ? "#10b981" : "#ef4444",
                                            }}
                                        >
                                            {item.is_visible ? "Visible" : "Hidden"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "12.5px", color: "#64748b" }}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                            <button
                                                type="button"
                                                title="View Full Details"
                                                onClick={() => setSelectedReview(item)}
                                                style={{ background: "rgba(99, 102, 241, 0.1)", border: "none", color: "#6366f1", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                title={item.is_visible ? "Hide Review" : "Show Review"}
                                                onClick={() => handleToggleVisibility(item)}
                                                disabled={actionLoading}
                                                style={{
                                                    background: item.is_visible ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                                    border: "none",
                                                    color: item.is_visible ? "#d97706" : "#10b981",
                                                    padding: "6px",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {item.is_visible ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                            <button
                                                type="button"
                                                title="Delete Review"
                                                onClick={() => setDeleteTargetReview(item)}
                                                disabled={actionLoading}
                                                style={{ background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444", padding: "6px", borderRadius: "6px", cursor: "pointer" }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div style={{ marginTop: "16px" }}>
                    <Pagination
                        page={currentPage}
                        totalPages={Math.ceil(totalCount / pageSize)}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            )}

            {/* Detail Modal */}
            {selectedReview && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                    <div style={{ background: "var(--card-bg, #ffffff)", borderRadius: "16px", padding: "24px", maxWidth: "540px", width: "100%", border: "1px solid var(--border-color, #e2e8f0)", position: "relative" }}>
                        <button
                            onClick={() => setSelectedReview(null)}
                            style={{ position: "absolute", right: "16px", top: "16px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                        >
                            <X size={20} />
                        </button>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--text-color, #1e293b)" }}>
                            Review Details
                        </h3>

                        <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Reviewer:</span> {selectedReview.user_name} ({selectedReview.user_email})
                            </div>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Product:</span> {selectedReview.product_name}
                            </div>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Variant:</span> {selectedReview.variant_name}
                            </div>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Rating:</span> {selectedReview.rating} / 5 Stars
                            </div>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Visibility:</span>{" "}
                                <span style={{ color: selectedReview.is_visible ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                                    {selectedReview.is_visible ? "Visible Publicly" : "Hidden from Customers"}
                                </span>
                            </div>
                            <div>
                                <span style={{ color: "#64748b", fontWeight: "600" }}>Created At:</span> {new Date(selectedReview.created_at).toLocaleString()}
                            </div>
                            <div style={{ marginTop: "8px" }}>
                                <span style={{ color: "#64748b", fontWeight: "600", display: "block", marginBottom: "4px" }}>Comment:</span>
                                <div style={{ background: "var(--bg, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)", lineHeight: "1.5" }}>
                                    {selectedReview.comment || <em>No text comment provided.</em>}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                onClick={() => {
                                    handleToggleVisibility(selectedReview);
                                    setSelectedReview(null);
                                }}
                                className="btn-copy-ref-link"
                                style={{ background: selectedReview.is_visible ? "#d97706" : "#10b981" }}
                            >
                                {selectedReview.is_visible ? "Hide Review" : "Make Visible"}
                            </button>
                            <button
                                onClick={() => setSelectedReview(null)}
                                style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-color, #cbd5e1)", background: "none", cursor: "pointer" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog for Delete */}
            {deleteTargetReview && (
                <ConfirmationDialog
                    isOpen={Boolean(deleteTargetReview)}
                    title="Delete Product Review"
                    message={`Are you sure you want to permanently delete the review by ${deleteTargetReview.user_name}? This action cannot be undone.`}
                    confirmText="Delete Review"
                    cancelText="Cancel"
                    isDanger={true}
                    isLoading={actionLoading}
                    onConfirm={handleDeleteReview}
                    onClose={() => setDeleteTargetReview(null)}
                    onCancel={() => setDeleteTargetReview(null)}
                />
            )}
        </div>
    );
}

export default AdminReviews;
