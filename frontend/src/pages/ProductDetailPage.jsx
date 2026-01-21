import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { productApi, favoriteApi, resolveMediaUrl } from '../services/api'
import { addToCart } from '../services/cart'
import ImageWithFallback from '../components/ImageWithFallback'
import '../styles/pages/ProductDetailPage.css'

function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [user, setUser] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    if (slug) {
      loadProduct()
    }
  }, [slug])

  useEffect(() => {
    if (user && product) {
      checkFavorite()
    }
  }, [user, product])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await productApi.getBySlug(slug)
      setProduct(response.data)
      
      // Load related products
      if (response.data.productCategory) {
        const relatedResponse = await productApi.getByCategory(response.data.productCategory, 0, 4)
        const related = (relatedResponse.data.content || relatedResponse.data)
          .filter(p => p.id !== response.data.id)
          .slice(0, 4)
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Error loading product:', error)
      navigate('/san-pham')
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const response = await favoriteApi.check(product.id)
      setIsFavorite(response.data.isFavorite)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/dang-nhap')
      return
    }

    try {
      const response = await favoriteApi.toggle(product.id)
      setIsFavorite(response.data.isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Không tìm thấy sản phẩm</h2>
          <Link to="/san-pham">Quay lại bộ sưu tập</Link>
        </div>
      </div>
    )
  }

  // Gallery: ưu tiên images[] từ DB, fallback về thumbnail
  const images = (product.images && product.images.length > 0 ? product.images : [product.thumbnail])
    .filter(Boolean)
    .map((u) => resolveMediaUrl(u))

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/san-pham">Sản Phẩm</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <section className="product-detail">
        <div className="container">
          <div className="product-detail-grid">
            {/* Product Images */}
            <motion.div 
              className="product-images"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="main-image">
                {images.length > 0 ? (
                  <ImageWithFallback src={images[activeImage]} alt={product.name} />
                ) : (
                  <div className="no-image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Chưa có ảnh</span>
                  </div>
                )}
                {product.salePrice && (
                  <span className="sale-badge">Giảm giá</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="image-thumbnails">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      className={`thumb ${activeImage === index ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <ImageWithFallback src={img} alt={`${product.name} - ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              className="product-info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {product.productCategory && (
                <span className="product-category">{product.productCategory}</span>
              )}
              
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-price-box">
                {product.salePrice ? (
                  <>
                    <span className="price-sale">{formatPrice(product.salePrice)}</span>
                    <span className="price-original">{formatPrice(product.price)}</span>
                    <span className="discount-percent">
                      -{Math.round((1 - product.salePrice / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="price">{formatPrice(product.price)}</span>
                )}
              </div>

              {product.description && (
                <div className="product-description">
                  <p>{product.description}</p>
                </div>
              )}

              {/* Product Features */}
              <div className="product-features">
                <div className="feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Bảo hành chất lượng</span>
                </div>
                <div className="feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                  <span>100% thủ công</span>
                </div>
                <div className="feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  <span>Đóng gói cẩn thận</span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="stock-status">
                {product.stock > 0 ? (
                  <span className="in-stock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Còn hàng ({product.stock} sản phẩm)
                  </span>
                ) : (
                  <span className="out-of-stock">Hết hàng</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="quantity-selector">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-controls">
                  <button onClick={decreaseQuantity} disabled={quantity <= 1}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button onClick={increaseQuantity} disabled={quantity >= (product.stock || 10)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="product-actions">
                <button className="btn-add-cart" disabled={product.stock === 0} onClick={handleAddToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
                <button 
                  className={`btn-favorite ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavorite}
                >
                  <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Extra Info */}
              <div className="extra-info">
                <div className="info-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <div>
                    <strong>Giao hàng toàn quốc</strong>
                    
                  </div>
                </div>
                <div className="info-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  <div>
                    <strong>Đổi trả trong 7 ngày</strong>
                    
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="container">
            <h2 className="section-title">Sản phẩm gợi ý</h2>
            <div className="related-grid">
              {relatedProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="related-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to={`/san-pham/${item.slug}`} className="related-link">
                    <div className="related-image">
                      {item.thumbnail ? (
                        <ImageWithFallback src={resolveMediaUrl(item.thumbnail)} alt={item.name} />
                      ) : (
                        <div className="no-image-small">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                      )}
                      {item.salePrice && <span className="sale-tag">Giảm giá</span>}
                    </div>
                    <div className="related-info">
                      <span className="related-category">{item.productCategory}</span>
                      <h4 className="related-name">{item.name}</h4>
                      <div className="related-price">
                        {item.salePrice ? (
                          <>
                            <span className="price-sale">{formatPrice(item.salePrice)}</span>
                            <span className="price-old">{formatPrice(item.price)}</span>
                          </>
                        ) : (
                          <span className="price">{formatPrice(item.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage
