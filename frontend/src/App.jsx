import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AddressesPage } from "./pages/AddressesPage";
import { BlogArticlePage } from "./pages/BlogArticlePage";
import { BlogListPage } from "./pages/BlogListPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CollectionPage } from "./pages/CollectionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { GiftStorePage } from "./pages/GiftStorePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderConfirmationPage } from "./pages/OrderConfirmationPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ProductPage } from "./pages/ProductPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { StoreLocatorPage } from "./pages/StoreLocatorPage";
import { WishlistPage } from "./pages/WishlistPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/collections/:handle" element={<CollectionPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/pages/gift-store" element={<GiftStorePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/pages/store-locator" element={<StoreLocatorPage />} />
        <Route path="/blogs/tales" element={<BlogListPage />} />
        <Route path="/blogs/tales/:slug" element={<BlogArticlePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/account/login" element={<LoginPage />} />
        <Route path="/account/register" element={<RegisterPage />} />
        <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/account/dashboard" element={<DashboardPage />} />
          <Route path="/account/orders" element={<OrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          <Route path="/account/wishlist" element={<WishlistPage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/checkout/confirmation/:orderId"
            element={<OrderConfirmationPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
