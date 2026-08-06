import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Cpu,
    Zap,
    RotateCw,
    Gamepad2,
    Puzzle,
    Rocket,
    Dice5,
    Wand2,
    Gift
} from "lucide-react";
import "./HomePage.css";


// Import images
import heroToy from "../../assets/landing_hero_toy.png";
import catMonsterTruck from "../../assets/category_monster_truck.png";
import catDiecast from "../../assets/category_diecast.png";
import catTechToys from "../../assets/category_tech_toys.png";
import catDolls from "../../assets/category_dolls.png";
import catGarage from "../../assets/category_garage.png";
import prodMech from "../../assets/product_mech.png";
import prodDrone from "../../assets/product_drone.png";
import cyberToyCar from "../../assets/cyber_toy_car.png";
import retroHotRod from "../../assets/retro_hot_rod.png";
import neonDriftCar from "../../assets/neon_drift_car.png";


function HomePage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    // Generate random background floating toy elements
    const [floatingToys] = useState(() => {
        const icons = ["gamepad", "puzzle", "rocket", "dice", "wand", "gift", "bear", "star", "car", "rocket2", "dice2", "gift2", "remote", "puzzle2", "t", "o", "y"];
        return Array.from({ length: 12 }).map((_, idx) => ({
            id: idx,
            iconType: icons[idx % icons.length],
            size: Math.floor(Math.random() * 100) + 16,
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 80 + 10}%`,
            delay: `${Math.random() * 1}s`,
            duration: `${Math.random() * 10 + 12}s`,
            opacity: Math.random() * 0.12 + 0.04,
        }));
    });

    const renderFloatingToyIcon = (type, size) => {
        switch (type) {
            case "gamepad": return <Gamepad2 size={size} />;
            case "puzzle": return <Puzzle size={size} />;
            case "rocket": return <Rocket size={size} />;
            case "dice": return <Dice5 size={size} />;
            case "wand": return <Wand2 size={size} />;
            case "gift": return <Gift size={size} />;
            case "bear": return <div><span style={{ 'font-size': '100px' }}>🧸</span></div>
            case "star": return <div><span style={{ 'font-size': '50px' }}>⭐</span></div>
            case "remote": return <div><span style={{ 'font-size': '100px' }}>🎮</span></div>
            case "car": return <div><span style={{ 'font-size': '100px' }}>🚗</span></div>
            case "puzzle2": return <div><span style={{ 'font-size': '100px' }}>🧩</span></div>
            case "dice2": return <div><span style={{ 'font-size': '100px' }}>🎲</span></div>
            case "gift2": return <div><span style={{ 'font-size': '100px' }}>🎁</span></div>
            case "rocket2": return <div><span style={{ 'font-size': '100px' }}>🚀</span></div>
            case "t": return <div style={{ 'font-size': '100px' }}>
                <span className="logo-letter logo-letter-t">T</span>
            </div>;
            case "o": return <div style={{ 'font-size': '100px' }}>
                <span className="logo-letter logo-letter-o">o</span>
            </div>;
            case "y": return <div style={{ 'font-size': '100px' }}>
                <span className="logo-letter logo-letter-y">y</span>
            </div>;
            default: return null;
        }
    };

    // Showroom State
    const [selectedCar, setSelectedCar] = useState(0);
    const [isEngineOn, setIsEngineOn] = useState(false);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const colors = [
        { name: "Original", value: "#ffffff", rgb: "255, 255, 255", hue: 0 },
        { name: "Neon Cyan", value: "#00f0ff", rgb: "0, 240, 255", hue: 180 },
        { name: "Toxic Lime", value: "#39ff14", rgb: "57, 255, 20", hue: 90 },
        { name: "Inferno Orange", value: "#ff6600", rgb: "255, 102, 0", hue: 45 },
        { name: "Electric Violet", value: "#8c52ff", rgb: "140, 82, 255", hue: 280 }
    ];

    const showroomCars = [
        {
            name: "Cyber Shredder V3",
            class: "HYPER CYBERPUNK",
            image: cyberToyCar,
            desc: "Powered by electric neon fusion, this model features independent rear suspension and customizable cybernetic underglow.",
            accentColor: "#00f0ff",
            accentColorRgb: "0, 240, 255",
            stats: { speed: "98%", battery: "6 hours", scale: "1:10" }
        },
        {
            name: "Retro Flame Hot Rod",
            class: "DIECAST CLASSIC",
            image: retroHotRod,
            desc: "A timeless hand-polished diecast body. Features a massive chrome engine intake and heavy-duty rubber racing wheels.",
            accentColor: "#ff3333",
            accentColorRgb: "255, 51, 51",
            stats: { speed: "85%", material: "Zamak Alloy", scale: "1:18" }
        },
        {
            name: "Inferno Drift Tuner",
            class: "STREET DRIFTER",
            image: neonDriftCar,
            desc: "Designed for track performance, this low-profile tuner comes equipped with drift-slick tires and a carbon fiber tail wing.",
            accentColor: "#ff9900",
            accentColorRgb: "255, 153, 0",
            stats: { speed: "94%", drift: "Extreme", scale: "1:12" }
        }
    ];

    const currentCar = showroomCars[selectedCar];
    const currentColor = colors[selectedColorIndex];

    const triggerSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setTimeout(() => {
            setIsSpinning(false);
        }, 1200);
    };


    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            alert(`Thanks for joining the club, ${email}!`);
            setEmail("");
        }
    };

    const categories = [
        { id: "rc-cars", title: "RC Speed Beasts", className: "cat-card-monster", image: catMonsterTruck },
        { id: "diecast", title: "Diecast Classics", className: "cat-card-diecast", image: catDiecast },
        { id: "tech-toys", title: "STEM Tech & Gadgets", className: "cat-card-tech", image: catTechToys },
        { id: "dolls", title: "Dolls & Figures", className: "cat-card-dolls", image: catDolls },
        {
            id: "garages",
            title: "Miniature Showrooms",
            className: "cat-card-garage",
            image: catGarage,
            desc: "Give your custom speedsters the dream garage they deserve!"
        }
    ];

    const products = [
        {
            id: 1,
            title: "Super Drift X1",
            price: 12999,
            subtitle: "RC speeds for elite series",
            image: catMonsterTruck,
            tag: "HOT"
        },
        {
            id: 2,
            title: "Titan Mech V2",
            price: 845,
            subtitle: "Collectible Tech Toys",
            image: prodMech,
            tag: null
        },
        {
            id: 3,
            title: "Luxury Garage",
            price: 1590,
            subtitle: "Display collections",
            image: catGarage,
            tag: null
        },
        {
            id: 4,
            title: "Drone-Z Mini",
            price: 4999,
            subtitle: "Icon & remote gadgets",
            image: prodDrone,
            tag: "NEW"
        }
    ];

    return (
        <div className="homepage-container">
            {/* 1. Hero Section */}
            <section className="hero-section">
                {/* Floating Background Toys */}
                <div className="floating-toys-background" aria-hidden="true">
                    {floatingToys.map((toy) => (
                        <div
                            key={toy.id}
                            className={`floating-toy float-toy-${toy.id % 4}`}
                            style={{
                                left: toy.left,
                                top: toy.top,
                                animationDelay: toy.delay,
                                animationDuration: toy.duration,
                                opacity: toy.opacity,
                                fontSize: `${toy.size}%`,
                                color: "#8c52ff"
                            }}
                        >
                            {renderFloatingToyIcon(toy.iconType, toy.size)}
                        </div>
                    ))}
                </div>

                <div className="hero-left">

                    <span className="hero-badge">✨ NOW ENTERING THE PLAY ZONE</span>
                    <h1 className="hero-title">
                        The Ultimate <br />
                        <span className="logo-letter logo-letter-t">T</span>
                        <span className="logo-letter logo-letter-o">o</span>
                        <span className="logo-letter logo-letter-y">y</span>
                        <span className="logo-store"> Store</span>
                    </h1>
                    <p className="hero-subtitle">
                        Welcome to the ultimate playground of dreams! Unlocking a universe of wonder for kids, kids-at-heart, and hardcore collectors. Speed off with high-velocity RC beasts, display intricate diecast classics, or build your own desktop city!
                    </p>
                    <div className="hero-actions">
                        <button
                            type="button"
                            className="btn-shop-now"
                            onClick={() => navigate("/products")}
                            style={{fontFamily: "'Nunito', sans-serif"}} 
                        >
                            Shop Now
                        </button>
                        <button
                            type="button"
                            className="btn-explore"
                            onClick={() => navigate("/categories")}
                            style={{fontFamily: "'Nunito', sans-serif"}} 
                        >
                            Explore Collections <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
                <div className="hero-right" onClick={() => navigate("/products")}>
                    <div className="hero-card">
                        <img src={heroToy} alt="Featured Collectible Sports Car" className="hero-card-img" />
                    </div>
                </div>
            </section>

            {/* 2. Shop by Category Section */}
            <section className="category-section">
                <div className="category-header">
                    <div className="category-header-left">
                        <h2>Shop by Category</h2>
                        <p>Unbox your next hyper-obsession from our magic toy vaults!</p>
                    </div>
                    <button
                        type="button"
                        className="btn-view-all"
                        onClick={() => navigate("/categories")}
                    >
                        View All Categories <ArrowRight size={14} />
                    </button>
                </div>

                <div className="category-grid">
                    {/* Monster Truck Card */}
                    <div
                        className={`category-card ${categories[0].className}`}
                        onClick={() => navigate(`/products?category=${categories[0].id}`)}
                    >
                        <div className="category-card-img-wrapper">
                            <img src={categories[0].image} alt={categories[0].title} />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-title">{categories[0].title}</h3>
                        </div>
                    </div>

                    {/* Diecast Card */}
                    <div
                        className={`category-card ${categories[1].className}`}
                        onClick={() => navigate(`/products?category=${categories[1].id}`)}
                    >
                        <div className="category-card-img-wrapper">
                            <img src={categories[1].image} alt={categories[1].title} />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-title">{categories[1].title}</h3>
                        </div>
                    </div>

                    {/* Tech Toys Card */}
                    <div
                        className={`category-card ${categories[2].className}`}
                        onClick={() => navigate(`/products?category=${categories[2].id}`)}
                    >
                        <div className="category-card-img-wrapper">
                            <img src={categories[2].image} alt={categories[2].title} />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-title">{categories[2].title}</h3>
                        </div>
                    </div>

                    {/* Dolls Card */}
                    <div
                        className={`category-card ${categories[3].className}`}
                        onClick={() => navigate(`/products?category=${categories[3].id}`)}
                    >
                        <div className="category-card-img-wrapper">
                            <img src={categories[3].image} alt={categories[3].title} />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-title">{categories[3].title}</h3>
                        </div>
                    </div>

                    {/* Miniature Garages Card */}
                    <div
                        className={`category-card ${categories[4].className}`}
                        onClick={() => navigate(`/products?category=${categories[4].id}`)}
                    >
                        <div className="category-card-img-wrapper">
                            <img src={categories[4].image} alt={categories[4].title} />
                        </div>
                        <div className="category-card-content">
                            <h3 className="category-card-title">{categories[4].title}</h3>
                            <p className="category-card-desc">{categories[4].desc}</p>
                        </div>
                    </div>

                    {/* Gadgets Card */}
                    <div className="category-card cat-card-gadgets" onClick={() => navigate("/products?category=gadgets")}>
                        <div className="gadget-icon-circle">
                            <Cpu size={22} />
                        </div>
                        <h3 className="category-card-title">Gadgets</h3>
                        <p className="category-card-desc">New arrivals daily</p>
                    </div>
                </div>
            </section>



            {/* 3. New Arrivals Section */}
            <section className="new-arrivals-section">
                <div className="arrivals-header">
                    <div className="arrivals-header-left">
                        <h2>New Arrivals</h2>
                        <p>The latest treasures have just entered the vault.</p>
                    </div>
                    <div className="slider-controls">
                        <button type="button" className="btn-slider-arrow" aria-label="Previous Slide">
                            <ChevronLeft size={20} />
                        </button>
                        <button type="button" className="btn-slider-arrow" aria-label="Next Slide">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="products-grid">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => navigate(`/products/${product.id}`)}
                        >
                            <div className="product-card-img-wrapper">
                                <img src={product.image} alt={product.title} />
                                {product.tag === "NEW" && (
                                    <span className="product-tag tag-new">New</span>
                                )}
                                {product.tag === "HOT" && (
                                    <span className="product-tag tag-hot">Hot</span>
                                )}
                            </div>
                            <div className="product-card-info">
                                <div className="product-card-meta">
                                    <h3 className="product-card-title">{product.title}</h3>
                                    <p className="product-card-price">₹{product.price}</p>
                                </div>
                                <p className="product-card-subtitle">{product.subtitle}</p>
                                <button
                                    type="button"
                                    className="btn-add-to-cart"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert(`${product.title} added to cart!`);
                                    }}
                                >
                                    <ShoppingCart size={15} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Join the Club Section */}
            <section className="newsletter-section">
                <div className="newsletter-card">
                    <div className="newsletter-left">
                        <h3>Unlock VIP Toy Drops! 🎁</h3>
                        <p>
                            Join the coolest inner circle in the play zone! Get first dibs on rare <br />
                            collectibles, secret restocks, and members-only discounts before they sell out.
                        </p>
                    </div>
                    <div className="newsletter-right">
                        <form onSubmit={handleSubscribe} className="newsletter-form">
                            <input
                                type="email"
                                className="newsletter-input"
                                placeholder="Your favorite email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-newsletter-submit">
                                Sign Me Up!
                            </button>
                        </form>
                    </div>
                    {/* SVG Rocket Overlay */}
                    <div className="newsletter-rocket-overlay" aria-hidden="true">
                        <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 2C8 2 6 6 6 10c0 2.5 1 4.5 2 5.5.5-1.5 1.5-2.5 3-3 1.5.5 2.5 1.5 3 3 1-1 2-3 2-5.5 0-4-2-8-6-8z" />
                            <path d="M9 12h6M12 9v6M19.5 16.5c1.5 1.25 2.5 3.5 2.5 3.5s-2.25-1-3.5-2.5" />
                        </svg>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
