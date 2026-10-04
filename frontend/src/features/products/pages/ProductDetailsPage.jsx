import React, { useEffect, useState, useRef } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Star,
  ShoppingCart,
  ShieldCheck,
  Tag,
  Sparkles,
  Loader,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Copy,
  Check,
  Truck,
  RefreshCw,
  Award,
  CheckCircle2,
  Share2,
} from "lucide-react";

import {
  fetchProductDetailsAsync,
  selectProductDetail,
  selectProductDetailLoading,
  selectProductDetailError,
  clearProductDetails,
} from "../redux/productDetailsSlice";
import ProductCard from "../components/ProductCard";
import { addToCartAsync } from "../../cart/redux/cartSlice";
import { selectIsAuthenticated } from "../../auth/authSlice";
import WishlistButton from "../../wishlist/components/WishlistButton";
import ReviewList from "../components/ReviewList";

import "../styles/ProductDetails.css";

export function ProductDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const targetVariantId = searchParams.get("variant");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const product = useSelector(selectProductDetail);
  const loading = useSelector(selectProductDetailLoading);
  const error = useSelector(selectProductDetailError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Selected variant and active gallery image index state
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Copied SKU feedback state
  const [copiedSku, setCopiedSku] = useState(false);

  // Touch swipe states for mobile gallery
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Desktop hover zoom state
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const imageContainerRef = useRef(null);
  const thumbnailStripRef = useRef(null);

  // Fetch product details on mount or ID change
  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetailsAsync(id));
    }
    return () => {
      dispatch(clearProductDetails());
      setSelectedVariantId(null);
      setActiveImageIndex(0);
    };
  }, [id, dispatch]);

  // Set default variant when product details load
  useEffect(() => {
    if (product) {
      const variants = product.variants || [];
      if (
        targetVariantId &&
        variants.some((v) => String(v.id) === String(targetVariantId))
      ) {
        setSelectedVariantId(targetVariantId);
      } else if (product.default_variant && product.default_variant.id) {
        setSelectedVariantId(product.default_variant.id);
      } else if (variants.length > 0) {
        setSelectedVariantId(variants[0].id);
      }
    }
  }, [product, targetVariantId]);

  // Handle 404 or missing product redirection
  useEffect(() => {
    if (error) {
      toast.error("This product is no longer available.");
      navigate("/products", { replace: true });
    }
  }, [error, navigate]);

  // Auto-scroll active thumbnail into view smoothly
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[activeImageIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeImageIndex]);

  // Safe retrieval of gallery images
  const {
    name,
    brand,
    category,
    description,
    breadcrumbs = [],
    highlights = [],
    variants = [],
    images = [],
    offers = [],
    reviews_summary = {},
    related_products = [],
  } = product || {};

  // Resolve currently selected variant details
  const selectedVariant =
    (variants &&
      variants.find((v) => String(v.id) === String(selectedVariantId))) ||
    product?.default_variant ||
    {};

  const stock =
    selectedVariant.stock_quantity !== undefined
      ? selectedVariant.stock_quantity
      : 0;
  const isInStock = selectedVariant.is_in_stock !== false && stock > 0;

  const galleryImages =
    selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
      ? selectedVariant.images
      : images && images.length > 0
        ? images
        : [];
  const activeImage = galleryImages[activeImageIndex] || null;

  // Keyboard controls for gallery lightbox & image switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxOpen) {
        if (e.key === "Escape") setLightboxOpen(false);
        if (e.key === "ArrowLeft") handlePrevImage();
        if (e.key === "ArrowRight") handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, galleryImages.length]);

  if (loading || !product) {
    return <ProductDetailsSkeleton />;
  }

  // Desktop Hover Zoom mouse move handler
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseEnter = () => setZoomActive(true);
  const handleMouseLeave = () => {
    setZoomActive(false);
    setZoomStyle({});
  };

  // Gallery Navigation Handlers
  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) =>
      prev > 0 ? prev - 1 : galleryImages.length - 1
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) =>
      prev < galleryImages.length - 1 ? prev + 1 : 0
    );
  };

  const scrollThumbnails = (direction) => {
    if (thumbnailStripRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      thumbnailStripRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Touch Swipe Handlers for Mobile Gallery
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Copy SKU handler
  const handleCopySku = () => {
    const sku = selectedVariant.sku;
    if (!sku) return;
    navigator.clipboard.writeText(sku).then(() => {
      setCopiedSku(true);
      toast.success(`SKU "${sku}" copied to clipboard!`);
      setTimeout(() => setCopiedSku(false), 2000);
    });
  };

  // Scroll to reviews section
  const scrollToReviews = () => {
    const reviewsEl = document.getElementById("product-reviews-section");
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return `Rs. ${num.toLocaleString("en-IN")}`;
  };

  // Handle variant click
  const handleVariantSelect = (variantId) => {
    setSelectedVariantId(variantId);
    setActiveImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    dispatch(addToCartAsync({ variantId: selectedVariant.id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success("Cart updated.");
      })
      .catch((err) => {
        toast.error(err || "Failed to update cart.");
      });
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    if (!isAuthenticated) {
      toast.warning("Please log in to buy items.");
      navigate("/login");
      return;
    }
    dispatch(addToCartAsync({ variantId: selectedVariant.id, quantity: 1 }))
      .unwrap()
      .then(() => {
        navigate("/cart");
      })
      .catch((err) => {
        toast.error(err || "Failed to update cart.");
      });
  };

  // Safely construct dynamic, fully working breadcrumbs with valid category & brand links
  const getEffectiveBreadcrumbs = () => {
    if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      const isStructured =
        typeof breadcrumbs[0] === "object" &&
        breadcrumbs[0] !== null &&
        breadcrumbs[0].label;
      if (isStructured) {
        return breadcrumbs;
      }

      return breadcrumbs.map((crumbText, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        const isFirst = idx === 0;

        let url = null;
        if (!isLast) {
          if (isFirst) {
            url = "/";
          } else if (
            idx === 1 &&
            (crumbText.toLowerCase() === "categories" ||
              crumbText.toLowerCase() === "products")
          ) {
            url = "/products";
          } else if (
            category &&
            (crumbText === category ||
              crumbText.toLowerCase().includes(category.toLowerCase()))
          ) {
            url = `/products?category=${encodeURIComponent(category)}`;
          } else if (
            brand &&
            (crumbText === brand ||
              crumbText.toLowerCase().includes(brand.toLowerCase()))
          ) {
            url = `/products?brand=${encodeURIComponent(brand)}`;
          } else {
            url = `/products?category=${encodeURIComponent(crumbText)}`;
          }
        }

        return {
          label: crumbText,
          url,
        };
      });
    }

    // Fallback dynamic breadcrumb generator using product attributes
    const items = [
      { label: "Home", url: "/" },
      { label: "Products", url: "/products" },
    ];

    if (category) {
      const categoryName =
        typeof category === "object" ? category.name : category;
      if (categoryName) {
        items.push({
          label: categoryName,
          url: `/products?category=${encodeURIComponent(categoryName)}`,
        });
      }
    }

    if (brand) {
      const brandName = typeof brand === "object" ? brand.name : brand;
      if (brandName && brandName !== category) {
        items.push({
          label: brandName,
          url: `/products?brand=${encodeURIComponent(brandName)}`,
        });
      }
    }

    if (name) {
      items.push({
        label: name,
        url: null,
      });
    }

    return items;
  };

  const effectiveBreadcrumbs = getEffectiveBreadcrumbs();

  return (
    <div className="details-page-outer-container">
      {/* 1. Breadcrumb Navigation */}
      {effectiveBreadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="breadcrumbs-wrapper-box">
          <ol className="breadcrumbs-nav-list">
            {effectiveBreadcrumbs.map((crumb, idx) => {
              const isLast = idx === effectiveBreadcrumbs.length - 1;
              const label = typeof crumb === "string" ? crumb : crumb.label;
              const url = typeof crumb === "string" ? null : crumb.url;

              return (
                <li
                  key={idx}
                  className={isLast ? "breadcrumbs-current-item" : ""}
                >
                  {!isLast && url ? (
                    <>
                      <Link to={url} className="breadcrumb-link">
                        {label}
                      </Link>
                      <span
                        className="breadcrumbs-separator-slash"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    </>
                  ) : (
                    <span className="breadcrumb-current-text" title={label}>
                      {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* 2. Main split layout */}
      <div className="product-details-main-layout">
        {/* Left Column: Premium Image Gallery */}
        <div className="details-gallery-column-area">
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`primary-image-viewport-wrapper ${zoomActive ? "hover-zoom-active" : ""}`}
          >
            {/* Image counter pill tag */}
            {galleryImages.length > 0 && (
              <span className="gallery-image-counter-pill">
                {activeImageIndex + 1} / {galleryImages.length}
              </span>
            )}

            {/* Expand Lightbox Button */}
            {activeImage && (
              <button
                type="button"
                className="gallery-lightbox-expand-btn"
                onClick={() => setLightboxOpen(true)}
                title="View Fullscreen"
              >
                <Maximize2 size={16} />
              </button>
            )}

            {/* Viewport Prev/Next Navigation Overlay Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="gallery-nav-overlay-btn btn-prev-overlay"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="gallery-nav-overlay-btn btn-next-overlay"
                  aria-label="Next image"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Main Product Image */}
            {activeImage ? (
              <img
                src={activeImage.image}
                alt={name}
                style={zoomStyle}
                className="primary-view-image"
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div
                className="product-card-placeholder-wrapper"
                style={{ height: "100%", width: "100%" }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  No Image Available
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip Wrapper with Overflow Scroll Prevention & Nav Arrows */}
          {galleryImages.length > 1 && (
            <div className="gallery-thumbnail-strip-container">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails("left")}
                className="thumb-scroll-btn btn-thumb-scroll-left"
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Scrollable Thumbnail Strip Row */}
              <div
                ref={thumbnailStripRef}
                className="gallery-thumbnail-strip-row"
              >
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`btn-thumbnail-item ${activeImageIndex === idx ? "active-thumbnail" : ""}`}
                    aria-label={`View thumbnail ${idx + 1}`}
                  >
                    <img src={img.image} alt={`${name} thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollThumbnails("right")}
                className="thumb-scroll-btn btn-thumb-scroll-right"
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Controls */}
        <div className="details-info-column-area">
          {/* Metadata Header */}
          <div className="info-product-metadata">
            <div className="meta-brand-category-row">
              {brand && <span className="meta-brand-lbl">{brand}</span>}
              {brand && category && (
                <span className="breadcrumbs-separator-slash">•</span>
              )}
              {category && (
                <span className="meta-category-lbl">{category}</span>
              )}
            </div>

            <h1 className="info-product-title">{name}</h1>

            <div className="meta-sku-row">
              <button
                type="button"
                onClick={handleCopySku}
                className="meta-sku-copy-btn"
                title="Click to copy SKU"
              >
                {copiedSku ? (
                  <Check size={13} className="copy-sku-success-icon" />
                ) : (
                  <Copy size={13} />
                )}
                <span>SKU: {selectedVariant.sku || "N/A"}</span>
              </button>
            </div>
          </div>

          {/* Ratings row */}
          {reviews_summary.total_reviews > 0 && (
            <div
              className="info-ratings-reviews-row clickable-ratings-row"
              onClick={scrollToReviews}
              title="Click to see reviews"
            >
              <div className="stars-rating-wrapper">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={
                      i < Math.round(reviews_summary.average_rating)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
              <span className="numeric-rating-val">
                {reviews_summary.average_rating}
              </span>
              <span className="total-reviews-count-lbl">
                ({reviews_summary.total_reviews} reviews)
              </span>
            </div>
          )}

          {/* Pricing Section */}
          <div className="pricing-section-block">
            <span className="price-current-large">
              {formatPrice(
                selectedVariant.offer_price ||
                selectedVariant.sale_price ||
                selectedVariant.price,
              )}
            </span>

            {(selectedVariant.has_offer ||
              (selectedVariant.sale_price &&
                selectedVariant.sale_price < selectedVariant.price)) && (
                <>
                  <span className="price-original-strike">
                    {formatPrice(selectedVariant.price)}
                  </span>
                  <span className="discount-badge-green">
                    Save {selectedVariant.discount_percentage}% (You Save{" "}
                    {formatPrice(
                      selectedVariant.price -
                      (selectedVariant.offer_price ||
                        selectedVariant.sale_price),
                    )}
                    )
                  </span>
                </>
              )}

            {/* Offers overlay badge */}
            {selectedVariant.has_offer && selectedVariant.offer_name && (
              <div className="active-offer-badge-amber">
                <Tag size={13} />
                <span>
                  {selectedVariant.offer_name} ({selectedVariant.offer_type}{" "}
                  OFFER)
                </span>
              </div>
            )}
            {!selectedVariant.has_offer && offers.length > 0 && (
              <div className="active-offer-badge-amber">
                <Tag size={13} />
                <span>{offers[0].title}</span>
              </div>
            )}
          </div>

          {/* Variant Selection Cards Grid */}
          {variants.length > 1 && (
            <div className="variant-selector-workspace">
              <span className="variant-selector-title">Select Edition</span>
              <div className="variant-buttons-list-grid">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantSelect(v.id)}
                    className={`btn-variant-selection-card ${selectedVariantId === v.id ? "active-variant-card" : ""}`}
                  >
                    <div className="variant-selection-thumb-wrapper">
                      <img src={v.thumbnail || ""} alt={v.variant_name} />
                    </div>
                    <div className="variant-selection-info-wrapper">
                      <span className="variant-selection-card-name">
                        {v.variant_name}
                      </span>
                      <span className="variant-selection-card-price">
                        {formatPrice(v.offer_price || v.sale_price || v.price)}
                      </span>
                    </div>
                    {selectedVariantId === v.id && (
                      <span className="variant-active-check-badge">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status & Action Buttons Section */}
          <div className="stock-status-and-actions-section">
            <div
              className={`stock-status-indicator-box ${!isInStock
                  ? "out-of-stock"
                  : stock <= 5
                    ? "low-stock"
                    : "in-stock"
                }`}
            >
              <ShieldCheck size={16} />
              <span>
                {!isInStock
                  ? "Out of Stock"
                  : stock <= 5
                    ? `Only ${stock} left in stock - order soon!`
                    : "In Stock & Ready to Ship"}
              </span>
            </div>

            {/* Main Action Buttons */}
            <div className="actions-buttons-checkout-row">
              <div className="cart-buy-buttons-group">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className="btn-action-add-to-cart"
                >
                  <ShoppingCart size={17} />
                  <span>Add to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  className="btn-action-buy-now"
                >
                  <span>Buy Now</span>
                </button>
              </div>
              <WishlistButton
                productId={product.id}
                productName={product.name}
                showText={true}
                className="btn-action-wishlist-details"
                size={17}
              />
            </div>
          </div>

          {/* E-Commerce Trust Badges */}
          <div className="trust-badges-grid">
            <div className="trust-badge-item">
              <Truck size={18} className="trust-icon" />
              <div className="trust-text-group">
                <strong>Free Delivery</strong>
                <span>On qualifying orders</span>
              </div>
            </div>
            <div className="trust-badge-item">
              <Award size={18} className="trust-icon" />
              <div className="trust-text-group">
                <strong>100% Authentic</strong>
                <span>Guaranteed genuine product</span>
              </div>
            </div>
            <div className="trust-badge-item">
              <RefreshCw size={18} className="trust-icon" />
              <div className="trust-text-group">
                <strong>Easy Returns</strong>
                <span>7 days return policy</span>
              </div>
            </div>
          </div>

          {/* Product Description Card */}
          <div className="description-collapsible-section">
            <h4 className="description-collapsible-title">Product Details</h4>
            <p className="description-text-body">{description}</p>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="description-collapsible-section highlights-card">
              <h4 className="description-collapsible-title">Highlights</h4>
              <ul className="highlights-custom-list">
                {highlights.map((h, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} className="highlight-check-icon" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. Ratings & Reviews section for selected variant */}
      {selectedVariant && selectedVariant.id && (
        <div id="product-reviews-section">
          <ReviewList
            variantId={selectedVariant.id}
            variantName={selectedVariant.variant_name || name}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}

      {/* 4. Related Products Shelf section */}
      {related_products.length > 0 && (
        <section className="related-products-section-wrapper">
          <h3 className="related-products-title-heading">You May Also Like</h3>
          <div className="related-products-cards-grid-layout">
            {related_products.map((relatedProd) => (
              <ProductCard key={relatedProd.id} product={relatedProd} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="lightbox-modal-backdrop"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="lightbox-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="lightbox-header-bar">
              <span className="lightbox-image-counter">
                {name} — {activeImageIndex + 1} of {galleryImages.length}
              </span>
              <button
                type="button"
                className="btn-close-lightbox"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close fullscreen view"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox Main Image View */}
            <div className="lightbox-main-view">
              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="lightbox-nav-btn lightbox-btn-prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              {activeImage && (
                <img
                  src={activeImage.image}
                  alt={name}
                  className="lightbox-img-element"
                />
              )}

              {galleryImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="lightbox-nav-btn lightbox-btn-next"
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="lightbox-bottom-thumbnails-strip">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`lightbox-thumb-item ${activeImageIndex === idx ? "active-lightbox-thumb" : ""}`}
                  >
                    <img src={img.image} alt={`Thumb ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Mobile Sticky Bottom Action Bar */}
      <div className="mobile-sticky-action-bar">
        <div className="mobile-sticky-price-info">
          <span className="mobile-price-val">
            {formatPrice(
              selectedVariant.offer_price ||
              selectedVariant.sale_price ||
              selectedVariant.price,
            )}
          </span>
          <span className="mobile-variant-name-lbl">
            {selectedVariant.variant_name || name}
          </span>
        </div>
        <div className="mobile-sticky-btns-group">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="btn-mobile-sticky-cart"
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isInStock}
            className="btn-mobile-sticky-buy"
          >
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeletons screen loader
function ProductDetailsSkeleton() {
  return (
    <div className="details-page-outer-container details-page-skeleton-loader">
      <div
        className="skeleton-box-el"
        style={{ width: "200px", height: "16px", marginBottom: "32px" }}
      />
      <div className="product-details-main-layout">
        <div className="details-gallery-column-area">
          <div
            className="skeleton-box-el"
            style={{ width: "100%", aspectRatio: "1", borderRadius: "16px" }}
          />
          <div style={{ display: "flex", gap: "12px" }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="skeleton-box-el"
                style={{ width: "72px", height: "72px", borderRadius: "12px" }}
              />
            ))}
          </div>
        </div>
        <div className="details-info-column-area">
          <div
            className="skeleton-box-el"
            style={{ width: "150px", height: "14px", marginBottom: "8px" }}
          />
          <div
            className="skeleton-box-el"
            style={{ width: "80%", height: "36px", marginBottom: "16px" }}
          />
          <div
            className="skeleton-box-el"
            style={{ width: "100px", height: "12px", marginBottom: "16px" }}
          />
          <div
            className="skeleton-box-el"
            style={{
              width: "100%",
              height: "80px",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          />
          <div
            className="skeleton-box-el"
            style={{ width: "100%", height: "120px", borderRadius: "12px" }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
