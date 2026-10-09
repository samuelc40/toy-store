import React from "react";
import { RotateCcw } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";
import useFilters from "../hooks/useFilters";

/**
 * OFFO Cute Filters Sidebar Panel.
 */
export function ProductFilters({ activeFilters, onFilterChange, onClearAll }) {
  const { categories, brands } = useFilters();

  const hasActiveFilters =
    Boolean(activeFilters.category) ||
    Boolean(activeFilters.brand) ||
    Boolean(activeFilters.minPrice) ||
    Boolean(activeFilters.maxPrice);

  return (
    <aside className="filters catalog-filters-sidebar-container" aria-label="Filters">
      <div className="head">
        <span className="orb"></span>
        <span className="spark k1">✦</span>
        <span className="spark k2">★</span>
        <span className="spark k3">♥</span>
        <span className="badge">
          <svg viewBox="0 0 24 24">
            <path d="M3 4h18l-7 8.5V20l-4-2v-5.5L3 4z" />
          </svg>
        </span>
        <h2>Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="btn-clear-all-cute-filters"
            title="Clear all active filters"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="filters-sidebar-scroller">
        <PriceFilter
          minPrice={activeFilters.minPrice}
          maxPrice={activeFilters.maxPrice}
          onChange={onFilterChange}
        />

        <CategoryFilter
          categories={categories}
          activeCategory={activeFilters.category}
          onChange={(val) => onFilterChange("category", val)}
        />

        <BrandFilter
          brands={brands}
          activeBrand={activeFilters.brand}
          onChange={(val) => onFilterChange("brand", val)}
        />
      </div>
      <div className="bottom-pad"></div>
    </aside>
  );
}

export default ProductFilters;
