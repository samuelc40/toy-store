import React, { useState } from "react";
import { FolderOpen, Edit, Trash2, Calendar } from "lucide-react";
import "./UserTable.css"; // Reuse UserTable CSS rules for uniform layout

const CategoryImage = ({ category, getImageUrl }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = getImageUrl(category);

  if (!url || imgFailed) {
    return (
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "12px",
          backgroundColor: "var(--accent-bg)",
          color: "var(--accent-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow)",
          userSelect: "none",
        }}
        title={category.name}
      >
        <FolderOpen size={20} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={category.name}
      onError={() => setImgFailed(true)}
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "12px",
        objectFit: "cover",
        border: "1.5px solid var(--border-color)",
        boxShadow: "var(--shadow)",
      }}
    />
  );
};

function CategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
  actionLoadingId,
}) {
  const getImageUrl = (category) => {
    if (!category.image) return null;
    const pic = category.image;
    if (pic.startsWith("http://") || pic.startsWith("https://")) {
      return pic;
    }
    const backendUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")
      : "http://localhost:8000";
    return `${backendUrl}${pic.startsWith("/") ? "" : "/"}${pic}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        {/* Desktop Table Skeleton */}
        <div className="user-table-card">
          <table className="user-table-el">
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>NAME</th>
                <th>DESCRIPTION</th>
                <th>CREATED DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "12px",
                      }}
                    />
                  </td>
                  <td>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: "150px",
                        height: "18px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: "250px",
                        height: "16px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: "100px",
                        height: "16px",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>
                    <div
                      className="skeleton-shimmer"
                      style={{
                        width: "80px",
                        height: "24px",
                        borderRadius: "12px",
                      }}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div
                      className="btn-action-group"
                      style={{ justifyContent: "flex-end" }}
                    >
                      <div
                        className="skeleton-shimmer"
                        style={{
                          width: "70px",
                          height: "36px",
                          borderRadius: "10px",
                        }}
                      />
                      <div
                        className="skeleton-shimmer"
                        style={{
                          width: "70px",
                          height: "36px",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Skeleton View */}
        <div className="categories-mobile-list">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-category-card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  className="skeleton-shimmer"
                  style={{ width: "48px", height: "48px", borderRadius: "12px" }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div
                    className="skeleton-shimmer"
                    style={{ width: "60%", height: "16px", borderRadius: "4px" }}
                  />
                  <div
                    className="skeleton-shimmer"
                    style={{ width: "80%", height: "14px", borderRadius: "4px" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Table View (>= 768px) */}
      <div className="user-table-card">
        <table className="user-table-el">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>CATEGORY NAME</th>
              <th>DESCRIPTION</th>
              <th>CREATED DATE</th>
              <th>STATUS</th>
              <th style={{ textAlign: "center" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isProcessing = actionLoadingId === category.id;

              return (
                <tr key={category.id}>
                  <td data-label="IMAGE">
                    <CategoryImage
                      category={category}
                      getImageUrl={getImageUrl}
                    />
                  </td>
                  <td
                    data-label="CATEGORY NAME"
                    style={{ fontWeight: "700", color: "var(--text-primary)" }}
                  >
                    {category.name}
                  </td>
                  <td data-label="DESCRIPTION">
                    <div
                      className="category-description-text"
                      title={category.description || ""}
                    >
                      {category.description || "-"}
                    </div>
                  </td>
                  <td
                    data-label="CREATED DATE"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        justifyContent: "inherit",
                      }}
                    >
                      <Calendar
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <span style={{ fontSize: "13.5px" }}>
                        {formatDate(category.created_at)}
                      </span>
                    </div>
                  </td>
                  <td data-label="STATUS">
                    <span
                      className={`badge-pill ${category.is_active ? "badge-verified" : "badge-blocked"}`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td data-label="ACTIONS" style={{ textAlign: "right" }}>
                    <div
                      className="btn-action-group"
                      style={{ justifyContent: "inherit", gap: "8px" }}
                    >
                      {/* Edit Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onEdit(category)}
                        className="btn-action-user"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          fontWeight: "700",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--border-color)";
                          e.currentTarget.style.transform = "translateY(-0.5px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-secondary)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onDelete(category)}
                        className="btn-action-user btn-delete-action"
                      >
                        {isProcessing ? (
                          <span className="btn-loading-content">
                            <svg
                              className="spinner-icon"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="31.4 31.4"
                                style={{ opacity: 0.2 }}
                              ></circle>
                              <path
                                d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                              ></path>
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards List View (< 768px) */}
      <div className="categories-mobile-list">
        {categories.map((category) => {
          const isProcessing = actionLoadingId === category.id;

          return (
            <div key={category.id} className="admin-category-card">
              <div className="category-card-header">
                <CategoryImage category={category} getImageUrl={getImageUrl} />
                <div className="category-card-title-group">
                  <h4 className="category-card-name">{category.name}</h4>
                  <span
                    className={`badge-pill ${category.is_active ? "badge-verified" : "badge-blocked"}`}
                  >
                    {category.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {category.description && (
                <p className="category-card-desc">{category.description}</p>
              )}

              <div className="category-card-meta">
                <Calendar size={13} style={{ color: "var(--text-secondary)" }} />
                <span>Created {formatDate(category.created_at)}</span>
              </div>

              <div className="category-card-actions">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onEdit(category)}
                  className="btn-category-card-action edit"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => onDelete(category)}
                  className="btn-category-card-action delete"
                >
                  {isProcessing ? (
                    <span className="btn-loading-content">
                      <svg
                        className="spinner-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray="31.4 31.4"
                          style={{ opacity: 0.2 }}
                        />
                        <path
                          d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default CategoryTable;
