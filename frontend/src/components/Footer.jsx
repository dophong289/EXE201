import { Link, useLocation } from 'react-router-dom'
import '../styles/components/Footer.css'

function Footer() {
  const location = useLocation()
  const isProductsPage = location.pathname === '/san-pham'
  
  return (
    <footer className="footer">
      {!isProductsPage && (
        <div className="footer-newsletter">
        <div className="newsletter-container">
          <h3>Đăng ký nhận thông tin từ Gói Mây</h3>
          <p>Khám phá bộ sưu tập quà tặng văn hóa Việt Nam, ưu đãi độc quyền và câu chuyện từ các làng nghề truyền thống.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Nhập email của bạn" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </div>
      )}

      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Đặt hàng & Hỗ trợ</h4>
            <ul>
              <li><Link to="/hoi-dap">Hỏi đáp</Link></li>
              <li><Link to="/qua-tang-doanh-nghiep">Quà tặng doanh nghiệp</Link></li>
              <li><Link to="/lien-he">Liên hệ chúng tôi</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Sản Phẩm</h4>
            <ul>
              <li><Link to="/san-pham/tet">Set quà Tết</Link></li>
              <li><Link to="/san-pham/thu-cong">Đồ thủ công mỹ nghệ</Link></li>
              <li><Link to="/san-pham/qua-tang">Quà tặng dịp lễ</Link></li>
              <li><Link to="/san-pham/moi">Sản phẩm mới</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Gói Mây</h4>
            <ul>
              <li><Link to="/ve-goi-may">Câu chuyện thương hiệu</Link></li>
              <li><Link to="/ben-vung">Cam kết bền vững</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Mạng xã hội</h4>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61585943023670" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@goimay_" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6 2c.2 2.1 1.4 3.8 3.4 4.5V10c-1.5-.1-2.8-.6-3.9-1.5v6.4c0 3.7-3 6.7-6.7 6.7S2.7 18.6 2.7 14.9c0-3.6 2.9-6.6 6.5-6.7v3.6c-.2 0-.4-.1-.6-.1-1.7 0-3.1 1.4-3.1 3.1S7 17.9 8.7 17.9s3-1.3 3.1-3V2h4.8z"/>
                </svg>
              </a>
              <a href="https://zalo.me/19009300" target="_blank" rel="noopener noreferrer" aria-label="Zalo">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="Arial" fontWeight="700" fill="currentColor">
                    Z
                  </text>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="company-info">
            <p><strong>GÓI MÂY - QUÀ TẶNG VĂN HÓA VIỆT NAM</strong></p>
            <p>Kết hợp đặc sản địa phương và bao bì thủ công truyền thống</p>
            <p>Hướng đến trải nghiệm ý nghĩa – bền vững – mang bản sắc Việt</p>
            <p>Điện thoại: 098 552 39 82 </p>
            <p>Email: goimayvn@gmail.com</p>
          </div>
          <div className="copyright">
            <p>© 2026 Gói Mây Vietnam. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
