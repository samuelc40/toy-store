import React from 'react';
import ImageCard from './ImageCard';

/**
 * Responsive grid list of variant uploaded images.
 */
export function ImageGrid({ images, onPreviewClick, onDelete, onSetPrimary, disabled = false }) {
    if (!images || images.length === 0) return null;

    return (
        <div className="gallery-images-grid">
            {images.map((image) => (
                <ImageCard
                    key={image.id}
                    image={image}
                    onPreviewClick={onPreviewClick}
                    onDelete={onDelete}
                    onSetPrimary={onSetPrimary}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}

export default ImageGrid;
