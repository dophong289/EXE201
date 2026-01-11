import { Link } from 'react-router-dom'
import '../styles/components/Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-newsletter">
        <div className="newsletter-container">
          <h3>Đăng ký để nhận thông tin khuyến mãi sớm nhất từ Gói Mây</h3>
          <p>Đăng ký để nhận thông tin liên lạc về các sản phẩm, dịch vụ, cửa hàng, sự kiện và các vấn đề đáng quan tâm của Gói Mây.</p>
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
              <li><Link to="/huong-dan-mua-hang">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/chinh-sach-ban-hang">Chính sách bán hàng</Link></li>
              <li><Link to="/dieu-khoan-bao-mat">Điều khoản bảo mật</Link></li>
              <li><Link to="/dieu-kien-chung">Điều kiện chung</Link></li>
              <li><Link to="/lien-he">Liên hệ chúng tôi</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/san-pham/moi">Sản Phẩm Mới</Link></li>
              <li><Link to="/san-pham/duong-da">Dưỡng Da</Link></li>
              <li><Link to="/san-pham/cham-soc-toc">Chăm Sóc Tóc</Link></li>
              <li><Link to="/san-pham/tam-duong-the">Tắm & Dưỡng Thể</Link></li>
              <li><Link to="/san-pham/duong-moi">Dưỡng Môi</Link></li>
              <li><Link to="/san-pham/combo">Combo / Bộ Sản Phẩm</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Về Gói Mây</h4>
            <ul>
              <li><Link to="/ve-goi-may">Câu chuyện thương hiệu</Link></li>
              <li><Link to="/gia-tri-cot-loi">Giá trị cốt lõi</Link></li>
              <li><Link to="/trach-nhiem-cong-dong">Trách nhiệm cộng đồng</Link></li>
              <li><Link to="/nguyen-lieu">Tìm hiểu nguyên liệu</Link></li>
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
            <p><strong>WEBSITE THUỘC QUYỀN CÔNG TY CỔ PHẦN Y&B</strong></p>
            <p>GCNĐKKD: 0315803699 | PHÒNG ĐĂNG KÝ KINH DOANH - SỞ TÀI CHÍNH THÀNH PHỐ HỒ CHÍ MINH</p>
            <p>14D1, KHU PHỐ 1A, ĐƯỜNG QUỐC LỘ 1A, PHƯỜNG TÂN THỚI HIỆP, TP. HỒ CHÍ MINH, VIỆT NAM</p>
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

