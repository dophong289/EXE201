import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import ImageWithFallback from '../components/ImageWithFallback'
import '../styles/pages/AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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
      // Lưu thông tin user (token được lưu trong httpOnly cookie bởi backend)
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role
      }))
      addToast('Đăng nhập thành công!')
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credential) => {
    setGoogleLoading(true)
    setError('')

    try {
      const response = await authApi.loginWithGoogle(credential)
      // Lưu thông tin user (token được lưu trong httpOnly cookie bởi backend)
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role
      }))
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    // Wait for Google Sign-In API to load
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
          console.error('VITE_GOOGLE_CLIENT_ID chưa được cấu hình trong .env file')
          const buttonElement = document.getElementById('google-signin-button')
          if (buttonElement) {
            buttonElement.innerHTML = '<p style="color: #999; font-size: 12px;">Google Sign-In chưa được cấu hình</p>'
          }
          return
        }

        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response.credential) {
                handleGoogleLogin(response.credential)
              }
            },
            use_fedcm_for_prompt: true,
          })

          // Render Google Sign-In button
          const buttonElement = document.getElementById('google-signin-button')
          if (buttonElement) {
            // Clear any existing content
            buttonElement.innerHTML = ''
            window.google.accounts.id.renderButton(buttonElement, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
              locale: 'vi',
              type: 'standard'
            })
          }
        } catch (error) {
          console.error('Lỗi khởi tạo Google Sign-In:', error)
        }
      }
    }

    // Check if Google API is already loaded
    if (window.google && window.google.accounts) {
      initGoogleSignIn()
    } else {
      // Wait for Google API to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        }
      }, 100)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkGoogle)
        if (!window.google || !window.google.accounts) {
          console.error('Không thể tải Google Sign-In API')
        }
      }, 5000)
    }

    // Cleanup
    return () => {
      const buttonElement = document.getElementById('google-signin-button')
      if (buttonElement && window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

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
              <ImageWithFallback
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
              Gói trọn tinh hoa Việt Nam<br />
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
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
              <div id="google-signin-button" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
              {googleLoading && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--color-text-light)' }}>
                  Đang xử lý...
                </div>
              )}
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
