import React from 'react';
import { Link } from 'react-router-dom';

function NavbarMenu({ menuItems, activeTab, onTabClick }) {
  return (
    <nav className="header-nav">
      {menuItems.map((item) => (
         <Link
          key={item.path}
          to={item.path}
          style={{textDecoration: 'none'}}
          className={`nav-item ${
            activeTab === item.label
              ? 'active'
              : ''
          }`}
          onClick={() => onTabClick(item)}>
          {item.label}
          {activeTab === item.label && <span className="active-indicator" />}
        </Link>
      ))}
    </nav>
  );
}

export default NavbarMenu;
