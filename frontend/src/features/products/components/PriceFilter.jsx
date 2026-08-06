import React from 'react';

/**
 * Filter container for custom price boundaries.
 */
export function PriceFilter({ minPrice, maxPrice, onChange }) {
    const handleMinChange = (e) => {
        onChange('minPrice', e.target.value);
    };

    const handleMaxChange = (e) => {
        onChange('maxPrice', e.target.value);
    };

    return (
        <div className="catalog-filter-group">
            <h5 className="filter-group-title">Price Range</h5>
            <div className="price-inputs-flex-row">
                <div className="price-input-badge-wrapper">
                    <span className="price-currency-label">Rs.</span>
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={handleMinChange}
                        className="price-range-field-element"
                    />
                </div>
                <span className="price-connector-dash">to</span>
                <div className="price-input-badge-wrapper">
                    <span className="price-currency-label">Rs.</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={handleMaxChange}
                        className="price-range-field-element"
                    />
                </div>
            </div>
        </div>
    );
}

export default PriceFilter;
