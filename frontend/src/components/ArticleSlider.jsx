import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ArticleCard from './ArticleCard'
import '../styles/components/ArticleSlider.css'

function ArticleSlider({ articles, title }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sliderRef = useRef(null)
  const itemsPerView = 3

  const maxIndex = Math.max(0, articles.length - itemsPerView)

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
  }

  return (
    <div className="article-slider">
      <div className="slider-header">
        <h2 className="slider-title">{title}</h2>
        <a href="#" className="view-all">Tất cả bài viết</a>
      </div>

      <div className="slider-wrapper">
        <button 
          className="slider-arrow prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div className="slider-container" ref={sliderRef}>
          <motion.div 
            className="slider-track"
            animate={{ x: `${-currentIndex * (100 / itemsPerView)}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {articles.map((article, index) => (
              <div key={article.id || index} className="slider-item">
                <ArticleCard article={article} />
              </div>
            ))}
          </motion.div>
        </div>

        <button 
          className="slider-arrow next"
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ArticleSlider

