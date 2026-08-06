import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../redux/CategoryListingSlice";
import "../styles/CategoriesPage.css";

import mechImg from "../../../assets/product_mech.png";
import diecastImg from "../../../assets/category_diecast.png";
import techImg from "../../../assets/category_tech_toys.png";
import boardGamesImg from "../../../assets/board_games.png";
import buildingSetsImg from "../../../assets/building_sets.png";
import dollsImg from "../../../assets/category_dolls.png";
import guideCoverImg from "../../../assets/collectors_guide_cover.png";

const FALLBACK_IMAGES = [
    mechImg,
    diecastImg,
    techImg,
    boardGamesImg,
    buildingSetsImg,
    dollsImg
];

const TAG_THEMES = [
    { tag: "COLLECTORS", theme: "tag-purple" },
    { tag: "PRECISION", theme: "tag-orange" },
    { tag: "TECH TOYS", theme: "tag-olive" },
    { tag: "FAMILY", theme: "tag-indigo" },
    { tag: "CREATIVITY", theme: "tag-olive" },
    { tag: "IMAGINATION", theme: "tag-magenta" },
];

const CategoriesPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        categories = [],
        loading = false
    } = useSelector(
        state => state.customerCategory || {}
    );

    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    const displayCategories = (Array.isArray(categories) ? categories : []).map((cat, idx) => {
        const themeConfig = TAG_THEMES[idx % TAG_THEMES.length];
        const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

        return {
            id: cat.id,
            name: cat.name,
            tag: cat.name ? cat.name.toUpperCase() : themeConfig.tag,
            tagTheme: themeConfig.theme,
            description: cat.description || "Discover premium toys and collectibles in this category.",
            itemsCount: `${cat.products_count !== undefined ? cat.products_count : 0} ${cat.products_count === 1 ? 'Item' : 'Items'}`,
            image: cat.image || fallbackImg,
        };
    });

    if (loading && displayCategories.length === 0) {
        return (
            <div className="categories-loading-container">
                <div className="categories-spinner"></div>
                <p>Loading Vault Categories...</p>
            </div>
        );
    }

    return (
        <div className="categories-page-wrapper">
            <div className="categories-page-container">
                {/* Header Section */}
                <header className="categories-header-section">
                    <h1 className="vault-main-title">
                        Explore the <span className="vault-highlight-italic">Categories</span>
                    </h1>
                    <p className="vault-sub-title">
                        Discover toys for every age, hobby, and imagination. From high-octane racing
                        models to the deepest lore of the collectors' universe.
                    </p>
                </header>

                {/* Grid of Category Cards */}
                {displayCategories.length === 0 ? (
                    <div className="categories-empty-state" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                        <h3>No categories found</h3>
                        <p>Check back soon for new arrivals!</p>
                    </div>
                ) : (
                    <div className="categories-cards-grid">
                        {displayCategories.map((category) => (
                            <div
                                key={category.id}
                                className="vault-category-card"
                                onClick={() => navigate(`/products?category=${category.id}`)}
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="vault-card-bg-image"
                                />

                                {/* Frosted Glass Bottom Overlay */}
                                <div className="vault-card-frosted-overlay">
                                    <div className={`vault-card-tag ${category.tagTheme}`}>
                                        {category.tag}
                                    </div>
                                    <h3 className="vault-card-title">{category.name}</h3>
                                    <div className="vault-card-footer-row">
                                        <span className="vault-card-desc">{category.description}</span>
                                        <span className="vault-card-count">{category.itemsCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Collector's Exclusive Banner */}
                <div className="collector-banner-wrapper">
                    <div className="collector-banner-content">
                        <div className="collector-badge">
                            <span className="lightning-icon">⚡</span> COLLECTOR'S EXCLUSIVE
                        </div>
                        <h2 className="collector-banner-heading">
                            The 2024 Kinetic <span className="highlight-yellow">Collector's Guide</span> is here.
                        </h2>
                        <p className="collector-banner-paragraph">
                            Dive into our curated selection of limited edition pieces, behind-the-scenes
                            toy design stories, and upcoming vault releases.
                        </p>
                        <button
                            className="collector-banner-cta"
                            onClick={() => navigate("/products")}
                        >
                            Explore now
                        </button>
                    </div>

                    <div className="collector-banner-graphic-container">
                        <div className="collector-book-glow"></div>
                        <img
                            src={guideCoverImg}
                            alt="2024 Collector's Guide"
                            className="collector-book-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;