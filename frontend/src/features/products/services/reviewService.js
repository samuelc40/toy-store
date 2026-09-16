import api from "../../../api/axios";

/**
 * Fetch paginated reviews and rating statistics for a specific variant.
 */
export const getVariantReviews = async (variantId, page = 1, pageSize = 5) => {
  if (!variantId || variantId === "undefined" || variantId === "null") {
    return {
      count: 0,
      results: {
        reviews: [],
        statistics: {
          average_rating: 0.0,
          total_reviews: 0,
          rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      },
    };
  }
  const response = await api.get(
    `/customers/reviews/variants/${encodeURIComponent(variantId)}/reviews/?page=${page}&page_size=${pageSize}`,
  );
  return response.data;
};

/**
 * Fetch review eligibility status for the authenticated user and selected variant.
 */
export const getReviewEligibility = async (variantId) => {
  if (!variantId || variantId === "undefined" || variantId === "null") {
    return {
      data: {
        can_review: false,
        has_reviewed: false,
        already_reviewed: false,
        has_eligible_purchase: false,
        existing_review_id: null,
        existing_review: null,
      },
    };
  }
  const response = await api.get(
    `/customers/reviews/variants/${encodeURIComponent(variantId)}/reviews/eligibility/`,
  );
  return response.data;
};

/**
 * Submit a new review for a variant.
 */
export const createVariantReview = async (variantId, { rating, comment }) => {
  const response = await api.post(
    `/customers/reviews/variants/${variantId}/reviews/`,
    { rating, comment },
  );
  return response.data;
};

/**
 * Update an existing review owned by the authenticated user.
 */
export const updateReview = async (reviewId, { rating, comment }) => {
  const response = await api.patch(`/customers/reviews/${reviewId}/`, {
    rating,
    comment,
  });
  return response.data;
};

/**
 * Delete a review owned by the authenticated user.
 */
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/customers/reviews/${reviewId}/`);
  return response.data;
};
