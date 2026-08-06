import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar, ShoppingBag, Eye, Lock, ArrowLeft } from 'lucide-react';
import { getVariantsAsync, selectVariants, selectVariantsLoading } from '../redux/variantSlice';
import ImageGallery from './ImageGallery';

/**
 * Premium Admin Read-Only Detail View for Products.
 * Renders product information in a beautiful layout and displays
 * variants as modern clickable cards.
 */
export function ProductDetailsView({ product, categories, onClose }) {
    const dispatch = useDispatch();
    const variants = useSelector(selectVariants);
    const loadingVariants = useSelector(selectVariantsLoading);

    // Selected variant for the detail overlay (view without page reloads)
    const [selectedVariant, setSelectedVariant] = useState(null);

    useEffect(() => {
        if (product && product.id) {
            dispatch(getVariantsAsync(product.id));
        }
    }, [product, dispatch]);

    const getCategoryName = (catId) => {
        if (product.category_name) return product.category_name;
        const cat = categories.find((c) => c.id === catId);
        return cat ? cat.name : 'Uncategorized';
    };

    // Helper for stock badges
    const renderStockBadge = (stock) => {
        if (stock === 0) {
            return <span className="p-stock-badge stock-out">Out of Stock</span>;
        } else if (stock <= 10) {
            return <span className="p-stock-badge stock-low">Low Stock ({stock})</span>;
        } else {
            return <span className="p-stock-badge stock-in">In Stock ({stock})</span>;
        }
    };

    // Normalizes variant image URL
    const getVariantImageUrl = (variant) => {
        if (variant.images && variant.images.length > 0) {
            const primary = variant.images.find((img) => img.is_primary) || variant.images[0];
            if (primary.image.startsWith('http')) return primary.image;
            return `http://localhost:8000${primary.image}`;
        }
        return ''; // Placeholder will render
    };

    // Render variant detail inline view
    if (selectedVariant) {
        return (
            <div className="variant-inline-detail-view">
                <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="btn-back-to-product"
                >
                    <ArrowLeft size={16} /> Back to Product Details
                </button>

                <div className="v-detail-header-row">
                    <h3 className="v-detail-title">{selectedVariant.variant_name}</h3>
                    <div className="v-detail-badges-row">
                        {selectedVariant.blocked && <span className="badge-status blocked">Blocked</span>}
                        {!selectedVariant.is_active && <span className="badge-status inactive">Inactive</span>}
                        {selectedVariant.is_active && !selectedVariant.blocked && (
                            <span className="badge-status active">Active</span>
                        )}
                    </div>
                </div>

                <div className="v-detail-grid-layout">
                    {/* Information Column */}
                    <div className="v-detail-info-card">
                        <h4 className="v-section-title">Variant Information</h4>
                        <div className="v-info-list">
                            <div className="v-info-item">
                                <span className="v-info-label">SKU</span>
                                <span className="v-info-value value-sku">{selectedVariant.sku}</span>
                            </div>
                            <div className="v-info-item">
                                <span className="v-info-label">Price</span>
                                <span className="v-info-value">
                                    {selectedVariant.sale_price ? (
                                        <>
                                            <span className="price-strikethrough">Rs. {selectedVariant.price}</span>
                                            <span className="price-sale-green"> Rs. {selectedVariant.sale_price}</span>
                                        </>
                                    ) : (
                                        `Rs. ${selectedVariant.price}`
                                    )}
                                </span>
                            </div>
                            <div className="v-info-item">
                                <span className="v-info-label">Stock Status</span>
                                <span className="v-info-value">
                                    {renderStockBadge(selectedVariant.stock_quantity)}
                                </span>
                            </div>
                            <div className="v-info-item">
                                <span className="v-info-label">Display Position</span>
                                <span className="v-info-value">Order #{selectedVariant.display_order}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Column */}
                    <div className="v-detail-gallery-card">
                        <ImageGallery images={selectedVariant.images} loading={false} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-product-details-container">
            {/* Product Meta Section */}
            <div className="product-meta-header-card">
                <div className="p-meta-left">
                    <span className="p-meta-category-badge">{getCategoryName(product.category)}</span>
                    <h2 className="p-meta-title">{product.name}</h2>
                    {product.brand && (
                        <p className="p-meta-brand-text">
                            by <strong>{product.brand}</strong>
                        </p>
                    )}
                </div>
                <div className="p-meta-right">
                    <div className="p-status-box">
                        <span className="p-status-label">Product Status</span>
                        {product.blocked ? (
                            <span className="badge-status blocked">Blocked</span>
                        ) : (
                            <span className="badge-status active">Active</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Card */}
            <div className="product-details-desc-card">
                <h4 className="p-card-section-title">Description</h4>
                <p className="p-desc-text-body">{product.description || 'No description available for this product.'}</p>
            </div>

            {/* Variants List Section */}
            <div className="product-details-variants-section">
                <div className="variants-section-header">
                    <h4 className="p-card-section-title">Variants</h4>
                    <span className="variants-count-pill">{variants.length} Available</span>
                </div>

                {loadingVariants ? (
                    <div className="variants-loading-spinner-wrapper">
                        <div className="v-shimmer-card-list">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="v-shimmer-card v-skeleton-shimmer" />
                            ))}
                        </div>
                    </div>
                ) : variants.length === 0 ? (
                    <div className="variants-detail-empty-state">
                        <ShoppingBag size={32} className="empty-state-icon-svg" />
                        <p>No variants registered for this product entry.</p>
                    </div>
                ) : (
                    <div className="variants-clickable-cards-grid">
                        {variants.map((v) => {
                            const imageUrl = getVariantImageUrl(v);
                            return (
                                <div
                                    key={v.id}
                                    className={`variant-clickable-card ${v.blocked ? 'v-card-blocked' : ''}`}
                                    onClick={() => setSelectedVariant(v)}
                                    title={`Click to view ${v.variant_name} details`}
                                >
                                    {/* Thumbnail */}
                                    <div className="v-card-image-box">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={v.variant_name}
                                                className="v-card-img-element"
                                            />
                                        ) : (
                                            <div className="v-card-placeholder-box">
                                                <ShoppingBag size={20} className="placeholder-icon-img" />
                                            </div>
                                        )}
                                        {v.blocked && (
                                            <div className="v-card-blocked-overlay">
                                                <Lock size={14} />
                                                <span>Blocked</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="v-card-details-box">
                                        <div className="v-card-top-row">
                                            <h5 className="v-card-title-name">{v.variant_name}</h5>
                                            {v.is_primary && (
                                                <span className="v-card-primary-tag-badge">Primary</span>
                                            )}
                                        </div>
                                        <p className="v-card-sku-code">SKU: {v.sku}</p>

                                        {/* Price and Stock info */}
                                        <div className="v-card-bottom-row">
                                            <div className="v-card-pricing">
                                                {v.sale_price ? (
                                                    <>
                                                        <span className="price-orig-strikethrough">Rs. {v.price}</span>
                                                        <span className="price-sale-green-tag"> Rs. {v.sale_price}</span>
                                                    </>
                                                ) : (
                                                    <span className="price-tag-value">Rs. {v.price}</span>
                                                )}
                                            </div>
                                            <div className="v-card-badges-wrapper">
                                                {renderStockBadge(v.stock_quantity)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Actions Close Button */}
            <div className="form-actions-footer details-close-btn-row">
                <button
                    type="button"
                    onClick={onClose}
                    className="btn-form-cancel"
                    style={{ minWidth: '120px' }}
                >
                    Close Product
                </button>
            </div>
        </div>
    );
}

export default ProductDetailsView;
