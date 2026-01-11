import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ProductsPage from './pages/ProductsPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bai-viet" element={<ArticlesPage />} />
          <Route path="/bai-viet/:slug" element={<ArticleDetailPage />} />
          <Route path="/san-pham" element={<ProductsPage />} />
          <Route path="/ve-goi-may" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

