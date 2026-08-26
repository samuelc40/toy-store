import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Ticket,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Percent,
} from "lucide-react";
import {
    getAdminCoupons,
    createCouponThunk,
    updateCouponThunk,
    deleteCouponThunk,
    setPage,
} from "../redux/adminCouponsSlice";
import CouponFormModal from "../components/CouponFormModal";
import DeleteCouponModal from "../components/DeleteCouponModal";
import Pagination from "../../../../pages/admin/Pagination";
import "../styles/AdminCoupons.css";

export function AdminCouponsPage() {
    const dispatch = useDispatch();
    const { coupons, count, page, pageSize, totalPages, loading, actionLoading } = useSelector(
        (state) => state.adminCoupons
    );

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deletingCoupon, setDeletingCoupon] = useState(null);

    useEffect(() => {
        dispatch(getAdminCoupons({ search, sort, page, page_size: pageSize }));
    }, [dispatch, search, sort, page, pageSize]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        dispatch(setPage(1));
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        dispatch(setPage(1));
    };

    const handleCreateSubmit = async (formData) => {
        let res;
        if (editingCoupon) {
            res = await dispatch(updateCouponThunk({ id: editingCoupon.id, data: formData }));
            if (!res.error) {
                setIsCreateModalOpen(false);
                setEditingCoupon(null);
                dispatch(getAdminCoupons({ search, sort, page, page_size: pageSize }));
                return null;
            }
        } else {
            res = await dispatch(createCouponThunk(formData));
            if (!res.error) {
                setIsCreateModalOpen(false);
                dispatch(getAdminCoupons({ search, sort, page: 1, page_size: pageSize }));
                return null;
            }
        }
        return res.payload;
    };

    const handleDeleteConfirm = async (id) => {
        const res = await dispatch(deleteCouponThunk(id));
        if (!res.error) {
            setDeletingCoupon(null);
            dispatch(getAdminCoupons({ search, sort, page, page_size: pageSize }));
        }
    };

    const getStatusBadge = (coupon) => {
        const now = new Date();
        const end = new Date(coupon.end_date);
        if (!coupon.is_active) {
            return (
                <span className="status-badge-pill inactive">
                    <XCircle size={13} />
                    Inactive
                </span>
            );
        }
        if (end < now) {
            return (
                <span className="status-badge-pill expired">
                    <Clock size={13} />
                    Expired
                </span>
            );
        }
        return (
            <span className="status-badge-pill active">
                <CheckCircle size={13} />
                Active
            </span>
        );
    };

    // Calculate stats summary
    const totalActiveCount = coupons.filter((c) => c.is_active).length;
    const totalUsageSum = coupons.reduce((acc, c) => acc + (c.used_count || 0), 0);

    return (
        <div className="admin-coupons-page">
            {/* Header */}
            <div className="coupons-header">
                <div className="coupons-title-group">
                    <h1>Coupon Management</h1>
                    <p>Create, manage and track discount coupons for customer checkout.</p>
                </div>
                <button
                    type="button"
                    className="btn-create-coupon"
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsCreateModalOpen(true);
                    }}
                >
                    <Plus size={18} />
                    <span>Create New Coupon</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="coupons-stats-grid">
                <div className="coupon-stat-card">
                    <div className="stat-icon-wrapper purple">
                        <Ticket size={22} />
                    </div>
                    <div className="stat-meta-info">
                        <span>Total Coupons</span>
                        <strong>{count}</strong>
                    </div>
                </div>

                <div className="coupon-stat-card">
                    <div className="stat-icon-wrapper green">
                        <CheckCircle size={22} />
                    </div>
                    <div className="stat-meta-info">
                        <span>Active Coupons</span>
                        <strong>{totalActiveCount}</strong>
                    </div>
                </div>

                <div className="coupon-stat-card">
                    <div className="stat-icon-wrapper blue">
                        <Percent size={22} />
                    </div>
                    <div className="stat-meta-info">
                        <span>Total Redemptions</span>
                        <strong>{totalUsageSum} times</strong>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="coupons-filter-bar">
                <div className="search-input-wrapper">
                    <Search size={16} />
                    <input
                        type="text"
                        className="search-input-field"
                        placeholder="Search coupons by code or description..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>

                <select className="filter-select" value={sort} onChange={handleSortChange}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="code_a_z">Code A - Z</option>
                    <option value="code_z_a">Code Z - A</option>
                    <option value="highest_discount">Highest Discount</option>
                    <option value="lowest_discount">Lowest Discount</option>
                </select>
            </div>

            {/* Table Card */}
            <div className="coupons-table-card">
                <div className="table-responsive">
                    <table className="coupons-table">
                        <thead>
                            <tr>
                                <th>Coupon Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Expiry Date</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "30px 0" }}>
                                        <RefreshCw size={24} className="spinner-icon" style={{ opacity: 0.5 }} />
                                        <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)" }}>Loading coupons...</p>
                                    </td>
                                </tr>
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "40px 0" }}>
                                        <Ticket size={36} style={{ opacity: 0.3, marginBottom: "8px" }} />
                                        <p style={{ margin: 0, fontWeight: 700 }}>No coupons found.</p>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((c) => (
                                    <tr key={c.id}>
                                        <td>
                                            <span className="code-pill">{c.code}</span>
                                            {c.description && (
                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                                    {c.description}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="discount-val-text">
                                                {c.discount_type === "PERCENTAGE"
                                                    ? `${c.discount_value}% OFF`
                                                    : `Rs. ${Number(c.discount_value).toFixed(2)} OFF`}
                                            </span>
                                            {c.maximum_discount_amount && c.discount_type === "PERCENTAGE" && (
                                                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                                                    Max: Rs. {Number(c.maximum_discount_amount).toFixed(2)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {Number(c.minimum_order_amount) > 0
                                                ? `Rs. ${Number(c.minimum_order_amount).toFixed(2)}`
                                                : "None"}
                                        </td>
                                        <td>{new Date(c.end_date).toLocaleDateString()}</td>
                                        <td>
                                            <strong>{c.used_count}</strong>
                                            <span> / {c.usage_limit > 0 ? c.usage_limit : "∞"}</span>
                                            {c.usage_limit > 0 && (
                                                <div className="usage-progress-bar">
                                                    <div
                                                        className="usage-progress-fill"
                                                        style={{
                                                            width: `${Math.min(100, (c.used_count / c.usage_limit) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(c)}</td>
                                        <td>
                                            <div className="action-buttons-cell">
                                                <button
                                                    type="button"
                                                    className="btn-icon-action"
                                                    title="Edit Coupon"
                                                    onClick={() => {
                                                        setEditingCoupon(c);
                                                        setIsCreateModalOpen(true);
                                                    }}
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon-action delete"
                                                    title="Deactivate Coupon"
                                                    onClick={() => setDeletingCoupon(c)}
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

                {totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => dispatch(setPage(p))}
                    />
                )}
            </div>

            {/* Create / Edit Modal */}
            <CouponFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingCoupon(null);
                }}
                onSubmit={handleCreateSubmit}
                initialData={editingCoupon}
                isLoading={actionLoading}
            />

            {/* Deactivate / Delete Modal */}
            <DeleteCouponModal
                isOpen={Boolean(deletingCoupon)}
                onClose={() => setDeletingCoupon(null)}
                onConfirm={handleDeleteConfirm}
                coupon={deletingCoupon}
                isLoading={actionLoading}
            />
        </div>
    );
}

export default AdminCouponsPage;
