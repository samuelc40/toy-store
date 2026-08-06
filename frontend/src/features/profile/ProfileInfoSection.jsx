import React from "react";

function ProfileInfoSection({ label, value, isBadge = false, badgeType = "success" }) {
    return (
        <div className="profile-info-field">
            <span className="info-field-label">{label}</span>
            {isBadge ? (
                <span className={`info-field-badge badge-${badgeType}`}>{value}</span>
            ) : (
                <span className="info-field-value">{value}</span>
            )}
        </div>
    );
}

export default ProfileInfoSection;
