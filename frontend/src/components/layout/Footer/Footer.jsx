import React from 'react';
import { Globe, Share2 } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="toyvault-footer">
      <div className="footer-content">
        <div className="footer-brand-section">
          <div className="footer-logo">
            <span className="logo-letter logo-letter-t">T</span>
            <span className="logo-letter logo-letter-o">o</span>
            <span className="logo-letter logo-letter-y">y</span>
            <span className="logo-store">Store</span>
          </div>
          <p className="footer-description">
            The premier destination for the world's most exciting toys and collectibles. We bridge the gap between high-end retail and pure imagination.
          </p>
          <div className="footer-social-icons">
            <a href="#" className="social-btn" aria-label="Website">
              <Globe size={18} />
            </a>
            <a href="#" className="social-btn" aria-label="Share">
              <Share2 size={18} />
            </a>
            <a href="#" className="social-btn" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links-columns">
          <div className="footer-column">
            <h3 className="column-title">SHOP</h3>
            <ul className="column-links">
              <li><a href="#">RC Cars & Trucks</a></li>
              <li><a href="#">Diecast Models</a></li>
              <li><a href="#">STEM Tech Toys</a></li>
              <li><a href="#">Limited Editions</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="column-title">SUPPORT</h3>
            <ul className="column-links">
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Returns & Refunds</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="column-title">COMPANY</h3>
            <ul className="column-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Story</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-divider" />
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2024 ToyStore Collectibles. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
