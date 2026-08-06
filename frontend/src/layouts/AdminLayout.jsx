import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, ShoppingBag, Boxes, Receipt, FolderOpen, Users, ArrowLeft, LogOut } from 'lucide-react';
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

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { label: 'Orders', path: '/admin/orders', icon: Receipt },
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 16px',
              marginTop: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ff4d4f',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'left',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <div className="admin-main-area">
        <header className="admin-header">
          <h2 className="admin-header-title">{headerTitle}</h2>
          <div className="admin-profile-menu">
            <div className="profile-avatar">{adminInitial}</div>
            <div className="profile-info">
              <span className="profile-name">{adminName}</span>
              <span className="profile-role">Super User</span>
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
