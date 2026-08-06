import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';

/**
 * Dropzone component that supports drag and drop, browsing files, and pasting from clipboard.
 */
export function ImageDropzone({ onFilesSelected, disabled = false }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const dropzoneRef = useRef(null);

    // Click trigger to browse
    const handleBrowseClick = () => {
        if (disabled) return;
        fileInputRef.current?.click();
    };

    // File input selection
    const handleFileChange = (e) => {
        if (disabled) return;
        onFilesSelected(e.target.files);
        // Clear input value so selecting the same file again triggers change event
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragActive(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setIsDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    };

    // Clipboard Paste Listener
    useEffect(() => {
        const handlePaste = (e) => {
            if (disabled) return;
            // Only capture paste if active element is body or inside the modal (prevents intercepting text input pasting)
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                onFilesSelected(e.clipboardData.files);
                e.preventDefault();
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onFilesSelected, disabled]);

    return (
        <div
            ref={dropzoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`image-dropzone-container ${isDragActive ? 'drag-active' : ''} ${
                disabled ? 'dropzone-disabled' : ''
            }`}
        >
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={disabled}
            />

            <div className="dropzone-content-wrapper">
                <div className="dropzone-icon-badge">
                    <UploadCloud size={24} />
                </div>
                <div className="dropzone-text-group">
                    <p className="dropzone-title">
                        {disabled ? 'Uploading images...' : 'Drag & drop images here'}
                    </p>
                    <p className="dropzone-subtitle">
                        {disabled
                            ? 'Please wait until current upload completes'
                            : 'Or click to browse from device. Paste support active (Ctrl+V)'}
                    </p>
                </div>
                <div className="dropzone-formats-badge">
                    <span>JPG, JPEG, PNG, WEBP • Max 5MB</span>
                </div>
            </div>
        </div>
    );
}

export default ImageDropzone;
