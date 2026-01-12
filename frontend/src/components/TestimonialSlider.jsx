import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/components/TestimonialSlider.css'

const testimonials = [
  {
    id: 1,
    quote: '"Gói Mây – Quà tặng văn hóa Việt Nam, gói trọn yêu thương và bản sắc dân tộc"',
    source: 'VnExpress'
  },
  {
    id: 2,
    quote: '"Mỗi set quà từ Gói Mây không chỉ là món quà – mà là câu chuyện của làng nghề, của nghệ nhân, của văn hóa Việt"',
    source: 'Thanh Niên'
  },
  {
    id: 3,
    quote: '"Khi tặng Gói Mây, bạn đang góp phần bảo tồn nghề thủ công truyền thống và tạo sinh kế cho cộng đồng làng nghề"',
    source: 'Dân Trí'
  },
  {
    id: 4,
    quote: '"Sự kết hợp hoàn hảo giữa đặc sản địa phương và bao bì thủ công – một xu hướng quà tặng bền vững đáng trân trọng"',
    source: 'Forbes Vietnam'
  }
]

function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="testimonial-slider">
      <div className="testimonial-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="testimonial-item"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <blockquote className="testimonial-quote">
              {testimonials[currentIndex].quote}
            </blockquote>
            <cite className="testimonial-source">
              {testimonials[currentIndex].source}
            </cite>
          </motion.div>
        </AnimatePresence>

        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialSlider
