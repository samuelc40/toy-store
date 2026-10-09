import React from "react";

/**
 * OFFO Cute Price Range Filter Component.
 */
export function PriceFilter({ minPrice, maxPrice, onChange }) {
  const handleMinChange = (e) => {
    onChange("minPrice", e.target.value);
  };

  const handleMaxChange = (e) => {
    onChange("maxPrice", e.target.value);
  };

  return (
    <section className="sec">
      <h3 className="title">
        <i>
          <svg viewBox="0 0 24 24">
            <path
              d="M2 12.5V4a2 2 0 0 1 2-2h8.5L22 11.5 12.5 21 2 12.5zM7.5 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
              fillRule="evenodd"
            />
          </svg>
        </i>
        Price Range
      </h3>
      <div className="price">
        <label className="pi">
          <b>Rs.</b>
          <input
            id="min"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Min"
            aria-label="Minimum price"
            value={minPrice || ""}
            onChange={handleMinChange}
          />
        </label>
        <span className="to">to</span>
        <label className="pi">
          <b>Rs.</b>
          <input
            id="max"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Max"
            aria-label="Maximum price"
            value={maxPrice || ""}
            onChange={handleMaxChange}
          />
        </label>
      </div>
    </section>
  );
}

export default PriceFilter;
