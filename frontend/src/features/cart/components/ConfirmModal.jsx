import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/Cart.css';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        if (onCancel) onCancel();
    };

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-box">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="confirm-modal-close-btn"
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="confirm-modal-content">
                    <div className="confirm-modal-icon-wrapper">
                        <AlertTriangle size={24} className="confirm-modal-icon" />
                    </div>
                    <div className="confirm-modal-text-group">
                        <h4 className="confirm-modal-title">{title || 'Confirm Action'}</h4>
                        <p className="confirm-modal-message">{message || 'Are you sure you want to proceed?'}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="confirm-modal-actions-row">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-confirm-modal-cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="btn-confirm-modal-confirm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
