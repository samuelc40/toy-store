import React, { useState, useEffect } from "react";

const DefaultAvatarSvg = () => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ 
            width: "100%", 
            height: "100%", 
            color: "#a09cb0", 
            backgroundColor: "#f2f1f5", 
            display: "block" 
        }}
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

function Avatar({ image, user, alt, className }) {
    const [hasError, setHasError] = useState(false);
    console.log(user);
    console.log("profile_image:", user?.profile_image);
    console.log("google_profile_picture:", user?.google_profile_picture);

    // Resolve the active source using Priority: Uploaded Profile Image -> Google Profile Image
    let imageSrc = null;
    if (image) {
        imageSrc = image;
    } else if (user) {
        imageSrc = user.profile_image || user.google_profile_picture;
    }

    // Reset error state whenever the source path changes
    useEffect(() => {
        setHasError(false);
    }, [imageSrc]);

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL 
            ? new URL(import.meta.env.VITE_API_BASE_URL).origin 
            : "http://localhost:8000";
        return `${baseUrl}${url}`;
    };

    const resolvedUrl = getFullImageUrl(imageSrc);

    if (!resolvedUrl || hasError) {
        return (
            <div 
                className={`default-avatar-container ${className || ""}`} 
                style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    overflow: "hidden", 
                    borderRadius: "50%" 
                }}
            >
                <DefaultAvatarSvg />
            </div>
        );
    }

    return (
        <img
            src={resolvedUrl}
            alt={alt || "User Avatar"}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}

export default Avatar;
