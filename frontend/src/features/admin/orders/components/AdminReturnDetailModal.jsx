import React, { useState } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    PackageCheck,
    CreditCard,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    Calendar,
    FileText,
} from "lucide-react";

export function AdminReturnDetailModal({
    returnReq,
    onClose,
    onApprove,
    onReject,
    loading = false,
}) {
    const [actionType, setActionType] = useState(null); // "APPROVE" | "REJECT" | null
    const [remarkInput, setRemarkInput] = useState("");

    if (!returnReq) return null;

    const orderDetails = returnReq.order_details || {};
    const items = orderDetails.items || [];
    const customer = returnReq.customer || {};
    const status = returnReq.status || "PENDING";
    const isPending = status === "PENDING";
    const refundVal = returnReq.refund_amount_val || orderDetails.total_amount || "0.00";

    const getStatusBadge = (st) => {
        switch (st) {
            case "PENDING":
                return <span className="status-badge warning"><Clock size={13} /> PENDING</span>;
            case "APPROVED":
            case "COMPLETED":
                return <span className="status-badge success"><CheckCircle2 size={13} /> APPROVED</span>;
            case "REJECTED":
                return <span className="status-badge danger"><XCircle size={13} /> REJECTED</span>;
            default:
                return <span className="status-badge">{st}</span>;
        }
    };

    const handleConfirmAction = () => {
        if (actionType === "APPROVE") {
            onApprove(returnReq.id, remarkInput);
        } else if (actionType === "REJECT") {
            onReject(returnReq.id, remarkInput);
        }
        setActionType(null);
    };

    return (
        <div className="admin-modal-backdrop" onClick={onClose}>
            <div
                className="admin-modal-content return-detail-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="admin-modal-header">
                    <div className="modal-title-group">
                        <h2>Return Request Details</h2>
                        <span className="modal-subtitle-id">ID: {returnReq.id}</span>
                    </div>
                    <button type="button" className="btn-close-modal" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-modal-body modal-scrollable-body">
                    {/* Top Status & Refund Highlights */}
                    <div className="return-highlights-bar">
                        <div className="highlight-column">
                            <span className="label-sm">Current Status</span>
                            <div>{getStatusBadge(status)}</div>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Return Type</span>
                            <span className="val-md font-bold text-accent">
                                {returnReq.is_item_return ? "Single Product Return" : "Full Order Return"}
                            </span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Order Number</span>
                            <span className="val-md font-bold">{returnReq.order_number || "N/A"}</span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Refund Amount</span>
                            <span className="val-lg text-accent font-bold">Rs. {Number(refundVal).toFixed(2)}</span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Requested Date</span>
                            <span className="val-sm">
                                {returnReq.requested_at ? new Date(returnReq.requested_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Target Returned Product Snapshot (if Item Return) */}
                    {returnReq.is_item_return && returnReq.item_details && (
                        <div className="details-section-card" style={{ background: 'rgba(79, 70, 229, 0.06)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                            <div className="section-card-header">
                                <PackageCheck size={16} color="var(--accent)" />
                                <h3 style={{ color: 'var(--accent)' }}>Target Item for Return</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px' }}>
                                {returnReq.item_details.image && (
                                    <img src={returnReq.item_details.image} alt={returnReq.item_details.product_name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                )}
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{returnReq.item_details.product_name}</h4>
                                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Variant: {returnReq.item_details.variant_name} | Qty: x{returnReq.item_details.quantity} | Line Total: Rs. {Number(returnReq.item_details.line_total).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Info Box */}
                    <div className="details-section-card">
                        <div className="section-card-header">
                            <User size={16} />
                            <h3>Customer Details</h3>
                        </div>
                        <div className="details-info-grid">
                            <div>
                                <span className="info-label"><User size={13} /> Name:</span>
                                <span className="info-value">{customer.first_name} {customer.last_name}</span>
                            </div>
                            <div>
                                <span className="info-label"><Mail size={13} /> Email:</span>
                                <span className="info-value">{customer.email || "N/A"}</span>
                            </div>
                            <div>
                                <span className="info-label"><Phone size={13} /> Phone:</span>
                                <span className="info-value">{customer.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Reason & Description Box */}
                    <div className="details-section-card">
                        <div className="section-card-header">
                            <FileText size={16} />
                            <h3>Return Reason &amp; Note</h3>
                        </div>
                        <div className="reason-info-block">
                            <p className="reason-title-line">
                                <strong>Reason:</strong> <span className="reason-tag">{returnReq.reason}</span>
                            </p>
                            {returnReq.description && (
                                <p className="reason-desc-text">
                                    <strong>Description:</strong> {returnReq.description}
                                </p>
                            )}
                            {returnReq.admin_remark && (
                                <p className="admin-remark-box">
                                    <strong>Admin Remark:</strong> {returnReq.admin_remark}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Returned Items Box */}
                    {items.length > 0 && (
                        <div className="details-section-card">
                            <div className="section-card-header">
                                <PackageCheck size={16} />
                                <h3>Order Items ({items.length})</h3>
                            </div>
                            <div className="returned-items-table-wrapper">
                                <table className="admin-table mini-items-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Variant</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="font-semibold">{item.product_name}</td>
                                                <td className="text-muted">{item.variant_name}</td>
                                                <td>Rs. {Number(item.price ?? item.price_at_purchase ?? 0).toFixed(2)}</td>
                                                <td className="font-bold">x{item.quantity}</td>
                                                <td className="font-bold text-accent">Rs. {Number(item.line_total || 0).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="admin-modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                        Close
                    </button>
                    {isPending && (
                        <div className="action-buttons-group">
                            <button
                                type="button"
                                className="btn-danger-pill"
                                disabled={loading}
                                onClick={() => {
                                    setActionType("REJECT");
                                    setRemarkInput("");
                                }}
                            >
                                Reject Return
                            </button>
                            <button
                                type="button"
                                className="btn-success-pill"
                                disabled={loading}
                                onClick={() => {
                                    setActionType("APPROVE");
                                    setRemarkInput("");
                                }}
                            >
                                Approve &amp; Refund to Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog Modal */}
            {actionType && (
                <div className="nested-modal-backdrop" onClick={() => setActionType(null)}>
                    <div className="nested-modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {actionType === "APPROVE" ? "Approve Return & Refund?" : "Reject Return Request?"}
                        </h3>
                        <p className="nested-modal-subtext">
                            {actionType === "APPROVE"
                                ? `This will credit Rs. ${Number(refundVal).toFixed(2)} to ${customer.first_name}'s wallet and restore item inventory stock.`
                                : "This return request will be marked as rejected."}
                        </p>

                        <div className="form-group-remark">
                            <label>Admin Remark / Reason (Optional):</label>
                            <textarea
                                rows={3}
                                className="admin-textarea"
                                placeholder="Enter any notes or remarks for customer record..."
                                value={remarkInput}
                                onChange={(e) => setRemarkInput(e.target.value)}
                            />
                        </div>

                        <div className="nested-modal-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setActionType(null)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className={actionType === "APPROVE" ? "btn-success-pill" : "btn-danger-pill"}
                                onClick={handleConfirmAction}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading-content">
                                        <Loader2 size={16} className="spinner-icon" /> Processing...
                                    </span>
                                ) : (
                                    actionType === "APPROVE" ? "Confirm Approval & Wallet Credit" : "Confirm Rejection"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReturnDetailModal;
