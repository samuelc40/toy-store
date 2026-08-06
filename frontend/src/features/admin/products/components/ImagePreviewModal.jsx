import React from 'react';
import { X } from 'lucide-react';

/**
 * Fullscreen lightbox preview modal for product variant images.
 */
export function ImagePreviewModal({ isOpen, onClose, image }) {
    if (!isOpen || !image) return null;

    // Normalize image URL
    const getImageUrl = (imgObj) => {
        if (!imgObj || !imgObj.image) return '';
        if (imgObj.image.startsWith('http')) return imgObj.image;
        return `http://localhost:8000${imgObj.image}`;
    };

    return (
        <div className="preview-lightbox-backdrop" onClick={onClose}>
            <div className="preview-lightbox-card" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="preview-lightbox-close-btn"
                    title="Close Preview"
                >
                    <X size={20} />
                </button>

                {/* Main Image */}
                <div className="preview-lightbox-image-container">
                    <img
                        src={getImageUrl(image)}
                        alt={image.alt_text || 'Variant Product Image Lightbox'}
                        className="preview-lightbox-img"
                    />
                </div>

                {/* Footer details */}
                <div className="preview-lightbox-details-footer">
                    <span className="preview-details-order">Image #{image.display_order}</span>
                    {image.alt_text && (
                        <p className="preview-details-alt-text">Alt Text: "{image.alt_text}"</p>
                    )}
                    {image.is_primary && (
                        <span className="preview-details-primary-label">Primary Image</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ImagePreviewModal;
