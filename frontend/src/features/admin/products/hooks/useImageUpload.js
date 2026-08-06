import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import validateImageFile from '../utils/imageValidation';
import compressImage from '../utils/imageCompression';
import { uploadVariantImagesAsync } from '../redux/variantSlice';

/**
 * Custom hook to manage the variant image upload queue, cropping triggers,
 * canvas compression, and multipart progress tracking.
 */
export const useImageUpload = (variantId, existingImagesCount, onUploadSuccess) => {
    const dispatch = useDispatch();

    // The queue: Array of { id, file, originalFile, progress, status, previewUrl, errorMsg }
    // Status can be: 'idle' | 'compressing' | 'uploading' | 'success' | 'error'
    const [queue, setQueue] = useState([]);
    const [activeCropIndex, setActiveCropIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);

    // Clears the queue and revokes object URLs
    const clearQueue = useCallback(() => {
        queue.forEach((item) => {
            if (item.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }
        });
        setQueue([]);
        setUploading(false);
        setOverallProgress(0);
        setActiveCropIndex(null);
    }, [queue]);

    // File selection handler
    const handleFilesAdded = useCallback(async (files) => {
        if (!files || files.length === 0) return;

        const fileList = Array.from(files);
        const totalPendingCount = queue.length + existingImagesCount;

        if (totalPendingCount + fileList.length > 10) {
            toast.warning('Maximum 10 images allowed per product variant.');
            return;
        }

        const newQueueItems = [];

        for (const file of fileList) {
            // 1. Validate file format and size (Max 5MB)
            const validationError = validateImageFile(file);
            if (validationError) {
                toast.error(validationError);
                continue;
            }

            const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            const previewUrl = URL.createObjectURL(file);

            newQueueItems.push({
                id,
                file,
                originalFile: file, // Keep reference to original file
                progress: 0,
                status: 'idle',
                previewUrl,
                errorMsg: null,
            });
        }

        if (newQueueItems.length > 0) {
            setQueue((prev) => [...prev, ...newQueueItems]);

            // Auto-compress the newly added items
            for (const item of newQueueItems) {
                try {
                    setQueue((prev) =>
                        prev.map((q) => (q.id === item.id ? { ...q, status: 'compressing' } : q))
                    );

                    const compressedFile = await compressImage(item.file);
                    const newPreview = URL.createObjectURL(compressedFile);

                    // Revoke old object URL
                    URL.revokeObjectURL(item.previewUrl);

                    setQueue((prev) =>
                        prev.map((q) =>
                            q.id === item.id
                                ? {
                                      ...q,
                                      file: compressedFile,
                                      previewUrl: newPreview,
                                      status: 'idle',
                                  }
                                : q
                        )
                    );
                } catch (err) {
                    console.error('Image compression failed:', err);
                    // Fallback to original uncompressed file if compression fails
                    setQueue((prev) =>
                        prev.map((q) => (q.id === item.id ? { ...q, status: 'idle' } : q))
                    );
                }
            }
        }
    }, [queue.length, existingImagesCount]);

    // Remove queued file
    const removeFile = useCallback((id) => {
        setQueue((prev) => {
            const fileToRemove = prev.find((item) => item.id === id);
            if (fileToRemove && fileToRemove.previewUrl) {
                URL.revokeObjectURL(fileToRemove.previewUrl);
            }
            return prev.filter((item) => item.id !== id);
        });
    }, []);

    // Crop triggers
    const openCropper = useCallback((index) => {
        setActiveCropIndex(index);
    }, []);

    const closeCropper = useCallback(() => {
        setActiveCropIndex(null);
    }, []);

    // Save cropped canvas Blob
    const saveCroppedImage = useCallback((index, croppedBlob) => {
        setQueue((prev) => {
            const newQueue = [...prev];
            const target = newQueue[index];
            if (!target) return prev;

            const nameWithoutExt = target.file.name.substring(0, target.file.name.lastIndexOf('.'));
            const extension = target.file.type === 'image/webp' ? '.webp' : '.jpg';
            const croppedFile = new File([croppedBlob], `${nameWithoutExt}-cropped${extension}`, {
                type: target.file.type,
                lastModified: Date.now(),
            });

            if (target.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
            }
            const newPreviewUrl = URL.createObjectURL(croppedFile);

            newQueue[index] = {
                ...target,
                file: croppedFile,
                previewUrl: newPreviewUrl,
                status: 'idle',
            };

            return newQueue;
        });
        setActiveCropIndex(null);
    }, []);

    // Submit queue to backend
    const uploadImages = useCallback(async () => {
        if (queue.length === 0) return;

        const totalImagesCount = queue.length + existingImagesCount;

        if (totalImagesCount < 3) {
            toast.warning(`A variant must have at least 3 images. You need to upload ${3 - existingImagesCount} more.`);
            return;
        }

        setUploading(true);
        setOverallProgress(0);

        setQueue((prev) => prev.map((item) => ({ ...item, status: 'uploading', progress: 0 })));

        const filesToUpload = queue.map((item) => item.file);

        try {
            const resultAction = await dispatch(
                uploadVariantImagesAsync({
                    variantId,
                    files: filesToUpload,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setOverallProgress(percentCompleted);
                        setQueue((prev) =>
                            prev.map((item) => ({ ...item, progress: percentCompleted }))
                        );
                    },
                })
            );

            if (uploadVariantImagesAsync.fulfilled.match(resultAction)) {
                toast.success('Images uploaded successfully.');
                clearQueue();
                if (onUploadSuccess) onUploadSuccess();
            } else {
                const apiError = resultAction.payload;
                throw new Error(
                    typeof apiError === 'string'
                        ? apiError
                        : apiError?.message || apiError?.detail || 'Upload failed'
                );
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(err.message || 'Failed to upload images.');
            setQueue((prev) =>
                prev.map((item) => ({
                    ...item,
                    status: 'error',
                    errorMsg: err.message || 'Upload failed',
                }))
            );
            setUploading(false);
        }
    }, [queue, existingImagesCount, variantId, dispatch, onUploadSuccess, clearQueue]);

    return {
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
        clearQueue,
    };
};

export default useImageUpload;
