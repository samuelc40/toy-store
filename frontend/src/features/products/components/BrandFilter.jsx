import React from "react";

const TICK_MARK_SVG = (
  <span className="tick">
    <svg viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </span>
);

/**
 * OFFO Cute Brand Filter Component.
 */
export function BrandFilter({ brands, activeBrand, onChange }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="sec">
      <h3 className="title">
        <i>
          <svg viewBox="0 0 24 24">
            <path d="M3 9l1.5-5h15L21 9v1.5a3 3 0 0 1-5.5 1.7 3 3 0 0 1-5 0A3 3 0 0 1 5 12.2 3 3 0 0 1 3 10.5V9zm2 5.5V21h14v-6.5a5 5 0 0 1-1 .1 4.9 4.9 0 0 1-2.5-.7 5 5 0 0 1-5 0 4.9 4.9 0 0 1-2.5.7 5 5 0 0 1-1-.1z" />
          </svg>
        </i>
        Brands
      </h3>
      <div className="scroll" role="radiogroup" aria-label="Brands">
        <button
          type="button"
          className="row"
          role="radio"
          aria-checked={activeBrand === ""}
          onClick={() => onChange("")}
        >
          <span>All Brands</span>
          {TICK_MARK_SVG}
        </button>
        {brands.map((brand) => (
          <button
            key={brand}
            type="button"
            className="row"
            role="radio"
            aria-checked={activeBrand === brand}
            onClick={() => onChange(brand)}
          >
            <span>{brand}</span>
            {TICK_MARK_SVG}
          </button>
        ))}
      </div>
    </section>
  );
}

export default BrandFilter;
