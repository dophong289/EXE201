import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArticleCard from '../components/ArticleCard'
import ArticleSlider from '../components/ArticleSlider'
import TestimonialSlider from '../components/TestimonialSlider'
import { articleApi } from '../services/api'
import { getCache, setCache } from '../services/cache'
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
      // Kiểm tra cache trước
      const featuredCacheKey = '/articles/featured'
      const articlesCacheKey = '/articles/latest?limit=6'
      
      const cachedFeatured = getCache(featuredCacheKey)
      const cachedArticles = getCache(articlesCacheKey)
      
      if (cachedFeatured && cachedArticles) {
        // Hiển thị cache ngay
        if (cachedFeatured.length > 0) {
          setFeaturedArticle(cachedFeatured[0])
        }
        setArticles(cachedArticles)
        setLoading(false)
        
        // Fetch ở background để update cache
        setTimeout(() => {
          Promise.all([
            articleApi.getFeatured(),
            articleApi.getLatest(6)
          ])
            .then(([featuredRes, articlesRes]) => {
              if (featuredRes?.data) {
                setCache(featuredCacheKey, featuredRes.data, 5 * 60 * 1000)
                if (featuredRes.data.length > 0) {
                  setFeaturedArticle(featuredRes.data[0])
                }
              }
              if (articlesRes?.data) {
                setCache(articlesCacheKey, articlesRes.data, 5 * 60 * 1000)
                setArticles(articlesRes.data)
              }
            })
            .catch(() => {})
        }, 0)
        return
      }
      
      // Nếu không có cache, fetch bình thường
      const [featuredRes, articlesRes] = await Promise.all([
        articleApi.getFeatured(),
        articleApi.getLatest(6)
      ])
      
      if (featuredRes.data.length > 0) {
        setFeaturedArticle(featuredRes.data[0])
        setCache(featuredCacheKey, featuredRes.data, 5 * 60 * 1000)
      }
      setArticles(articlesRes.data)
      setCache(articlesCacheKey, articlesRes.data, 5 * 60 * 1000)
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback data
      setFeaturedArticle({
        id: 1,
        title: 'Gói Mây hợp tác cùng 50 làng nghề truyền thống - Hành trình gìn giữ văn hóa Việt',
        slug: 'goi-may-hop-tac-lang-nghe',
        summary: 'Thông qua việc hợp tác với các làng nghề truyền thống trên khắp Việt Nam, Gói Mây mong muốn góp phần bảo tồn nghề thủ công và tạo sinh kế bền vững cho cộng đồng nghệ nhân.',
        thumbnail: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=800'
      })
      setArticles([
        
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

  const langNgheArticles = articles.filter(a => a.categoryName === 'Làng nghề' || a.categoryName === 'Nghệ nhân')
  const dacSanArticles = articles.filter(a => a.categoryName === 'Đặc sản' || a.categoryName === 'Set quà')

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
            Câu chuyện văn hóa
          </motion.h1>
          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Khám phá hành trình gìn giữ nghề thủ công truyền thống
          </motion.p>
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

      {/* Làng nghề Section */}
      <section className="articles-section">
        <ArticleSlider 
          articles={langNgheArticles.length > 0 ? langNgheArticles : articles.slice(0, 3)} 
          title="Làng nghề & Nghệ nhân" 
        />
      </section>

      {/* Đặc sản Section */}
      <section className="articles-section cocoon-section">
        <ArticleSlider 
          articles={dacSanArticles.length > 0 ? dacSanArticles : articles.slice(0, 3)} 
          title="Đặc sản & Set quà" 
        />
      </section>

      {/* Testimonials */}
      <TestimonialSlider />
    </div>
  )
}

export default HomePage
