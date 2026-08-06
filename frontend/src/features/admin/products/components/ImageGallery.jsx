import React, { useState } from 'react';
import ImageGrid from './ImageGrid';
import ImagePreviewModal from './ImagePreviewModal';

/**
 * Modern gallery wrapper showing variant uploaded images.
 * Shows skeletons when loading, empty states, and preview modal toggles.
 */
export function ImageGallery({
    images,
    loading = false,
    onDelete,
    onSetPrimary,
    disabled = false,
}) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreviewClick = (image) => {
        setSelectedImage(image);
        setPreviewOpen(true);
    };

    if (loading && (!images || images.length === 0)) {
        return (
            <div className="variant-images-gallery-section">
                <div className="gallery-section-header">
                    <h5 className="gallery-section-title">Product Images</h5>
                    <div className="v-skeleton-shimmer gallery-count-skeleton" />
                </div>
                <div className="gallery-loading-skeleton-grid">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="gallery-skeleton-card v-skeleton-shimmer" />
                    ))}
                </div>
            </div>
        );
    }

    const hasImages = images && images.length > 0;

    return (
        <div className="variant-images-gallery-section">
            <div className="gallery-section-header">
                <h5 className="gallery-section-title">Product Images</h5>
                {hasImages && (
                    <span className="gallery-count-badge-el">
                        {images.length} {images.length === 1 ? 'image' : 'images'}
                    </span>
                )}
            </div>

            {hasImages ? (
                <ImageGrid
                    images={images}
                    onPreviewClick={handlePreviewClick}
                    onDelete={onDelete}
                    onSetPrimary={onSetPrimary}
                    disabled={disabled}
                />
            ) : (
                <div className="gallery-empty-state-wrapper">
                    <p className="gallery-empty-state-text">
                        No images uploaded for this variant yet. Upload at least 3 images below.
                    </p>
                </div>
            )}

            {/* Fullscreen Lightbox Lightbox Preview */}
            <ImagePreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                image={selectedImage}
            />
        </div>
    );
}

export default ImageGallery;
