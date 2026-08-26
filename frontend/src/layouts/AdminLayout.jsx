import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, ShoppingBag, Boxes, Receipt, FolderOpen, Users, Ticket, RotateCcw, XCircle, Percent, ArrowLeft, LogOut, FileText, Sun, Moon } from 'lucide-react';
import { selectUser, logout as logoutAction } from '../features/auth/authSlice';
import { logout as apiLogout } from '../features/auth/services/authService';
import { toast } from 'react-toastify';
import './AdminLayout.css';

function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const user = useSelector(selectUser);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Sales Reports', path: '/admin/reports/sales', icon: FileText },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { label: 'Orders', path: '/admin/orders', icon: Receipt },
    { label: 'Return Requests', path: '/admin/returns', icon: RotateCcw },
    { label: 'Cancellation Requests', path: '/admin/cancellations', icon: XCircle },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Offers', path: '/admin/offers', icon: Percent },
    { label: 'Users', path: '/admin/users', icon: Users },
  ];

  const currentMenuItem = menuItems.find(
    (item) => currentPath === item.path || (item.path === '/admin/dashboard' && currentPath === '/admin')
  );
  const headerTitle = currentMenuItem ? `Admin ${currentMenuItem.label}` : 'Admin Panel';
  const adminName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Administrator';
  const adminInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A';

  const handleLogout = async () => {
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

  return (
    <div className="admin-layout-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="logo-toy">Toy</span>
          <span className="logo-vault">Vault</span>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/admin/dashboard' && currentPath === '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="back-to-store-btn">
            <ArrowLeft size={16} />
            <span>Back to Store</span>
          </Link>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="admin-logout-btn" 
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <div className="admin-main-area">
        <header className="admin-header">
          <h2 className="admin-header-title">{headerTitle}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={toggleTheme}
              className="admin-theme-toggle-btn"
              aria-label="Toggle Theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="admin-profile-menu">
              <div className="profile-avatar">{adminInitial}</div>
              <div className="profile-info">
                <span className="profile-name">{adminName}</span>
                <span className="profile-role">Super User</span>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
