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
    { id: 'Chăm Sóc Da', name: 'Chăm Sóc Da' },
    { id: 'Tắm & Dưỡng Thể', name: 'Tắm & Dưỡng Thể' },
    { id: 'Chăm Sóc Tóc', name: 'Chăm Sóc Tóc' },
    { id: 'Dưỡng Môi', name: 'Dưỡng Môi' }
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
      // Fallback data
      setProducts([
        {
          id: 1,
          name: 'Cà phê Đắk Lắk làm sạch da chết cơ thể',
          slug: 'ca-phe-dak-lak-lam-sach-da-chet',
          price: 165000,
          thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
          productCategory: 'Tắm & Dưỡng Thể'
        },
        {
          id: 2,
          name: 'Sữa rửa mặt nghệ Hưng Yên',
          slug: 'sua-rua-mat-nghe-hung-yen',
          price: 145000,
          thumbnail: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
          productCategory: 'Chăm Sóc Da'
        },
        {
          id: 3,
          name: 'Nước tẩy trang hoa hồng',
          slug: 'nuoc-tay-trang-hoa-hong',
          price: 175000,
          salePrice: 149000,
          thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
          productCategory: 'Chăm Sóc Da'
        },
        {
          id: 4,
          name: 'Dầu gội bưởi Việt Nam',
          slug: 'dau-goi-buoi-viet-nam',
          price: 185000,
          thumbnail: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400',
          productCategory: 'Chăm Sóc Tóc'
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
        <h1>Sản phẩm</h1>
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
                      <span className="sale-badge">Giảm giá</span>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.productCategory}</span>
                    <h3 className="product-name">{product.name}</h3>
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
    </div>
  )
}

export default ProductsPage

