import React, { useState } from "react";
import { Star } from "lucide-react";

/**
 * Reusable StarRating Component.
 * Supports Display Mode (read-only rating value) and Interactive Mode (1-5 clickable stars with keyboard support).
 */
export function StarRating({
  rating = 0,
  maxStars = 5,
  size = 18,
  interactive = false,
  onChange,
  disabled = false,
  className = "",
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  const handleClick = (value) => {
    if (interactive && !disabled && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e, value) => {
    if (
      interactive &&
      !disabled &&
      onChange &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      onChange(value);
    }
  };

  return (
    <div
      className={`star-rating-container ${interactive ? "is-interactive" : ""} ${className}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      role={interactive ? "radiogroup" : "img"}
      aria-label={
        interactive
          ? "Select star rating"
          : `Rating: ${rating} out of ${maxStars} stars`
      }
    >
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeRating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              disabled={disabled}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              style={{
                background: "none",
                border: "none",
                padding: "2px",
                cursor: disabled ? "not-allowed" : "pointer",
                color: isFilled ? "#f59e0b" : "var(--border, #cbd5e1)",
                transition: "transform 0.15s ease, color 0.15s ease",
                transform:
                  hoverRating === starValue ? "scale(1.2)" : "scale(1)",
              }}
            >
              <Star size={size} fill={isFilled ? "#f59e0b" : "none"} />
            </button>
          );
        }

        return (
          <span
            key={starValue}
            style={{
              color: isFilled ? "#f59e0b" : "var(--border, #cbd5e1)",
              display: "inline-flex",
            }}
          >
            <Star size={size} fill={isFilled ? "#f59e0b" : "none"} />
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
