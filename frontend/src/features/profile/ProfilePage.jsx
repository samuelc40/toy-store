import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser, logout as localLogout } from "../auth/authSlice";
import { logout as apiLogout } from "../auth/services/authService";
import { getProfile, updateProfile } from "./profileService";
import { 
    getAddresses, 
    createAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
} from "./addressService";
import Avatar from "../../components/common/Avatar";
import AddressCard from "./AddressCard";
import AddressForm from "./AddressForm";
import DeleteAddressDialog from "./DeleteAddressDialog";
import ChangePasswordModal from "./ChangePasswordModal";
import ProfileSkeleton from "./ProfileSkeleton";
import OrdersPage from "../orders/pages/OrdersPage";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { 
    User, 
    Package, 
    Heart, 
    Wallet, 
    Settings, 
    HelpCircle, 
    LogOut,
    Plus,
    RefreshCw,
    AlertTriangle,
    Camera
} from "lucide-react";
import "./ProfilePage.css";

const profileFormSchema = yup.object({
    first_name: yup.string().required("First name is required").trim().max(150),
    last_name: yup.string().required("Last name is required").trim().max(150),
    phone: yup
        .string()
        .nullable()
        .transform((v) => v || "")
        .test("len", "Phone number must be exactly 10 digits", (val) => !val || (val.isdigit ? val : val.replace(/\D/g, "")).length === 10),
});

function ProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectUser);
    const fileInputRef = useRef(null);

    // Page State
    const [isLoading, setIsLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");

    // Avatar Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Modal State
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profileFormSchema),
    });

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profileRes = await getProfile();
            if (profileRes?.success && profileRes?.data) {
                dispatch(setUser(profileRes.data));
                reset({
                    first_name: profileRes.data.first_name || "",
                    last_name: profileRes.data.last_name || "",
                    phone: profileRes.data.phone || "",
                });
            }
            const addressRes = await getAddresses();
            if (addressRes?.success && addressRes?.data) {
                setAddresses(addressRes.data);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Could not retrieve profile information.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Form Submissions (Personal Info)
    const onProfileSubmit = async (data) => {
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("phone", data.phone);

            if (selectedFile) {
                formData.append("profile_image", selectedFile);
            }

            const response = await updateProfile(formData);
            if (response.success && response.data) {
                dispatch(setUser(response.data));
                setSelectedFile(null);
                setAvatarPreview(null);
                setIsEditMode(false);
                toast.success("Profile updated successfully.");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            const response = err.response?.data;
            const getFieldMsg = (val) => Array.isArray(val) ? val[0] : val;
            toast.error(response?.message || getFieldMsg(response?.phone) || "Failed to update profile.");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Avatar handlers
    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCancelAvatar = () => {
        setSelectedFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile) return;
        setIsActionLoading(true);
        try {
            const formData = new FormData();
            formData.append("profile_image", selectedFile);
            
            const response = await updateProfile(formData);
            if (response.success && response.data) {
                dispatch(setUser(response.data));
                setSelectedFile(null);
                setAvatarPreview(null);
                toast.success("Profile picture updated successfully.");
            }
        } catch (err) {
            console.error("Avatar upload error:", err);
            toast.error("Failed to upload profile picture.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStartEdit = () => {
        reset({
            first_name: currentUser?.first_name || "",
            last_name: currentUser?.last_name || "",
            phone: currentUser?.phone || "",
        });
        setIsEditMode(true);
    };

    // Address list actions
    const handleAddressSubmit = async (formData) => {
        setIsActionLoading(true);
        try {
            if (selectedAddress) {
                await updateAddress(selectedAddress.id, formData);
                toast.success("Address updated successfully.");
            } else {
                await createAddress(formData);
                toast.success("Address added successfully.");
            }
            // Reload addresses
            const res = await getAddresses();
            if (res.success && res.data) {
                setAddresses(res.data);
            }
            setIsAddressFormOpen(false);
            setSelectedAddress(null);
        } catch (err) {
            console.error("Address operation error:", err);
            toast.error("Failed to save address details.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
            toast.success("Default address updated.");
            const res = await getAddresses();
            if (res.success && res.data) {
                setAddresses(res.data);
            }
        } catch (err) {
            console.error("Set default address error:", err);
            toast.error("Failed to update default address.");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!addressToDelete) return;
        setIsActionLoading(true);
        try {
            await deleteAddress(addressToDelete.id);
            toast.success("Address deleted successfully.");
            const res = await getAddresses();
            if (res.success && res.data) {
                setAddresses(res.data);
            }
            setIsDeleteOpen(false);
            setAddressToDelete(null);
        } catch (err) {
            console.error("Delete address error:", err);
            toast.error("Failed to delete address.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            dispatch(localLogout());
            navigate("/login");
        }
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="profile-error-container">
                <div className="profile-error-card">
                    <AlertTriangle className="error-icon" size={48} />
                    <h2>Something Went Wrong</h2>
                    <p>{error}</p>
                    <button type="button" className="retry-btn" onClick={loadData}>
                        <RefreshCw size={16} />
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        );
    }

    const fullName = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "Alex Miller";

    const sidebarItems = [
        { id: "profile", label: "Profile", icon: <User size={18} /> },
        { id: "orders", label: "Orders", icon: <Package size={18} /> },
        { id: "wishlist", label: "Wishlist", icon: <Heart size={18} /> },
        { id: "wallet", label: "My Wallet", icon: <Wallet size={18} /> },
        { id: "settings", label: "Settings", icon: <Settings size={18} /> },
    ];

    const sortedAddresses = [...addresses].sort(
        (a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <>
                        {/* Personal Information card block */}
                        <div className="personal-details-card">
                            <div className="details-card-header">
                                <div>
                                    <h2 className="details-card-title">
                                        Personal Information
                                    </h2>
                                    <p className="details-card-subtitle">
                                        Manage your account details and security settings.
                                    </p>
                                </div>
                                {currentUser?.is_verified && (
                                    <span className="verified-badge">Verified Account</span>
                                )}
                            </div>

                            {!isEditMode ? (
                                /* View Profile Details Grid */
                                <div>
                                    <div className="profile-info-grid">
                                        <div className="profile-info-field">
                                            <span className="profile-info-field-label">First Name</span>
                                            <p className="profile-info-field-value">{currentUser?.first_name || '-'}</p>
                                        </div>
                                        <div className="profile-info-field">
                                            <span className="profile-info-field-label">Last Name</span>
                                            <p className="profile-info-field-value">{currentUser?.last_name || '-'}</p>
                                        </div>
                                        <div className="profile-info-field span-2">
                                            <span className="profile-info-field-label">Email Address</span>
                                            <div className="profile-info-email-row">
                                                <p className="profile-info-email-value">{currentUser?.email || '-'}</p>
                                                <button type="button" className="btn-text-link" onClick={() => navigate("/change-email")}>
                                                    Change Email
                                                </button>
                                            </div>
                                        </div>
                                        <div className="profile-info-field">
                                            <span className="profile-info-field-label">Phone Number</span>
                                            <p className="profile-info-field-value">{currentUser?.phone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="profile-actions-row">
                                        <div style={{'padding':'0 5%'}}>
                                            <button type="button" className="btn-profile-primary" onClick={handleStartEdit}>
                                                Edit Profile
                                            </button>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-profile-secondary" 
                                            onClick={() => setIsChangePasswordOpen(true)}
                                            >
                                                Change Password
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Edit Profile Form */
                                <form onSubmit={handleSubmit(onProfileSubmit)} className="profile-edit-form">
                                    <div className="profile-edit-grid">
                                        <div className="profile-form-field">
                                            <label htmlFor="first_name">First Name</label>
                                            <input type="text" id="first_name" {...register("first_name")} />
                                            {errors.first_name && <span className="error-text-small">{errors.first_name.message}</span>}
                                        </div>
                                        <div className="profile-form-field">
                                            <label htmlFor="last_name">Last Name</label>
                                            <input type="text" id="last_name" {...register("last_name")} />
                                            {errors.last_name && <span className="error-text-small">{errors.last_name.message}</span>}
                                        </div>
                                        <div className="profile-form-field span-2">
                                            <label htmlFor="profile_email">Email Address</label>
                                            <div className="profile-form-email-wrapper">
                                                <input type="text" id="profile_email" disabled value={currentUser?.email || ''} />
                                                <button type="button" className="btn-profile-secondary" onClick={() => navigate("/change-email")}>
                                                    Change Email
                                                </button>
                                            </div>
                                        </div>
                                        <div className="profile-form-field">
                                            <label htmlFor="profile_phone">Phone Number</label>
                                            <input type="text" id="profile_phone" placeholder="10-digit mobile number" {...register("phone")} />
                                            {errors.phone && <span className="error-text-small">{errors.phone.message}</span>}
                                        </div>
                                    </div>
                                    <div className="profile-form-actions">
                                        <button type="button" className="btn-profile-cancel" onClick={() => setIsEditMode(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-profile-save" disabled={isActionLoading}>
                                            {isActionLoading ? (
                                                <span className="btn-loading-content">
                                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Manage Addresses card block */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <div>
                                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)", margin: 0 }}>
                                        Manage Addresses
                                    </h2>
                                    <p style={{ fontSize: "14px", color: "var(--text)", margin: "4px 0 0 0" }}>
                                        Where should we deliver your latest treasure?
                                    </p>
                                </div>
                                <button 
                                    type="button" 
                                    className="add-address-btn-3d"
                                    onClick={() => {
                                        setSelectedAddress(null);
                                        setIsAddressFormOpen(true);
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", "color":"white" }}>
                                        <Plus size={16} /> Add New Address
                                    </span>
                                </button>
                            </div>

                            <div className="addresses-list-grid">
                                {sortedAddresses.map((addr) => (
                                    <AddressCard 
                                        key={addr.id} 
                                        address={addr} 
                                        userName={fullName}
                                        onEdit={(address) => {
                                            setSelectedAddress(address);
                                            setIsAddressFormOpen(true);
                                        }}
                                        onDelete={(address) => {
                                            setAddressToDelete(address);
                                            setIsDeleteOpen(true);
                                        }}
                                        onSetDefault={handleSetDefault}
                                    />
                                ))}

                                {/* Add summer home dashed trigger slot card */}
                                <div 
                                    className="address-dashed-placeholder-card"
                                    onClick={() => {
                                        setSelectedAddress(null);
                                        setIsAddressFormOpen(true);
                                    }}
                                >
                                    <div className="dashed-card-icon-wrapper">
                                        <Plus size={20} />
                                    </div>
                                    <span className="dashed-card-title">Add a summer home or gift recipient</span>
                                    <span className="dashed-card-subtext">Spread the joy to more locations</span>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case "orders":
                return <OrdersPage />;
            case "wishlist":
                navigate("/wishlist");
                return null;
            case "wallet":
                return (
                    <div className="personal-details-card">
                        <div className="details-card-header">
                            <div>
                                <h2 className="details-card-title">My Wallet &amp; Toy Coins</h2>
                                <p className="details-card-subtitle">
                                    Earn coins on every purchase and redeem them during checkout.
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "20px", background: "rgba(255, 214, 21, 0.12)", borderRadius: "16px", border: "1px solid rgba(255, 214, 21, 0.3)", marginTop: "16px" }}>
                            <Wallet size={40} style={{ color: "#d89e00" }} />
                            <div>
                                <span style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted, #64748b)" }}>Available Toy Coins</span>
                                <h1 style={{ fontSize: "36px", fontWeight: 900, color: "var(--text-primary, #0f172a)", margin: "4px 0 0 0" }}>{currentUser?.coins || 0} Coins</h1>
                            </div>
                        </div>
                    </div>
                );
            case "settings":
                return (
                    <div className="tab-page-content-box" style={{ gap: "20px", padding: "48px" }}>
                        <h3 className="card-section-title" style={{ marginBottom: "16px" }}>Account Settings</h3>
                        <p style={{ marginBottom: "24px", maxWidth: "380px" }}>Configure your security details, manage email subscriptions, or update credentials.</p>
                        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                                type="button"
                                className="add-address-btn-3d"
                                onClick={() => navigate("/change-email")}
                            >
                                Change Email Address
                            </button>
                            <button
                                type="button"
                                className="add-address-btn-3d"
                                style={{ backgroundColor: "#ffd615", color: "#2c2a2e", boxShadow: "0 4px 0 #d89e00" }}
                                onClick={() => setIsChangePasswordOpen(true)}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                );
            default:
                const activeLabel = sidebarItems.find(item => item.id === activeTab)?.label || "Content";
                return (
                    <div className="tab-page-content-box">
                        <h3>{activeLabel}</h3>
                        <p>{activeLabel} dashboard content is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="profile-dashboard-layout">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
            />

            {/* Left Sidebar */}
            <aside className="profile-sidebar">
                <div className="sidebar-user-header">
                    <div className="avatar-upload-wrapper" onClick={handleAvatarClick}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="sidebar-avatar-img" />
                        ) : (
                            <Avatar user={currentUser} className="sidebar-avatar-img" />
                        )}
                        <div className="avatar-upload-overlay">
                            <Camera size={14} />
                        </div>
                    </div>
                    <div className="sidebar-user-meta">
                        <span className="sidebar-username">
                            {fullName}
                        </span>
                        <span className="sidebar-user-badge">
                            Gold Collector
                        </span>
                    </div>
                </div>

                {/* Reset or Save Avatar buttons if pending */}
                {avatarPreview && (
                    <div className="avatar-upload-actions-row">
                        <button 
                            type="button" 
                            disabled={isActionLoading}
                            onClick={handleUploadAvatar}
                            className="btn-avatar-save"
                        >
                            {isActionLoading ? "Saving..." : "Save New Photo"}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCancelAvatar}
                            disabled={isActionLoading}
                            className="btn-avatar-cancel"
                        >
                            Cancel Upload
                        </button>
                    </div>
                )}

                <ul className="sidebar-menu-list">
                    {sidebarItems.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={`sidebar-menu-item-btn ${activeTab === item.id ? "active" : ""}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Master Collector XP Card */}
                <div className="sidebar-xp-status-card">
                    <span className="xp-card-badge">STATUS</span>
                    <h4 className="xp-card-title">Master Collector</h4>
                    <p className="xp-card-subtitle">
                        You're only 250 XP away from unlocking the Diamond tier rewards!
                    </p>
                    <div className="xp-progress-track">
                        <div className="xp-progress-bar"></div>
                    </div>
                </div>

                <div className="sidebar-footer-menu">
                    <button type="button" className="sidebar-menu-item-btn">
                        <HelpCircle size={18} />
                        <span>Help Center</span>
                    </button>
                    <button type="button" className="sidebar-menu-item-btn logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Right Main Content Area */}
            <main className="profile-main-content">
                {renderTabContent()}
            </main>

            {/* Overlay modals */}
            <AddressForm 
                isOpen={isAddressFormOpen} 
                onClose={() => {
                    setIsAddressFormOpen(false);
                    setSelectedAddress(null);
                }} 
                onSubmit={handleAddressSubmit} 
                address={selectedAddress} 
                isLoading={isActionLoading}
            />

            <DeleteAddressDialog 
                isOpen={isDeleteOpen} 
                onClose={() => {
                    setIsDeleteOpen(false);
                    setAddressToDelete(null);
                }} 
                onConfirm={handleDeleteConfirm} 
                isLoading={isActionLoading}
            />

            <ChangePasswordModal 
                isOpen={isChangePasswordOpen} 
                onClose={() => setIsChangePasswordOpen(false)} 
            />
        </div>
    );
}

export default ProfilePage;
