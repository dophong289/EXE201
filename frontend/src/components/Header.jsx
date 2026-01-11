import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/components/Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const navItems = [
    { path: '/san-pham', label: 'Sản phẩm' },
    { path: '/khuyen-mai', label: 'Khuyến mãi' },
    { path: '/ve-goi-may', label: 'Gói Mây' },
    { path: '/bai-viet', label: 'Bài viết' },
  ]

  return (
    <header className="header">
      <div className="header-top">
        <p>Tận hưởng giao hàng miễn phí toàn quốc với hoá đơn từ 99.000 đ</p>
      </div>
      
      <nav className="header-main">
        <div className="header-container">
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          </button>

          <Link to="/" className="logo">
            <svg viewBox="0 0 140 40" className="logo-svg">
              <text x="10" y="30" className="logo-text">Gói Mây</text>
            </svg>
          </Link>

          <ul className="nav-menu desktop-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="header-actions">
            <button 
              className="icon-btn search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Tìm kiếm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <button className="icon-btn cart-btn" aria-label="Giỏ hàng">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <button className="language-btn">en</button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink 
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="search-container">
              <button 
                className="close-search"
                onClick={() => setIsSearchOpen(false)}
              >
                ×
              </button>
              <h3>Tìm kiếm</h3>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Nhập từ khóa bạn muốn tìm kiếm"
                  autoFocus
                />
                <button className="search-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </div>
              <div className="search-suggestions">
                <p>Gợi ý tìm kiếm:</p>
                <div className="suggestion-tags">
                  <span>Sữa rửa mặt</span>
                  <span>Nước tẩy trang</span>
                  <span>Gel tắm</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header

