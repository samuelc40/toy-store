import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import adminUsersReducer from "../features/admin/adminUsersSlice";
import adminCategoriesReducer from "../features/admin/adminCategoriesSlice";
import productReducer from "../features/admin/products/redux/productSlice";
import variantReducer from "../features/admin/products/redux/variantSlice";
import productListingReducer from "../features/products/redux/productListingSlice";
import productDetailsReducer from "../features/products/redux/productDetailsSlice";
import categoryListingReducer from "../features/products/redux/CategoryListingSlice";
import cartReducer from "../features/cart/redux/cartSlice";
import wishlistReducer from "../features/wishlist/redux/wishlistSlice";
import checkoutReducer from "../features/checkout/redux/checkoutSlice";
import ordersReducer from "../features/orders/redux/ordersSlice";
import adminOrdersReducer from "../features/admin/orders/redux/adminOrdersSlice";
import adminInventoryReducer from "../features/admin/inventory/redux/adminInventorySlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        adminUsers: adminUsersReducer,
        adminCategories: adminCategoriesReducer,
        products: productReducer,
        variants: variantReducer,
        productListing: productListingReducer,
        productDetails: productDetailsReducer,
        customerCategory: categoryListingReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        checkout: checkoutReducer,
        orders: ordersReducer,
        adminOrders: adminOrdersReducer,
        adminInventory: adminInventoryReducer,
    },
});