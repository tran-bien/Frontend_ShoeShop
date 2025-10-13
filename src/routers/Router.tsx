import { Route, Routes } from "react-router-dom";
import OrderConfirmationPage from "../pages/OrderConfirmationPage/OrderConfirmationPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProductListPage from "../pages/MainPages/ProductListPage";
import LoginPage from "../pages/AuthPages/LoginPage";
import RegisterPage from "../pages/AuthPages/RegisterPage";
import OTPVerificationPage from "../pages/AuthPages/OTPVerificationPage";
import ForgotPasswordPage from "../pages/AuthPages/ForgotPasswordPage";
import AdminLayout from "./layout/AdminLayout";
import LandingPage from "../pages/MainPages/LandingPage/LandingPage";
import MainLayout from "./layout/MainLayout";
import Dashboard from "../pages/AdminPages/DashboardPage/Dashboard";
import ListCustomerPage from "../pages/AdminPages/AdminUser/CustomerPage";
import ListCategoriesPage from "../pages/AdminPages/AdminCategories/CategoriesPage";
import ListOrderPage from "../pages/AdminPages/AdminOrders/OrderPage";
import CartPage from "../pages/MainPages/CartPage/CartPage";
import UserInformationPage from "../pages/MainPages/UserPage/UserInformationPage";
import UserManageOrderPage from "../pages/MainPages/UserPage/UserManageOrderPage";
import UserOrderDetailPage from "../pages/MainPages/UserPage/UserOrderDetailPage";
import UserCancelRequestsPage from "../pages/MainPages/UserPage/UserCancelRequestsPage";
import UserReviewPage from "../pages/MainPages/UserPage/UserReviewPage";
import LikePage from "../pages/MainPages/LikePage/LikePage";
import ProductPage from "../pages/AdminPages/ProductPage/ProductPage";
import DiscountPage from "../pages/AdminPages/DiscountPage/DiscountPage";
import BrandPage from "../pages/AdminPages/BrandPage/BrandPage";
import ColorPage from "../pages/AdminPages/ColorPage/ColorPage";
import SizePage from "../pages/AdminPages/SizePage/SizePage";
import TagPage from "../pages/AdminPages/TagPage/TagPage";
import PaymentStatusPage from "../pages/OrderConfirmationPage/PaymentStatusPage";
import VariantPage from "../pages/AdminPages/VariantPage/VariantPage";
import BannerPage from "../pages/AdminPages/BannerPage";
import AuthGuard from "../components/Auth/AuthGuard";
import UnauthorizedPage from "../pages/UnauthorizedPage/UnauthorizedPage";
import CouponsPage from "../pages/MainPages/Coupons/Coupons";
import ResetPasswordPage from "../pages/AuthPages/ResetPasswordPage";
import UserChangePasswordPage from "../pages/MainPages/UserPage/UserChangePasswordPage";
import UserSessionsPage from "../pages/MainPages/UserPage/UserSessionsPage";
import InventoryPage from "../pages/AdminPages/InventoryPage/InventoryPage";
import ShipperPage from "../pages/AdminPages/ShipperPage/ShipperPage";
import ReturnPage from "../pages/AdminPages/ReturnPage/ReturnPage";
import ShipperLayout from "./layout/ShipperLayout";
import ShipperDashboardPage from "../pages/ShipperPages/ShipperDashboardPage";
import MyOrdersPage from "../pages/ShipperPages/MyOrdersPage";
import OrderDetailPage from "../pages/ShipperPages/OrderDetailPage";
import ShipperProfilePage from "../pages/ShipperPages/ShipperProfilePage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Auth routes - không cần layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/otp-verification" element={<OTPVerificationPage />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Shipper routes - sử dụng ShipperLayout */}
      <Route
        path="/shipper/*"
        element={
          <AuthGuard requireShipper>
            <ShipperLayout />
          </AuthGuard>
        }
      >
        <Route path="" element={<ShipperDashboardPage />} />
        <Route path="dashboard" element={<ShipperDashboardPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="completed" element={<MyOrdersPage />} />
        <Route path="profile" element={<ShipperProfilePage />} />
      </Route>

      {/* Admin routes - sử dụng AdminLayout */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard requireStaff>
            <AdminLayout />
          </AuthGuard>
        }
      >
        {/* Routes cho Staff và Admin */}
        <Route path="products" element={<ProductPage />} />
        <Route path="products/discount" element={<DiscountPage />} />
        <Route path="products/variants" element={<VariantPage />} />
        <Route path="categories" element={<ListCategoriesPage />} />
        <Route path="brand" element={<BrandPage />} />
        <Route path="color" element={<ColorPage />} />
        <Route path="size" element={<SizePage />} />
        <Route path="tags" element={<TagPage />} />
        <Route path="banners" element={<BannerPage />} />
        <Route path="orders" element={<ListOrderPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="shippers" element={<ShipperPage />} />
        <Route path="returns" element={<ReturnPage />} />

        {/* Routes chỉ dành cho Admin */}
        <Route
          path=""
          element={
            <AuthGuard requireAdminOnly>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="dashboard"
          element={
            <AuthGuard requireAdminOnly>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="users"
          element={
            <AuthGuard requireAdminOnly>
              <ListCustomerPage />
            </AuthGuard>
          }
        />
      </Route>

      {/* Main layout routes - sử dụng MainLayout với MainNavbar */}
      <Route path="/" element={<MainLayout />}>
        <Route path="" element={<LandingPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route
          path="cart"
          element={
            <AuthGuard>
              <CartPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-information"
          element={
            <AuthGuard>
              <UserInformationPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-manage-order"
          element={
            <AuthGuard>
              <UserManageOrderPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-order/:orderId"
          element={
            <AuthGuard>
              <UserOrderDetailPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-cancel-requests"
          element={
            <AuthGuard>
              <UserCancelRequestsPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-reviews"
          element={
            <AuthGuard>
              <UserReviewPage />
            </AuthGuard>
          }
        />
        <Route
          path="like-page"
          element={
            <AuthGuard>
              <LikePage />
            </AuthGuard>
          }
        />
        <Route
          path="user-change-password"
          element={
            <AuthGuard>
              <UserChangePasswordPage />
            </AuthGuard>
          }
        />
        <Route
          path="user-sessions"
          element={
            <AuthGuard>
              <UserSessionsPage />
            </AuthGuard>
          }
        />
        <Route
          path="order-confirmation"
          element={
            <AuthGuard>
              <OrderConfirmationPage />
            </AuthGuard>
          }
        />
        <Route path="payment/status" element={<PaymentStatusPage />} />
        <Route path="payment/result" element={<PaymentStatusPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
