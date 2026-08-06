/**
 * Client-side image compression using HTML Canvas.
 * Resizes the image to a maximum dimension (default 1920px) keeping aspect ratio
 * and exports to webp (or jpeg if unsupported) at the specified quality (default 85%).
 */
export const compressImage = (file, maxDimension = 1920, quality = 0.85) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale dimensions down if they exceed the maximum dimension limit
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context could not be created'));
                    return;
                }

                // Draw image on canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Detect WebP support via dummy test or directly output to webp
                let mimeType = 'image/jpeg';
                const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
                if (supportsWebP) {
                    mimeType = 'image/webp';
                }

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Image conversion failed'));
                            return;
                        }

                        const ext = mimeType === 'image/webp' ? '.webp' : '.jpg';
                        // Keep original base name but strip previous extension and swap in the target extension
                        const originalName = file.name;
                        const lastIndex = originalName.lastIndexOf('.');
                        const baseName = lastIndex !== -1 ? originalName.substring(0, lastIndex) : originalName;

                        const compressedFile = new File([blob], `${baseName}${ext}`, {
                            type: mimeType,
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    mimeType,
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default compressImage;
