import React from 'react';
import { Crop, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Component showing list of pending files, compression state, and progress bars.
 */
export function UploadProgress({
    queue,
    onRemove,
    onCropClick,
    onRetry,
    uploading = false,
    overallProgress = 0,
}) {
    if (!queue || queue.length === 0) return null;

    // Helper to format file size
    const formatSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = 1;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="upload-progress-container">
            <div className="upload-progress-header">
                <span className="queue-count-label">Upload Queue ({queue.length} files)</span>
                {uploading && (
                    <span className="overall-percentage-badge">
                        Uploading: {overallProgress}%
                    </span>
                )}
            </div>

            {/* Queue List */}
            <div className="upload-queue-scrollable-list">
                {queue.map((item, index) => {
                    const isError = item.status === 'error';
                    const isCompressing = item.status === 'compressing';
                    const isUploading = item.status === 'uploading';

                    return (
                        <div key={item.id} className={`queue-item-card ${isError ? 'item-failed' : ''}`}>
                            {/* Left: Preview thumbnail */}
                            <div className="queue-item-thumbnail-wrapper">
                                <img
                                    src={item.previewUrl}
                                    alt="Preview"
                                    className="queue-item-thumbnail-img"
                                />
                                {isCompressing && (
                                    <div className="thumbnail-shimmer-overlay">
                                        <span className="shimmer-spin-text">...</span>
                                    </div>
                                )}
                            </div>

                            {/* Center: Info and progress */}
                            <div className="queue-item-info-group">
                                <div className="queue-item-details-row">
                                    <span className="queue-item-filename" title={item.file.name}>
                                        {item.file.name}
                                    </span>
                                    <span className="queue-item-filesize">
                                        {formatSize(item.file.size)}
                                    </span>
                                </div>

                                {/* Status indicators */}
                                {isCompressing && (
                                    <span className="queue-status-text text-compressing">
                                        Optimizing / Compressing image...
                                    </span>
                                )}

                                {isError && (
                                    <span className="queue-status-text text-danger">
                                        <AlertCircle size={12} style={{ marginRight: '3px' }} />
                                        Upload failed: {item.errorMsg || 'Server error'}
                                    </span>
                                )}

                                {isUploading && (
                                    <div className="queue-item-progress-track">
                                        <div
                                            className="queue-item-progress-bar"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right: Actions */}
                            <div className="queue-item-actions">
                                {/* Crop Button (only before uploading) */}
                                {!uploading && !isCompressing && (
                                    <button
                                        type="button"
                                        onClick={() => onCropClick(index)}
                                        className="btn-queue-action btn-queue-crop"
                                        title="Crop Image"
                                    >
                                        <Crop size={14} />
                                    </button>
                                )}

                                {/* Retry Button (if upload failed) */}
                                {isError && !uploading && onRetry && (
                                    <button
                                        type="button"
                                        onClick={onRetry}
                                        className="btn-queue-action btn-queue-retry"
                                        title="Retry Upload"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                )}

                                {/* Remove Button */}
                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.id)}
                                        className="btn-queue-action btn-queue-delete"
                                        title="Remove File"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Overall progress bar during upload */}
            {uploading && (
                <div className="overall-progress-track-wrapper">
                    <div
                        className="overall-progress-bar-el"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export default UploadProgress;
