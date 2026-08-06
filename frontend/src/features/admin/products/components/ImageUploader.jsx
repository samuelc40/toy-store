import React from 'react';
import ImageDropzone from './ImageDropzone';
import UploadProgress from './UploadProgress';
import ImageCropModal from './ImageCropModal';
import useImageUpload from '../hooks/useImageUpload';

/**
 * ImageUploader container coordinating selection, validation, cropping,
 * compression, and multipart uploading.
 */
export function ImageUploader({
    variantId,
    existingImagesCount = 0,
    onUploadSuccess,
    hideUploadButton = false,
    queueController = null,
}) {
    // Use external controller if provided, otherwise instantiate internally
    const internalController = useImageUpload(variantId, existingImagesCount, onUploadSuccess);
    const controller = queueController || internalController;

    const {
        queue,
        uploading,
        overallProgress,
        activeCropIndex,
        handleFilesAdded,
        removeFile,
        openCropper,
        closeCropper,
        saveCroppedImage,
        uploadImages,
    } = controller;

    // Get active file being cropped
    const activeCropItem = activeCropIndex !== null ? queue[activeCropIndex] : null;
    const cropImageSrc = activeCropItem ? activeCropItem.previewUrl : null;
    const cropMimeType = activeCropItem ? activeCropItem.file.type : 'image/jpeg';

    const handleCropSave = (croppedBlob) => {
        if (activeCropIndex !== null) {
            saveCroppedImage(activeCropIndex, croppedBlob);
        }
    };

    const hasQueue = queue.length > 0;

    return (
        <div className="variant-images-uploader-section">
            <h5 className="uploader-section-title">Upload New Images</h5>
            
            {/* Dropzone */}
            <ImageDropzone
                onFilesSelected={handleFilesAdded}
                disabled={uploading}
            />

            {/* Queue and upload progress list */}
            <UploadProgress
                queue={queue}
                onRemove={removeFile}
                onCropClick={openCropper}
                onRetry={uploadImages}
                uploading={uploading}
                overallProgress={overallProgress}
            />

            {/* Upload submit action bar */}
            {hasQueue && !hideUploadButton && (
                <div className="uploader-actions-bar">
                    <button
                        type="button"
                        onClick={uploadImages}
                        disabled={uploading}
                        className="btn-uploader-upload"
                    >
                        {uploading ? `Uploading (${overallProgress}%)` : 'Upload Images'}
                    </button>
                </div>
            )}

            {/* Cropper Modal Overlay */}
            <ImageCropModal
                isOpen={activeCropIndex !== null}
                onClose={closeCropper}
                imageSrc={cropImageSrc}
                mimeType={cropMimeType}
                onSave={handleCropSave}
            />
        </div>
    );
}

export default ImageUploader;
