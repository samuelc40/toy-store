# 🧸 Toy Store — Full-Stack E-Commerce Platform

A modern, full-stack e-commerce platform for selling toys online, built with **Django REST Framework** on the backend and **React** on the frontend.

The application includes customer shopping functionality, secure authentication, product and variant management, cart and checkout, multiple payment methods, wallet management, offers, referrals, order management, product reviews, sales reports, and an admin dashboard.

---

## 🚀 Project Overview

Toy Store is designed as a scalable e-commerce application with a clear separation between the frontend and backend.

### Backend

Built using:

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Razorpay Payment Gateway

### Frontend

Built using:

- React
- JavaScript
- HTML5
- CSS3
- REST APIs
- Responsive UI

---

# ✨ Features

## 👤 Customer Features

### Authentication

- User registration
- User login/logout
- JWT-based authentication
- Cookie-based authentication
- Email verification
- Google authentication
- User profile management
- Address management

### 🛍️ Product Browsing

- Browse products
- Product details
- Product variants
- Product categories
- Product brands
- Product search
- Product filtering
- Product sorting
- Responsive product listing

### 🛒 Shopping Cart

- Add products to cart
- Variant-based cart items
- Update quantity
- Remove items
- Stock validation
- Cart total calculation
- Offer/discount calculation

### ❤️ Wishlist

- Add product/variant to wishlist
- Remove from wishlist
- View wishlist
- Wishlist validation

### 💳 Checkout & Payments

- Address selection
- Order summary
- Coupon application
- Offer discounts
- Shipping calculation
- Cash on Delivery
- Razorpay online payment
- Wallet payment
- Payment success handling
- Payment failure handling
- Payment retry

### 💰 Wallet

- Wallet balance
- Wallet transactions
- Credit transactions
- Debit transactions
- Refunds to wallet
- Cancellation refunds
- Return refunds
- Wallet payment during checkout

### 📦 Order Management

Customers can:

- View orders
- View order details
- Track order status
- Cancel complete orders
- Cancel individual products
- Submit cancellation requests
- Request returns after delivery
- Request individual product returns
- View return status
- View cancellation status
- Receive refunds according to the payment/refund rules

### ⭐ Product Reviews

Variant-based review system with:

- Review eligibility verification
- Delivered-order verification
- Variant-specific reviews
- Create review
- Edit own review
- Delete own review
- Rating system from 1–5 stars
- Average rating
- Rating distribution
- Review count
- Pagination
- Review moderation
- Duplicate review prevention

Customers can review a product variant only after purchasing and receiving the eligible item.

### 🎁 Offers

#### Product Offers

- Product-specific offers
- Discount calculation

#### Category Offers

- Category-based discounts
- Automatically applies the better applicable offer between product and category offers

#### Referral Offers

- Automatically generated referral codes
- Referral links
- Referral code registration
- Referrer rewards
- New-user rewards
- Minimum first-order requirement
- Wallet-based referral rewards
- Admin-controlled referral configuration

---

# 🔐 Security

The application follows backend-first security principles.

Security measures include:

- Authentication-protected APIs
- Admin-only APIs
- Object-level authorization
- Ownership validation
- Backend purchase verification
- Server-side price/discount validation
- Backend wallet validation
- Backend payment verification
- Input validation
- Duplicate transaction/review protection
- Database constraints
- Protected user information
- Secure cookie-based JWT authentication

Frontend validation is used only for user experience.

All important business rules are enforced by the backend.

---

# 🛠️ Admin Features

## 👨‍💼 Admin Authentication

- Secure admin authentication
- Admin-only API access
- Protected admin routes

## 📦 Product Management

Admins can:

- Create products
- Update products
- Delete products
- Manage product images
- Manage variants
- Manage stock
- Manage categories
- Manage brands

## 🏷️ Offer Management

Admins can manage:

- Product offers
- Category offers
- Referral offer configuration
- Offer activation/deactivation
- Discount values
- Minimum order requirements

## 📋 Order Management

Admins can:

- View orders
- Search orders
- Filter orders
- Update order status
- View order details
- Review cancellation requests
- Approve/reject cancellation requests
- Review return requests
- Approve/reject return requests
- Process eligible refunds

## 💰 Wallet & Refund Management

The system supports:

- Cancellation refunds
- Return refunds
- Wallet credits
- Wallet debits
- Wallet transaction history

Refund processing is handled through the backend service layer.

## ⭐ Review Moderation

Admins can:

- View customer reviews
- Search reviews
- Filter reviews
- View review details
- Hide reviews
- Show reviews
- Moderate inappropriate reviews

Hidden reviews are excluded from customer-facing ratings and review statistics.

## 📊 Sales Reports

The admin system supports sales reporting based on:

- Daily
- Weekly
- Monthly
- Yearly
- Custom date range

Reports include metrics such as:

- Sales count
- Order amount
- Discounts
- Coupon deductions
- Net sales

---

# 📈 Admin Dashboard

The dashboard provides business insights including:

- Sales statistics
- Sales charts
- Time-based filtering
- Best-selling products
- Best-selling categories
- Best-selling brands

The reporting system uses database-level aggregation wherever possible to maintain performance.

---

# 🧱 Backend Architecture

The backend follows a service-oriented architecture.

A typical application structure is:

```text
backend/
│
├── apps/
│   │
│   ├── accounts/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── selectors.py
│   │   ├── services.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   ├── wallet/
│   ├── coupons/
│   ├── offers/
│   ├── reviews/
│   └── ...
│
├── config/
│
├── manage.py
└── requirements.txt
