import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import StarRating from "./StarRating";

export function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
  variantName = "Variant",
}) {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 5);
      setComment(initialData.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setError("");
    onSubmit({ rating, comment: comment.trim() });
  };

  const isEdit = Boolean(initialData?.id);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8, 6, 13, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--card-bg, #ffffff)",
          width: "100%",
          maxWidth: "500px",
          borderRadius: "20px",
          padding: "28px",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
          border: "1px solid var(--border, #e2e8f0)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "none",
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            color: "var(--text-muted, #94a3b8)",
            padding: "4px",
          }}
        >
          <X size={20} />
        </button>

        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            margin: "0 0 4px 0",
            color: "var(--text, #1e293b)",
          }}
        >
          {isEdit ? "Edit Your Review" : "Write a Review"}
        </h3>
        <p
          style={{
            fontSize: "13.5px",
            color: "var(--text-muted, #64748b)",
            margin: "0 0 20px 0",
          }}
        >
          Sharing feedback for <strong>{variantName}</strong>
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star selection */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "var(--text, #1e293b)",
              }}
            >
              Your Rating <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <StarRating
                rating={rating}
                interactive
                onChange={(val) => setRating(val)}
                disabled={isSubmitting}
                size={28}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#f59e0b",
                }}
              >
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Optional Comment */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text, #1e293b)",
                }}
              >
                Your Review{" "}
                <span
                  style={{
                    fontWeight: "400",
                    color: "var(--text-muted, #94a3b8)",
                  }}
                >
                  (Optional)
                </span>
              </label>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted, #94a3b8)",
                }}
              >
                {comment.length}/1000
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="What did you like or dislike about this toy? Is the quality good?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border, #cbd5e1)",
                background: "var(--input-bg, #ffffff)",
                color: "var(--text, #1e293b)",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid var(--border, #cbd5e1)",
                background: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text, #1e293b)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-copy-ref-link"
              style={{
                padding: "10px 22px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {isSubmitting && <Loader size={16} className="spin" />}
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : isEdit
                    ? "Update Review"
                    : "Submit Review"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
