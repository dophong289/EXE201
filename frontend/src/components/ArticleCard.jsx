import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../services/api'
import ImageWithFallback from './ImageWithFallback'
import '../styles/components/ArticleCard.css'

function ArticleCard({ article, featured = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  }

  if (featured) {
    const thumbnail = resolveMediaUrl(article.thumbnail)
    return (
      <motion.article 
        className="article-card featured"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to={`/bai-viet/${article.slug}`}>
          <div className="article-image">
            {thumbnail && (
              <ImageWithFallback 
                src={thumbnail}
                alt={article.title}
              />
            )}
            <div className="article-overlay">
              <span className="read-more">Đọc bài viết</span>
            </div>
          </div>
          <div className="article-content">
            <h2 className="article-title">{article.title}</h2>
            <p className="article-summary">{article.summary}</p>
          </div>
        </Link>
      </motion.article>
    )
  }

  const thumbnail = resolveMediaUrl(article.thumbnail)

  return (
    <motion.article 
      className="article-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/bai-viet/${article.slug}`}>
        <div className="article-image">
          {thumbnail && (
            <ImageWithFallback 
              src={thumbnail}
              alt={article.title}
            />
          )}
        </div>
        <div className="article-content">
          <div className="article-meta">
            <span className="article-category">{article.categoryName || 'Làm đẹp'}</span>
            <span className="article-date">{formatDate(article.publishedAt)}</span>
          </div>
          <h3 className="article-title">{article.title}</h3>
          <p className="article-summary">{article.summary}</p>
          <span className="read-more-link">Đọc thêm</span>
        </div>
      </Link>
    </motion.article>
  )
}

export default ArticleCard

