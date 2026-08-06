export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validates a single image file for size and type constraints.
 * Returns null if valid, or a string error message if invalid.
 */
export const validateImageFile = (file) => {
    if (!file) return 'No file provided.';

    // Check file extension
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.includes(extension);
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!hasValidExtension || !hasValidMime) {
        return `Unsupported format for "${file.name}". Only JPG, JPEG, PNG, and WebP are allowed.`;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB file size limit.`;
    }

    return null;
};

export default validateImageFile;
