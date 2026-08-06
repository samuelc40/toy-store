import React from "react";

function ProfileSkeleton() {
    return (
        <div className="profile-dashboard-layout skeleton-active">
            {/* Sidebar Skeleton */}
            <div className="profile-sidebar skeleton-pulse">
                <div className="sidebar-user-header">
                    <div className="sidebar-avatar skeleton-avatar"></div>
                    <div className="skeleton-text" style={{ width: "100px", height: "14px", margin: 0 }}></div>
                </div>
                <div className="sidebar-menu-list">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton-text" style={{ height: "40px", borderRadius: "50px", marginBottom: "8px" }}></div>
                    ))}
                </div>
            </div>

            {/* Main Area Skeleton */}
            <div className="profile-main-content">
                {/* Banner Skeleton */}
                <div className="profile-banner-card skeleton-pulse" style={{ backgroundColor: "#ecebf1" }}></div>

                {/* Details Grid Skeleton */}
                <div className="profile-details-grid">
                    {/* Personal Info Card Skeleton */}
                    <div className="personal-details-card skeleton-pulse">
                        <div className="skeleton-text" style={{ width: "140px", height: "20px", marginBottom: "28px" }}></div>
                        <div className="details-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="details-field">
                                    <div className="skeleton-text" style={{ width: "80px", height: "10px", marginBottom: "6px" }}></div>
                                    <div className="skeleton-text" style={{ width: "120px", height: "14px" }}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Stack Skeleton */}
                    <div className="stats-cards-stack">
                        <div className="stat-card-item skeleton-pulse" style={{ backgroundColor: "#ecebf1" }}></div>
                        <div className="stat-card-item skeleton-pulse" style={{ backgroundColor: "#ecebf1" }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileSkeleton;
