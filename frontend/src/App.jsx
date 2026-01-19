import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ProductsPage from './pages/ProductsPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminSiteSettingsPage from './pages/AdminSiteSettingsPage'
import AdminArticlesPage from './pages/AdminArticlesPage'
import AccountPage from './pages/AccountPage'

function App() {
  const location = useLocation()
  const isAuthPage = ['/dang-nhap', '/dang-ky'].includes(location.pathname)

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bai-viet" element={<ArticlesPage />} />
          <Route path="/bai-viet/:slug" element={<ArticleDetailPage />} />
          <Route path="/san-pham" element={<ProductsPage />} />
          <Route path="/ve-goi-may" element={<AboutPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          <Route path="/tai-khoan" element={<AccountPage />} />
          <Route path="/admin/san-pham" element={<AdminProductsPage />} />
          <Route path="/admin/danh-muc" element={<AdminCategoriesPage />} />
          <Route path="/admin/hinh-anh" element={<AdminSiteSettingsPage />} />
          <Route path="/admin/bai-viet" element={<AdminArticlesPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App

