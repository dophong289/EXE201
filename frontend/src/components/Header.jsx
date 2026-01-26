import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { favoriteApi } from '../services/api'
import { getCartItemCount } from '../services/cart'
import ImageWithFallback from './ImageWithFallback'
import '../styles/components/Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadFavoriteCount()
    }
  }, [user])

  useEffect(() => {
    const refresh = () => setCartCount(getCartItemCount())
    refresh()
    window.addEventListener('cart_updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('cart_updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const loadFavoriteCount = async () => {
    try {
      const response = await favoriteApi.count()
      setFavoriteCount(response.data.count || 0)
    } catch (error) {
      console.error('Error loading favorite count:', error)
    }
  }

  const loadFavorites = async () => {
    try {
      const response = await favoriteApi.getAll()
      setFavorites(response.data || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleFavoritesClick = () => {
    if (!user) {
      navigate('/dang-nhap')
      return
    }
    loadFavorites()
    setShowFavorites(!showFavorites)
    setShowUserMenu(false)
  }

  const removeFavorite = async (productId, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await favoriteApi.toggle(productId)
      setFavorites(favorites.filter(f => f.id !== productId))
      setFavoriteCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setShowUserMenu(false)
    navigate('/')
  }

  const handleCartClick = () => {
    setShowFavorites(false)
    setShowUserMenu(false)
    navigate('/gio-hang')
  }

  const submitSearch = (value) => {
    const q = (value ?? searchText).trim()
    if (q) {
      navigate(`/san-pham?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/san-pham')
    }
    setIsSearchOpen(false)
  }

  const navItems = [
    { path: '/san-pham', label: 'Sản Phẩm' },
    { path: '/khuyen-mai', label: 'Ưu đãi' },
    { path: '/menu', label: 'Menu' },
    { path: '/ve-goi-may', label: 'Gói Mây' },
    { path: '/bai-viet', label: 'Câu chuyện' },
  ]

  return (
    <header className="header">
      
      <nav className="header-main">
        <div className="header-container">
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
          </button>

          <Link to="/ve-goi-may" className="logo">
            <ImageWithFallback
              className="brand-logo"
              src="/Logo-Gói-Mây.png"
              alt="Logo Gói Mây"
              onError={(e) => {
                // Nếu chưa có file trong /public thì tự ẩn, tránh hiện icon ảnh lỗi
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="brand-text">Gói Mây</span>
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
              onClick={() => {
                setShowFavorites(false)
                setShowUserMenu(false)
                setIsSearchOpen(!isSearchOpen)
              }}
              aria-label="Tìm kiếm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <div className="favorites-container">
              <button 
                className="icon-btn favorites-btn" 
                aria-label="Yêu thích"
                onClick={handleFavoritesClick}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {user && favoriteCount > 0 && (
                  <span className="favorites-count">{favoriteCount}</span>
                )}
              </button>

              <AnimatePresence>
                {showFavorites && user && (
                  <motion.div 
                    className="favorites-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="favorites-header">
                      <h4>Sản phẩm yêu thích</h4>
                      <button className="close-favorites" onClick={() => setShowFavorites(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    {favorites.length === 0 ? (
                      <div className="favorites-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                        </svg>
                        <p>Chưa có sản phẩm yêu thích</p>
                        <Link to="/san-pham" onClick={() => setShowFavorites(false)}>
                          Khám phá ngay
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="favorites-list">
                          {favorites.slice(0, 5).map((product) => (
                            <Link 
                              key={product.id} 
                              to={`/san-pham/${product.slug}`}
                              className="favorite-item"
                              onClick={() => setShowFavorites(false)}
                            >
                              <div className="favorite-thumb">
                                {product.thumbnail ? (
                                  <ImageWithFallback src={product.thumbnail} alt={product.name} />
                                ) : (
                                  <div className="no-thumb">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                      <circle cx="8.5" cy="8.5" r="1.5"/>
                                      <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="favorite-info">
                                <span className="favorite-name">{product.name}</span>
                                <span className="favorite-price">
                                  {product.salePrice ? formatPrice(product.salePrice) : formatPrice(product.price)}
                                </span>
                              </div>
                              <button 
                                className="remove-favorite"
                                onClick={(e) => removeFavorite(product.id, e)}
                                title="Xóa khỏi yêu thích"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </Link>
                          ))}
                        </div>
                        {favorites.length > 5 && (
                          <Link 
                            to="/yeu-thich" 
                            className="view-all-favorites"
                            onClick={() => setShowFavorites(false)}
                          >
                            Xem tất cả ({favorites.length})
                          </Link>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="cart-container">
              <button className="icon-btn cart-btn" aria-label="Giỏ hàng" onClick={handleCartClick}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
            
            {user ? (
              <div className="user-menu-container">
                <button 
                  className="user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.fullName?.split(' ').pop()}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="dropdown-header">
                        <div className="user-avatar large">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="name">{user.fullName}</span>
                          <span className="email">{user.email}</span>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/tai-khoan" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Tài khoản của tôi
                      </Link>
                      <Link to="/don-hang" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        Đơn hàng
                      </Link>
                      {user.role === 'ADMIN' && (
                        <>
                          <div className="dropdown-divider"></div>
                          <Link to="/admin/don-hang" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            Quản lý đơn hàng
                          </Link>
                          <Link to="/admin/san-pham" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                              <path d="M2 17l10 5 10-5"/>
                              <path d="M2 12l10 5 10-5"/>
                            </svg>
                            Quản lý sản phẩm
                          </Link>
                          <Link to="/admin/bai-viet" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            Quản lý bài viết
                          </Link>
                          <Link to="/admin/danh-muc" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                            </svg>
                            Quản lý danh mục
                          </Link>
                          <Link to="/admin/hinh-anh" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            Quản lý hình ảnh
                          </Link>
                        </>
                      )}
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Đăng xuất
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/dang-nhap" className="login-btn">
                Đăng nhập
              </Link>
            )}
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
                  placeholder="Tìm set quà, đặc sản, quà tặng..."
                  autoFocus
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      submitSearch()
                    }
                  }}
                />
                <button className="search-submit" onClick={() => submitSearch()} aria-label="Tìm kiếm" type="button">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </div>
              <div className="search-suggestions">
                <p>Gợi ý tìm kiếm:</p>
                <div className="suggestion-tags">
                  <span onClick={() => submitSearch('Set quà Tết')}>Set quà Tết</span>
                  <span onClick={() => submitSearch('Đặc sản Đà Lạt')}>Đặc sản Đà Lạt</span>
                  <span onClick={() => submitSearch('Giỏ mây thủ công')}>Giỏ mây thủ công</span>
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
