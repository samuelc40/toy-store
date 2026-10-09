import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Eye,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getWishlistAsync,
  removeFromWishlistAsync,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
} from "../redux/wishlistSlice";
import { addToCartAsync } from "../../cart/redux/cartSlice";
import ProductCard from "../../products/components/ProductCard";
import "../styles/Wishlist.css";

/**
 * Premium Wishlist Page component.
 * Features ultra-sleek cards, smooth micro-interactions, responsive dark/light mode themes,
 * direct cart move with auto-wishlist removal, and variant selection redirects.
 */
export function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);

  useEffect(() => {
    dispatch(getWishlistAsync());
  }, [dispatch]);

  const handleRemove = async (productId, productName) => {
    try {
      await dispatch(removeFromWishlistAsync(productId)).unwrap();
      toast.info(`Removed "${productName || "Product"}" from your wishlist.`);
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : "Failed to remove from wishlist.",
      );
    }
  };

  const handleAddToCart = (product) => {
    const isOutOfStock =
      product.is_in_stock === false || (product.total_stock || 0) === 0;
    if (isOutOfStock) return;

    // If product has multiple variants, navigate to detail page to select variant
    if (product.available_variants > 1) {
      toast.info("Please select your preferred edition/variant.");
      navigate(`/products/${product.id}`);
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
        toast.success(`Moved "${product.name}" to your cart!`);
      })
      .catch((err) => {
        toast.error(
          typeof err === "string" ? err : "Failed to add item to cart.",
        );
      });
  };

  const getProductImageUrl = (product) => {
    if (product.primary_image) return product.primary_image;
    if (product.images && product.images.length > 0) {
      const first = product.images[0];
      return typeof first === "string" ? first : first.image;
    }
    return "";
  };

  if (loading && items.length === 0) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="wishlist-page-outer-container">
      <div className="wishlist-header-banner">
        <div className="wishlist-title-group">
          <div className="wishlist-title-icon-badge">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="wishlist-page-heading">My Wishlist</h1>
            <p className="wishlist-page-subheading">
              {items.length > 0
                ? `You have ${items.length} ${items.length === 1 ? "favorite toy" : "favorite toys"} saved.`
                : "Save your favorite toys and come back to them anytime."}
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <div className="wishlist-count-pill-tag">
            <Sparkles size={14} />
            <span>{items.length} Saved</span>
          </div>
        )}
      </div>

      {error && (
        <div className="wishlist-error-banner">
          <ShieldAlert size={18} />
          <span>
            {typeof error === "string"
              ? error
              : "Failed to load wishlist items."}
          </span>
        </div>
      )}

      {!loading && items.length === 0 ? (
        <div className="wishlist-empty-state-card">
          <div className="empty-state-heart-circle">
            <Heart size={44} className="empty-heart-icon" />
          </div>
          <h2 className="empty-state-title">Your wishlist is empty</h2>
          <p className="empty-state-description">
            Explore our catalog of premium collectibles &amp; toys. Tap the
            heart icon on any product to save it here for later.
          </p>
          <Link to="/products" className="btn-empty-explore-catalog">
            <Sparkles size={16} />
            <span>Explore Toys Catalog</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-items-grid-container">
          {items.map((item) => (
            <ProductCard key={item.id || item.product?.id} product={item.product || {}} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="wishlist-page-outer-container">
      <div className="wishlist-header-banner">
        <div
          className="skeleton-shimmer"
          style={{ width: "220px", height: "36px", borderRadius: "12px" }}
        />
      </div>
      <div className="wishlist-items-grid-container">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="wishlist-item-card" style={{ padding: "0" }}>
            <div
              className="skeleton-shimmer"
              style={{ width: "100%", aspectRatio: "1" }}
            />
            <div style={{ padding: "18px" }}>
              <div
                className="skeleton-shimmer"
                style={{
                  width: "60px",
                  height: "18px",
                  borderRadius: "6px",
                  marginBottom: "10px",
                }}
              />
              <div
                className="skeleton-shimmer"
                style={{
                  width: "85%",
                  height: "22px",
                  borderRadius: "6px",
                  marginBottom: "16px",
                }}
              />
              <div
                className="skeleton-shimmer"
                style={{ width: "100%", height: "42px", borderRadius: "12px" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
