import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, MapPin, Compass, Map, Flag, Hash, Globe, Bookmark, AlertCircle } from "lucide-react";
// import "./AddressForm.css";
import "./AddressForm.css";


const addressSchema = yup.object({
    address_line1: yup.string().required("Address Line 1 is required"),
    address_line2: yup.string().nullable().transform((v) => v || ""),
    landmark: yup.string().nullable().transform((v) => v || ""),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    postal_code: yup.string().required("Postal Code is required"),
    country: yup.string().required("Country is required"),
    address_type: yup.string().oneOf(["HOME", "OFFICE", "OTHER"]).required("Address Type is required"),
    is_default: yup.boolean(),
});

function AddressForm({ isOpen, onClose, onSubmit, address, isLoading }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(addressSchema),
        defaultValues: {
            address_line1: "",
            address_line2: "",
            landmark: "",
            city: "",
            state: "",
            postal_code: "",
            country: "India",
            address_type: "HOME",
            is_default: false,
        },
    });

    useEffect(() => {
        if (address) {
            reset({
                address_line1: address.address_line1 || "",
                address_line2: address.address_line2 || "",
                landmark: address.landmark || "",
                city: address.city || "",
                state: address.state || "",
                postal_code: address.postal_code || "",
                country: address.country || "India",
                address_type: address.address_type || "HOME",
                is_default: address.is_default || false,
            });
        } else {
            reset({
                address_line1: "",
                address_line2: "",
                landmark: "",
                city: "",
                state: "",
                postal_code: "",
                country: "India",
                address_type: "HOME",
                is_default: false,
            });
        }
    }, [address, reset, isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-backdrop">
            <div className="address-modal-card">
                <div className="modal-header">
                    <h3 className="modal-title">{address ? "Edit Address" : "Add New Address"}</h3>
                    <button type="button" className="close-modal-btn" onClick={onClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="address-form-layout">
                    <div className="form-grid">
                        <div className="form-group span-2">
                            <label htmlFor="address_type">Address Type</label>
                            <div className="input-icon-wrapper">
                                <Bookmark className="input-icon" size={18} />
                                <select
                                    id="address_type"
                                    {...register("address_type")}
                                    className="modal-select"
                                >
                                    <option value="HOME">🏠 Home</option>
                                    <option value="OFFICE">🏢 Office</option>
                                    <option value="OTHER">📍 Other</option>
                                </select>
                            </div>
                            {errors.address_type && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.address_type.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group span-2">
                            <label htmlFor="address_line1">Address Line 1</label>
                            <div className="input-icon-wrapper">
                                <MapPin className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    id="address_line1"
                                    placeholder="123 Playtime Lane" 
                                    {...register("address_line1")} 
                                />
                            </div>
                            {errors.address_line1 && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.address_line1.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group span-2">
                            <label htmlFor="address_line2">Address Line 2 (Optional)</label>
                            <div className="input-icon-wrapper">
                                <MapPin className="input-icon" size={18} style={{ opacity: 0.6 }} />
                                <input 
                                    type="text" 
                                    id="address_line2"
                                    placeholder="Suite 400" 
                                    {...register("address_line2")} 
                                />
                            </div>
                        </div>

                        <div className="form-group span-2">
                            <label htmlFor="landmark">Landmark (Optional)</label>
                            <div className="input-icon-wrapper">
                                <Compass className="input-icon" size={18} style={{ opacity: 0.6 }} />
                                <input 
                                    type="text" 
                                    id="landmark"
                                    placeholder="Near central park" 
                                    {...register("landmark")} 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <div className="input-icon-wrapper">
                                <Map className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    id="city"
                                    placeholder="Brick City" 
                                    {...register("city")} 
                                />
                            </div>
                            {errors.city && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.city.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <div className="input-icon-wrapper">
                                <Flag className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    id="state"
                                    placeholder="CA" 
                                    {...register("state")} 
                                />
                            </div>
                            {errors.state && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.state.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="postal_code">Postal Code</label>
                            <div className="input-icon-wrapper">
                                <Hash className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    id="postal_code"
                                    placeholder="90210" 
                                    {...register("postal_code")} 
                                />
                            </div>
                            {errors.postal_code && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.postal_code.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <div className="input-icon-wrapper">
                                <Globe className="input-icon" size={18} />
                                <input 
                                    type="text" 
                                    id="country"
                                    placeholder="India" 
                                    {...register("country")} 
                                />
                            </div>
                            {errors.country && (
                                <span className="error-text">
                                    <AlertCircle size={12} />
                                    {errors.country.message}
                                </span>
                            )}
                        </div>

                        <div className="form-group span-2 checkbox-group">
                            <label className="checkbox-label" htmlFor="is_default">
                                <input 
                                    type="checkbox" 
                                    id="is_default"
                                    {...register("is_default")} 
                                />
                                <div className="checkbox-custom-box">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span>Set as default shipping address</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions-row">
                        <button 
                            type="button" 
                            className="modal-cancel-btn" 
                            onClick={onClose} 
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="modal-submit-btn" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-loading-content">
                                    <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : "Save Address"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default AddressForm;
