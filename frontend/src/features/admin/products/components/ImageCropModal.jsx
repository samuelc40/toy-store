import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, RotateCw } from 'lucide-react';

// Helper helper to load image source
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        // Only set crossOrigin for external URLs. data: and blob: URLs fail if crossOrigin is set
        if (url && !url.startsWith('data:') && !url.startsWith('blob:')) {
            image.setAttribute('crossOrigin', 'anonymous');
        }
        image.src = url;
    });

// Helper to draw cropped image on HTML Canvas
const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, mimeType = 'image/jpeg') => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const rotRad = (rotation * Math.PI) / 180;

    // Bounding dimensions after rotation
    const bWidth = Math.abs(Math.sin(rotRad) * image.height) + Math.abs(Math.cos(rotRad) * image.width);
    const bHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = bWidth;
    canvas.height = bHeight;

    // Fill with white background if target format doesn't support transparency (e.g. JPEG) to avoid black output
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, bWidth, bHeight);
    }

    ctx.translate(bWidth / 2, bHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    // Create a second canvas for the final cropped image to avoid clearing/black canvas bugs
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) return null;

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    // Fill with white background on target canvas for JPEG formats
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        croppedCtx.fillStyle = '#ffffff';
        croppedCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);
    }

    // Draw the cropped portion from the rotated canvas onto the cropped canvas
    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        croppedCanvas.toBlob((blob) => {
            resolve(blob);
        }, mimeType, 0.95);
    });
};

/**
 * Image Crop Modal integrating react-easy-crop.
 */
export function ImageCropModal({
    isOpen,
    onClose,
    imageSrc,
    mimeType = 'image/jpeg',
    onSave,
}) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || isSaving) return;
        setIsSaving(true);
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, mimeType);
            onSave(croppedBlob);
        } catch (err) {
            console.error('Cropping canvas generation failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return createPortal(
        <div className="crop-modal-backdrop-overlay">
            <div className="crop-modal-card-container">
                {/* Header */}
                <div className="crop-modal-header">
                    <h3 className="crop-modal-title">Crop Image</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="crop-modal-close-btn"
                        title="Close Cropper"
                        disabled={isSaving}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cropper Container */}
                <div className="crop-workspace-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1} // Force square crop
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                    />
                </div>

                {/* Controls Footer */}
                <div className="crop-controls-container">
                    {/* Zoom Slider */}
                    <div className="crop-control-row">
                        <ZoomIn size={16} className="control-icon" />
                        <span className="control-label">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="crop-slider-bar"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Rotation Slider */}
                    <div className="crop-control-row">
                        <RotateCw size={16} className="control-icon" />
                        <span className="control-label">Rotate</span>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="crop-slider-bar"
                            disabled={isSaving}
                        />
                    </div>

                    {/* Actions Row */}
                    <div className="crop-actions-row">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-crop-cancel"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="btn-crop-save"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Processing...' : 'Apply Crop'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ImageCropModal;
