import { Route, Routes } from "react-router-dom";

import RequireAdmin from "@/app/guards/RequireAdmin";
import RequireAuth from "@/app/guards/RequireAuth";
import AdminLayout from "@/app/layouts/AdminLayout";

// Feature-owned routes: old Pages/* files for these screens were bridge/wrapper layer only.

import Home from "@/features/home/HomeView";


// Auth flows — use barrel export from features/auth.
import { ForgotPasswordView as ForgotPassword, LoginView as Login, LoginSuccessView as LoginSuccess, RegisterView as Register, ResetPasswordView as ResetPassword } from "@/features/auth";

// Cart — dedicated module in features/cart.
import { CartView as Cart, CartAction } from "@/features/cart";
// Checkout flow — barrel import from features/checkout.
import { ShippingView as Shipping, OrderConfirmView as OrderConfirm, OrderSuccessView as OrderSuccess, PaymentView as Payment, VnpayResultView as VnpayResult } from "@/features/checkout";
// Orders flow — barrel import from features/orders.
import { MyOrdersView as MyOrders, OrderDetailsView as OrderDetails } from "@/features/orders";
// Product detail — migrated to dedicated features/product-detail module.
import { ProductDetailView as ProductDetails } from "@/features/product-detail";

function AppRoutes() {
  return (
    <Routes>
      {/* Feature storefront routes: legacy Pages/public Home/Products wrappers are no longer active here. */}
      <Route path="/" element={<Home />} />

      
    </Routes>
  );
}

export default AppRoutes;
