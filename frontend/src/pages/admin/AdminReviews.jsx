import React, { useEffect, useState } from "react";
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  fetchAdminReviews,
  toggleAdminReviewVisibility,
  deleteAdminReview,
} from "../../features/admin/reviews/services/adminReviewService";
import Pagination from "./Pagination";
import ConfirmationDialog from "./ConfirmationDialog";
import "./AdminReviews.css";

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
    <div className="admin-reviews-container">
      {/* Header Section */}
      <div className="admin-reviews-header">
        <div className="admin-reviews-header-text">
          <h1 className="admin-reviews-title">Product Reviews Moderation</h1>
          <p className="admin-reviews-subtitle">
            Manage customer reviews, toggle visibility, and moderate product
            feedback.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-reviews-filter-card">
        <form onSubmit={handleSearchSubmit} className="reviews-search-form">
          <div className="reviews-search-input-wrapper">
            <Search size={16} className="reviews-search-icon" />
            <input
              type="text"
              placeholder="Search reviewer, product, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="reviews-search-input"
            />
          </div>
          <button type="submit" className="reviews-search-btn">
            Search
          </button>
        </form>

        <div className="reviews-filter-controls">
          <div className="reviews-filter-item">
            <Filter size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="reviews-select"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="reviews-filter-item">
            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="reviews-select"
            >
              <option value="">All Statuses</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
          </div>

          <button
            type="button"
            onClick={loadReviews}
            className="reviews-refresh-btn"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Desktop Reviews Table View (>= 768px) */}
      <div className="reviews-desktop-wrapper">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Product / Variant</th>
              <th>Rating</th>
              <th>Comment Preview</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#94a3b8",
                  }}
                >
                  Loading product reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#94a3b8",
                  }}
                >
                  No reviews found matching your filter criteria.
                </td>
              </tr>
            ) : (
              reviews.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="reviewer-name">{item.user_name}</div>
                    <div className="reviewer-email">{item.user_email}</div>
                  </td>
                  <td>
                    <div className="review-product-title">
                      {item.product_name || "N/A"}
                    </div>
                    {item.variant_name && (
                      <span className="review-variant-tag">
                        {item.variant_name}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="review-rating-badge">
                      <Star size={14} fill="#f59e0b" />
                      <span>{item.rating}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: "260px" }}>
                    <div className="review-comment-preview">
                      {item.comment || (
                        <em style={{ color: "#94a3b8" }}>
                          No comment provided
                        </em>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`review-status-pill ${item.is_visible ? "visible" : "hidden"}`}
                    >
                      {item.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-muted, #64748b)",
                    }}
                  >
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="review-actions-cell">
                      <button
                        type="button"
                        title="View Full Details"
                        onClick={() => setSelectedReview(item)}
                        className="btn-icon-action btn-icon-view"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        title={item.is_visible ? "Hide Review" : "Show Review"}
                        onClick={() => handleToggleVisibility(item)}
                        disabled={actionLoading}
                        className={`btn-icon-action ${item.is_visible ? "btn-icon-toggle-hide" : "btn-icon-toggle-show"}`}
                      >
                        {item.is_visible ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                      <button
                        type="button"
                        title="Delete Review"
                        onClick={() => setDeleteTargetReview(item)}
                        disabled={actionLoading}
                        className="btn-icon-action btn-icon-delete"
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

      {/* Mobile Reviews Cards List View (< 768px) */}
      <div className="reviews-mobile-list">
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              background: "var(--card-bg, #ffffff)",
              borderRadius: "16px",
              border: "1px solid var(--border-color, #e2e8f0)",
              color: "#94a3b8",
            }}
          >
            Loading product reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              background: "var(--card-bg, #ffffff)",
              borderRadius: "16px",
              border: "1px solid var(--border-color, #e2e8f0)",
              color: "#94a3b8",
            }}
          >
            No reviews found matching your filter criteria.
          </div>
        ) : (
          reviews.map((item) => (
            <div key={item.id} className="admin-review-card">
              {/* Reviewer Header Row */}
              <div className="review-card-header">
                <div className="review-card-reviewer">
                  <div className="reviewer-name">{item.user_name}</div>
                  <div className="reviewer-email">{item.user_email}</div>
                </div>
                <span
                  className={`review-status-pill ${item.is_visible ? "visible" : "hidden"}`}
                >
                  {item.is_visible ? "Visible" : "Hidden"}
                </span>
              </div>

              {/* Product Info Block */}
              <div className="review-card-product">
                <div className="review-product-title">
                  {item.product_name || "N/A"}
                </div>
                {item.variant_name && (
                  <div style={{ display: "flex" }}>
                    <span className="review-variant-tag">
                      {item.variant_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating & Date Meta */}
              <div className="review-card-meta">
                <div className="review-rating-badge">
                  <Star size={14} fill="#f59e0b" />
                  <span>{item.rating} / 5</span>
                </div>
                <span className="review-card-date">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Comment Box */}
              <div className="review-card-comment">
                {item.comment || (
                  <em style={{ color: "#94a3b8" }}>No comment provided</em>
                )}
              </div>

              {/* Touch Actions */}
              <div className="review-card-actions">
                <button
                  type="button"
                  onClick={() => setSelectedReview(item)}
                  className="btn-card-action view"
                >
                  <Eye size={14} />
                  <span>Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleVisibility(item)}
                  disabled={actionLoading}
                  className={`btn-card-action ${item.is_visible ? "toggle-hide" : "toggle-show"}`}
                >
                  {item.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{item.is_visible ? "Hide" : "Show"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTargetReview(item)}
                  disabled={actionLoading}
                  className="btn-card-action delete"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div style={{ marginTop: "8px" }}>
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            totalPages={Math.ceil(totalCount / pageSize)}
            count={totalCount}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="reviews"
          />
        </div>
      )}

      {/* Detail Modal */}
      {selectedReview && (
        <div className="admin-modal-overlay">
          <div className="admin-review-modal-card">
            <button
              onClick={() => setSelectedReview(null)}
              className="modal-close-btn"
              title="Close"
            >
              <X size={20} />
            </button>
            <h3 className="modal-title">Review Details</h3>

            <div className="modal-detail-grid">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Reviewer:</span>
                <span className="modal-detail-value">
                  {selectedReview.user_name} ({selectedReview.user_email})
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Product:</span>
                <span className="modal-detail-value">
                  {selectedReview.product_name}
                </span>
              </div>
              {selectedReview.variant_name && (
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Variant:</span>
                  <span className="modal-detail-value">
                    {selectedReview.variant_name}
                  </span>
                </div>
              )}
              <div className="modal-detail-row">
                <span className="modal-detail-label">Rating:</span>
                <span
                  className="modal-detail-value"
                  style={{ color: "#f59e0b", fontWeight: "700" }}
                >
                  ★ {selectedReview.rating} / 5 Stars
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Visibility:</span>
                <span
                  className="modal-detail-value"
                  style={{
                    color: selectedReview.is_visible ? "#10b981" : "#ef4444",
                    fontWeight: "700",
                  }}
                >
                  {selectedReview.is_visible
                    ? "Visible Publicly"
                    : "Hidden from Customers"}
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Created At:</span>
                <span className="modal-detail-value">
                  {new Date(selectedReview.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ marginTop: "6px" }}>
                <span
                  className="modal-detail-label"
                  style={{ display: "block", marginBottom: "6px" }}
                >
                  Comment text:
                </span>
                <div className="modal-comment-box">
                  {selectedReview.comment || <em>No text comment provided.</em>}
                </div>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                onClick={() => {
                  handleToggleVisibility(selectedReview);
                  setSelectedReview(null);
                }}
                className="reviews-search-btn"
                style={{
                  background: selectedReview.is_visible ? "#d97706" : "#10b981",
                }}
              >
                {selectedReview.is_visible ? "Hide Review" : "Make Visible"}
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="reviews-refresh-btn"
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
