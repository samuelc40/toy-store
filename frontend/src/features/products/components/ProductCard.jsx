import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCartAsync } from '../../cart/redux/cartSlice';
import { selectIsAuthenticated } from '../../auth/authSlice';
import ProductImage from './ProductImage';
import ProductPrice from './ProductPrice';
import ProductBadge from './ProductBadge';
import WishlistButton from '../../wishlist/components/WishlistButton';

/**
 * Premium product card for customer-facing store shelves.
 * Employs hover scale-ups, subtle shadows, wishlist triggers, and out-of-stock disabled states.
 */
export function ProductCard({ product }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const totalStock = (product.total_stock !== undefined && product.total_stock !== null) ? Number(product.total_stock) : null;
    const isOutOfStock = product.is_in_stock === false || (totalStock !== null && totalStock <= 0);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;

        if (!isAuthenticated) {
            toast.warning('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }
        
        if (!product.default_variant_id) {
            toast.error("This product doesn't have any purchasable variants.");
            return;
        }

        dispatch(addToCartAsync({ variantId: product.default_variant_id, quantity: 1 }))
            .unwrap()
            .then(() => {
                toast.success('Cart updated.');
            })
            .catch((err) => {
                toast.error(err || 'Failed to add item to cart.');
            });
    };

    const avgRating = Number(product.average_rating || 0);
    const totalReviews = Number(product.total_reviews || 0);

    return (
        <Link to={`/products/${product.id}${product.default_variant_id ? `?variant=${product.default_variant_id}` : ''}`} className="cust-product-card-link-wrapper">
            <div className={`cust-product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}>
                {/* Media Container */}
                <div className="card-media-box">
                    <ProductImage product={product} />
                    
                    {/* Badges Overlays */}
                    <div className="card-badges-overlay-box">
                        <ProductBadge product={product} type="discount" />
                        <ProductBadge product={product} type="stock" />
                    </div>

                    {/* Wishlist Icon Button */}
                    <WishlistButton productId={product.id} productName={product.name} />
                </div>

                {/* Details Container */}
                <div className="card-details-box">
                    {/* Product Name (takes its own line) */}
                    <h3 className="card-product-title" title={product.name}>
                        {product.name}
                    </h3>

                    {/* Metadata Row */}
                    <div className="card-metadata-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="card-category-lbl">{product.category || 'Toy'}</span>
                            {product.brand && <span className="card-brand-lbl">{product.brand}</span>}
                        </div>
                        {avgRating > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
                                <Star size={12} fill="#f59e0b" />
                                <span>{avgRating.toFixed(1)}</span>
                                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '11px', fontWeight: '400' }}>({totalReviews})</span>
                            </div>
                        ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)' }}>No reviews</span>
                        )}
                    </div>

                    {/* Price and Stock row */}
                    <div className="card-price-stock-row">
                        <div className="card-price-wrapper">
                            <ProductPrice product={product} />
                        </div>
                        <span className={`card-stock-status-lbl ${isOutOfStock ? 'is-out' : totalStock <= 5 ? 'is-low' : 'is-in'}`}>
                            {isOutOfStock ? 'Sold Out' : totalStock <= 5 ? 'Low Stock' : 'In Stock'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="btn-card-add-to-cart-element"
                        title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    >
                        <ShoppingCart size={14} />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
