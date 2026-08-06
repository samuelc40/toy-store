/**
 * Helper to extract the primary image URL of a product.
 * Looks for the primary variant's primary image, falls back to first available variant image,
 * and returns empty if no images exist.
 */
export const getProductPrimaryImage = (product) => {
    if (!product || !product.variants || product.variants.length === 0) return '';
    
    // Find active, unblocked variants
    const activeVariants = product.variants.filter(v => v.is_active && !v.blocked);
    const variantsToUse = activeVariants.length > 0 ? activeVariants : product.variants;
    
    // Try to find a variant marked as primary, or fallback to first variant
    const primaryVar = variantsToUse.find(v => v.is_primary) || variantsToUse[0];
    if (primaryVar && primaryVar.images && primaryVar.images.length > 0) {
        const primaryImg = primaryVar.images.find(img => img.is_primary) || primaryVar.images[0];
        if (primaryImg && primaryImg.image) {
            if (primaryImg.image.startsWith('http')) return primaryImg.image;
            return `http://localhost:8000${primaryImg.image}`;
        }
    }
    
    return '';
};

/**
 * Helper to get the price information of a product.
 * Returns { lowestPrice, highestPrice, lowestSalePrice, highestSalePrice, hasDiscount, discountPercent }
 */
export const getProductPriceInfo = (product) => {
    const info = {
        lowestPrice: 0,
        highestPrice: 0,
        lowestSalePrice: 0,
        highestSalePrice: 0,
        hasDiscount: false,
        discountPercent: 0
    };

    if (!product || !product.variants || product.variants.length === 0) return info;

    // Filter active, unblocked variants
    const activeVariants = product.variants.filter(v => v.is_active && !v.blocked);
    if (activeVariants.length === 0) return info;

    const prices = activeVariants.map(v => Number(v.price)).filter(p => !isNaN(p));
    const salePrices = activeVariants.map(v => Number(v.sale_price)).filter(p => !isNaN(p) && p > 0);

    if (prices.length > 0) {
        info.lowestPrice = Math.min(...prices);
        info.highestPrice = Math.max(...prices);
    }

    if (salePrices.length > 0) {
        info.lowestSalePrice = Math.min(...salePrices);
        info.highestSalePrice = Math.max(...salePrices);
        
        // Calculate max discount percentage
        const discounts = activeVariants
            .filter(v => v.sale_price && Number(v.sale_price) < Number(v.price))
            .map(v => {
                const diff = Number(v.price) - Number(v.sale_price);
                return Math.round((diff / Number(v.price)) * 100);
            });
        
        if (discounts.length > 0) {
            info.hasDiscount = true;
            info.discountPercent = Math.max(...discounts);
        }
    }

    return info;
};

/**
 * Client-side filter and sorting processor for products.
 * Handles category matching, brand matches, price bounds, blocked states, and sorts.
 */
export const filterAndSortProducts = (products, filters, search, sortOption) => {
    if (!products) return [];

    let result = [...products];

    // 1. Hide blocked and inactive products
    result = result.filter(p => p.is_active && !p.blocked);

    // 2. Hide products without active variants
    result = result.filter(p => p.variants && p.variants.some(v => v.is_active && !v.blocked));

    // 3. Search query filter (if not already filtered by backend)
    if (search && search.trim() !== '') {
        const query = search.toLowerCase().trim();
        result = result.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.category_name && p.category_name.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    // 4. Category filter (UUID)
    if (filters.category) {
        result = result.filter(p => p.category === filters.category);
    }

    // 5. Brand filter
    if (filters.brand) {
        result = result.filter(p => p.brand === filters.brand);
    }

    // 6. Price Range filter (lowest active sale price must be within bounds)
    if (filters.minPrice !== '' || filters.maxPrice !== '') {
        const min = filters.minPrice !== '' ? Number(filters.minPrice) : 0;
        const max = filters.maxPrice !== '' ? Number(filters.maxPrice) : Infinity;

        result = result.filter(p => {
            const priceInfo = getProductPriceInfo(p);
            const activePrice = priceInfo.lowestSalePrice || priceInfo.lowestPrice;
            return activePrice >= min && activePrice <= max;
        });
    }

    // 7. Sorting
    result.sort((a, b) => {
        const aPriceInfo = getProductPriceInfo(a);
        const bPriceInfo = getProductPriceInfo(b);
        const aPrice = aPriceInfo.lowestSalePrice || aPriceInfo.lowestPrice;
        const bPrice = bPriceInfo.lowestSalePrice || bPriceInfo.lowestPrice;

        switch (sortOption) {
            case 'price_low':
                return aPrice - bPrice;
            case 'price_high':
                return bPrice - aPrice;
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'newest':
            default:
                // Fallback to ID comparison
                return b.id.localeCompare(a.id);
        }
    });

    return result;
};
