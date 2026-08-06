import api from "../../../../api/axios";

/**
 * Admin Inventory Service
 */
export const adminInventoryService = {
    /**
     * Fetch paginated inventory list with search, sort, and multi-field filters.
     */
    getInventory: async (params = {}) => {
        const response = await api.get("/admin/products/inventory/", { params });
        return response.data;
    },

    /**
     * Fetch inventory summary statistics (total products, variants, in stock, low stock, out of stock).
     */
    getInventorySummary: async () => {
        const response = await api.get("/admin/products/inventory/summary/");
        return response.data;
    },

    /**
     * Update variant stock quantity.
     */
    updateVariantStock: async (variantId, payload) => {
        const response = await api.patch(`/admin/products/inventory/variants/${variantId}/stock/`, payload);
        return response.data;
    },
};

export default adminInventoryService;
