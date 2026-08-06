import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Star, ShoppingCart, ShieldCheck, Tag, Sparkles, Loader } from 'lucide-react';

import {
    fetchProductDetailsAsync,
    selectProductDetail,
    selectProductDetailLoading,
    selectProductDetailError,
    clearProductDetails,
} from '../redux/productDetailsSlice';
import ProductCard from '../components/ProductCard';
import { addToCartAsync } from '../../cart/redux/cartSlice';
import { selectIsAuthenticated } from '../../auth/authSlice';
import WishlistButton from '../../wishlist/components/WishlistButton';

import '../styles/ProductDetails.css';

export function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const product = useSelector(selectProductDetail);
    const loading = useSelector(selectProductDetailLoading);
    const error = useSelector(selectProductDetailError);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Selected variant and active gallery image index state
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Desktop hover zoom state
    const [zoomActive, setZoomActive] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({});
    const imageContainerRef = useRef(null);

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
            if (product.default_variant) {
                setSelectedVariantId(product.default_variant.id);
            } else if (product.variants && product.variants.length > 0) {
                setSelectedVariantId(product.variants[0].id);
            }
        }
    }, [product]);

    // Handle 404 or missing product redirection
    useEffect(() => {
        if (error) {
            toast.error('This product is no longer available.');
            navigate('/products', { replace: true });
        }
    }, [error, navigate]);

    if (loading || !product) {
        return <ProductDetailsSkeleton />;
    }

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
    } = product;

    // Resolve currently selected variant details
    const selectedVariant = variants.find((v) => v.id === selectedVariantId) || product.default_variant || {};

    const stock = selectedVariant.stock_quantity !== undefined ? selectedVariant.stock_quantity : 0;
    const isInStock = selectedVariant.is_in_stock !== false && stock > 0;

    // Desktop Hover Zoom mouse move handler
    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
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

    const formatPrice = (val) => {
        const num = Number(val);
        if (isNaN(num)) return val;
        return `Rs. ${num.toLocaleString('en-IN')}`;
    };

    // Safe retrieval of gallery images
    const galleryImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
        ? selectedVariant.images
        : (images.length > 0 ? images : []);
    const activeImage = galleryImages[activeImageIndex] || null;

    // Handle variant click
    const handleVariantSelect = (variantId) => {
        setSelectedVariantId(variantId);
        setActiveImageIndex(0);
    };

    const handleAddToCart = () => {
        if (!isInStock) return;
        if (!isAuthenticated) {
            toast.warning('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }
        dispatch(addToCartAsync({ variantId: selectedVariant.id, quantity: 1 }))
            .unwrap()
            .then(() => {
                toast.success('Cart updated.');
            })
            .catch((err) => {
                toast.error(err || 'Failed to update cart.');
            });
    };

    const handleBuyNow = () => {
        if (!isInStock) return;
        if (!isAuthenticated) {
            toast.warning('Please log in to buy items.');
            navigate('/login');
            return;
        }
        dispatch(addToCartAsync({ variantId: selectedVariant.id, quantity: 1 }))
            .unwrap()
            .then(() => {
                navigate('/cart');
            })
            .catch((err) => {
                toast.error(err || 'Failed to update cart.');
            });
    };

    return (
        <div className="details-page-outer-container">
            {/* 1. Breadcrumb Navigation */}
            {breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb">
                    <ol className="breadcrumbs-nav-list">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <li key={idx} className={isLast ? 'breadcrumbs-current-item' : ''}>
                                    {isLast ? (
                                        crumb
                                    ) : (
                                        <>
                                            <Link to={idx === 0 ? '/' : idx === 1 ? '/products' : '#'}>
                                                {crumb}
                                            </Link>
                                            <span className="breadcrumbs-separator-slash" aria-hidden="true">
                                                /
                                            </span>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            )}

            {/* 2. Main split layout */}
            <div className="product-details-main-layout">
                {/* Left Column: Image Gallery */}
                <div className="details-gallery-column-area">
                    <div
                        ref={imageContainerRef}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className={`primary-image-viewport-wrapper ${zoomActive ? 'hover-zoom-active' : ''}`}
                    >
                        {activeImage ? (
                            <img
                                src={activeImage.image}
                                alt={name}
                                style={zoomStyle}
                                className="primary-view-image"
                            />
                        ) : (
                            <div className="product-card-placeholder-wrapper" style={{ height: '100%', width: '100%' }}>
                                <span style={{ color: 'var(--text-muted)' }}>No Image Available</span>
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Strip */}
                    {galleryImages.length > 1 && (
                        <div className="gallery-thumbnail-strip-row">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`btn-thumbnail-item ${activeImageIndex === idx ? 'active-thumbnail' : ''}`}
                                >
                                    <img src={img.image} alt={`${name} thumb ${idx}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Product Information & Controls */}
                <div className="details-info-column-area">
                    {/* Metadata Header */}
                    <div className="info-product-metadata">
                        <div className="meta-brand-category-row">
                            {brand && <span className="meta-brand-lbl">{brand}</span>}
                            {brand && category && <span className="breadcrumbs-separator-slash">•</span>}
                            {category && <span className="meta-category-lbl">{category}</span>}
                        </div>
                        <h1 className="info-product-title">{name}</h1>
                        <span className="meta-sku-lbl">SKU: {selectedVariant.sku || 'N/A'}</span>
                    </div>

                    {/* Ratings row */}
                    {reviews_summary.total_reviews > 0 && (
                        <div className="info-ratings-reviews-row">
                            <div className="stars-rating-wrapper">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={i < Math.round(reviews_summary.average_rating) ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <span className="numeric-rating-val">{reviews_summary.average_rating}</span>
                            <span className="total-reviews-count-lbl">
                                ({reviews_summary.total_reviews} reviews)
                            </span>
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="pricing-section-block">
                        <span className="price-current-large">
                            {formatPrice(selectedVariant.sale_price || selectedVariant.price)}
                        </span>
                        {selectedVariant.sale_price && (
                            <>
                                <span className="price-original-strike">
                                    {formatPrice(selectedVariant.price)}
                                </span>
                                <span className="discount-badge-green">
                                    Save {selectedVariant.discount_percentage}%
                                </span>
                            </>
                        )}
                        {/* Offers overlay */}
                        {offers.length > 0 && (
                            <div className="active-offer-badge-amber">
                                <Tag size={13} />
                                <span>{offers[0].title}</span>
                            </div>
                        )}
                    </div>

                    {/* Variant selection cards list */}
                    {variants.length > 1 && (
                        <div className="variant-selector-workspace">
                            <span className="variant-selector-title">Select Edition</span>
                            <div className="variant-buttons-list-grid">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => handleVariantSelect(v.id)}
                                        className={`btn-variant-selection-card ${selectedVariantId === v.id ? 'active-variant-card' : ''}`}
                                    >
                                        <div className="variant-selection-thumb-wrapper">
                                            <img src={v.thumbnail || ''} alt={v.variant_name} />
                                        </div>
                                        <div className="variant-selection-info-wrapper">
                                            <span className="variant-selection-card-name">
                                                {v.variant_name}
                                            </span>
                                            <span className="variant-selection-card-price">
                                                {formatPrice(v.sale_price || v.price)}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Status Indicator */}
                    <div className="stock-status-and-actions-section">
                        <div
                            className={`stock-status-indicator-box ${
                                !isInStock ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock'
                            }`}
                        >
                            <ShieldCheck size={16} />
                            <span>
                                {!isInStock
                                    ? 'Out of Stock'
                                    : stock <= 5
                                    ? `Only ${stock} left in stock - order soon!`
                                    : 'In Stock & Ready to Ship'}
                            </span>
                        </div>

                        {/* Checkout operations */}
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

                    {/* Product Description */}
                    <div className="description-collapsible-section">
                        <h4 className="description-collapsible-title">Product Details</h4>
                        <p className="description-text-body">{description}</p>
                    </div>

                    {/* Highlights */}
                    {highlights.length > 0 && (
                        <div className="description-collapsible-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <h4 className="description-collapsible-title">Highlights</h4>
                            <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: '1.6' }}>
                                {highlights.map((h, i) => (
                                    <li key={i}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Ratings & Reviews summary dashboard */}
            {reviews_summary.total_reviews > 0 && (
                <section className="reviews-breakdown-section-wrapper">
                    <h3 className="reviews-summary-title">Customer Ratings &amp; Reviews</h3>
                    <div className="reviews-summary-dashboard-layout">
                        {/* Scorecard card */}
                        <div className="reviews-summary-scorecard-box">
                            <span className="summary-score-large">{reviews_summary.average_rating}</span>
                            <div className="stars-rating-wrapper" style={{ marginTop: '8px', fontSize: '18px', gap: '4px' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < Math.round(reviews_summary.average_rating) ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <span className="summary-scorecard-reviews-count">
                                Based on {reviews_summary.total_reviews} ratings
                            </span>
                        </div>

                        {/* Breakdown Progress stack */}
                        {reviews_summary.rating_breakdown && (
                            <div className="reviews-bars-chart-stack">
                                {['5', '4', '3', '2', '1'].map((stars) => {
                                    const count = reviews_summary.rating_breakdown[stars] || 0;
                                    const percent =
                                        reviews_summary.total_reviews > 0
                                            ? (count / reviews_summary.total_reviews) * 100
                                            : 0;
                                    return (
                                        <div key={stars} className="reviews-rating-bar-row">
                                            <span className="rating-star-label-badge">{stars} Star</span>
                                            <div className="progress-bar-track-el">
                                                <div
                                                    className="progress-bar-fill-indicator"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="rating-count-label-el">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
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
        </div>
    );
}

// Skeletons screen loader
function ProductDetailsSkeleton() {
    return (
        <div className="details-page-outer-container details-page-skeleton-loader">
            <div className="skeleton-box-el" style={{ width: '200px', height: '16px', marginBottom: '32px' }} />
            <div className="product-details-main-layout">
                <div className="details-gallery-column-area">
                    <div className="skeleton-box-el" style={{ width: '100%', aspectRatio: '1', borderRadius: '16px' }} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton-box-el" style={{ width: '72px', height: '72px', borderRadius: '8px' }} />
                        ))}
                    </div>
                </div>
                <div className="details-info-column-area">
                    <div className="skeleton-box-el" style={{ width: '150px', height: '14px', marginBottom: '8px' }} />
                    <div className="skeleton-box-el" style={{ width: '80%', height: '36px', marginBottom: '16px' }} />
                    <div className="skeleton-box-el" style={{ width: '100px', height: '12px', marginBottom: '16px' }} />
                    <div className="skeleton-box-el" style={{ width: '100%', height: '80px', borderRadius: '12px', marginBottom: '24px' }} />
                    <div className="skeleton-box-el" style={{ width: '100%', height: '120px', borderRadius: '12px' }} />
                </div>
            </div>
        </div>
    );
}

export default ProductDetailsPage;
