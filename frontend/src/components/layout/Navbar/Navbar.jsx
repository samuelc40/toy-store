import React, { useState, useEffect } from 'react';
import { Heart, User, ShoppingCart, LogOut, LayoutDashboard, ClipboardList, Settings, UserCheck, Menu, X, Sun, Moon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectUser, selectIsAuthenticated, logout as logoutAction } from '../../../features/auth/authSlice';
import { logout as apiLogout } from '../../../features/auth/services/authService';
import NavbarMenu from './NavbarMenu';
import SearchBar from './SearchBar';
import Avatar from '../../common/Avatar';
import './Navbar.css';
import { toast } from 'react-toastify';
import { fetchCartAsync, selectCartSummary } from '../../../features/cart/redux/cartSlice';
import { getWishlistAsync, selectWishlistItems } from '../../../features/wishlist/redux/wishlistSlice';

function Navbar() {
  const menuItems = [
      { label: 'Shop', path: '/products' },
      { label: 'Categories', path: '/categories' },
      { label: 'New Arrivals', path: '/new-arrivals' },
      { label: 'Top Picks', path: '/top-picks' },
      { label: 'Brands', path: '/brands' },
      { label: 'Offers', path: '/offers' },
      { label: 'Gift Cards', path: '/gift-cards' },
      { label: 'Contact', path: '/contact' },
  ];
  const [activeTab, setActiveTab] = useState(menuItems.label);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartSummary = useSelector(selectCartSummary);
  const cartItemsCount = cartSummary?.total_items || 0;

  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = wishlistItems.length;

  // Check if admin (based on Django superuser status)
  const isAdmin = user && user.is_superuser;

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      dispatch(fetchCartAsync());
      dispatch(getWishlistAsync());
    }
  }, [isAuthenticated, isAdmin, dispatch]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
      toast.success("Logged out successfully!");
    }
  };

  const handleTabClick = (item) => {
    setActiveTab(item.label);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="toyvault-header">
      <div className="header-logo" onClick={() => { navigate('/'); setMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
        <span className="logo-letter logo-letter-t">T</span>
        <span className="logo-letter logo-letter-o">o</span>
        <span className="logo-letter logo-letter-y">y</span>
        <span className="logo-store">Store</span>
        <span>🧸</span>
      </div>

      {!isAdmin && (
        <div className="desktop-nav-wrapper">
          <NavbarMenu
            menuItems={menuItems}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />
        </div>
      )}

      <div className="header-actions">
        {!isAdmin && (
          <div className="desktop-search-wrapper">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        )}

        {!isAdmin && (
          <button className="action-btn cart-btn" aria-label="Wishlist" onClick={() => { navigate('/wishlist'); setMobileMenuOpen(false); }}>
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="cart-badge">{wishlistCount}</span>
            )}
          </button>
        )}

        {!isAdmin && (
          <button className="action-btn cart-btn" aria-label="Shopping Cart" onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }}>
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="cart-badge">{cartItemsCount}</span>
            )}
          </button>
        )}

        <button 
          className="action-btn theme-toggle-btn" 
          aria-label="Toggle Theme" 
          onClick={toggleTheme}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Dynamic Profile Dropdown */}
        <div className="profile-dropdown-container">
          <button
            className={`action-btn ${isAuthenticated ? 'authenticated-user-btn' : ''}`}
            aria-label="Profile"
            onClick={() => { setDropdownOpen(!dropdownOpen); setMobileMenuOpen(false); }}
          >
            {isAuthenticated ? (
              <Avatar user={user} className="navbar-avatar-img" />
            ) : (
              <User size={20} />
            )}
          </button>

          {dropdownOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
              <div className="profile-dropdown-menu">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">
                        Hi, {user?.first_name || 'Collector'}
                      </span>
                      <span className="dropdown-user-email">{user?.email}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item admin-link" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>

                    )}
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <ClipboardList size={16} /> Orders
                    </Link>
                    <Link to="/wishlist" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Heart size={16} /> Wishlist
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Hamburger Menu Toggle Button */}
        {!isAdmin && (
          <button
            className="action-btn hamburger-btn"
            aria-label="Toggle Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {!isAdmin && (
        <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-search-wrapper">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
            <nav className="mobile-nav-list">
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`mobile-nav-item ${
                  activeTab === item.label
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  setActiveTab(item.label);
                  setMobileMenuOpen(false);}}>

                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
