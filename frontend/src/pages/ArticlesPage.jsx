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
