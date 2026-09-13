import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles, Tag, Gift } from "lucide-react";
import { fetchCustomerHero } from "../products/services/productListingService";

import heroToy from "../../assets/landing_hero_toy.png";
import prodMech from "../../assets/product_mech.png";
import catMonsterTruck from "../../assets/category_monster_truck.png";
import prodDrone from "../../assets/product_drone.png";
import cyberToyCar from "../../assets/cyber_toy_car.png";

const FALLBACK_SLIDES = [
    {
        id: "cyber-shredder",
        name: "Cyber Shredder V3",
        tagline: "High-Velocity Electric Racer",
        price: 12999,
        original_price: 15999,
        badge: "🔥 HOT PICK",
        image: cyberToyCar,
        category: "RC Cars",
        url: "/products"
    },
    {
        id: "super-drift-x1",
        name: "Super Drift X1 Beast",
        tagline: "Pro Series RC Speedster",
        price: 8499,
        original_price: 9999,
        badge: "⚡ 20% OFF",
        image: catMonsterTruck,
        category: "RC Cars",
        url: "/products"
    },
    {
        id: "titan-mech-v2",
        name: "Titan Mech Armor V2",
        tagline: "Collectible Desktop Tech",
        price: 4999,
        original_price: 5999,
        badge: "⭐ FEATURED",
        image: prodMech,
        category: "Tech Toys",
        url: "/products"
    },
    {
        id: "drone-z-mini",
        name: "Drone-Z Stealth Mini",
        tagline: "HD Camera Remote Gadget",
        price: 6499,
        original_price: 7499,
        badge: "🚀 NEW ARRIVAL",
        image: prodDrone,
        category: "Gadgets",
        url: "/products"
    }
];

const OFFERS_VAULT_SLIDE = {
    id: "all-offers-vault-slide",
    name: "Store-Wide Offers Vault 🎁",
    tagline: "Unlock up to 50% OFF discounts on top toy categories & deals!",
    price: "SPECIAL DEALS",
    badge: "🔥 OFFERS VAULT",
    image: heroToy,
    isOffersSlide: true,
    url: "/offers"
};

const HeroCard = () => {
    const navigate = useNavigate();
    const [heroData, setHeroData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);

    useEffect(() => {
        let isMounted = true;
        fetchCustomerHero()
            .then((res) => {
                if (isMounted) {
                    const data = res?.hero || res;
                    setHeroData(data);
                }
            })
            .catch(() => {
                if (isMounted) setHeroData(null);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const backendProducts = heroData?.products || [];
    const baseSlides = backendProducts.length > 0
        ? backendProducts.map((p, idx) => ({
            id: p.id,
            name: p.name,
            tagline: p.description || p.category || "Exclusive Toy Store Selection",
            price: p.lowest_price !== undefined ? p.lowest_price : p.price || 999,
            original_price: p.original_price || null,
            badge: heroData?.discount ? `🔥 ${heroData.discount}` : idx === 0 ? "🔥 SPECIAL OFFER" : "⭐ FEATURED",
            image: p.primary_image || [cyberToyCar, catMonsterTruck, prodMech, prodDrone][idx % 4],
            category: p.category || "Toys",
            url: `/products/${p.id}`
        }))
        : FALLBACK_SLIDES;

    // Append special "Offers Vault" slide to carousel
    const slides = [...baseSlides, OFFERS_VAULT_SLIDE];

    useEffect(() => {
        if (isHovered || slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isHovered, slides.length]);

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        if (diff > 40) {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        } else if (diff < -40) {
            setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        }
        setTouchStartX(null);
    };

    if (loading) {
        return (
            <div className="hero-card hero-card-skeleton" style={{'width': '70%'}}>
                <div className="hero-skeleton-badge"></div>
                <div className="hero-skeleton-title"></div>
                <div className="hero-skeleton-title"></div>
                <div className="hero-skeleton-subtitle"></div>
                <div className="hero-skeleton-title"></div>
                <div className="hero-skeleton-subtitle"></div>
                <div className="hero-skeleton-btn"></div>
            </div>
        );
    }

    const currentSlide = slides[currentIndex % slides.length];

    const handleItemClick = () => {
        if (currentSlide?.url) {
            navigate(currentSlide.url);
        } else {
            navigate("/products");
        }
    };

    const handleOffersButtonClick = (e) => {
        e.stopPropagation();
        navigate("/offers");
    };

    return (
        <div
            className="hero-banner-slider-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleItemClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleItemClick()}
        >
            {/* 1. Full Cover Background Image & Dark Offer Gradient Overlay */}
            <div className="hero-slider-bg-cover-wrapper">
                <img
                    key={currentSlide.id}
                    src={currentSlide.image}
                    alt={currentSlide.name}
                    className="hero-slider-bg-cover-img"
                    onError={(e) => {
                        e.target.src = heroToy;
                    }}
                />
                <div className="hero-slider-bg-overlay offer-gradient-overlay"></div>
            </div>

            {/* 2. Header Row: Badge, All Offers Quick CTA & Nav Controls */}
            <div className="hero-slider-header">
                <div className="hero-slider-header-left">
                    <span className="hero-slider-badge-pill">
                        {currentSlide.badge}
                    </span>
                    <button
                        type="button"
                        className="btn-all-offers-chip"
                        onClick={handleOffersButtonClick}
                        title="View All Store Offers"
                    >
                        <Tag size={13} /> All Offers
                    </button>
                </div>

                <div className="hero-slider-nav-arrows">
                    <button
                        type="button"
                        className="slider-nav-btn btn-prev"
                        onClick={handlePrev}
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        className="slider-nav-btn btn-next"
                        onClick={handleNext}
                        aria-label="Next Slide"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* 3. Middle Details: Title, Tagline & Price Tag */}
            <div className="hero-slider-content-single">
                <div className="hero-slider-text-details">
                    <h2 className="hero-slider-title">{currentSlide.name}</h2>
                    <p className="hero-slider-tagline">{currentSlide.tagline}</p>
                </div>

                <div className="hero-slider-price-tag">
                    {typeof currentSlide.price === "number" ? (
                        <>
                            <span className="slider-current-price">₹{currentSlide.price}</span>
                            {currentSlide.original_price && (
                                <span className="slider-orig-price">₹{currentSlide.original_price}</span>
                            )}
                        </>
                    ) : (
                        <span className="slider-current-price offer-highlight-text">{currentSlide.price}</span>
                    )}
                </div>
            </div>

            {/* 4. Footer: Pagination Dots & Action Button */}
            <div className="hero-slider-footer">
                <div className="hero-slider-dots">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            type="button"
                            className={`slider-dot ${idx === currentIndex ? "active" : ""} ${slide.isOffersSlide ? "offers-dot" : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex(idx);
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className={`btn-slider-action ${currentSlide.isOffersSlide ? "btn-offers-action" : ""}`}
                    onClick={currentSlide.isOffersSlide ? handleOffersButtonClick : handleItemClick}
                >
                    {currentSlide.isOffersSlide ? (
                        <>
                            Explore Offers <Sparkles size={16} />
                        </>
                    ) : (
                        <>
                            Shop Item <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default HeroCard;
