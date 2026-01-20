import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productApi, productCategoryApi, favoriteApi, resolveMediaUrl } from '../services/api'
import { addToCart } from '../services/cart'
import '../styles/pages/ProductsPage.css'

function ProductsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [favoriteIds, setFavoriteIds] = useState([])
  const [user, setUser] = useState(null)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    loadCategories()
  }, [])

  // Keep local state in sync if user changes URL manually
  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchInput(q)
    setDebouncedSearch(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Debounce typing so search feels smooth
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reflect debounced search to URL (so Header search can navigate here)
  useEffect(() => {
    const q = (debouncedSearch || '').trim()
    const next = new URLSearchParams(searchParams)
    if (q) next.set('q', q)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    if (user) {
      loadFavoriteIds()
    }
  }, [user])

  useEffect(() => {
    loadProducts()
  }, [activeCategory, debouncedSearch])

  const loadCategories = async () => {
    try {
      const response = await productCategoryApi.getActive()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadFavoriteIds = async () => {
    try {
      const response = await favoriteApi.getIds()
      setFavoriteIds(response.data || [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      let response
      const keyword = (debouncedSearch || '').trim()
      if (keyword) {
        response = await productApi.search(keyword, activeCategory === 'all' ? null : activeCategory, 0, 12)
      } else if (activeCategory === 'all') {
        response = await productApi.getAll(0, 12)
      } else {
        response = await productApi.getByCategory(activeCategory, 0, 12)
      }
      setProducts(response.data.content || response.data)
    } catch (error) {
      console.error('Error loading products:', error)
      // Fallback data
      setProducts([
        {
          id: 1,
          name: 'Set quà Tết An Khang - Giỏ mây tre đan',
          slug: 'set-qua-tet-an-khang',
          price: 850000,
          thumbnail: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=400',
          productCategory: 'Set quà Tết',
          description: 'Giỏ mây tre đan thủ công kết hợp đặc sản'
        },
        {
          id: 2,
          name: 'Set quà Phú Quý - Hộp tre truyền thống',
          slug: 'set-qua-phu-quy',
          price: 1250000,
          salePrice: 999000,
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          productCategory: 'Set quà Tết',
          description: 'Hộp tre khắc hoa văn truyền thống'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (productId, e) => {
    e.stopPropagation()
    
    if (!user) {
      navigate('/dang-nhap')
      return
    }

    try {
      const response = await favoriteApi.toggle(productId)
      if (response.data.isFavorite) {
        setFavoriteIds([...favoriteIds, productId])
      } else {
        setFavoriteIds(favoriteIds.filter(id => id !== productId))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const isFavorite = (productId) => {
    return favoriteIds.includes(productId)
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const clearSearch = () => setSearchInput('')

  return (
    <div className="products-page">
      <section className="page-header">
        <h1>Danh Sách Sản Phẩm</h1>
        <p className="page-subtitle">Quà tặng văn hóa Việt Nam - Ý nghĩa, Bền vững, Bản sắc</p>
      </section>

      {/* Category Filter */}
      <section className="category-section">
        <div className="container">
          <div className="products-search-bar">
            <div className="products-search-input">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput.trim() && (
                <button className="clear-search" onClick={clearSearch} aria-label="Xóa tìm kiếm" type="button">
                  ×
                </button>
              )}
            </div>
            {debouncedSearch.trim() && (
              <div className="products-search-hint">
                Kết quả cho: <strong>{debouncedSearch.trim()}</strong>
              </div>
            )}
          </div>

          <div className="category-tabs">
            <button
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>{debouncedSearch.trim() ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm trong danh mục này'}</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/san-pham/${product.slug}`} className="product-link">
                    <div className="product-image">
                      <img src={resolveMediaUrl(product.thumbnail)} alt={product.name} />
                      {product.salePrice && (
                        <span className="sale-badge">Ưu đãi</span>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.productCategory}</span>
                      <h3 className="product-name">{product.name}</h3>
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                      <div className="product-price">
                        {product.salePrice ? (
                          <>
                            <span className="price-sale">{formatPrice(product.salePrice)}</span>
                            <span className="price-original">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="price">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="product-actions">
                    <button 
                      className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(product.id, e)}
                      title={isFavorite(product.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <svg viewBox="0 0 24 24" fill={isFavorite(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                      </svg>
                    </button>
                    <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(product, e)}>
                      Thêm vào giỏ
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🎋</span>
              <h4>Thủ công 100%</h4>
              <p>Mỗi sản phẩm được làm bởi nghệ nhân làng nghề</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌱</span>
              <h4>Nguyên liệu tự nhiên</h4>
              <p>Tre, mây, lá chuối khô - thân thiện với môi trường</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎁</span>
              <h4>Gói quà miễn phí</h4>
              <p>Đóng gói tinh tế, sẵn sàng làm quà tặng</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <h4>Giao hàng toàn quốc</h4>
              <p>Miễn phí với đơn từ 1.000.000đ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductsPage
