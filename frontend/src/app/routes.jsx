import { Route, Routes } from "react-router-dom";

import RequireAdmin from "@/app/guards/RequireAdmin";
import RequireAuth from "@/app/guards/RequireAuth";
import AdminLayout from "@/app/layouts/AdminLayout";

// Feature-owned routes: old Pages/* files for these screens were bridge/wrapper layer only.
import Dashboard from "@/features/admin/dashboard/DashboardView";
import OrdersManagement from "@/features/admin/orders/OrdersManagementView";
import ProductsManagement from "@/features/admin/products/ProductsManagementView";
import Settings from "@/features/admin/settings/SettingsView";
import UsersManagement from "@/features/admin/users/UsersManagementView";
import VouchersManagement from "@/features/admin/vouchers/VouchersManagementView";
import Home from "@/features/home/HomeView";
import Products from "@/features/products/ProductListView";
import FlashSalesManagement from "@/features/admin/flash-sales/FlashSalesManagementView";
import Addresses from "@/features/address/AddressesView";
import Notifications from "@/features/notifications/NotificationsView";
import Profile from "@/features/user/ProfileView";
import UpdatePassword from "@/features/user/UpdatePasswordView";
import UpdateProfile from "@/features/user/UpdateProfileView";
import VoucherPage from "@/features/vouchers/VoucherPageView";
import CatePageView from "@/features/admin/categorys/CateManagementView";
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

      {/* Legacy ProductDetails route remains on Pages/* for now. */}
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:keyword" element={<Products />} />

      {/* Legacy auth routes remain on Pages/* for now. */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/success" element={<LoginSuccess />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />

      {/* Feature account routes: old Pages/user wrappers are no longer active here. */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/update"
        element={
          <RequireAuth>
            <UpdateProfile />
          </RequireAuth>
        }
      />
      <Route
        path="/password/update"
        element={
          <RequireAuth>
            <UpdatePassword />
          </RequireAuth>
        }
      />
      <Route
        path="/profile/addresses"
        element={
          <RequireAuth>
            <Addresses />
          </RequireAuth>
        }
      />



      {/* Mixed cart/checkout/order group: /cart/add uses a feature action, the rest remain on Pages/* for now. */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/cart/add/:id" element={<CartAction />} />
      <Route
        path="/shipping"
        element={
          <RequireAuth>
            <Shipping />
          </RequireAuth>
        }
      />
      <Route
        path="/order/confirm"
        element={
          <RequireAuth>
            <OrderConfirm />
          </RequireAuth>
        }
      />
      <Route
        path="/process/payment"
        element={
          <RequireAuth>
            <Payment />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/user"
        element={
          <RequireAuth>
            <MyOrders />
          </RequireAuth>
        }
      />
      <Route
        path="/order/:id"
        element={
          <RequireAuth>
            <OrderDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/order/success"
        element={
          <RequireAuth>
            <OrderSuccess />
          </RequireAuth>
        }
      />
      <Route
        path="/payment/success"
        element={
          <RequireAuth>
            <VnpayResult />
          </RequireAuth>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <RequireAuth>
            <VnpayResult />
          </RequireAuth>
        }
      />

      {/* Feature notification/voucher routes: old Pages/user wrappers are no longer active here. */}
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/order"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/promotion"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/wallet"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications/shopee"
        element={
          <RequireAuth>
            <Notifications />
          </RequireAuth>
        }
      />

      <Route
        path="/vouchers"
        element={
          <RequireAuth>
            <VoucherPage />
          </RequireAuth>
        }
      />
      
      {/* Feature admin routes: old Pages/admin wrappers are no longer active here. */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="vouchers" element={<VouchersManagement />} />
        <Route path="categories" element={<CatePageView />} />
        <Route path="flash-sales" element={<FlashSalesManagement />} />

        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;