import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { userApi } from '../services/api'
import '../styles/pages/AccountPage.css'

function AccountPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    address: ''
  })
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      navigate('/dang-nhap')
      return
    }
    loadProfile()
  }, [navigate])

  const loadProfile = async () => {
    try {
      const response = await userApi.getProfile()
      setUser(response.data)
      setProfileData({
        fullName: response.data.fullName || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/dang-nhap')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await userApi.updateProfile(profileData)
      setUser(response.data)
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      storedUser.fullName = response.data.fullName
      localStorage.setItem('user', JSON.stringify(storedUser))
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
      return
    }

    setChangingPassword(true)
    setMessage({ type: '', text: '' })

    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra' })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <motion.div
          className="account-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="user-avatar-large">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="user-header-info">
            <h1>{user?.fullName}</h1>
            <p>{user?.email}</p>
            <span className="member-since">Thành viên từ {user?.createdAt}</span>
          </div>
        </motion.div>

        {message.text && (
          <motion.div 
            className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {message.text}
          </motion.div>
        )}

        <div className="account-sections">
          {/* Profile Section */}
          <motion.section 
            className="account-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2>Thông tin cá nhân</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled"
                />
                <span className="form-hint">Email không thể thay đổi</span>
              </div>
              
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  placeholder="Nhập địa chỉ giao hàng"
                  rows="3"
                />
              </div>
              
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </motion.section>

          {/* Password Section */}
          <motion.section 
            className="account-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
              
              <button type="submit" className="btn-save" disabled={changingPassword}>
                {changingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
