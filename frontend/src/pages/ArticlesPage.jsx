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
        { id: 1, name: 'Làm đẹp', slug: 'lam-dep' },
        { id: 2, name: 'Gói Mây', slug: 'goi-may' },
        { id: 3, name: 'Chăm sóc tóc', slug: 'cham-soc-toc' }
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
      // Fallback data
      setArticles([
        {
          id: 1,
          title: 'Gói Mây x AAF: Ký kết hợp tác "Chung tay cứu trợ chó mèo lang thang" lần II',
          slug: 'goi-may-x-aaf-ky-ket-hop-tac',
          summary: 'Thông qua việc duy trì chương trình cùng AAF, Gói Mây mong muốn góp phần cung cấp nguồn lực cho các trạm cứu hộ.',
          thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
          categoryName: 'Gói Mây',
          publishedAt: '2025-12-03T10:00:00'
        },
        {
          id: 2,
          title: 'Vài "tip" giúp bạn tận hưởng trọn vẹn từng giây phút làm sạch da chết',
          slug: 'tip-lam-sach-da-chet',
          summary: 'Hãy thử áp dụng một vài tip sau để gia tăng thêm những trải nghiệm thật "chill".',
          thumbnail: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
          categoryName: 'Làm đẹp',
          publishedAt: '2021-10-01T10:00:00'
        },
        {
          id: 3,
          title: '3 bước tẩy da chết hiệu quả dành cho mặt từ cà phê Đắk Lắk',
          slug: '3-buoc-tay-da-chet',
          summary: 'Việc tẩy da chết tuy chỉ mất từ 10 – 15s nhưng nó sẽ giúp bạn loại bỏ các tế bào da chết.',
          thumbnail: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800',
          categoryName: 'Làm đẹp',
          publishedAt: '2021-09-22T10:00:00'
        },
        {
          id: 4,
          title: 'Da dầu, mụn sẽ "ăn chay" như thế nào?',
          slug: 'da-dau-mun-an-chay',
          summary: 'Giống như các loại da khác, da dầu cũng sẽ đạt được trạng thái khỏe mạnh.',
          thumbnail: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
          categoryName: 'Làm đẹp',
          publishedAt: '2021-09-22T09:00:00'
        },
        {
          id: 5,
          title: 'Chương trình "Thu hồi pin cũ - Bảo vệ trái đất xanh" năm 2025',
          slug: 'chuong-trinh-thu-hoi-pin-cu',
          summary: 'Gói Mây và Trường ĐH Sư phạm TP.HCM phát động chương trình lần thứ 4.',
          thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
          categoryName: 'Gói Mây',
          publishedAt: '2025-10-24T10:00:00'
        },
        {
          id: 6,
          title: 'Gói Mây đã có mặt tại Nhật Bản',
          slug: 'goi-may-da-co-mat-tai-nhat-ban',
          summary: 'Cột mốc đánh dấu nấc thang mới trên hành trình vươn xa của thương hiệu.',
          thumbnail: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
          categoryName: 'Gói Mây',
          publishedAt: '2025-08-20T10:00:00'
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
        <h1>Bài viết</h1>
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

