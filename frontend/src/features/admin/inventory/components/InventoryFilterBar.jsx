import React from "react";
import { Search, RotateCcw, Filter, ArrowUpDown } from "lucide-react";

export function InventoryFilterBar({
    searchQuery,
    onSearchChange,
    sortOrder,
    onSortChange,
    stockStatusFilter,
    onStockStatusChange,
    statusFilter,
    onStatusChange,
    onClearFilters,
}) {
    const hasActiveFilters =
        searchQuery ||
        sortOrder !== "newest" ||
        stockStatusFilter !== "ALL" ||
        statusFilter !== "ALL";

    return (
        <div className="inventory-filter-bar-card">
            {/* Search Box */}
            <div className="inventory-search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by product name, variant, SKU, brand..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                    <button
                        type="button"
                        className="clear-search-x-btn"
                        onClick={() => onSearchChange("")}
                        title="Clear search"
                    >
                        &times;
                    </button>
                )}
            </div>

            {/* Controls Row */}
            <div className="inventory-controls-group">
                {/* Stock Status Filter */}
                <div className="filter-select-box">
                    <Filter size={15} className="select-icon" />
                    <select
                        value={stockStatusFilter}
                        onChange={(e) => onStockStatusChange(e.target.value)}
                    >
                        <option value="ALL">All Stock Statuses</option>
                        <option value="IN_STOCK">In Stock (6+)</option>
                        <option value="LOW_STOCK">Low Stock (1-5)</option>
                        <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                    </select>
                </div>

                {/* Product/Variant Status Filter */}
                <div className="filter-select-box">
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                    >
                        <option value="ALL">All Availability</option>
                        <option value="ACTIVE">Active Products</option>
                        <option value="INACTIVE">Inactive Products</option>
                        <option value="BLOCKED">Blocked Products</option>
                    </select>
                </div>

                {/* Sort Dropdown */}
                <div className="filter-select-box">
                    <ArrowUpDown size={15} className="select-icon" />
                    <select
                        value={sortOrder}
                        onChange={(e) => onSortChange(e.target.value)}
                    >
                        <option value="newest">Recently Updated</option>
                        <option value="oldest">Oldest First</option>
                        <option value="lowest_stock">Stock: Low to High</option>
                        <option value="highest_stock">Stock: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                        <option value="highest_price">Price: High to Low</option>
                        <option value="lowest_price">Price: Low to High</option>
                    </select>
                </div>

                {/* Clear Filters CTA */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="btn-clear-inventory-filters"
                    >
                        <RotateCcw size={15} />
                        <span>Clear Filters</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default InventoryFilterBar;
