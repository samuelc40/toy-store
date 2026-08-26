import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchProductOffersAsync,
    fetchCategoryOffersAsync,
    fetchReferralConfigAsync,
    createProductOfferAsync,
    updateProductOfferAsync,
    toggleProductOfferStatusAsync,
    deleteProductOfferAsync,
    createCategoryOfferAsync,
    updateCategoryOfferAsync,
    toggleCategoryOfferStatusAsync,
    deleteCategoryOfferAsync,
    updateReferralConfigAsync,
    setActiveTab,
    setStatusFilter,
    setSearchQuery,
    setCurrentPage,
    selectAdminOffers,
} from "../redux/adminOffersSlice";
import {
    Tag,
    FolderOpen,
    Gift,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Save,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import ProductOfferFormModal from "../components/ProductOfferFormModal";
import CategoryOfferFormModal from "../components/CategoryOfferFormModal";
import DeleteOfferConfirmModal from "../components/DeleteOfferConfirmModal";
import "../styles/AdminOffers.css";

export default function AdminOffersPage() {
    const dispatch = useDispatch();
    const {
        activeTab,
        productOffers,
        categoryOffers,
        referralConfig,
        count,
        totalPages,
        currentPage,
        statusFilter,
        searchQuery,
        loading,
        actionLoading,
    } = useSelector(selectAdminOffers);

    // Modal Visibility States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Items for Edit / Delete
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Debounced Search Local State
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Referral Config Form State
    const [refFormData, setRefFormData] = useState({
        is_active: true,
        referrer_bonus: 100,
        new_user_bonus: 50,
        minimum_order_amount: 500,
    });

    useEffect(() => {
        if (referralConfig) {
            setRefFormData({
                is_active: referralConfig.is_active ?? true,
                referrer_bonus: referralConfig.referrer_bonus ?? 100,
                new_user_bonus: referralConfig.new_user_bonus ?? 50,
                minimum_order_amount: referralConfig.minimum_order_amount ?? 500,
            });
        }
    }, [referralConfig]);

    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                dispatch(setSearchQuery(localSearch));
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, dispatch]);

    // Fetch data whenever activeTab, statusFilter, searchQuery, or currentPage changes
    useEffect(() => {
        const params = {
            page: currentPage,
            status: statusFilter,
            search: searchQuery,
        };

        if (activeTab === "products") {
            dispatch(fetchProductOffersAsync(params));
        } else if (activeTab === "categories") {
            dispatch(fetchCategoryOffersAsync(params));
        } else if (activeTab === "referrals") {
            dispatch(fetchReferralConfigAsync());
        }
    }, [activeTab, statusFilter, searchQuery, currentPage, dispatch]);

    // Refresh Current Tab List
    const refreshCurrentTab = () => {
        const params = { page: currentPage, status: statusFilter, search: searchQuery };
        if (activeTab === "products") dispatch(fetchProductOffersAsync(params));
        if (activeTab === "categories") dispatch(fetchCategoryOffersAsync(params));
        if (activeTab === "referrals") dispatch(fetchReferralConfigAsync());
    };

    // Modal Handlers
    const handleOpenCreateModal = () => {
        setSelectedOffer(null);
        if (activeTab === "products") setIsProductModalOpen(true);
        if (activeTab === "categories") setIsCategoryModalOpen(true);
    };

    const handleOpenEditModal = (offer) => {
        setSelectedOffer(offer);
        if (activeTab === "products") setIsProductModalOpen(true);
        if (activeTab === "categories") setIsCategoryModalOpen(true);
    };

    const handleOpenDeleteModal = (offer) => {
        setSelectedOffer(offer);
        setIsDeleteModalOpen(true);
    };

    // Product Offer Submit
    const handleProductOfferSubmit = async (payload) => {
        try {
            if (selectedOffer) {
                await dispatch(updateProductOfferAsync({ offerId: selectedOffer.id, payload })).unwrap();
                toast.success("Product offer updated successfully!");
            } else {
                await dispatch(createProductOfferAsync(payload)).unwrap();
                toast.success("Product offer created successfully!");
            }
            setIsProductModalOpen(false);
            refreshCurrentTab();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to save product offer.");
        }
    };

    // Category Offer Submit
    const handleCategoryOfferSubmit = async (payload) => {
        try {
            if (selectedOffer) {
                await dispatch(updateCategoryOfferAsync({ offerId: selectedOffer.id, payload })).unwrap();
                toast.success("Category offer updated successfully!");
            } else {
                await dispatch(createCategoryOfferAsync(payload)).unwrap();
                toast.success("Category offer created successfully!");
            }
            setIsCategoryModalOpen(false);
            refreshCurrentTab();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to save category offer.");
        }
    };

    // Save Referral Config Submit
    const handleSaveReferralConfig = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateReferralConfigAsync({
                is_active: refFormData.is_active,
                referrer_bonus: parseFloat(refFormData.referrer_bonus || 0),
                new_user_bonus: parseFloat(refFormData.new_user_bonus || 0),
                minimum_order_amount: parseFloat(refFormData.minimum_order_amount || 0),
            })).unwrap();
            toast.success("Referral program settings saved successfully!");
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to save referral settings.");
        }
    };

    // Toggle Status
    const handleToggleStatus = async (offer) => {
        try {
            const nextStatus = !offer.is_active;
            if (activeTab === "products") {
                await dispatch(toggleProductOfferStatusAsync({ offerId: offer.id, isActive: nextStatus })).unwrap();
            } else if (activeTab === "categories") {
                await dispatch(toggleCategoryOfferStatusAsync({ offerId: offer.id, isActive: nextStatus })).unwrap();
            }
            toast.success(`Offer ${nextStatus ? "activated" : "deactivated"} successfully!`);
            refreshCurrentTab();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to update offer status.");
        }
    };

    // Delete Offer Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedOffer) return;
        try {
            if (activeTab === "products") {
                await dispatch(deleteProductOfferAsync(selectedOffer.id)).unwrap();
            } else if (activeTab === "categories") {
                await dispatch(deleteCategoryOfferAsync(selectedOffer.id)).unwrap();
            }
            toast.success("Offer deleted successfully!");
            setIsDeleteModalOpen(false);
            refreshCurrentTab();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Failed to delete offer.");
        }
    };

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderStatusBadge = (statusStr) => {
        const st = (statusStr || "INACTIVE").toUpperCase();
        if (st === "ACTIVE") {
            return (
                <span className="offer-badge active">
                    <CheckCircle2 size={12} /> Active
                </span>
            );
        }
        if (st === "UPCOMING") {
            return (
                <span className="offer-badge upcoming">
                    <Clock size={12} /> Upcoming
                </span>
            );
        }
        if (st === "EXPIRED") {
            return (
                <span className="offer-badge expired">
                    <XCircle size={12} /> Expired
                </span>
            );
        }
        return (
            <span className="offer-badge inactive">
                <XCircle size={12} /> Inactive
            </span>
        );
    };

    return (
        <div className="admin-offers-container">
            {/* Header */}
            <div className="admin-offers-header">
                <div>
                    <h1 className="admin-offers-title">Offer Management</h1>
                    <p className="admin-offers-subtitle">
                        Create and manage product discounts, category campaigns, and referral reward settings.
                    </p>
                </div>
                {activeTab !== "referrals" && (
                    <button
                        type="button"
                        className="btn-admin-primary"
                        onClick={handleOpenCreateModal}
                    >
                        <Plus size={18} />
                        <span>Create {activeTab === "products" ? "Product Offer" : "Category Offer"}</span>
                    </button>
                )}
            </div>

            {/* Stat Summary Cards */}
            <div className="admin-offers-stats-grid">
                <div className="admin-offer-stat-card">
                    <div>
                        <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Product Offers</span>
                        <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "4px 0 0 0", color: "var(--text-primary)" }}>
                            {productOffers.length}
                        </h2>
                    </div>
                    <div className="admin-stat-icon-wrapper" style={{ background: "#4f46e5" }}>
                        <Tag size={24} />
                    </div>
                </div>

                <div className="admin-offer-stat-card">
                    <div>
                        <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Category Offers</span>
                        <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "4px 0 0 0", color: "var(--text-primary)" }}>
                            {categoryOffers.length}
                        </h2>
                    </div>
                    <div className="admin-stat-icon-wrapper" style={{ background: "#10b981" }}>
                        <FolderOpen size={24} />
                    </div>
                </div>

                <div className="admin-offer-stat-card">
                    <div>
                        <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>Referral Program</span>
                        <div style={{ marginTop: "4px" }}>
                            {referralConfig?.is_active ? (
                                <span className="offer-badge active"><CheckCircle2 size={12} /> Active</span>
                            ) : (
                                <span className="offer-badge inactive"><XCircle size={12} /> Disabled</span>
                            )}
                        </div>
                    </div>
                    <div className="admin-stat-icon-wrapper" style={{ background: "#ec4899" }}>
                        <Gift size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-offers-tabs">
                <button
                    type="button"
                    className={`admin-offer-tab-btn ${activeTab === "products" ? "active" : ""}`}
                    onClick={() => dispatch(setActiveTab("products"))}
                >
                    <Tag size={16} /> Product Offers
                </button>
                <button
                    type="button"
                    className={`admin-offer-tab-btn ${activeTab === "categories" ? "active" : ""}`}
                    onClick={() => dispatch(setActiveTab("categories"))}
                >
                    <FolderOpen size={16} /> Category Offers
                </button>
                <button
                    type="button"
                    className={`admin-offer-tab-btn ${activeTab === "referrals" ? "active" : ""}`}
                    onClick={() => dispatch(setActiveTab("referrals"))}
                >
                    <Gift size={16} /> Referral Settings
                </button>
            </div>

            {/* Controls Bar (Search/Filter for Product & Category Tabs) */}
            {activeTab !== "referrals" && (
                <div className="admin-offers-controls">
                    <div className="admin-offers-search-box">
                        <Search className="admin-offers-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab} offers...`}
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <select
                            className="admin-offers-filter-select"
                            value={statusFilter}
                            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="EXPIRED">Expired</option>
                        </select>

                        <button
                            type="button"
                            className="admin-action-btn"
                            onClick={refreshCurrentTab}
                            title="Refresh list"
                        >
                            <RefreshCw size={16} className={loading ? "spinner-icon" : ""} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            {activeTab === "referrals" ? (
                /* REFERRAL PROGRAM CONFIGURATION CARD */
                <form onSubmit={handleSaveReferralConfig} className="referral-config-card">
                    <div className="referral-config-header">
                        <div className="referral-config-title-group">
                            <div className="referral-config-icon">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h3 className="referral-config-title">Storewide Referral Rewards Program</h3>
                                <p className="referral-config-desc">
                                    Configure bonus reward amounts for referrers and new customers upon qualifying first purchase.
                                </p>
                            </div>
                        </div>

                        <div className="referral-toggle-wrapper">
                            <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                                Program Status:
                            </span>
                            <label className="toggle-switch-label">
                                <input
                                    type="checkbox"
                                    checked={refFormData.is_active}
                                    onChange={(e) => setRefFormData({ ...refFormData, is_active: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span className={`offer-badge ${refFormData.is_active ? "active" : "inactive"}`}>
                                {refFormData.is_active ? "Active" : "Disabled"}
                            </span>
                        </div>
                    </div>

                    <div className="referral-config-grid">
                        <div className="referral-input-box">
                            <label htmlFor="ref-bonus-input">Referrer User Bonus (Rs.)</label>
                            <input
                                id="ref-bonus-input"
                                type="number"
                                min="0"
                                step="1"
                                value={refFormData.referrer_bonus}
                                onChange={(e) => setRefFormData({ ...refFormData, referrer_bonus: e.target.value })}
                                required
                            />
                            <p>Wallet credit awarded to the user who shared their referral link.</p>
                        </div>

                        <div className="referral-input-box">
                            <label htmlFor="new-user-bonus-input">New User Bonus (Rs.)</label>
                            <input
                                id="new-user-bonus-input"
                                type="number"
                                min="0"
                                step="1"
                                value={refFormData.new_user_bonus}
                                onChange={(e) => setRefFormData({ ...refFormData, new_user_bonus: e.target.value })}
                                required
                            />
                            <p>Welcome wallet bonus awarded to the newly registered friend.</p>
                        </div>

                        <div className="referral-input-box">
                            <label htmlFor="min-order-input">Minimum Order Amount (Rs.)</label>
                            <input
                                id="min-order-input"
                                type="number"
                                min="0"
                                step="1"
                                value={refFormData.minimum_order_amount}
                                onChange={(e) => setRefFormData({ ...refFormData, minimum_order_amount: e.target.value })}
                                required
                            />
                            <p>Minimum first order total required to trigger referral payout.</p>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" className="btn-admin-primary" disabled={actionLoading}>
                            <Save size={18} />
                            <span>{actionLoading ? "Saving Settings..." : "Save Referral Settings"}</span>
                        </button>
                    </div>
                </form>
            ) : (
                /* PRODUCT / CATEGORY OFFERS TABLES */
                <div className="admin-table-card">
                    {loading ? (
                        <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                            <RefreshCw size={28} className="spinner-icon text-accent" />
                            <p style={{ marginTop: "12px", fontWeight: 600 }}>Loading offers...</p>
                        </div>
                    ) : activeTab === "products" ? (
                        /* PRODUCT OFFERS TABLE */
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Discount</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                            No product offers found.
                                        </td>
                                    </tr>
                                ) : (
                                    productOffers.map((offer) => (
                                        <tr key={offer.id}>
                                            <td>
                                                <strong style={{ display: "block", color: "var(--text-primary)" }}>
                                                    {offer.product?.name || "Product"}
                                                </strong>
                                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                    {offer.product?.brand || "Brand"}
                                                </span>
                                            </td>
                                            <td>{offer.product?.category_name || "Category"}</td>
                                            <td>
                                                <strong style={{ color: "var(--accent)" }}>
                                                    {offer.discount_type === "PERCENTAGE" ? `${offer.discount_value}% OFF` : `Rs. ${offer.discount_value} OFF`}
                                                </strong>
                                            </td>
                                            <td style={{ fontSize: "13px" }}>{formatDate(offer.start_date)}</td>
                                            <td style={{ fontSize: "13px" }}>{formatDate(offer.end_date)}</td>
                                            <td>{renderStatusBadge(offer.status)}</td>
                                            <td>
                                                <div className="admin-action-btn-group">
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => handleToggleStatus(offer)}
                                                        title={offer.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        {offer.is_active ? <XCircle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#10b981" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => handleOpenEditModal(offer)}
                                                        title="Edit Offer"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn delete"
                                                        onClick={() => handleOpenDeleteModal(offer)}
                                                        title="Delete Offer"
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
                    ) : (
                        /* CATEGORY OFFERS TABLE */
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Category Name</th>
                                    <th>Discount</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                            No category offers found.
                                        </td>
                                    </tr>
                                ) : (
                                    categoryOffers.map((offer) => (
                                        <tr key={offer.id}>
                                            <td>
                                                <strong style={{ color: "var(--text-primary)" }}>
                                                    {offer.category?.name || "Category"}
                                                </strong>
                                            </td>
                                            <td>
                                                <strong style={{ color: "#10b981" }}>
                                                    {offer.discount_type === "PERCENTAGE" ? `${offer.discount_value}% OFF` : `Rs. ${offer.discount_value} OFF`}
                                                </strong>
                                            </td>
                                            <td style={{ fontSize: "13px" }}>{formatDate(offer.start_date)}</td>
                                            <td style={{ fontSize: "13px" }}>{formatDate(offer.end_date)}</td>
                                            <td>{renderStatusBadge(offer.status)}</td>
                                            <td>
                                                <div className="admin-action-btn-group">
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => handleToggleStatus(offer)}
                                                        title={offer.is_active ? "Deactivate" : "Activate"}
                                                    >
                                                        {offer.is_active ? <XCircle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#10b981" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn"
                                                        onClick={() => handleOpenEditModal(offer)}
                                                        title="Edit Offer"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-action-btn delete"
                                                        onClick={() => handleOpenDeleteModal(offer)}
                                                        title="Delete Offer"
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
                    )}

                    {/* Pagination */}
                    {activeTab !== "referrals" && totalPages > 1 && (
                        <div className="admin-pagination-bar">
                            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>
                                Showing page {currentPage} of {totalPages} ({count} items total)
                            </span>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    type="button"
                                    className="btn-admin-cancel"
                                    disabled={currentPage <= 1 || loading}
                                    onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn-admin-cancel"
                                    disabled={currentPage >= totalPages || loading}
                                    onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <ProductOfferFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleProductOfferSubmit}
                initialData={selectedOffer}
                isSubmitting={actionLoading}
            />

            <CategoryOfferFormModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSubmit={handleCategoryOfferSubmit}
                initialData={selectedOffer}
                isSubmitting={actionLoading}
            />

            <DeleteOfferConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                offerTitle={
                    selectedOffer
                        ? activeTab === "products"
                            ? selectedOffer.product?.name
                            : selectedOffer.category?.name
                        : "Offer"
                }
                isDeleting={actionLoading}
            />
        </div>
    );
}
