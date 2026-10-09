import React from "react";

const TICK_MARK_SVG = (
  <span className="tick">
    <svg viewBox="0 0 24 24">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </span>
);

/**
 * OFFO Cute Category Filter Component.
 */
export function CategoryFilter({ categories = [], activeCategory, onChange }) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <section className="sec">
      <h3 className="title">
        <i>
          <svg viewBox="0 0 24 24">
            <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
          </svg>
        </i>
        Categories
      </h3>
      <div className="scroll" role="radiogroup" aria-label="Categories">
        <button
          type="button"
          className="row"
          role="radio"
          aria-checked={!activeCategory}
          onClick={() => onChange("")}
        >
          <span>All Categories</span>
          {TICK_MARK_SVG}
        </button>
        {list.map((cat) => {
          const activeStr = String(activeCategory || "")
            .toLowerCase()
            .trim();
          const catIdStr = String(cat.id || "")
            .toLowerCase()
            .trim();
          const catNameStr = String(cat.name || "")
            .toLowerCase()
            .trim();
          const catSlugStr = catNameStr.replace(/\s+/g, "-");

          const isActive =
            activeStr !== "" &&
            (activeStr === catIdStr ||
              activeStr === catNameStr ||
              activeStr === catSlugStr);

          return (
            <button
              key={cat.id}
              type="button"
              className="row"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(String(cat.id))}
            >
              <span>{cat.name}</span>
              {TICK_MARK_SVG}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryFilter;
