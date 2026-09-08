import api from "../../../../api/axios";

export const fetchAdminReviews = async ({ page = 1, page_size = 10, search = "", rating = "", is_visible = "" }) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (page_size) params.append("page_size", page_size);
    if (search) params.append("search", search);
    if (rating) params.append("rating", rating);
    if (is_visible !== "") params.append("is_visible", is_visible);

    const response = await api.get(`/admin/reviews/?${params.toString()}`);
    return response.data;
};

export const fetchAdminReviewDetail = async (reviewId) => {
    const response = await api.get(`/admin/reviews/${reviewId}/`);
    return response.data;
};

export const toggleAdminReviewVisibility = async (reviewId, isVisible) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/`, {
        is_visible: isVisible,
    });
    return response.data;
};

export const deleteAdminReview = async (reviewId) => {
    const response = await api.delete(`/admin/reviews/${reviewId}/`);
    return response.data;
};
