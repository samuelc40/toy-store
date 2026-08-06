import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import "./ProfilePage.css";

function DeleteAddressDialog({ isOpen, onClose, onConfirm, isLoading }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-backdrop">
            <div className="address-modal-card dialog-card-delete">
                <div className="dialog-icon-row">
                    <div className="dialog-warning-icon-wrapper">
                        <AlertTriangle size={28} />
                    </div>
                </div>
                <h3 className="modal-title dialog-title-centered">Delete Address</h3>
                <p className="modal-description dialog-description">
                    Are you sure you want to delete this address? This action cannot be undone.
                </p>
                <div className="modal-actions-row dialog-actions-centered">
                    <button 
                        type="button" 
                        className="modal-cancel-btn btn-dialog-action" 
                        onClick={onClose} 
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="modal-submit-btn btn-danger-confirm btn-dialog-action" 
                        onClick={onConfirm} 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="btn-loading-content">
                                <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                                    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                </svg>
                                Deleting...
                            </span>
                        ) : "Delete"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default DeleteAddressDialog;
