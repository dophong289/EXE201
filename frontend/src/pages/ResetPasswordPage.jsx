import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import ImageWithFallback from '../components/ImageWithFallback'
import '../styles/pages/AuthPage.css'

function ResetPasswordPage() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
        }
    }, [token])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        setLoading(true)
        setError('')

        try {
            await authApi.resetPassword(token, formData.password)
            setSuccess(true)
            addToast('Đặt lại mật khẩu thành công!')
            setTimeout(() => navigate('/dang-nhap'), 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
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
                            <ImageWithFallback
                                className="brand-logo-image"
                                src={encodeURI('/Logo-Gói-Mây.png')}
                                alt="Logo Gói Mây"
                                onError={(e) => {
                                    e.currentTarget.style.visibility = 'hidden'
                                }}
                            />
                            <h1 className="brand-name">Gói Mây</h1>
                        </div>
                        <p className="brand-tagline">
                            Gói trọn tinh hoa Việt Nam<br />
                            Chạm đến trái tim bạn
                        </p>
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
                            <h2>Đặt lại mật khẩu</h2>
                            <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
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

                        {success ? (
                            <motion.div
                                className="auth-success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="success-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <h3>Đặt lại thành công!</h3>
                                <p>
                                    Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập...
                                </p>
                            </motion.div>
                        ) : !token ? (
                            <div className="auth-error-state">
                                <p>Link không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.</p>
                                <Link to="/quen-mat-khau" className="auth-submit-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                                    Quên mật khẩu
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="auth-form">
                                <div className="form-group">
                                    <label htmlFor="password">Mật khẩu mới</label>
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
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                    <div className="input-wrapper">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="btn-loading">
                                            <span className="spinner"></span>
                                            Đang xử lý...
                                        </span>
                                    ) : (
                                        'Đặt lại mật khẩu'
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="auth-footer">
                            <p>Đã nhớ mật khẩu? <Link to="/dang-nhap">Đăng nhập</Link></p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ResetPasswordPage
