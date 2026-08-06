import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

/**
 * Custom beautified selector for catalog sorting configurations.
 */
export function ProductSorting({ value, onChange }) {
    const handleSortChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="catalog-sorting-dropdown-container">
            <span className="sorting-prefix-label">
                <ArrowUpDown size={14} className="sorting-icon-prefix" />
                <span>Sort by:</span>
            </span>
            <div className="sorting-select-wrapper">
                <select
                    value={value}
                    onChange={handleSortChange}
                    className="sorting-select-field-element"
                >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_low">Price: Low → High</option>
                    <option value="price_high">Price: High → Low</option>
                    <option value="a_z">Name: A → Z</option>
                    <option value="z_a">Name: Z → A</option>
                </select>
                <ChevronDown size={15} className="sorting-chevron-icon" />
            </div>
        </div>
    );
}

export default ProductSorting;
