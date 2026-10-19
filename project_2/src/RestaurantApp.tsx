import { Routes, Route, Navigate } from "react-router-dom";
import RestaurantLayout from "./components/RestaurantLayout";
import RestaurantScrollToTop from "./components/RestaurantScrollToTop";
import RestaurantHome from "./pages/RestaurantHome";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./restaurant.css";

export default function RestaurantApp() {
  return (
    <>
      <RestaurantScrollToTop />
      <Routes>
        <Route element={<RestaurantLayout />}>
          <Route index element={<RestaurantHome />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="order/:orderId" element={<OrderStatusPage />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/project_2/" replace />} />
      </Routes>
    </>
  );
}