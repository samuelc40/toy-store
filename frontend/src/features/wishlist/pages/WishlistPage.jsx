import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Eye, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    getWishlistAsync,
    removeFromWishlistAsync,
    selectWishlistItems,
    selectWishlistLoading,
    selectWishlistError,
} from '../redux/wishlistSlice';
import { addToCartAsync } from '../../cart/redux/cartSlice';
import ProductPrice from '../../products/components/ProductPrice';
import ProductBadge from '../../products/components/ProductBadge';
import '../styles/Wishlist.css';

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
            toast.info(`Removed "${productName || 'Product'}" from your wishlist.`);
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to remove from wishlist.');
        }
    };

    const handleAddToCart = (product) => {
        const isOutOfStock = product.is_in_stock === false || (product.total_stock || 0) === 0;
        if (isOutOfStock) return;

        // If product has multiple variants, navigate to detail page to select variant
        if (product.available_variants > 1) {
            toast.info('Please select your preferred edition/variant.');
            navigate(`/products/${product.id}`);
            return;
        }

        if (!product.default_variant_id) {
            toast.error("This product doesn't have any purchasable variants.");
            return;
        }

        dispatch(addToCartAsync({ variantId: product.default_variant_id, quantity: 1 }))
            .unwrap()
            .then(() => {
                toast.success(`Moved "${product.name}" to your cart!`);
            })
            .catch((err) => {
                toast.error(typeof err === 'string' ? err : 'Failed to add item to cart.');
            });
    };

    const getProductImageUrl = (product) => {
        if (product.primary_image) return product.primary_image;
        if (product.images && product.images.length > 0) {
            const first = product.images[0];
            return typeof first === 'string' ? first : first.image;
        }
        return '';
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
                                ? `You have ${items.length} ${items.length === 1 ? 'favorite toy' : 'favorite toys'} saved.`
                                : 'Save your favorite toys and come back to them anytime.'}
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
                    <span>{typeof error === 'string' ? error : 'Failed to load wishlist items.'}</span>
                </div>
            )}

            {!loading && items.length === 0 ? (
                <div className="wishlist-empty-state-card">
                    <div className="empty-state-heart-circle">
                        <Heart size={44} className="empty-heart-icon" />
                    </div>
                    <h2 className="empty-state-title">Your wishlist is empty</h2>
                    <p className="empty-state-description">
                        Explore our catalog of premium collectibles &amp; toys. Tap the heart icon on any product to save it here for later.
                    </p>
                    <Link to="/products" className="btn-empty-explore-catalog">
                        <Sparkles size={16} />
                        <span>Explore Toys Catalog</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="wishlist-items-grid-container">
                    {items.map((item) => {
                        const product = item.product || {};
                        const isOutOfStock = product.is_in_stock === false || (product.total_stock || 0) === 0;
                        const imgUrl = getProductImageUrl(product);

                        return (
                            <div key={item.id} className="wishlist-item-card">
                                {/* Top Image Section */}
                                <div className="wishlist-card-media-box">
                                    <Link to={`/products/${product.id}`} className="wishlist-img-link">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={product.name} className="wishlist-card-img" />
                                        ) : (
                                            <div className="wishlist-img-placeholder">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </Link>

                                    <div className="wishlist-card-badges-overlay">
                                        <ProductBadge product={product} type="discount" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemove(product.id, product.name)}
                                        className="btn-wishlist-remove-floating"
                                        title="Remove from wishlist"
                                        aria-label={`Remove ${product.name} from wishlist`}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <div className="wishlist-card-content-box">
                                    <div className="wishlist-card-metadata-row">
                                        <span className="wishlist-category-tag">{product.category || 'Toy'}</span>
                                        {product.brand && <span className="wishlist-brand-tag">{product.brand}</span>}
                                    </div>

                                    <h3 className="wishlist-product-title" title={product.name}>
                                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                                    </h3>

                                    <div className="wishlist-price-stock-row">
                                        <ProductPrice product={product} />
                                        <span className={`wishlist-stock-pill ${isOutOfStock ? 'is-out' : 'is-in'}`}>
                                            {isOutOfStock ? (
                                                <>
                                                    <AlertCircle size={11} /> Out of Stock
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={11} /> In Stock
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="wishlist-card-actions-row">
                                        <button
                                            type="button"
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isOutOfStock}
                                            className="btn-wishlist-add-cart"
                                            title={
                                                isOutOfStock
                                                    ? 'Out of Stock'
                                                    : product.available_variants > 1
                                                    ? 'Choose Edition'
                                                    : 'Add to Cart'
                                            }
                                        >
                                            <ShoppingCart size={15} />
                                            <span>
                                                {isOutOfStock
                                                    ? 'Out of Stock'
                                                    : product.available_variants > 1
                                                    ? 'Choose Edition'
                                                    : 'Add to Cart'}
                                            </span>
                                        </button>

                                        <Link
                                            to={`/products/${product.id}`}
                                            className="btn-wishlist-view-details"
                                            title="View Details"
                                        >
                                            <Eye size={15} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function WishlistSkeleton() {
    return (
        <div className="wishlist-page-outer-container">
            <div className="wishlist-header-banner">
                <div className="skeleton-shimmer" style={{ width: '220px', height: '36px', borderRadius: '12px' }} />
            </div>
            <div className="wishlist-items-grid-container">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="wishlist-item-card" style={{ padding: '0' }}>
                        <div className="skeleton-shimmer" style={{ width: '100%', aspectRatio: '1' }} />
                        <div style={{ padding: '18px' }}>
                            <div className="skeleton-shimmer" style={{ width: '60px', height: '18px', borderRadius: '6px', marginBottom: '10px' }} />
                            <div className="skeleton-shimmer" style={{ width: '85%', height: '22px', borderRadius: '6px', marginBottom: '16px' }} />
                            <div className="skeleton-shimmer" style={{ width: '100%', height: '42px', borderRadius: '12px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WishlistPage;
