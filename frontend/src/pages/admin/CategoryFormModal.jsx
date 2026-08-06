import React, { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Upload, Loader } from "lucide-react";

function CategoryFormModal({ isOpen, onClose, onSave, category, isSaving, serverErrors = {} }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [nameError, setNameError] = useState("");
  const [imageError, setImageError] = useState("");

  const fileInputRef = useRef(null);

  // Initialize form when category changes (Add vs Edit mode)
  useEffect(() => {
    if (isOpen) {
      setNameError("");
      setImageError("");
      if (category) {
        setName(category.name || "");
        setDescription(category.description || "");
        setImageFile(null);
        
        // Handle existing image URL for preview
        if (category.image) {
          const pic = category.image;
          if (pic.startsWith('http://') || pic.startsWith('https://')) {
            setImagePreview(pic);
          } else {
            const backendUrl = import.meta.env.VITE_API_BASE_URL 
              ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
              : 'http://localhost:8000';
            setImagePreview(`${backendUrl}${pic.startsWith('/') ? '' : '/'}${pic}`);
          }
        } else {
          setImagePreview("");
        }
      } else {
        setName("");
        setDescription("");
        setImageFile(null);
        setImagePreview("");
      }
    }
  }, [category, isOpen]);

  // Sync API validation errors from backend
  useEffect(() => {
    if (serverErrors) {
      if (serverErrors.name) {
        const msg = Array.isArray(serverErrors.name) ? serverErrors.name[0] : serverErrors.name;
        setNameError(msg);
      }
      if (serverErrors.image) {
        const msg = Array.isArray(serverErrors.image) ? serverErrors.image[0] : serverErrors.image;
        setImageError(msg);
      }
    }
  }, [serverErrors]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    setNameError("");
    setImageError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Category name is required.");
      valid = false;
    } else if (trimmedName.length < 2) {
      setNameError("Category name must be at least 2 characters.");
      valid = false;
    } else if (trimmedName.length > 255) {
      setNameError("Category name cannot exceed 255 characters.");
      valid = false;
    } else if (!/^[A-Za-z0-9 &'()-]+$/.test(trimmedName)) {
      setNameError("Category name contains invalid characters.");
      valid = false;
    }

    // Image required on creation mode
    if (!category && !imageFile && !imagePreview) {
      setImageError("Category image is required.");
      valid = false;
    }

    if (imageFile) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
        setImageError("Only JPG, PNG and WebP images are allowed.");
        valid = false;
      } else if (imageFile.size > 5 * 1024 * 1024) {
        setImageError("Image size cannot exceed 5 MB.");
        valid = false;
      }
    }

    if (!valid) return;

    // Package into FormData for file transmission support
    const formData = new FormData();
    formData.append("name", trimmedName);
    if (description) {
      formData.append("description", description.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8, 6, 13, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        animation: "fadeIn .25s ease",
        padding: "16px",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "calc(100% - 32px)",
          maxWidth: "500px",
          background: "var(--card-bg)",
          borderRadius: "22px",
          padding: "32px",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--border-color)",
          animation: "scaleIn .25s ease",
          position: "relative",
          boxSizing: "border-box"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2
          style={{
            margin: "0 0 24px 0",
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Category Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
              Category Name *
            </label>
            <input
              type="text"
              value={name}
              disabled={isSaving}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setNameError("");
              }}
              placeholder="e.g. Action Figures, RC Beasts"
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: nameError ? "1.5px solid var(--error-color)" : "1.5px solid var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "14.5px",
                outline: "none",
                transition: "all 0.2s",
                boxSizing: "border-box",
                width: "100%"
              }}
              onFocus={(e) => {
                if (!nameError) {
                  e.target.style.borderColor = "var(--accent-color)";
                  e.target.style.backgroundColor = "var(--card-bg)";
                }
              }}
              onBlur={(e) => {
                if (!nameError) {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.backgroundColor = "var(--bg-secondary)";
                }
              }}
            />
            {nameError && (
              <span style={{ fontSize: "12px", color: "var(--error-color)", fontWeight: "600" }}>
                {nameError}
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              value={description}
              disabled={isSaving}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of the category..."
              rows={3}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1.5px solid var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "14.5px",
                outline: "none",
                transition: "all 0.2s",
                resize: "vertical",
                boxSizing: "border-box",
                width: "100%",
                fontFamily: "inherit"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent-color)";
                e.target.style.backgroundColor = "var(--card-bg)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-color)";
                e.target.style.backgroundColor = "var(--bg-secondary)";
              }}
            />
          </div>

          {/* Image Upload & Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
              Category Image {!category && "*"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Preview Box */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  border: imageError ? "2px dashed var(--error-color)" : "2px dashed var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  backgroundColor: "var(--bg-secondary)",
                  flexShrink: 0
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <ImageIcon size={24} style={{ color: "var(--text-secondary)" }} />
                )}
              </div>

              {/* Upload Action */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  disabled={isSaving}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--border-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                >
                  <Upload size={14} />
                  Choose File
                </button>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                  PNG, JPG, or WEBP (Max 5 MB).
                </span>
              </div>
            </div>
            {imageError && (
              <span style={{ fontSize: "12px", color: "var(--error-color)", fontWeight: "600" }}>
                {imageError}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              marginTop: "12px"
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontWeight: 600,
                fontSize: "15px",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: ".25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--border-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "var(--accent-color)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: ".25s",
                boxShadow: "0 10px 20px rgba(139,92,246,.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="spinner" style={{ animation: "spin 1s linear infinite" }} />
                  Saving...
                </>
              ) : category ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Spinner Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CategoryFormModal;
