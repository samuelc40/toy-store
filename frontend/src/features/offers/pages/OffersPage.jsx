import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, Sparkles, Gift, Share2, Copy, Check, Percent, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../../api/axios";
import ProductCard from "../../products/components/ProductCard";
import { selectUser } from "../../auth/authSlice";
import { toast } from "react-toastify";
import "./OffersPage.css";

export default function OffersPage() {
    const user = useSelector(selectUser);
    const [offersData, setOffersData] = useState({
        product_offers: [],
        category_offers: [],
        referral_offer: null,
        discounted_products: [],
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/customers/offers/");
            if (res.data?.success) {
                setOffersData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch customer offers:", err);
            toast.error("Failed to load active offers.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyReferralLink = () => {
        if (!user || !user.referral_code) {
            toast.info("Please log in to get your referral link.");
            return;
        }
        const refLink = `${window.location.origin}/register?ref=${user.referral_code}`;
        navigator.clipboard.writeText(refLink);
        setCopied(true);
        toast.success("Referral link copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
    };

    const { product_offers, category_offers, referral_offer, discounted_products } = offersData;

    return (
        <div className="offers-page-container">
            {/* Hero Section */}
            <div className="offers-hero-banner">
                <div className="offers-hero-content">
                    <div className="offers-hero-badge">
                        <Sparkles size={16} />
                        <span>Limited Time Vault Deals</span>
                    </div>
                    <h1 className="offers-hero-title">Exclusive Store Discounts &amp; Offers</h1>
                    <p className="offers-hero-subtitle">
                        Unlock massive savings on premium toys, limited edition die-cast models, and category-wide special offers!
                    </p>
                </div>
            </div>

            {/* Referral Hero Card */}
            {referral_offer && (
                <div className="referral-banner-card">
                    <div className="referral-banner-icon-box">
                        <Gift size={32} />
                    </div>
                    <div className="referral-banner-info">
                        <h3>Referral Reward Program</h3>
                        <p>
                            Invite your friends! You get <strong>Rs. {Number(referral_offer.referrer_bonus).toFixed(0)}</strong> &amp; your friend gets <strong>Rs. {Number(referral_offer.new_user_bonus).toFixed(0)}</strong> in wallet credits when they place their first order over Rs. {Number(referral_offer.minimum_order_amount).toFixed(0)}.
                        </p>
                    </div>
                    <div className="referral-banner-action">
                        {user ? (
                            <button className="btn-copy-ref-link" onClick={handleCopyReferralLink}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                <span>{copied ? "Copied!" : "Copy Referral Link"}</span>
                            </button>
                        ) : (
                            <Link to="/register" className="btn-copy-ref-link">
                                <span>Sign Up to Get Code</span>
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation Filter Tabs */}
            <div className="offers-filter-tabs">
                <button
                    className={`offers-tab-btn ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                >
                    All Deals
                </button>
                <button
                    className={`offers-tab-btn ${activeTab === "products" ? "active" : ""}`}
                    onClick={() => setActiveTab("products")}
                >
                    Product Offers ({product_offers.length})
                </button>
                <button
                    className={`offers-tab-btn ${activeTab === "categories" ? "active" : ""}`}
                    onClick={() => setActiveTab("categories")}
                >
                    Category Offers ({category_offers.length})
                </button>
            </div>

            {/* Active Category Campaigns Highlight */}
            {(activeTab === "all" || activeTab === "categories") && category_offers.length > 0 && (
                <div className="category-offers-section">
                    <h2 className="section-title">Category Discount Campaigns</h2>
                    <div className="category-offers-grid">
                        {category_offers.map((cOffer) => {
                            const bgImage = cOffer.category_image;
                            return (
                                <div
                                    key={cOffer.id}
                                    className={`category-offer-card ${bgImage ? "has-bg-img" : ""}`}
                                    style={bgImage ? { "--cat-bg-img": `url(${bgImage})` } : {}}
                                >
                                    {bgImage && <div className="category-offer-card-overlay" />}
                                    <div className="category-offer-card-content">
                                        <div className="category-offer-header">
                                            <Tag className="offer-tag-icon" size={20} />
                                            <span className="category-offer-badge">
                                                {cOffer.discount_type === "PERCENTAGE"
                                                    ? `${Number(cOffer.discount_value)}% OFF`
                                                    : `Rs. ${Number(cOffer.discount_value)} OFF`}
                                            </span>
                                        </div>
                                        <h3 className="category-offer-name">{cOffer.category_name} Collection</h3>
                                        <p className="category-offer-desc">
                                            Special discount automatically applied on all toys in the {cOffer.category_name} category!
                                        </p>
                                        <Link to={`/products?category=${encodeURIComponent(cOffer.category_name)}`} className="btn-explore-category-offer">
                                            Explore {cOffer.category_name} Toys <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Discounted Products Section */}
            {(activeTab === "all" || activeTab === "products") && (
                <div className="discounted-products-section">
                    <h2 className="section-title">Hot Items on Sale</h2>
                    {loading ? (
                        <div className="offers-loading-state">
                            <div className="spinner-el"></div>
                            <p>Loading latest deals...</p>
                        </div>
                    ) : discounted_products.length > 0 ? (
                        <div className="offers-product-grid">
                            {discounted_products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="offers-empty-state">
                            <Tag size={40} className="empty-icon" />
                            <h3>No Active Product Offers Currently</h3>
                            <p>Check back soon or explore our active category campaigns!</p>
                            <Link to="/products" className="btn-browse-all">Browse All Products</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
