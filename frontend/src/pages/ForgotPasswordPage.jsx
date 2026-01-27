import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import ImageWithFallback from '../components/ImageWithFallback'
import '../styles/pages/AuthPage.css'

function ForgotPasswordPage() {
    const navigate = useNavigate()
    const { addToast } = useToast()

    // Steps: 'email' -> 'otp' -> redirect to reset page
    const [step, setStep] = useState('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)

    // Step 1: Send OTP to email
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await authApi.forgotPassword(email)
            setStep('otp')
            addToast('Đã gửi mã xác minh đến email của bạn!')
            startResendCooldown()
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await authApi.verifyResetOtp(email, otp)
            const resetToken = response.data.token
            addToast('Xác minh thành công!')
            // Navigate to reset password page with token
            navigate(`/dat-lai-mat-khau?token=${resetToken}`)
        } catch (err) {
            setError(err.response?.data?.message || 'Mã xác minh không đúng hoặc đã hết hạn.')
        } finally {
            setLoading(false)
        }
    }

    // Resend OTP with cooldown
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return

        setLoading(true)
        setError('')

        try {
            await authApi.forgotPassword(email)
            addToast('Đã gửi lại mã xác minh!')
            startResendCooldown()
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    const startResendCooldown = () => {
        setResendCooldown(60)
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
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
                        <div className="brand-features">
                            <div className="feature-item">
                                <span className="feature-icon">🔒</span>
                                <span>Bảo mật tài khoản</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📧</span>
                                <span>Xác minh qua email</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✨</span>
                                <span>Đặt lại mật khẩu dễ dàng</span>
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
                        {step === 'email' ? (
                            <>
                                <div className="auth-header">
                                    <h2>Quên mật khẩu</h2>
                                    <p>Nhập email để nhận mã xác minh</p>
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

                                <form onSubmit={handleSendOtp} className="auth-form">
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
                                                value={email}
                                                onChange={(e) => { setEmail(e.target.value); setError('') }}
                                                placeholder="example@email.com"
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
                                                Đang gửi...
                                            </span>
                                        ) : (
                                            'Gửi mã xác minh'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <div className="auth-header">
                                    <h2>Nhập mã xác minh</h2>
                                    <p>Mã đã được gửi đến <strong>{email}</strong></p>
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

                                <form onSubmit={handleVerifyOtp} className="auth-form">
                                    <div className="form-group">
                                        <label htmlFor="otp">Mã xác minh (6 chữ số)</label>
                                        <div className="input-wrapper">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0110 0v4" />
                                            </svg>
                                            <input
                                                type="text"
                                                id="otp"
                                                name="otp"
                                                value={otp}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                    setOtp(val)
                                                    setError('')
                                                }}
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.25rem' }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="auth-submit-btn"
                                        disabled={loading || otp.length !== 6}
                                    >
                                        {loading ? (
                                            <span className="btn-loading">
                                                <span className="spinner"></span>
                                                Đang xác minh...
                                            </span>
                                        ) : (
                                            'Xác minh'
                                        )}
                                    </button>
                                </form>

                                <div className="resend-otp" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    {resendCooldown > 0 ? (
                                        <span style={{ color: 'var(--color-text-light)' }}>
                                            Gửi lại mã sau {resendCooldown}s
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--color-primary)',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            Gửi lại mã xác minh
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setStep('email'); setOtp(''); setError('') }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-light)',
                                        cursor: 'pointer',
                                        marginTop: '1rem',
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'center'
                                    }}
                                >
                                    ← Thay đổi email
                                </button>
                            </>
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

export default ForgotPasswordPage
