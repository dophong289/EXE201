import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArticleCard from '../components/ArticleCard'
import TestimonialSlider from '../components/TestimonialSlider'
import { articleApi, categoryApi } from '../services/api'
import '../styles/pages/ArticlesPage.css'

function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadArticles()
  }, [activeCategory])

  const loadInitialData = async () => {
    try {
      const categoriesRes = await categoryApi.getAll()
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([
        { id: 1, name: 'Làng nghề', slug: 'lang-nghe' },
        { id: 2, name: 'Nghệ nhân', slug: 'nghe-nhan' },
        { id: 3, name: 'Đặc sản', slug: 'dac-san' },
        { id: 4, name: 'Set quà', slug: 'set-qua' },
        { id: 5, name: 'Văn hóa Việt', slug: 'van-hoa-viet' }
      ])
    }
    loadArticles()
  }

  const loadArticles = async () => {
    setLoading(true)
    try {
      let response
      if (activeCategory === 'all') {
        response = await articleApi.getAll(0, 12)
      } else {
        response = await articleApi.getByCategory(activeCategory, 0, 12)
      }
      setArticles(response.data.content || response.data)
      setHasMore(response.data.totalPages > 1)
      setPage(0)
    } catch (error) {
      console.error('Error loading articles:', error)
      // Fallback data - Câu chuyện về văn hóa, làng nghề, nghệ nhân
      setArticles([
        {
          id: 1,
          title: 'Gói Mây hợp tác cùng 50 làng nghề truyền thống - Hành trình gìn giữ văn hóa Việt',
          slug: 'goi-may-hop-tac-lang-nghe',
          summary: 'Thông qua việc hợp tác với các làng nghề truyền thống, Gói Mây mong muốn góp phần bảo tồn nghề thủ công và tạo sinh kế bền vững cho nghệ nhân.',
          thumbnail: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=800',
          categoryName: 'Làng nghề',
          publishedAt: '2026-01-10T10:00:00'
        },
        {
          id: 2,
          title: 'Làng nghề mây tre đan Phú Vinh - 400 năm gìn giữ tinh hoa',
          slug: 'lang-nghe-phu-vinh',
          summary: 'Làng Phú Vinh (Chương Mỹ, Hà Nội) với hơn 400 năm lịch sử là cái nôi của nghề đan mây tre tinh xảo nhất Việt Nam.',
          thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
          categoryName: 'Làng nghề',
          publishedAt: '2026-01-08T10:00:00'
        },
        {
          id: 3,
          title: 'Nghệ nhân Nguyễn Văn Trung và những chiếc giỏ mây mang hồn Việt',
          slug: 'nghe-nhan-nguyen-van-trung',
          summary: 'Câu chuyện về người nghệ nhân 70 tuổi vẫn miệt mài gìn giữ nghề đan mây truyền thống của cha ông.',
          thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
          categoryName: 'Nghệ nhân',
          publishedAt: '2026-01-05T10:00:00'
        },
        {
          id: 4,
          title: 'Đặc sản vùng miền - Tinh túy ẩm thực Việt trong mỗi set quà',
          slug: 'dac-san-vung-mien',
          summary: 'Từ cà phê Đắk Lắk đến chè Thái Nguyên, từ mắm Phú Quốc đến kẹo dừa Bến Tre - hương vị Việt trong từng set quà.',
          thumbnail: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
          categoryName: 'Đặc sản',
          publishedAt: '2026-01-03T09:00:00'
        },
        {
          id: 5,
          title: 'Làng cói Kim Sơn (Ninh Bình) - Nơi sản sinh những sản phẩm cói tinh tế',
          slug: 'lang-coi-kim-son',
          summary: 'Kim Sơn là vùng đất nổi tiếng với nghề dệt cói truyền thống, tạo ra những sản phẩm thủ công mỹ nghệ độc đáo.',
          thumbnail: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
          categoryName: 'Làng nghề',
          publishedAt: '2025-12-28T10:00:00'
        },
        {
          id: 6,
          title: 'Bền vững từ gốc rễ - Triết lý xanh của Gói Mây',
          slug: 'ben-vung-tu-goc-re',
          summary: 'Cam kết sử dụng 100% nguyên liệu tự nhiên, có thể tái chế và phân hủy sinh học, góp phần bảo vệ môi trường.',
          thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
          categoryName: 'Văn hóa Việt',
          publishedAt: '2025-12-20T10:00:00'
        },
        {
          id: 7,
          title: 'Set quà Tết 2026 - Gói trọn yêu thương, đậm đà bản sắc',
          slug: 'set-qua-tet-2026',
          summary: 'Bộ sưu tập quà Tết với giỏ mây thủ công kết hợp đặc sản các vùng miền - món quà ý nghĩa dành tặng người thân.',
          thumbnail: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800',
          categoryName: 'Set quà',
          publishedAt: '2025-12-15T10:00:00'
        },
        {
          id: 8,
          title: 'Nghề đan lát - Di sản văn hóa phi vật thể cần được gìn giữ',
          slug: 'nghe-dan-lat-di-san',
          summary: 'Nghề đan lát truyền thống không chỉ là sinh kế mà còn là di sản văn hóa quý báu của dân tộc Việt Nam.',
          thumbnail: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
          categoryName: 'Văn hóa Việt',
          publishedAt: '2025-12-10T10:00:00'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    try {
      const nextPage = page + 1
      let response
      if (activeCategory === 'all') {
        response = await articleApi.getAll(nextPage, 12)
      } else {
        response = await articleApi.getByCategory(activeCategory, nextPage, 12)
      }
      const newArticles = response.data.content || response.data
      setArticles(prev => [...prev, ...newArticles])
      setHasMore(response.data.totalPages > nextPage + 1)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more articles:', error)
    }
  }

  const featuredArticle = articles[0]
  const regularArticles = articles.slice(1)

  return (
    <div className="articles-page">
      {/* Page Header */}
      <section className="page-header">
        <h1>Câu chuyện văn hóa</h1>
        <p className="page-subtitle">Khám phá hành trình gìn giữ nghề thủ công truyền thống Việt Nam</p>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="featured-section">
          <div className="container">
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

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
                className={`category-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="articles-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              <div className="articles-grid">
                {regularArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <ArticleCard article={article} />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="load-more">
                  <button className="btn btn-outline" onClick={loadMore}>
                    Xem thêm bài viết
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSlider />
    </div>
  )
}

export default ArticlesPage
