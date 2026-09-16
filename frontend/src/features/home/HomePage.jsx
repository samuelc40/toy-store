import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCategories } from "../products/redux/CategoryListingSlice";
import { selectUser, selectIsAuthenticated } from "../auth/authSlice";
import { fetchProductsList } from "../products/services/productListingService";
import { addToCartAsync } from "../cart/redux/cartSlice";
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
  Gift,
  Copy,
  Check,
  LogIn,
  Sparkles,
} from "lucide-react";
import HeroCard from "./HeroCard";
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
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyReferral = () => {
    const refCode = user?.referral_code || "REF-PLAYZONE";
    navigator.clipboard.writeText(refCode);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    const variantId =
      product.default_variant_id ||
      (product.rawProduct?.variants && product.rawProduct.variants[0]?.id);

    if (!variantId) {
      navigate(`/products/${product.id}`);
      return;
    }

    dispatch(addToCartAsync({ variantId, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success(`${product.name} added to cart!`);
      })
      .catch((err) => {
        toast.error(err || "Failed to add item to cart.");
      });
  };

  const {
    categories: fetchedCategories = [],
    loading: categoriesLoading = false,
  } = useSelector((state) => state.customerCategory || {});

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const FALLBACK_CATEGORY_IMAGES = [
    catMonsterTruck,
    catDiecast,
    catTechToys,
    catDolls,
    catGarage,
    prodMech,
  ];

  // Generate random background floating toy elements
  const [floatingToys] = useState(() => {
    const icons = [
      "gamepad",
      "puzzle",
      "rocket",
      "dice",
      "wand",
      "gift",
      "bear",
      "star",
      "car",
      "rocket2",
      "dice2",
      "gift2",
      "remote",
      "puzzle2",
      "t",
      "o",
      "y",
    ];
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
      case "gamepad":
        return <Gamepad2 size={size} />;
      case "puzzle":
        return <Puzzle size={size} />;
      case "rocket":
        return <Rocket size={size} />;
      case "dice":
        return <Dice5 size={size} />;
      case "wand":
        return <Wand2 size={size} />;
      case "gift":
        return <Gift size={size} />;
      case "bear":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🧸</span>
          </div>
        );
      case "star":
        return (
          <div>
            <span style={{ fontSize: "50px" }}>⭐</span>
          </div>
        );
      case "remote":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🎮</span>
          </div>
        );
      case "car":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🚗</span>
          </div>
        );
      case "puzzle2":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🧩</span>
          </div>
        );
      case "dice2":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🎲</span>
          </div>
        );
      case "gift2":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🎁</span>
          </div>
        );
      case "rocket2":
        return (
          <div>
            <span style={{ fontSize: "100px" }}>🚀</span>
          </div>
        );
      case "t":
        return (
          <div style={{ fontSize: "100px" }}>
            <span className="logo-letter logo-letter-t">T</span>
          </div>
        );
      case "o":
        return (
          <div style={{ fontSize: "100px" }}>
            <span className="logo-letter logo-letter-o">o</span>
          </div>
        );
      case "y":
        return (
          <div style={{ fontSize: "100px" }}>
            <span className="logo-letter logo-letter-y">y</span>
          </div>
        );
      default:
        return null;
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
    {
      name: "Electric Violet",
      value: "#8c52ff",
      rgb: "140, 82, 255",
      hue: 280,
    },
  ];

  const showroomCars = [
    {
      name: "Cyber Shredder V3",
      class: "HYPER CYBERPUNK",
      image: cyberToyCar,
      desc: "Powered by electric neon fusion, this model features independent rear suspension and customizable cybernetic underglow.",
      accentColor: "#00f0ff",
      accentColorRgb: "0, 240, 255",
      stats: { speed: "98%", battery: "6 hours", scale: "1:10" },
    },
    {
      name: "Retro Flame Hot Rod",
      class: "DIECAST CLASSIC",
      image: retroHotRod,
      desc: "A timeless hand-polished diecast body. Features a massive chrome engine intake and heavy-duty rubber racing wheels.",
      accentColor: "#ff3333",
      accentColorRgb: "255, 51, 51",
      stats: { speed: "85%", material: "Zamak Alloy", scale: "1:18" },
    },
    {
      name: "Inferno Drift Tuner",
      class: "STREET DRIFTER",
      image: neonDriftCar,
      desc: "Designed for track performance, this low-profile tuner comes equipped with drift-slick tires and a carbon fiber tail wing.",
      accentColor: "#ff9900",
      accentColorRgb: "255, 153, 0",
      stats: { speed: "94%", drift: "Extreme", scale: "1:12" },
    },
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

  const fallbackCategories = [
    {
      id: "rc-cars",
      title: "RC Speed Beasts",
      name: "RC Speed Beasts",
      image: catMonsterTruck,
      description: "High-velocity remote control beasts for elite racing.",
      products_count: 12,
    },
    {
      id: "diecast",
      title: "Diecast Classics",
      name: "Diecast Classics",
      image: catDiecast,
      description: "Intricate hand-polished collectible diecast vehicles.",
      products_count: 8,
    },
    {
      id: "tech-toys",
      title: "STEM Tech & Gadgets",
      name: "STEM Tech & Gadgets",
      image: catTechToys,
      description: "Interactive robotics, drones and educational tech.",
      products_count: 15,
    },
    {
      id: "dolls",
      title: "Dolls & Figures",
      name: "Dolls & Figures",
      image: catDolls,
      description: "Detailed action figures and collectible character dolls.",
      products_count: 10,
    },
    {
      id: "garages",
      title: "Miniature Showrooms",
      name: "Miniature Showrooms",
      image: catGarage,
      description: "Give your custom speedsters the dream garage they deserve!",
      products_count: 6,
    },
  ];

  const displayCategories =
    Array.isArray(fetchedCategories) && fetchedCategories.length > 0
      ? fetchedCategories.slice(0, 6).map((cat, idx) => ({
          id: cat.id,
          name: cat.name || cat.title || "Category",
          description:
            cat.description ||
            "Discover premium toys and collectibles in this category.",
          image:
            cat.image ||
            FALLBACK_CATEGORY_IMAGES[idx % FALLBACK_CATEGORY_IMAGES.length],
          products_count:
            cat.products_count !== undefined ? cat.products_count : null,
        }))
      : fallbackCategories.slice(0, 6);

  const FALLBACK_NEW_ARRIVALS = [
    {
      id: "na-1",
      name: "Cyber Shredder V3",
      price: 12999,
      subtitle: "High-Velocity Electric Racer",
      image: cyberToyCar,
      tag: "HOT",
    },
    {
      id: "na-2",
      name: "Super Drift X1 Beast",
      price: 8499,
      subtitle: "Pro Series RC Speedster",
      image: catMonsterTruck,
      tag: "20% OFF",
    },
    {
      id: "na-3",
      name: "Titan Mech Armor V2",
      price: 4999,
      subtitle: "Collectible Desktop Tech",
      image: prodMech,
      tag: "NEW",
    },
    {
      id: "na-4",
      name: "Drone-Z Stealth Mini",
      price: 6499,
      subtitle: "HD Camera Remote Gadget",
      image: prodDrone,
      tag: "NEW",
    },
    {
      id: "na-5",
      name: "Retro Flame Hot Rod",
      price: 3499,
      subtitle: "Diecast Classic Racer",
      image: retroHotRod,
      tag: "HOT",
    },
    {
      id: "na-6",
      name: "Inferno Drift Tuner",
      price: 5299,
      subtitle: "Street Racing Specimen",
      image: neonDriftCar,
      tag: "NEW",
    },
    {
      id: "na-7",
      name: "Luxury Toy Garage Bay",
      price: 8999,
      subtitle: "Custom Showroom Diorama",
      image: catGarage,
      tag: "FEATURED",
    },
    {
      id: "na-8",
      name: "Apex Diecast Cruiser",
      price: 2799,
      subtitle: "Precision Hand-Polished Vehicle",
      image: catDiecast,
      tag: "15% OFF",
    },
    {
      id: "na-9",
      name: "STEM Tech Bot Kit",
      price: 4499,
      subtitle: "Interactive Robot Building",
      image: catTechToys,
      tag: "NEW",
    },
    {
      id: "na-10",
      name: "Heroic Action Figure X",
      price: 1999,
      subtitle: "Limited Collector Edition",
      image: catDolls,
      tag: "NEW",
    },
  ];

  const [newArrivals, setNewArrivals] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(true);
  const arrivalsScrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    fetchProductsList({ sort: "newest", page_size: 10 })
      .then((res) => {
        if (isMounted) {
          const list = res?.results || res || [];
          if (Array.isArray(list) && list.length > 0) {
            const formatted = list.slice(0, 10).map((p) => ({
              id: p.id,
              name: p.name || p.title || "Toy Specimen",
              price:
                p.lowest_price !== undefined ? p.lowest_price : p.price || 0,
              subtitle: p.brand || p.category || p.subtitle || "New Arrival",
              image: p.primary_image || p.image || prodDrone,
              tag: p.discount_percentage
                ? `${p.discount_percentage}% OFF`
                : p.tag || "NEW",
              default_variant_id:
                p.default_variant_id ||
                (p.variants && p.variants[0] ? p.variants[0].id : null),
              rawProduct: p,
            }));
            setNewArrivals(formatted);
          } else {
            setNewArrivals(FALLBACK_NEW_ARRIVALS);
          }
        }
      })
      .catch(() => {
        if (isMounted) setNewArrivals(FALLBACK_NEW_ARRIVALS);
      })
      .finally(() => {
        if (isMounted) setArrivalsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const displayArrivals =
    newArrivals.length > 0 ? newArrivals : FALLBACK_NEW_ARRIVALS;

  const scrollArrivals = (direction) => {
    if (arrivalsScrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      arrivalsScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
                color: "#8c52ff",
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
            Welcome to the ultimate playground of dreams! Unlocking a universe
            of wonder for kids, kids-at-heart, and hardcore collectors. Speed
            off with high-velocity RC beasts, display intricate diecast
            classics, or build your own desktop city!
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-shop-now"
              onClick={() => navigate("/products")}
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Shop Now
            </button>
            <button
              type="button"
              className="btn-explore"
              onClick={() => navigate("/categories")}
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Explore Collections <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="hero-right">
          <HeroCard />
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
          {categoriesLoading &&
          (!fetchedCategories || fetchedCategories.length === 0) ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={`skel-${idx}`} className="category-skeleton-card">
                <div className="category-skeleton-img"></div>
                <div className="category-skeleton-text"></div>
              </div>
            ))
          ) : (
            <>
              {displayCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => navigate(`/products?category=${cat.id}`)}
                >
                  <div className="category-card-img-wrapper">
                    <img src={cat.image} alt={cat.name} />
                    {cat.products_count !== null && (
                      <span className="category-card-badge">
                        {cat.products_count}{" "}
                        {cat.products_count === 1 ? "Item" : "Items"}
                      </span>
                    )}
                  </div>
                  <div className="category-card-content">
                    <div>
                      <h3 className="category-card-title">{cat.name}</h3>
                      <p className="category-card-desc">{cat.description}</p>
                    </div>
                    <div className="category-card-footer">
                      <span className="category-card-action">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Explore All Categories Card */}
              <div
                className="category-card category-card-explore-all"
                onClick={() => navigate("/categories")}
              >
                <div className="explore-all-content">
                  <div className="explore-all-icon">
                    <ArrowRight size={26} />
                  </div>
                  <h3 className="category-card-title">Explore All</h3>
                  <p className="category-card-desc">
                    Discover our full vault of categories & collectibles
                  </p>
                  <span className="btn-explore-all-action">
                    View All Categories <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </>
          )}
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
            <button
              type="button"
              className="btn-slider-arrow"
              aria-label="Previous Slide"
              onClick={() => scrollArrivals("left")}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="btn-slider-arrow"
              aria-label="Next Slide"
              onClick={() => scrollArrivals("right")}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="arrivals-slider-wrapper">
          <div className="arrivals-slider-track" ref={arrivalsScrollRef}>
            {displayArrivals.map((product) => {
              const isNew =
                product.tag === "NEW" || product.tag?.includes("NEW");
              const isHot =
                product.tag === "HOT" || product.tag?.includes("HOT");

              return (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="product-card-img-wrapper">
                    <img src={product.image} alt={product.name} />
                    {product.tag && (
                      <span
                        className={`product-tag ${isNew ? "tag-new" : isHot ? "tag-hot" : "tag-offer"}`}
                      >
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <div className="product-card-info">
                    <div className="product-card-meta">
                      <h3 className="product-card-title">{product.name}</h3>
                      <p className="product-card-price">
                        ₹
                        {typeof product.price === "number"
                          ? product.price.toLocaleString("en-IN")
                          : product.price}
                      </p>
                    </div>
                    <p className="product-card-subtitle">{product.subtitle}</p>
                    <button
                      type="button"
                      className="btn-add-to-cart"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}

            {/* "See More" Button Card at the end */}
            <div
              className="product-card see-more-card"
              onClick={() => navigate("/products?sort=newest")}
            >
              <div className="see-more-card-content">
                <div className="see-more-icon-badge">
                  <Sparkles size={28} />
                </div>
                <h3 className="see-more-title">Explore All New Arrivals</h3>
                <p className="see-more-desc">
                  Discover newly added toys, RC beasts & limited edition
                  collectibles.
                </p>
                <button type="button" className="btn-see-more-action">
                  View All <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Referral Code & Earn Rewards Section */}
      <section className="newsletter-section referral-home-section">
        <div className="newsletter-card referral-home-card">
          <div className="newsletter-left referral-home-left">
            <div className="referral-home-badge">
              <Gift size={16} />
              <span>REFER &amp; EARN REWARDS</span>
            </div>
            {isAuthenticated && user ? (
              <>
                <h3>Invite Friends, Get Free Credits! 🎁</h3>
                <p>
                  Share your unique referral code with friends! When they
                  register and make their first purchase, you both earn
                  exclusive wallet rewards to spend anywhere in the store.
                </p>
              </>
            ) : (
              <>
                <h3>Earn Credits with Every Friend! 🚀</h3>
                <p>
                  Join the Toy Store club! Sign in to unlock your personal
                  referral code and start earning wallet rewards every time your
                  friends shop with us.
                </p>
              </>
            )}
          </div>
          <div className="newsletter-right referral-home-right">
            {isAuthenticated && user ? (
              <div className="referral-code-box">
                <div className="referral-code-input-group">
                  <span className="referral-label">YOUR CODE</span>
                  <span className="referral-code-value">
                    {user.referral_code || "REF-PLAYZONE"}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-copy-referral"
                  onClick={handleCopyReferral}
                >
                  {copiedRef ? (
                    <>
                      <Check size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy Code
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="referral-login-prompt">
                <button
                  type="button"
                  className="btn-referral-login"
                  onClick={() => navigate("/login")}
                >
                  <LogIn size={18} /> Sign In to Refer &amp; Earn
                </button>
              </div>
            )}
          </div>
          {/* Floating Decorative SVG Gift Icon */}
          <div className="newsletter-rocket-overlay" aria-hidden="true">
            <Gift size={220} strokeWidth={1} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
