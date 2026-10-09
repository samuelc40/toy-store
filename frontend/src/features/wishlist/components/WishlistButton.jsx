import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { toast } from "react-toastify";
import {
  addToWishlistAsync,
  removeFromWishlistAsync,
  selectWishlistItems,
} from "../redux/wishlistSlice";
import { selectIsAuthenticated } from "../../auth/authSlice";

/**
 * Reusable Wishlist Heart Toggle Button.
 * Syncs visually with Redux wishlist state.
 * Handles auth redirects and event isolation (prevents parent link navigation).
 */
export function WishlistButton({
  productId,
  productName,
  className = "",
  size = 20,
  showText = false,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wishlistItems = useSelector(selectWishlistItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animatePop, setAnimatePop] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Compute active wishlist status strictly from Redux state
  const isWishlisted = wishlistItems.some(
    (item) => item.product?.id === productId || item.product === productId,
  );

  const labelName = productName ? `"${productName}"` : "product";

  const triggerFloatingHearts = () => {
    const hearts = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      dx: `${Math.floor(Math.random() * 240) - 120}px`,
      size: `${Math.floor(Math.random() * 14) + 16}px`,
      delay: `${i * 65}ms`,
    }));
    setFloatingHearts(hearts);
    setTimeout(() => setFloatingHearts([]), 3500);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    // Redirect unauthenticated guests to login
    if (!isAuthenticated) {
      toast.warning("Please log in to manage your wishlist.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setIsSubmitting(true);
    setAnimatePop(true);
    setTimeout(() => setAnimatePop(false), 600);

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlistAsync(productId)).unwrap();
        toast.info(`Removed ${labelName} from your wishlist.`);
      } else {
        triggerFloatingHearts();
        await dispatch(addToWishlistAsync(productId)).unwrap();
        toast.success(`Added ${labelName} to your wishlist!`);
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Wishlist update failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="heart-button-wrapper" style={{ position: "absolute", right: "8px", top: "8px", zIndex: 15 }}>
      <button
        type="button"
        onClick={handleWishlistToggle}
        disabled={isSubmitting}
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? `Remove ${labelName} from wishlist`
            : `Add ${labelName} to wishlist`
        }
        className={`heart ${isWishlisted ? "on" : ""} ${animatePop ? "pop" : ""} ${className}`}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 21s-7.5-4.7-9.6-9.3C.9 8.3 2.8 4.5 6.5 4.5c2 0 3.9 1.1 5.5 3 1.6-1.9 3.5-3 5.5-3 3.7 0 5.6 3.8 4.1 7.2C19.5 16.3 12 21 12 21z" />
        </svg>
        {showText && (
          <span className="wishlist-btn-text-lbl">
            {isWishlisted ? "Saved" : "Wishlist"}
          </span>
        )}
      </button>
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="fh"
          style={{
            "--dx": h.dx,
            fontSize: h.size,
            animationDelay: h.delay,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export default WishlistButton;
