import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArticleCard from '../components/ArticleCard'
import ArticleSlider from '../components/ArticleSlider'
import TestimonialSlider from '../components/TestimonialSlider'
import { articleApi } from '../services/api'
import '../styles/pages/HomePage.css'

function HomePage() {
  const [featuredArticle, setFeaturedArticle] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [featuredRes, articlesRes] = await Promise.all([
        articleApi.getFeatured(),
        articleApi.getLatest(6)
      ])
      
      if (featuredRes.data.length > 0) {
        setFeaturedArticle(featuredRes.data[0])
      }
      setArticles(articlesRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback data
      setFeaturedArticle({
        id: 1,
        title: 'Gói Mây x AAF: Ký kết hợp tác "Chung tay cứu trợ chó mèo lang thang" lần II',
        slug: 'goi-may-x-aaf-ky-ket-hop-tac',
        summary: 'Thông qua việc duy trì chương trình "Chung tay cứu trợ chó mèo lang thang" cùng AAF, Gói Mây mong muốn được góp thêm một phần nhỏ bé trong việc cung cấp nguồn lực cho các trạm cứu hộ.',
        thumbnail: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800'
      })
      setArticles([
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
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const lamDepArticles = articles.filter(a => a.categoryName === 'Làm đẹp' || !a.categoryName)
  const goimayArticles = articles.filter(a => a.categoryName === 'Gói Mây')

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Bài viết
          </motion.h1>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="featured-section">
          <div className="container">
            <ArticleCard article={featuredArticle} featured />
          </div>
        </section>
      )}

      {/* Làm đẹp Section */}
      <section className="articles-section">
        <ArticleSlider 
          articles={lamDepArticles.length > 0 ? lamDepArticles : articles.slice(0, 3)} 
          title="Làm đẹp" 
        />
      </section>

      {/* Gói Mây Section */}
      <section className="articles-section cocoon-section">
        <ArticleSlider 
          articles={goimayArticles.length > 0 ? goimayArticles : articles.slice(0, 3)} 
          title="Gói Mây" 
        />
      </section>

      {/* Testimonials */}
      <TestimonialSlider />
    </div>
  )
}

export default HomePage

