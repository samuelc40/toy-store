import React from 'react';

/**
 * Filter list of brand options.
 */
export function BrandFilter({ brands, activeBrand, onChange }) {
    if (!brands || brands.length === 0) return null;

    return (
        <div className="catalog-filter-group">
            <h5 className="filter-group-title">Brands</h5>
            <div className="filter-buttons-stack">
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className={`btn-filter-option-item ${activeBrand === '' ? 'active-filter' : ''}`}
                >
                    All Brands
                </button>
                {brands.map((brand) => (
                    <button
                        key={brand}
                        type="button"
                        onClick={() => onChange(brand)}
                        className={`btn-filter-option-item ${activeBrand === brand ? 'active-filter' : ''}`}
                    >
                        {brand}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default BrandFilter;
