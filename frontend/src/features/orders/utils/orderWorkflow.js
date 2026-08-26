/**
 * Centralized Order Status Workflow configuration for Frontend.
 * Single source of truth for allowed order status transitions in UI elements and dropdowns.
 */

export const ORDER_STATUS_LABELS = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PACKED: "Packed",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out For Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURN_REQUESTED: "Return Requested",
    RETURNED: "Returned",
};

export const ORDER_STATUS_TRANSITIONS = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PACKED", "CANCELLED"],
    PACKED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["OUT_FOR_DELIVERY", "CANCELLED"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: ["RETURN_REQUESTED"],
    RETURN_REQUESTED: ["RETURNED"],
    CANCELLED: [],
    RETURNED: [],
};

/**
 * Returns a list of valid next status objects { key, label } based on the current order status.
 * @param {string} currentStatus
 * @returns {Array<{key: string, label: string}>}
 */
export function getValidNextStatuses(currentStatus) {
    if (!currentStatus) return [];
    const statusKey = String(currentStatus).trim().toUpperCase();
    const nextKeys = ORDER_STATUS_TRANSITIONS[statusKey] || [];
    return nextKeys.map((key) => ({
        key,
        label: ORDER_STATUS_LABELS[key] || key.replace(/_/g, " "),
    }));
}

/**
 * Checks whether transitioning from currentStatus to targetStatus is allowed.
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {boolean}
 */
export function isTransitionAllowed(currentStatus, targetStatus) {
    if (!currentStatus || !targetStatus) return false;
    const currentKey = String(currentStatus).trim().toUpperCase();
    const targetKey = String(targetStatus).trim().toUpperCase();
    const allowed = ORDER_STATUS_TRANSITIONS[currentKey] || [];
    return allowed.includes(targetKey);
}
