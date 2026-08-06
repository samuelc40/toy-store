import React from "react";
import { Home, Building2, HelpCircle, Pencil, Trash2, ArrowRight } from "lucide-react";

function AddressCard({ address, onEdit, onDelete, onSetDefault, userName }) {
    const getIcon = (type) => {
        switch (type?.toUpperCase()) {
            case "HOME":
                return <Home size={18} />;
            case "OFFICE":
                return <Building2 size={18} />;
            default:
                return <HelpCircle size={18} />;
        }
    };

    const getDisplayName = (type) => {
        switch (type?.toUpperCase()) {
            case "HOME":
                return "Home";
            case "OFFICE":
                return "Office";
            default:
                return "Other";
        }
    };

    return (
        <div className={`address-item-card ${address.is_default ? "default-address-card" : ""}`}>
            <div className="address-card-header">
                <div className="address-type-info">
                    <div className="address-type-icon-wrapper">
                        {getIcon(address.address_type)}
                    </div>
                    <div className="address-type-text-group">
                        <span className="address-type-title">{getDisplayName(address.address_type)}</span>
                        {address.is_default && (
                            <span className="default-badge">DEFAULT SHIPPING</span>
                        )}
                    </div>
                </div>
                <div className="address-card-actions">
                    <button 
                        type="button" 
                        className="card-action-btn edit-icon-btn" 
                        onClick={() => onEdit(address)} 
                        title="Edit Address"
                    >
                        <Pencil size={14} />
                    </button>
                    <button 
                        type="button" 
                        className="card-action-btn delete-icon-btn" 
                        onClick={() => onDelete(address)} 
                        title="Delete Address"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
            
            <div className="address-card-body">
                <p className="address-line">{address.address_line1}</p>
                {address.address_line2 && <p className="address-line">{address.address_line2}</p>}
                {address.landmark && <p className="address-landmark-text">Landmark: {address.landmark}</p>}
                <p className="address-city-state">
                    {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="address-recipient">{userName}</p>
            </div>

            {!address.is_default && (
                <div className="address-card-footer">
                    <button 
                        type="button" 
                        className="set-default-action-link" 
                        onClick={() => onSetDefault(address.id)}
                    >
                        <span>Set as Default</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default AddressCard;
