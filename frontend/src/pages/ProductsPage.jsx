import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productApi, productCategoryApi } from '../services/api'
import '../styles/pages/ProductsPage.css'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [activeCategory])

  const loadCategories = async () => {
    try {
      const response = await productCategoryApi.getActive()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      let response
      if (activeCategory === 'all') {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  return (
    <div className="products-page">
      <section className="page-header">
        <h1>Bộ sưu tập quà tặng</h1>
        <p className="page-subtitle">Quà tặng văn hóa Việt Nam - Ý nghĩa, Bền vững, Bản sắc</p>
      </section>

      {/* Category Filter */}
      <section className="category-section">
        <div className="container">
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
              <p>Chưa có sản phẩm trong danh mục này</p>
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
                  <div className="product-image">
                    <img src={product.thumbnail} alt={product.name} />
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
                    <button className="add-to-cart-btn">Thêm vào giỏ</button>
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
              <p>Tre, mây, cói - thân thiện với môi trường</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎁</span>
              <h4>Gói quà miễn phí</h4>
              <p>Đóng gói tinh tế, sẵn sàng làm quà tặng</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <h4>Giao hàng toàn quốc</h4>
              <p>Miễn phí với đơn từ 299.000đ</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductsPage
