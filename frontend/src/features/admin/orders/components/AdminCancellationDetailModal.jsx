import React, { useState } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    PackageCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    FileText,
} from "lucide-react";

export function AdminCancellationDetailModal({
    cancellationReq,
    onClose,
    onApprove,
    onReject,
    loading = false,
}) {
    const [actionType, setActionType] = useState(null); // "APPROVE" | "REJECT" | null
    const [remarkInput, setRemarkInput] = useState("");

    if (!cancellationReq) return null;

    const orderDetails = cancellationReq.order_details || {};
    const items = orderDetails.items || [];
    const customer = cancellationReq.customer || {};
    const status = cancellationReq.status || "PENDING";
    const isPending = status === "PENDING";
    const refundVal = cancellationReq.refund_amount_val || orderDetails.total_amount || "0.00";

    const getStatusBadge = (st) => {
        switch (st) {
            case "PENDING":
                return <span className="status-badge warning"><Clock size={13} /> PENDING</span>;
            case "APPROVED":
                return <span className="status-badge success"><CheckCircle2 size={13} /> APPROVED</span>;
            case "REJECTED":
                return <span className="status-badge danger"><XCircle size={13} /> REJECTED</span>;
            default:
                return <span className="status-badge">{st}</span>;
        }
    };

    const handleConfirmAction = () => {
        if (actionType === "APPROVE") {
            onApprove(cancellationReq.id, remarkInput);
        } else if (actionType === "REJECT") {
            onReject(cancellationReq.id, remarkInput);
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
                        <h2>Cancellation Request Details</h2>
                        <span className="modal-subtitle-id">ID: {cancellationReq.id}</span>
                    </div>
                    <button type="button" className="btn-close-modal" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-modal-body modal-scrollable-body">
                    {/* Top Highlights Bar */}
                    <div className="return-highlights-bar">
                        <div className="highlight-column">
                            <span className="label-sm">Current Status</span>
                            <div>{getStatusBadge(status)}</div>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Cancellation Type</span>
                            <span className="val-md font-bold text-accent">
                                {cancellationReq.is_item_cancellation ? "Single Product Cancellation" : "Full Order Cancellation"}
                            </span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Order Number</span>
                            <span className="val-md font-bold">{cancellationReq.order_number || "N/A"}</span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Refund Amount</span>
                            <span className="val-lg text-accent font-bold">Rs. {Number(refundVal).toFixed(2)}</span>
                        </div>
                        <div className="highlight-column">
                            <span className="label-sm">Requested Date</span>
                            <span className="val-sm">
                                {cancellationReq.created_at ? new Date(cancellationReq.created_at).toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                            </span>
                        </div>
                    </div>

                    {/* Target Product Snapshot (if Item Cancellation) */}
                    {cancellationReq.is_item_cancellation && cancellationReq.item_details && (
                        <div className="details-section-card" style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div className="section-card-header">
                                <PackageCheck size={16} color="#ef4444" />
                                <h3 style={{ color: '#ef4444' }}>Target Item to Cancel</h3>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '6px' }}>
                                {cancellationReq.item_details.image && (
                                    <img src={cancellationReq.item_details.image} alt={cancellationReq.item_details.product_name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                )}
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{cancellationReq.item_details.product_name}</h4>
                                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        Variant: {cancellationReq.item_details.variant_name} | Qty: x{cancellationReq.item_details.quantity} | Line Total: Rs. {Number(cancellationReq.item_details.line_total).toFixed(2)}
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
                            <h3>Cancellation Reason &amp; Note</h3>
                        </div>
                        <div className="reason-info-block">
                            <p className="reason-title-line">
                                <strong>Reason:</strong> <span className="reason-tag">{cancellationReq.reason}</span>
                            </p>
                            {cancellationReq.description && (
                                <p className="reason-desc-text">
                                    <strong>Description:</strong> {cancellationReq.description}
                                </p>
                            )}
                            {cancellationReq.admin_remark && (
                                <p className="admin-remark-box">
                                    <strong>Admin Remark:</strong> {cancellationReq.admin_remark}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="admin-modal-footer">
                    {isPending ? (
                        <>
                            {actionType === null ? (
                                <div className="modal-footer-actions-right">
                                    <button
                                        type="button"
                                        className="btn-admin secondary"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-admin danger"
                                        onClick={() => setActionType("REJECT")}
                                    >
                                        <XCircle size={15} /> Reject Request
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-admin success"
                                        onClick={() => setActionType("APPROVE")}
                                    >
                                        <CheckCircle2 size={15} /> Approve &amp; Refund
                                    </button>
                                </div>
                            ) : (
                                <div className="confirm-action-box">
                                    <div className="confirm-header-row">
                                        <span className={`confirm-title ${actionType === "APPROVE" ? "success" : "danger"}`}>
                                            {actionType === "APPROVE" ? "Approve Cancellation & Refund" : "Reject Cancellation Request"}
                                        </span>
                                    </div>
                                    <textarea
                                        className="admin-input modal-remark-textarea"
                                        placeholder={`Add optional ${actionType === "APPROVE" ? "approval note" : "rejection reason for customer"}...`}
                                        value={remarkInput}
                                        onChange={(e) => setRemarkInput(e.target.value)}
                                        rows={2}
                                    />
                                    <div className="confirm-actions-row">
                                        <button
                                            type="button"
                                            className="btn-admin secondary"
                                            onClick={() => setActionType(null)}
                                            disabled={loading}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-admin ${actionType === "APPROVE" ? "success" : "danger"}`}
                                            onClick={handleConfirmAction}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex-center-gap">
                                                    <Loader2 size={14} className="spin" /> Processing...
                                                </span>
                                            ) : (
                                                `Confirm ${actionType === "APPROVE" ? "Approve" : "Reject"}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="modal-footer-actions-right">
                            <button type="button" className="btn-admin secondary" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminCancellationDetailModal;
