import api from "../../../../api/axios";

/**
 * Fetch dashboard analytics from backend API.
 * @param {object} params - { date_range, start_date, end_date, year, month, group_by }
 * @returns {Promise<object>}
 */
export const getDashboardAnalytics = async (params = {}) => {
  const response = await api.get("/admin/orders/reports/dashboard/", { params });
  return response.data;
};
