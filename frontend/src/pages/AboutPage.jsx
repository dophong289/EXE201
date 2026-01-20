import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { siteSettingApi, resolveMediaUrl } from '../services/api'
import '../styles/pages/AboutPage.css'

function VietnamFlagIcon() {
  // Cờ Việt Nam (đỏ + sao vàng) bằng SVG để hiển thị ổn định trên mọi thiết bị
  return (
    <span className="flag-icon" aria-label="Cờ Việt Nam" title="Cờ Việt Nam">
      <svg viewBox="0 0 30 20" role="img" aria-hidden="true">
        <rect width="30" height="20" fill="#DA251D" />
        <path
          d="M15 4.2l1.763 5.428h5.707l-4.617 3.352 1.763 5.428L15 15.056l-4.616 3.352 1.763-5.428-4.617-3.352h5.707L15 4.2z"
          fill="#FFCD00"
        />
      </svg>
    </span>
  )
}

function AboutPage() {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await siteSettingApi.getMapByCategory('about')
      setSettings(response.data || {})
    } catch (error) {
      console.error('Error loading settings:', error)
      // Use default images if API fails
      setSettings({
        about_story_image: 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=600',
        about_artisan_image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600',
        about_material_1: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/615564671_122107400307198100_1475565070963309061_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEDBqvyD9utxkBdH9yX9G3O4gQ9gJTcRWviBD2AlNxFayXrQoKh3gBUommmHYZAFSz2nF_0v67-1LXfOoOqDj_3&_nc_ohc=wnurCQQD0BEQ7kNvwHoCwhK&_nc_oc=AdkOONJhbZMtxoeZvpAF1UjTRoMuFT0LPXmkmeEHQyG1rBeMV8aG67TLMrd6yWIlE8M&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=slk3jsgnDJmmMvM5MPqZQg&oh=00_AfqQ9DjYu75oh7fH041dlhttcR758BfRkdqi1IjrrTDokg&oe=6974D67F',
        about_material_2: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/615564671_122107400307198100_1475565070963309061_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEDBqvyD9utxkBdH9yX9G3O4gQ9gJTcRWviBD2AlNxFayXrQoKh3gBUommmHYZAFSz2nF_0v67-1LXfOoOqDj_3&_nc_ohc=wnurCQQD0BEQ7kNvwHoCwhK&_nc_oc=AdkOONJhbZMtxoeZvpAF1UjTRoMuFT0LPXmkmeEHQyG1rBeMV8aG67TLMrd6yWIlE8M&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=slk3jsgnDJmmMvM5MPqZQg&oh=00_AfqQ9DjYu75oh7fH041dlhttcR758BfRkdqi1IjrrTDokg&oe=6974D67F',
        about_material_3: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/615564671_122107400307198100_1475565070963309061_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEDBqvyD9utxkBdH9yX9G3O4gQ9gJTcRWviBD2AlNxFayXrQoKh3gBUommmHYZAFSz2nF_0v67-1LXfOoOqDj_3&_nc_ohc=wnurCQQD0BEQ7kNvwHoCwhK&_nc_oc=AdkOONJhbZMtxoeZvpAF1UjTRoMuFT0LPXmkmeEHQyG1rBeMV8aG67TLMrd6yWIlE8M&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=slk3jsgnDJmmMvM5MPqZQg&oh=00_AfqQ9DjYu75oh7fH041dlhttcR758BfRkdqi1IjrrTDokg&oe=6974D67F',
        about_material_4: 'https://scontent.fhan18-1.fna.fbcdn.net/v/t39.30808-6/615564671_122107400307198100_1475565070963309061_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEDBqvyD9utxkBdH9yX9G3O4gQ9gJTcRWviBD2AlNxFayXrQoKh3gBUommmHYZAFSz2nF_0v67-1LXfOoOqDj_3&_nc_ohc=wnurCQQD0BEQ7kNvwHoCwhK&_nc_oc=AdkOONJhbZMtxoeZvpAF1UjTRoMuFT0LPXmkmeEHQyG1rBeMV8aG67TLMrd6yWIlE8M&_nc_zt=23&_nc_ht=scontent.fhan18-1.fna&_nc_gid=slk3jsgnDJmmMvM5MPqZQg&oh=00_AfqQ9DjYu75oh7fH041dlhttcR758BfRkdqi1IjrrTDokg&oe=6974D67F'
      })
    }
  }

  const values = [
    {
      icon: '🎋',
      title: 'Thủ công truyền thống',
      description: 'Mỗi sản phẩm được làm thủ công bởi các nghệ nhân làng nghề, gìn giữ tinh hoa văn hóa Việt qua từng đường đan, nét tết.'
    },
    {
      icon: <VietnamFlagIcon />,
      title: 'Bản sắc Việt Nam',
      description: 'Kết hợp đặc sản địa phương với bao bì thủ công từ tre, mây, nan - mang đậm hồn Việt trong từng set quà.'
    },
    {
      icon: '🌱',
      title: 'Bền vững với môi trường',
      description: 'Sử dụng 100% nguyên liệu tự nhiên, có thể tái chế và phân hủy sinh học, góp phần bảo vệ môi trường.'
    },
    {
      icon: '💝',
      title: 'Trải nghiệm ý nghĩa',
      description: 'Mỗi set quà không chỉ là món quà - mà là câu chuyện văn hóa, là tình cảm được gửi gắm qua bàn tay nghệ nhân.'
    }
  ]

  // Helper to get image with fallback
  const getImage = (key, fallback) => resolveMediaUrl(settings[key] || fallback)

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
            <h1 className="about-brand">
              <img
                className="about-logo"
                src="/Logo-Gói-Mây.png"
                alt="Logo Gói Mây"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span>Gói Mây</span>
            </h1>
            <p className="tagline">Gói quà mây tre, kết tinh từ làng nghề và bàn tay người Việt!</p>
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
                <strong>Gói Mây</strong> ra đời từ tình yêu với những làng nghề truyền thống Việt Nam - 
                nơi đôi bàn tay khéo léo của các nghệ nhân đã tạo nên những tác phẩm từ tre, mây, nan 
                qua hàng trăm năm lịch sử.
              </p>
              <p>
                Chúng tôi kết nối tinh hoa thủ công truyền thống với đặc sản vùng miền, tạo nên những 
                set quà tặng độc đáo - nơi mỗi chiếc giỏ mây, hộp tre, túi cói đều mang trong mình 
                câu chuyện của người thợ làng nghề Chương Mỹ. 
              </p>
              <p>
                Với Gói Mây, tặng quà không chỉ là trao đi một món đồ - mà là gửi gắm văn hóa, 
                là lan tỏa giá trị truyền thống Việt Nam đến mọi người, mọi nơi trên thế giới.
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
                src={getImage('about_story_image', 'https://images.unsplash.com/photo-1595231712325-9fedecef7575?w=600')} 
                alt="Sản phẩm thủ công Gói Mây"
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

      {/* Materials Section */}
      <section className="about-ingredients">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Chất liệu thủ công truyền thống</h2>
            <p className="ingredients-intro">
              Gói Mây tự hào sử dụng các nguyên liệu tự nhiên từ làng nghề Việt Nam, 
              mỗi sản phẩm là một tác phẩm nghệ thuật mang đậm bản sắc văn hóa dân tộc.
            </p>
          </motion.div>
          
          <div className="ingredients-grid">
            <div className="ingredient-item">
              <img 
                src={getImage('about_material_1', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300')}
                alt="Mây tre đan" 
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'
                }}
              />
              <h4>Mây tre đan</h4>
            </div>
            <div className="ingredient-item">
              <img 
                src={getImage('about_material_2', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300')}
                alt="Mứt" 
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300'
                }}
              />
              <h4>Mứt</h4>
            </div>
            <div className="ingredient-item">
              <img 
                src={getImage('about_material_3', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300')}
                alt="Gỗ tre" 
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300'
                }}
              />
              <h4>Gỗ tre</h4>
            </div>
            <div className="ingredient-item">
              <img 
                src={getImage('about_material_4', 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=300')}
                alt="Lá chuối khô" 
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=300'
                }}
              />
              <h4>Lá chuối khô</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Artisans Section */}
      <section className="about-story" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="story-content">
            <motion.div
              className="story-image"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src={getImage('about_artisan_image', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600')} 
                alt="Nghệ nhân làng nghề"
              />
            </motion.div>
            <motion.div
              className="story-text"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2>Nghệ nhân làng nghề</h2>
              <p>
                Gói Mây hợp tác với hơn 50 hộ gia đình nghệ nhân tại các làng nghề truyền thống như
                - <strong>Chương Mỹ (Hà Nội)</strong> - những nơi lưu giữ tinh hoa nghề đan lát 
                hàng trăm năm tuổi.
              </p>
              <p>
                Mỗi set quà của Gói Mây không chỉ mang giá trị vật chất, mà còn góp phần 
                bảo tồn nghề thủ công truyền thống và tạo sinh kế bền vững cho cộng đồng làng nghề.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Khám phá bộ sưu tập quà tặng</h2>
          <p>Gửi gắm yêu thương qua những set quà mang đậm bản sắc Việt</p>
          <a href="/san-pham" className="btn btn-primary">Xem sản phẩm</a>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
