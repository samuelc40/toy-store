import React from 'react';

/**
 * Renders the product price range, applying original strikethroughs and sale styles.
 */
export function ProductPrice({ product }) {
    const { lowest_price, highest_price, original_price, has_offer } = product;

    const formatPrice = (val) => {
        const num = Number(val);
        if (isNaN(num)) return val;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    if (lowest_price === undefined || lowest_price === null) {
        return <span className="product-price-label">Price TBD</span>;
    }

    if (has_offer && original_price) {
        const isRange = lowest_price !== highest_price;
        return (
            <div className="product-pricing-wrapper">
                <span className="price-original-strikethrough">{formatPrice(original_price)}</span>
                <span className="price-sale-green-tag"> {formatPrice(lowest_price)}</span>
                {/* {isRange && <span className="price-range-indicator-label"> (Range)</span>} */}
            </div>
        );
    }

    // No Sale
    const isRange = lowest_price !== highest_price;
    return (
        <div className="product-pricing-wrapper">
            <span className="product-price-label">
                {isRange ? `${formatPrice(lowest_price)} - ${formatPrice(highest_price)}` : formatPrice(lowest_price)}
            </span>
        </div>
    );
}

export default ProductPrice;
