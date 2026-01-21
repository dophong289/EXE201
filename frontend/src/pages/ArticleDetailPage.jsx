import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articleApi, resolveMediaUrl } from '../services/api'
import ImageWithFallback from '../components/ImageWithFallback'
import '../styles/pages/ArticleDetailPage.css'

function ArticleDetailPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticle()
  }, [slug])

  const loadArticle = async () => {
    setLoading(true)
    try {
      const response = await articleApi.getBySlug(slug)
      setArticle(response.data)
      
      // Load related articles
      const relatedRes = await articleApi.getLatest(4)
      setRelatedArticles(relatedRes.data.filter(a => a.slug !== slug).slice(0, 3))
    } catch (error) {
      console.error('Error loading article:', error)
      // Fallback
      setArticle({
        id: 1,
        title: 'Gói Mây x AAF: Ký kết hợp tác "Chung tay cứu trợ chó mèo lang thang" lần II',
        slug: slug,
        content: '<p>Thông qua việc duy trì chương trình "Chung tay cứu trợ chó mèo lang thang" cùng AAF, Gói Mây mong muốn được góp thêm một phần nhỏ bé trong việc cung cấp nguồn lực cho các trạm cứu hộ, giúp duy trì và nâng cao phúc lợi của chó mèo lang thang, đồng thời, lan tỏa sự khích lệ và sẻ chia từ cộng đồng đến với những cá nhân, tập thể đang điều hành trạm và thực hiện công tác cứu hộ chó mèo.</p><p>Gói Mây luôn tin rằng, mỗi hành động nhỏ bé đều có thể tạo nên những thay đổi tích cực cho cộng đồng và môi trường xung quanh chúng ta.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200',
        author: 'Gói Mây Vietnam',
        categoryName: 'Gói Mây',
        publishedAt: '2025-12-03T10:00:00'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('vi-VN', options)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="article-not-found">
        <h2>Không tìm thấy bài viết</h2>
        <Link to="/bai-viet" className="btn btn-primary">Quay lại</Link>
      </div>
    )
  }

  return (
    <div className="article-detail-page">
      <motion.article
        className="article-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Article Header */}
        <header className="article-header">
          <div className="container">
            <div className="breadcrumb">
              <Link to="/">Trang chủ</Link>
              <span>/</span>
              <Link to="/bai-viet">Bài viết</Link>
              <span>/</span>
              <span>{article.categoryName || 'Gói Mây'}</span>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {article.title}
            </motion.h1>
            
            <div className="article-meta">
              <span className="category">{article.categoryName || 'Gói Mây'}</span>
              <span className="date">{formatDate(article.publishedAt)}</span>
              {article.author && <span className="author">bởi {article.author}</span>}
            </div>
          </div>
        </header>

        {/* Article Image */}
        {article.thumbnail && (
          <motion.div 
            className="article-image"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <ImageWithFallback 
              src={resolveMediaUrl(article.thumbnail)} 
              alt={article.title}
            />
          </motion.div>
        )}

        {/* Article Content */}
        <div className="article-body">
          <div className="container">
            <motion.div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            />

            {/* Share Buttons */}
            <div className="share-section">
              <span>Chia sẻ:</span>
              <div className="share-buttons">
                <a href="#" className="share-btn facebook" aria-label="Share on Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href="#" className="share-btn twitter" aria-label="Share on Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="related-articles">
            <div className="container">
              <h3>Bài viết liên quan</h3>
              <div className="related-grid">
                {relatedArticles.map(related => (
                  <Link key={related.id} to={`/bai-viet/${related.slug}`} className="related-card">
                    <div className="related-image">
                      <ImageWithFallback src={resolveMediaUrl(related.thumbnail)} alt={related.title} />
                    </div>
                    <h4>{related.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </motion.article>
    </div>
  )
}

export default ArticleDetailPage

