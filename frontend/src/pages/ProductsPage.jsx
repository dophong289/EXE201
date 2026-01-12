import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { productApi } from '../services/api'
import '../styles/pages/ProductsPage.css'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'Set quà Tết', name: 'Set quà Tết' },
    { id: 'Đặc sản vùng miền', name: 'Đặc sản vùng miền' },
    { id: 'Thủ công mỹ nghệ', name: 'Thủ công mỹ nghệ' },
    { id: 'Quà doanh nghiệp', name: 'Quà doanh nghiệp' }
  ]

  useEffect(() => {
    loadProducts()
  }, [activeCategory])

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
      // Fallback data - Set quà tặng thủ công
      setProducts([
        {
          id: 1,
          name: 'Set quà Tết An Khang - Giỏ mây tre đan',
          slug: 'set-qua-tet-an-khang',
          price: 850000,
          thumbnail: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=400',
          productCategory: 'Set quà Tết',
          description: 'Giỏ mây tre đan thủ công kết hợp đặc sản: Trà Thái Nguyên, Cà phê Đắk Lắk, Bánh đậu xanh Hải Dương'
        },
        {
          id: 2,
          name: 'Set quà Phú Quý - Hộp tre truyền thống',
          slug: 'set-qua-phu-quy',
          price: 1250000,
          salePrice: 999000,
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          productCategory: 'Set quà Tết',
          description: 'Hộp tre khắc hoa văn truyền thống, đựng: Mật ong Hưng Yên, Hạt điều Bình Phước, Trà sen Tây Hồ'
        },
        {
          id: 3,
          name: 'Giỏ mây đan Phú Vinh - Size L',
          slug: 'gio-may-dan-phu-vinh-l',
          price: 450000,
          thumbnail: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400',
          productCategory: 'Thủ công mỹ nghệ',
          description: 'Giỏ mây đan thủ công từ làng nghề Phú Vinh, Hà Nội - 400 năm truyền thống'
        },
        {
          id: 4,
          name: 'Túi cói Kim Sơn - Handmade',
          slug: 'tui-coi-kim-son',
          price: 280000,
          thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400',
          productCategory: 'Thủ công mỹ nghệ',
          description: 'Túi cói đan tay từ làng nghề Kim Sơn, Ninh Bình'
        },
        {
          id: 5,
          name: 'Set đặc sản Đà Lạt - Hộp gỗ tre',
          slug: 'set-dac-san-da-lat',
          price: 650000,
          thumbnail: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
          productCategory: 'Đặc sản vùng miền',
          description: 'Mứt dâu tây, Atiso sấy, Trà hoa cúc Đà Lạt trong hộp gỗ tre khắc laser'
        },
        {
          id: 6,
          name: 'Set đặc sản Tây Bắc - Giỏ mây',
          slug: 'set-dac-san-tay-bac',
          price: 720000,
          thumbnail: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400',
          productCategory: 'Đặc sản vùng miền',
          description: 'Mật ong rừng, Thịt trâu gác bếp, Chè Shan tuyết trong giỏ mây thủ công'
        },
        {
          id: 7,
          name: 'Set quà Doanh nghiệp Premium',
          slug: 'set-qua-doanh-nghiep-premium',
          price: 2500000,
          thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400',
          productCategory: 'Quà doanh nghiệp',
          description: 'Bộ quà cao cấp với hộp tre khắc logo doanh nghiệp, đặc sản và sản phẩm thủ công'
        },
        {
          id: 8,
          name: 'Bộ ấm trà tre nứa thủ công',
          slug: 'bo-am-tra-tre-nua',
          price: 380000,
          thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
          productCategory: 'Thủ công mỹ nghệ',
          description: 'Ấm trà và 6 chén làm từ tre nứa tự nhiên, thân thiện môi trường'
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
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
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
