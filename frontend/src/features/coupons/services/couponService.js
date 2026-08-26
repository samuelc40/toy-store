import api from "../../../api/axios";

export const applyCoupon = async (code) => {
    const response = await api.post("/customers/coupons/apply/", { code });
    return response.data;
};

export const removeCoupon = async () => {
    const response = await api.post("/customers/coupons/remove/");
    return response.data;
};

export const fetchAvailableCoupons = async () => {
    const response = await api.get("/customers/coupons/available/");
    return response.data;
};

// Admin Coupon APIs
export const fetchAdminCoupons = async (params = {}) => {
    const response = await api.get("/admin/coupons/", { params });
    return response.data;
};

export const createAdminCoupon = async (data) => {
    const response = await api.post("/admin/coupons/", data);
    return response.data;
};

export const updateAdminCoupon = async (id, data) => {
    const response = await api.patch(`/admin/coupons/${id}/`, data);
    return response.data;
};

export const deleteAdminCoupon = async (id) => {
    const response = await api.delete(`/admin/coupons/${id}/`);
    return response.data;
};
