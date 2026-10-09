import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Tag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCartAsync } from "../../cart/redux/cartSlice";
import { selectIsAuthenticated } from "../../auth/authSlice";
import ProductImage from "./ProductImage";
import WishlistButton from "../../wishlist/components/WishlistButton";

/**
 * Premium OFFO-styled Cute Product Card.
 * Features stage gradient, floating orbs, twinkling sparks, white framed media,
 * 24-point starburst discount sticker, squiggly title underline, scattering hearts,
 * and mobile-responsive layouts.
 */
export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [bubbleText, setBubbleText] = useState("");

  const totalStock =
    product.total_stock !== undefined && product.total_stock !== null
      ? Number(product.total_stock)
      : null;
  const isOutOfStock =
    product.is_in_stock === false || (totalStock !== null && totalStock <= 0);

  const lowest = Number(product.lowest_price || 0);
  const original = Number(product.original_price || 0);
  const isDiscounted =
    (product.has_offer || (original > 0 && lowest < original)) && original > lowest;
  const savingsAmount = isDiscounted ? original - lowest : 0;
  const discountPct = product.discount_percentage
    ? Number(product.discount_percentage)
    : isDiscounted && original > 0
      ? Math.round((savingsAmount / original) * 100)
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!product.default_variant_id) {
      toast.error("This product doesn't have any purchasable variants.");
      return;
    }

    dispatch(
      addToCartAsync({ variantId: product.default_variant_id, quantity: 1 }),
    )
      .unwrap()
      .then(() => {
        setBubbleText("Added! 🎉");
        setTimeout(() => setBubbleText(""), 1150);
      })
      .catch((err) => {
        toast.error(err || "Failed to add item to cart.");
      });
  };

  const avgRating = Number(product.average_rating || 0);
  const totalReviews = Number(product.total_reviews || 0);

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <Link
      to={`/products/${product.id}${product.default_variant_id ? `?variant=${product.default_variant_id}` : ""}`}
      className="cust-product-card-link-wrapper"
    >
      <article className={`card ${isOutOfStock ? "is-out-of-stock" : ""}`} data-product={product.id}>
        {/* Stage Area with Orbs & Sparks */}
        <div className="stage">
          <div className="stage-bg">
            <span className="orb o1"></span>
            <span className="orb o2"></span>
            <span className="spark a1">✦</span>
            <span className="spark a2">★</span>
            <span className="spark a3">♥</span>
            <span className="spark a4">✦</span>
          </div>

          {/* White Framed Product Media */}
          <div className="frame">
            <ProductImage product={product} />

            {/* Wishlist Heart Button with Scattering Hearts */}
            <WishlistButton productId={product.id} productName={product.name} />
          </div>

          {/* 24-Point Starburst Discount Sticker */}
          {isDiscounted && discountPct > 0 && (
            <div className="sticker" aria-label={`${discountPct} percent off`}>
              <svg viewBox="0 0 80 80">
                <polygon
                  points="78.0,40.0 72.4,46.4 75.1,54.5 67.4,58.3 66.9,66.9 58.3,67.4 54.5,75.1 46.4,72.4 40.0,78.0 33.6,72.4 25.5,75.1 21.7,67.4 13.1,66.9 12.6,58.3 4.9,54.5 7.6,46.4 2.0,40.0 7.6,33.6 4.9,25.5 12.6,21.7 13.1,13.1 21.7,12.6 25.5,4.9 33.6,7.6 40.0,2.0 46.4,7.6 54.5,4.9 58.3,12.6 66.9,13.1 67.4,21.7 75.1,25.5 72.4,33.6"
                  fill="#ffd23f"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="27"
                  fill="none"
                  stroke="#f2a900"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x="40"
                  y="40"
                  textAnchor="middle"
                  fontFamily="Fredoka, sans-serif"
                  fontWeight="700"
                  fontSize="19"
                  fill="#4a2c00"
                >
                  {discountPct}%
                </text>
                <text
                  x="40"
                  y="54"
                  textAnchor="middle"
                  fontFamily="Fredoka, sans-serif"
                  fontWeight="700"
                  fontSize="11"
                  fill="#4a2c00"
                >
                  OFF
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Info & Buy Section */}
        <div className="info">
          <div className="meta">
            <span className="chip">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" fill="#fff" stroke="#e3d6ff" />
                <path
                  d="M12 12m-1.5 0a1.5 1.5 0 1 1 3 0a3 3 0 1 1-6 0a4.5 4.5 0 1 1 9 0"
                  fill="none"
                  stroke="#ff5fa2"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <span>{product.category || "Toy"}</span>
            </span>

            <span className="rating">
              <Star size={14} fill="#ffb400" color="#ffb400" />
              <span>{avgRating > 0 ? avgRating.toFixed(1) : "5.0"}</span>
              <small>({totalReviews > 0 ? totalReviews : 1})</small>
            </span>
          </div>

          <h3 className="name" title={product.name}>
            <span>{product.name}</span>
            <svg className="squiggle" viewBox="0 0 78 14">
              <defs>
                <linearGradient id={`sq-${product.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ff5fa2" />
                  <stop offset="1" stopColor="#7c5cff" />
                </linearGradient>
              </defs>
              <path
                d="M3 7 Q9.5 -1 16 7 T29 7 T42 7 T55 7 T68 7 L75 7"
                fill="none"
                stroke={`url(#sq-${product.id})`}
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            </svg>
          </h3>

          <div className="buy">
            <div>
              <div className="price">
                <span className="now">{formatPrice(lowest)}</span>
                {isDiscounted && original > 0 && (
                  <span className="old">{formatPrice(original)}</span>
                )}
              </div>

              {isDiscounted && savingsAmount > 0 && (
                <span className="save">
                  <Tag size={13} fill="currentColor" />
                  Save {formatPrice(savingsAmount)}
                </span>
              )}
            </div>

            <div className="cta">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="add"
                title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
              >
                <ShoppingCart size={20} />
                <span>{isOutOfStock ? "Sold Out" : "Add"}</span>
              </button>

              {bubbleText && <span className="bubble">{bubbleText}</span>}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
