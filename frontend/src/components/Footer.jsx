import { Link } from 'react-router-dom'
import '../styles/components/Footer.css'

function Footer() {
  return (
    <footer className="footer">
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

      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Đặt hàng & Hỗ trợ</h4>
            <ul>
              <li><Link to="/hoi-dap">Hỏi đáp</Link></li>
              <li><Link to="/huong-dan-mua-hang">Hướng dẫn đặt hàng</Link></li>
              <li><Link to="/chinh-sach-ban-hang">Chính sách giao hàng</Link></li>
              <li><Link to="/dieu-khoan-bao-mat">Điều khoản bảo mật</Link></li>
              <li><Link to="/qua-tang-doanh-nghiep">Quà tặng doanh nghiệp</Link></li>
              <li><Link to="/lien-he">Liên hệ chúng tôi</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Bộ sưu tập</h4>
            <ul>
              <li><Link to="/san-pham/tet">Set quà Tết</Link></li>
              <li><Link to="/san-pham/dac-san">Đặc sản vùng miền</Link></li>
              <li><Link to="/san-pham/thu-cong">Đồ thủ công mỹ nghệ</Link></li>
              <li><Link to="/san-pham/qua-tang">Quà tặng dịp lễ</Link></li>
              <li><Link to="/san-pham/combo">Combo tiết kiệm</Link></li>
              <li><Link to="/san-pham/moi">Sản phẩm mới</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Về Gói Mây</h4>
            <ul>
              <li><Link to="/ve-goi-may">Câu chuyện thương hiệu</Link></li>
              <li><Link to="/lang-nghe">Làng nghề hợp tác</Link></li>
              <li><Link to="/nghe-nhan">Nghệ nhân</Link></li>
              <li><Link to="/ben-vung">Cam kết bền vững</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Mạng xã hội</h4>
            <div className="social-links">
              <a href="https://facebook.com/goimayvietnam" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://instagram.com/goimayvietnam" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://youtube.com/goimayvietnam" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/>
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
            <p>ĐIỆN THOẠI: 19009300 – EMAIL: CONTACT@GOIMAY.VN</p>
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
