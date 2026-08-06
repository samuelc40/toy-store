import React from "react";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading,
  isDanger,
}) {
  if (!isOpen) return null;

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
          maxWidth: "460px",
          background: "var(--card-bg)",
          borderRadius: "22px",
          padding: "32px",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--border-color)",
          animation: "scaleIn .25s ease",
          boxSizing: "border-box"
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            margin: "0 auto 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isDanger ? "var(--error-bg)" : "var(--accent-bg)",
          }}
        >
          {isDanger ? (
            <Trash2 size={34} color="var(--error-color)" />
          ) : (
            <ShieldAlert size={34} color="var(--accent-color)" />
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "24px",
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p
          style={{
            marginTop: "16px",
            marginBottom: "30px",
            textAlign: "center",
            fontSize: "15px",
            color: "var(--text-secondary)",
            lineHeight: "1.7",
          }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "14px",
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "15px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: ".25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--border-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            {cancelText || "Cancel"}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: isDanger ? "var(--error-color)" : "var(--accent-color)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: ".25s",
              boxShadow: isDanger
                ? "0 10px 20px rgba(239,68,68,.15)"
                : "0 10px 20px rgba(139,92,246,.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isLoading
              ? "Processing..."
              : confirmText || "Confirm"}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn{
          from{opacity:0;}
          to{opacity:1;}
        }

        @keyframes scaleIn{
          from{
            opacity:0;
            transform:scale(.92);
          }
          to{
            opacity:1;
            transform:scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default ConfirmationDialog;