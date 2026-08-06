import React from "react";

function ProfileCard({ user, onManageAddressClick }) {
    const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Alex Antony";
    const email = user?.email || "";
    const phone = user?.phone || "Phone number not added";

    const addresses = user?.addresses || [];
    const defaultAddressObj = addresses.find((addr) => addr.is_default) || addresses[0];
    const defaultAddressText = defaultAddressObj
        ? `${defaultAddressObj.address_line1}${
              defaultAddressObj.address_line2 ? ", " + defaultAddressObj.address_line2 : ""
          }${defaultAddressObj.landmark ? ", " + defaultAddressObj.landmark : ""}, ${
              defaultAddressObj.city
          }, ${defaultAddressObj.state} ${defaultAddressObj.postal_code}`
        : "No default address added";

    return (
        <div className="personal-details-card">
            <h3 className="details-section-title">Personal details</h3>
            <div className="details-grid">
                <div className="details-field">
                    <span className="details-label">Full Name</span>
                    <span className="details-value">{fullName}</span>
                </div>
                <div className="details-field">
                    <span className="details-label">Email Address</span>
                    <span className="details-value">{email}</span>
                </div>
                <div className="details-field">
                    <span className="details-label">Phone Number</span>
                    <span className="details-value">{phone}</span>
                </div>
                <div className="details-field">
                    <span className="details-label">Default Address</span>
                    <span className="details-value">{defaultAddressText}</span>
                    {addresses.length > 0 && (
                        <button
                            type="button"
                            className="manage-address-link"
                            onClick={onManageAddressClick}
                        >
                            View and Manage Address &rarr;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;
