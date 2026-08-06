import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar/Navbar';
import Footer from '../components/layout/Footer/Footer';
import './UserLayout.css';

function UserLayout() {
  return (
    <div className="user-layout-container">
      <Navbar />
      <div className="user-layout-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default UserLayout;
