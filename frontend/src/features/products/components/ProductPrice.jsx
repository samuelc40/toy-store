import React from "react";

/**
 * Renders the product price range, applying original strikethroughs, sale styles,
 * and saving amount badges (e.g. Save ₹200).
 */
export function ProductPrice({ product, showSavingsBadge = true }) {
  if (!product) return null;

  const { lowest_price, highest_price, original_price, has_offer, discount_percentage } = product;

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  if (lowest_price === undefined || lowest_price === null) {
    return <span className="product-price-label">Price TBD</span>;
  }

  const lowest = Number(lowest_price || 0);
  const original = Number(original_price || 0);
  const isDiscounted = (has_offer || (original > 0 && lowest < original)) && original > lowest;
  const savingsAmount = isDiscounted ? original - lowest : 0;
  const pct = discount_percentage ? Number(discount_percentage) : (isDiscounted ? Math.round((savingsAmount / original) * 100) : 0);

  if (isDiscounted) {
    return (
      <div className="product-pricing-wrapper">
        <div className="price-primary-row">
          <span className="price-sale-green-tag">{formatPrice(lowest_price)}</span>
          <span className="price-original-strikethrough">{formatPrice(original_price)}</span>
        </div>
        {showSavingsBadge && savingsAmount > 0 && (
          <span className="product-savings-badge" title={`You save ₹${savingsAmount.toLocaleString("en-IN")} (${pct}% off)`}>
            Save {formatPrice(savingsAmount)}
          </span>
        )}
      </div>
    );
  }

  // No Sale
  const isRange = lowest_price !== highest_price;
  return (
    <div className="product-pricing-wrapper">
      <span className="product-price-label">
        {isRange
          ? `${formatPrice(lowest_price)} - ${formatPrice(highest_price)}`
          : formatPrice(lowest_price)}
      </span>
    </div>
  );
}

export default ProductPrice;
