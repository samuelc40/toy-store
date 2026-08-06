import React from 'react';

/**
 * Filter list of category options.
 */
export function CategoryFilter({ categories = [], activeCategory, onChange }) {
    const list = Array.isArray(categories) ? categories : [];

    return (
        <div className="catalog-filter-group">
            <h5 className="filter-group-title">Categories</h5>
            <div className="filter-buttons-stack">
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className={`btn-filter-option-item ${!activeCategory ? 'active-filter' : ''}`}
                >
                    All Categories
                </button>
                {list.map((cat) => {
                    const activeStr = String(activeCategory || '').toLowerCase().trim();
                    const catIdStr = String(cat.id || '').toLowerCase().trim();
                    const catNameStr = String(cat.name || '').toLowerCase().trim();
                    const catSlugStr = catNameStr.replace(/\s+/g, '-');

                    const isActive = activeStr !== '' && (
                        activeStr === catIdStr ||
                        activeStr === catNameStr ||
                        activeStr === catSlugStr
                    );

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onChange(String(cat.id))}
                            className={`btn-filter-option-item ${isActive ? 'active-filter' : ''}`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default CategoryFilter;
