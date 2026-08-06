import React from "react";
import { Pencil } from "lucide-react";
import profileBanner from "../../assets/profile_banner.png";

function ProfileHeader({ user, onEditClick }) {
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Alex Antony";

    return (
        <div 
            className="profile-banner-card"
            style={{ backgroundImage: `url(${profileBanner})` }}
        >
            <div className="profile-banner-overlay">
                <h1 className="profile-banner-title">{fullName}</h1>
                <button type="button" className="edit-profile-btn" onClick={onEditClick}>
                    <Pencil size={15} />
                    <span>Edit Profile</span>
                </button>
            </div>
        </div>
    );
}

export default ProfileHeader;
