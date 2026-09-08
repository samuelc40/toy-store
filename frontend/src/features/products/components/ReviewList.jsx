import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Edit3, Trash2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import ConfirmationDialog from '../../../pages/admin/ConfirmationDialog';
import {
    getVariantReviews,
    getReviewEligibility,
    createVariantReview,
    updateReview,
    deleteReview,
} from '../services/reviewService';

export function ReviewList({ variantId, variantName = 'this item', isAuthenticated = false }) {
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState({
        average_rating: 0.0,
        total_reviews: 0,
        rating_breakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        rating_distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Eligibility state
    const [eligibility, setEligibility] = useState(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editReviewData, setEditReviewData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete dialog states
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch review list & stats for variant
    const loadVariantReviews = useCallback(async (targetVariantId, targetPage, isCancelled) => {
        if (!targetVariantId || targetVariantId === 'undefined' || targetVariantId === 'null') return;
        setLoading(true);
        try {
            const data = await getVariantReviews(targetVariantId, targetPage, 5);
            if (isCancelled()) return;
            setReviews(data.results?.reviews || []);
            setStatistics(
                data.results?.statistics || {
                    average_rating: 0.0,
                    total_reviews: 0,
                    rating_breakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
                    rating_distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
                }
            );
            if (data.count) {
                setTotalPages(Math.ceil(data.count / 5));
            } else {
                setTotalPages(1);
            }
        } catch (err) {
            if (!isCancelled()) {
                console.error('Failed to load reviews:', err);
            }
        } finally {
            if (!isCancelled()) {
                setLoading(false);
            }
        }
    }, []);

    // Fetch eligibility for authenticated user
    const loadEligibility = useCallback(async (targetVariantId, isCancelled) => {
        if (!targetVariantId || targetVariantId === 'undefined' || targetVariantId === 'null' || !isAuthenticated) {
            setEligibility(null);
            return;
        }
        setEligibilityLoading(true);
        try {
            const data = await getReviewEligibility(targetVariantId);
            if (!isCancelled()) {
                setEligibility(data.data || null);
            }
        } catch (err) {
            if (!isCancelled()) {
                console.error('Failed to check review eligibility:', err);
                setEligibility(null);
            }
        } finally {
            if (!isCancelled()) {
                setEligibilityLoading(false);
            }
        }
    }, [isAuthenticated]);

    // Reset and refetch whenever variantId changes
    useEffect(() => {
        let isCancelled = false;
        const checkCancelled = () => isCancelled;

        setPage(1);
        loadVariantReviews(variantId, 1, checkCancelled);
        loadEligibility(variantId, checkCancelled);

        return () => {
            isCancelled = true;
        };
    }, [variantId, loadVariantReviews, loadEligibility]);

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
        loadVariantReviews(variantId, newPage, () => false);
    };

    // Handle form submit (Create or Edit)
    const handleModalSubmit = async ({ rating, comment }) => {
        setIsSubmitting(true);
        try {
            if (editReviewData && editReviewData.id) {
                // Update
                await updateReview(editReviewData.id, { rating, comment });
                toast.success('Your review has been updated!');
            } else {
                // Create
                await createVariantReview(variantId, { rating, comment });
                toast.success('Thank you for reviewing this product!');
            }

            setIsModalOpen(false);
            setEditReviewData(null);

            // Refetch server state
            loadVariantReviews(variantId, page, () => false);
            loadEligibility(variantId, () => false);
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.detail || 'Failed to submit review. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle delete review
    const handleDeleteReview = async () => {
        if (!deleteTargetId) return;
        setIsDeleting(true);
        try {
            await deleteReview(deleteTargetId);
            toast.success('Your review has been deleted.');
            setDeleteTargetId(null);

            // Refetch server state
            loadVariantReviews(variantId, 1, () => false);
            setPage(1);
            loadEligibility(variantId, () => false);
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.detail || 'Failed to delete review.';
            toast.error(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const avgRating = Number(statistics.average_rating || 0);
    const totalReviews = Number(statistics.total_reviews || 0);
    const breakdown = statistics.rating_breakdown || statistics.rating_distribution || {};
    const hasReviewed = eligibility && (eligibility.has_reviewed || eligibility.already_reviewed);
    const existingReview = eligibility && (eligibility.existing_review || (eligibility.existing_review_id ? { id: eligibility.existing_review_id } : null));

    return (
        <section className="reviews-breakdown-section-wrapper" style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <h3 className="reviews-summary-title" style={{ margin: 0 }}>
                    Customer Ratings &amp; Reviews
                </h3>

                {/* Eligibility CTA Button */}
                {isAuthenticated && eligibility && (
                    <div>
                        {eligibility.can_review && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditReviewData(null);
                                    setIsModalOpen(true);
                                }}
                                className="btn-copy-ref-link"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Edit3 size={16} />
                                <span>Write a Review</span>
                            </button>
                        )}
                        {hasReviewed && existingReview && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditReviewData(existingReview);
                                        setIsModalOpen(true);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--accent, #6366f1)',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--accent, #6366f1)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '13.5px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    <Edit3 size={15} />
                                    <span>Edit Your Review</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeleteTargetId(existingReview.id)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        fontSize: '13.5px',
                                    }}
                                    title="Delete your review"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scorecard Dashboard */}
            <div className="reviews-summary-dashboard-layout">
                {/* Scorecard */}
                <div className="reviews-summary-scorecard-box">
                    <span className="scorecard-header-badge">Overall Rating</span>
                    
                    <div className="scorecard-number-wrapper">
                        <span className="summary-score-large">{avgRating.toFixed(1)}</span>
                        <span className="summary-score-max">/ 5</span>
                    </div>

                    <div className="scorecard-stars-glow-wrap">
                        <StarRating rating={Math.round(avgRating)} size={22} />
                    </div>

                    <span className="summary-scorecard-reviews-count-pill">
                        <MessageSquare size={13} />
                        <span>{totalReviews === 0 ? 'No reviews yet' : `Based on ${totalReviews} customer review${totalReviews > 1 ? 's' : ''}`}</span>
                    </span>

                    {/* Prominent Action Buttons inside Scorecard */}
                    {isAuthenticated && eligibility && eligibility.can_review && (
                        <div className="scorecard-actions-group">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditReviewData(null);
                                    setIsModalOpen(true);
                                }}
                                className="btn-scorecard-write-review"
                            >
                                <Edit3 size={15} />
                                <span>Write a Review</span>
                            </button>
                        </div>
                    )}
                    {isAuthenticated && hasReviewed && existingReview && (
                        <div className="scorecard-actions-group">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditReviewData(existingReview);
                                    setIsModalOpen(true);
                                }}
                                className="btn-scorecard-edit-review"
                            >
                                <Edit3 size={14} />
                                <span>Edit Review</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeleteTargetId(existingReview.id)}
                                className="btn-scorecard-delete-review"
                                title="Delete your review"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Breakdown Progress Bars */}
                <div className="reviews-bars-chart-stack">
                    {['5', '4', '3', '2', '1'].map((stars) => {
                        const rawCount = breakdown[stars] ?? breakdown[Number(stars)] ?? 0;
                        const count = Number(rawCount) || 0;
                        const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={stars} className="reviews-rating-bar-row">
                                <span className="rating-star-label-badge">{stars} ★</span>
                                <div className="progress-bar-track-el">
                                    <div
                                        className="progress-bar-fill-indicator"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="rating-count-label-el">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Eligibility Banner Info (if applicable) */}
            {!isAuthenticated ? (
                <div style={{ background: 'var(--card-bg, #ffffff)', padding: '16px 20px', borderRadius: '12px', border: '1px dashed var(--border, #cbd5e1)', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted, #64748b)' }}>
                        <Lock size={18} color="var(--accent, #6366f1)" />
                        <span>Have you purchased this item? Log in to leave a review.</span>
                    </div>
                    <Link to="/login" className="btn-copy-ref-link" style={{ padding: '6px 14px', fontSize: '13px' }}>
                        Log In
                    </Link>
                </div>
            ) : eligibility && !eligibility.can_review && !hasReviewed ? (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#d97706' }}>
                    <AlertCircle size={18} />
                    <span>{eligibility.reason || 'You can review this variant after purchasing and receiving your order.'}</span>
                </div>
            ) : null}

            {/* Customer Review List */}
            <div style={{ marginTop: '32px' }}>
                <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '16px', color: 'var(--text, #1e293b)' }}>
                    Customer Feedback ({totalReviews})
                </h4>

                {loading ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton-box-el" style={{ height: '90px', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ background: 'var(--card-bg, #ffffff)', padding: '40px 20px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border, #e2e8f0)' }}>
                        <MessageSquare size={36} color="var(--text-muted, #94a3b8)" style={{ marginBottom: '12px', opacity: 0.6 }} />
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--text, #1e293b)' }}>
                            No reviews yet for this variant.
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: 'var(--text-muted, #64748b)' }}>
                            {isAuthenticated && eligibility?.can_review
                                ? 'Be the first customer to share feedback!'
                                : 'Be the first to review once your order is delivered.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {reviews.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'var(--card-bg, #ffffff)',
                                    padding: '20px',
                                    borderRadius: '14px',
                                    border: item.is_own_review ? '1.5px solid var(--accent, #6366f1)' : '1px solid var(--border, #e2e8f0)',
                                    position: 'relative',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '14.5px', color: 'var(--text, #1e293b)' }}>
                                                {item.user_name}
                                            </span>
                                            {item.is_own_review && (
                                                <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent, #6366f1)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                                                    Your Review
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '4px' }}>
                                            <StarRating rating={item.rating} size={14} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        {item.is_own_review && (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditReviewData(item);
                                                        setIsModalOpen(true);
                                                    }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent, #6366f1)', padding: '4px' }}
                                                    title="Edit review"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTargetId(item.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                    title="Delete review"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {item.comment ? (
                                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', lineHeight: '1.6', color: 'var(--text, #334155)' }}>
                                        {item.comment}
                                    </p>
                                ) : (
                                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic', color: 'var(--text-muted, #94a3b8)' }}>
                                        No text comment provided.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border, #cbd5e1)',
                                background: 'var(--card-bg, #ffffff)',
                                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                opacity: page <= 1 ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '13px',
                            }}
                        >
                            <ChevronLeft size={16} />
                            <span>Previous</span>
                        </button>
                        <span style={{ fontSize: '13.5px', color: 'var(--text-muted, #64748b)', fontWeight: '600' }}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border, #cbd5e1)',
                                background: 'var(--card-bg, #ffffff)',
                                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                opacity: page >= totalPages ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '13px',
                            }}
                        >
                            <span>Next</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditReviewData(null);
                    }}
                    onSubmit={handleModalSubmit}
                    initialData={editReviewData}
                    isSubmitting={isSubmitting}
                    variantName={variantName}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {deleteTargetId && (
                <ConfirmationDialog
                    isOpen={Boolean(deleteTargetId)}
                    onClose={() => setDeleteTargetId(null)}
                    onConfirm={handleDeleteReview}
                    title="Delete Review"
                    message="Are you sure you want to delete your review for this product? This action cannot be undone."
                    confirmText="Delete Review"
                    cancelText="Cancel"
                    isLoading={isDeleting}
                    isDanger={true}
                />
            )}
        </section>
    );
}

export default ReviewList;
