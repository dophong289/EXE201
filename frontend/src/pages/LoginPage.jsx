import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../services/api'
import '../styles/pages/AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.login(formData)
      // Lưu token và thông tin user
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role
      }))
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <motion.div 
          className="auth-branding"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="brand-content">
            <div className="brand-logo">
              <img
                className="brand-logo-image"
                src={encodeURI('/Logo-Gói-Mây.png')}
                alt="Logo Gói Mây"
                onError={(e) => {
                  // Nếu logo lỗi (thường do tên file có dấu trên một số môi trường), ẩn ảnh nhưng vẫn giữ chữ
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
              <h1 className="brand-name">Gói Mây</h1>
            </div>
            <p className="brand-tagline">
              Gói trọn tinh hoa Việt Nam<br/>
              Chạm đến trái tim bạn
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-icon">🎁</span>
                <span>Set quà tặng độc đáo</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏡</span>
                <span>Đặc sản vùng miền</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Thủ công truyền thống</span>
              </div>
            </div>
          </div>
          <div className="brand-pattern"></div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div 
          className="auth-form-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Chào mừng trở lại</h2>
              <p>Đăng nhập để khám phá thêm</p>
            </div>

            {error && (
              <motion.div 
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/quen-mat-khau" className="forgot-link">Quên mật khẩu?</Link>
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <div className="social-login">
              <button className="social-btn google">
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </button>
            </div>

            <div className="auth-footer">
              <p>Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
