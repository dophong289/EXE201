import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatBox from './components/ChatBox'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'
import AboutPage from './pages/AboutPage'
import MenuPage from './pages/MenuPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminSiteSettingsPage from './pages/AdminSiteSettingsPage'
import AdminArticlesPage from './pages/AdminArticlesPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import AdminOrdersPage from './pages/AdminOrdersPage'

function App() {
  const location = useLocation()
  const isAuthPage = ['/dang-nhap', '/dang-ky', '/quen-mat-khau', '/dat-lai-mat-khau'].includes(location.pathname)

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      <main className="main-content">
        <Routes>
          {/* Mặc định mở web sẽ vào trang Gói Mây */}
          <Route path="/" element={<Navigate to="/ve-goi-may" replace />} />
          <Route path="/bai-viet" element={<ArticlesPage />} />
          <Route path="/bai-viet/:slug" element={<ArticleDetailPage />} />
          <Route path="/san-pham" element={<ProductsPage />} />
          <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/thanh-toan" element={<CheckoutPage />} />
          <Route path="/thanh-toan/thanh-cong/:orderId" element={<CheckoutSuccessPage />} />
          <Route path="/ve-goi-may" element={<AboutPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
          <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
          <Route path="/tai-khoan" element={<AccountPage />} />
          <Route path="/don-hang" element={<OrdersPage />} />
          <Route path="/admin/don-hang" element={<AdminOrdersPage />} />
          <Route path="/admin/san-pham" element={<AdminProductsPage />} />
          <Route path="/admin/danh-muc" element={<AdminCategoriesPage />} />
          <Route path="/admin/hinh-anh" element={<AdminSiteSettingsPage />} />
          <Route path="/admin/bai-viet" element={<AdminArticlesPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <ChatBox />}
    </div>
  )
}

export default App

