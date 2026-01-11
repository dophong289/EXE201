import { motion } from 'framer-motion'
import '../styles/pages/AboutPage.css'

function AboutPage() {
  const values = [
    {
      icon: '🌿',
      title: 'Thuần chay 100%',
      description: 'Tất cả sản phẩm Gói Mây không chứa thành phần từ động vật và không thử nghiệm trên động vật.'
    },
    {
      icon: '🇻🇳',
      title: 'Nguyên liệu Việt Nam',
      description: 'Tự hào sử dụng các nguyên liệu thiên nhiên đặc trưng của Việt Nam trong mỗi sản phẩm.'
    },
    {
      icon: '🌱',
      title: 'Thân thiện môi trường',
      description: 'Cam kết sử dụng bao bì có thể tái chế và giảm thiểu tác động đến môi trường.'
    },
    {
      icon: '💚',
      title: 'Trách nhiệm cộng đồng',
      description: 'Đồng hành cùng các hoạt động xã hội và bảo vệ động vật.'
    }
  ]

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Gói Mây</h1>
            <p className="tagline">Mỹ phẩm thuần chay cho nét đẹp thuần Việt</p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-content">
            <motion.div
              className="story-text"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Câu chuyện thương hiệu</h2>
              <p>
                Gói Mây được ra đời với sứ mệnh mang đến những sản phẩm chăm sóc da và tóc 
                thuần chay, an toàn và hiệu quả. Chúng tôi tin rằng vẻ đẹp thực sự đến từ 
                sự hài hòa với thiên nhiên.
              </p>
              <p>
                Mỗi sản phẩm Gói Mây đều được nghiên cứu và phát triển với tâm huyết, 
                sử dụng các nguyên liệu thiên nhiên đặc trưng của Việt Nam như cà phê 
                Đắk Lắk, nghệ Hưng Yên, bưởi Năm Roi, và nhiều hơn nữa.
              </p>
              <p>
                Chúng tôi cam kết không thử nghiệm trên động vật và không sử dụng 
                các thành phần có nguồn gốc từ động vật trong bất kỳ sản phẩm nào.
              </p>
            </motion.div>
            <motion.div
              className="story-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600" 
                alt="Gói Mây products"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2>Giá trị cốt lõi</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <span className="value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <section className="about-ingredients">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Nguyên liệu thiên nhiên Việt Nam</h2>
            <p className="ingredients-intro">
              Gói Mây tự hào sử dụng các nguyên liệu thiên nhiên đặc trưng của Việt Nam, 
              mang đến những trải nghiệm làm đẹp độc đáo và hiệu quả.
            </p>
          </motion.div>
          
          <div className="ingredients-grid">
            <div className="ingredient-item">
              <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" alt="Cà phê Đắk Lắk" />
              <h4>Cà phê Đắk Lắk</h4>
            </div>
            <div className="ingredient-item">
              <img src="https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300" alt="Nghệ Hưng Yên" />
              <h4>Nghệ Hưng Yên</h4>
            </div>
            <div className="ingredient-item">
              <img src="https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300" alt="Bưởi Năm Roi" />
              <h4>Bưởi Năm Roi</h4>
            </div>
            <div className="ingredient-item">
              <img src="https://images.unsplash.com/photo-1518882605630-8eb579795938?w=300" alt="Hoa hồng" />
              <h4>Hoa hồng</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Khám phá sản phẩm Gói Mây</h2>
          <p>Bắt đầu hành trình làm đẹp thuần chay cùng chúng tôi</p>
          <a href="/san-pham" className="btn btn-primary">Xem sản phẩm</a>
        </div>
      </section>
    </div>
  )
}

export default AboutPage

