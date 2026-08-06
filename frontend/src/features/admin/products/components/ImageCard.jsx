import React from 'react';
import { Star, Trash2, Move, Maximize2 } from 'lucide-react';

/**
 * Visualizes a single uploaded product variant image in the gallery.
 * Wires up disabled action hooks for primary image, delete, and drag-and-drop ordering.
 */
export function ImageCard({
    image,
    onPreviewClick,
    onDelete,
    onSetPrimary,
    disabled = false,
}) {
    // Normalize image URL from backend (could be absolute or relative)
    const getImageUrl = (imgObj) => {
        if (!imgObj || !imgObj.image) return '';
        if (imgObj.image.startsWith('http')) return imgObj.image;
        return `http://localhost:8000${imgObj.image}`; // backend server base
    };

    return (
        <div className={`gallery-image-card ${image.is_primary ? 'is-primary-card' : ''}`}>
            {/* Image Wrapper */}
            <div className="gallery-image-wrapper">
                <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || 'Variant Product Image'}
                    className="gallery-image-el"
                />

                {/* Hover overlay icons */}
                <div className="gallery-image-overlay-actions">
                    <button
                        type="button"
                        onClick={() => onPreviewClick(image)}
                        className="btn-overlay-gallery-action"
                        title="Preview Image"
                    >
                        <Maximize2 size={14} />
                    </button>
                </div>

                {/* Primary Image Star Indicator */}
                {image.is_primary && (
                    <div className="primary-badge-indicator" title="Primary Variant Image">
                        <Star size={10} fill="currentColor" />
                        <span>Primary</span>
                    </div>
                )}

                {/* Display Order Badge */}
                <div className="display-order-badge-indicator" title="Display Order Position">
                    <span>#{image.display_order}</span>
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="gallery-image-actions-row">
                {/* Drag Handle (Disabled) */}
                <button
                    type="button"
                    className="btn-v-image-action btn-image-drag"
                    title="Drag to Reorder (Upcoming Feature)"
                    disabled
                    style={{ cursor: 'not-allowed' }}
                >
                    <Move size={13} />
                </button>

                {/* Set Primary Toggle */}
                <button
                    type="button"
                    className={`btn-v-image-action btn-image-primary-toggle ${image.is_primary ? 'text-primary-active' : ''}`}
                    title={image.is_primary ? 'Primary Image' : 'Set as Primary'}
                    onClick={() => onSetPrimary(image.id)}
                    disabled={disabled}
                >
                    <Star size={13} fill={image.is_primary ? 'currentColor' : 'none'} />
                </button>

                {/* Delete Image */}
                <button
                    type="button"
                    className="btn-v-image-action btn-image-delete"
                    title="Delete Image"
                    onClick={() => onDelete(image.id)}
                    disabled={disabled}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

export default ImageCard;
