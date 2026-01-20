import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { siteSettingApi, uploadApi, resolveMediaUrl } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminSiteSettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [uploadingKey, setUploadingKey] = useState(null)
  const fileInputRef = useRef(null)
  const currentUploadKey = useRef(null)

  const settingsConfig = [
    {
      category: 'about',
      title: 'Trang Gói Mây',
      items: [
        { key: 'about_story_image', label: 'Ảnh câu chuyện thương hiệu', description: 'Ảnh hiển thị bên phải phần "Câu chuyện thương hiệu"' },
        { key: 'about_artisan_image', label: 'Ảnh nghệ nhân làng nghề', description: 'Ảnh hiển thị bên trái phần "Nghệ nhân làng nghề"' },
        { key: 'about_material_1', label: 'Ảnh chất liệu 1 - Mây tre đan', description: 'Ảnh đầu tiên trong phần chất liệu' },
        { key: 'about_material_2', label: 'Ảnh chất liệu 2 - Mứt', description: 'Ảnh thứ hai trong phần chất liệu' },
        { key: 'about_material_3', label: 'Ảnh chất liệu 3 - Gỗ tre', description: 'Ảnh thứ ba trong phần chất liệu' },
        { key: 'about_material_4', label: 'Ảnh chất liệu 4 - Lá chuối khô', description: 'Ảnh thứ tư trong phần chất liệu' },
      ]
    },
    {
      category: 'homepage',
      title: 'Trang chủ',
      items: [
        { key: 'home_hero_bg', label: 'Ảnh nền Hero', description: 'Ảnh nền phần hero trang chủ (để trống sẽ dùng gradient mặc định)' },
      ]
    }
  ]

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/dang-nhap')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'ADMIN') {
      navigate('/')
      return
    }
    loadSettings()
  }, [navigate])

  const loadSettings = async () => {
    try {
      // Initialize defaults first
      await siteSettingApi.initDefaults()
      const response = await siteSettingApi.getMap()
      setSettings(response.data || {})
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Không thể tải cài đặt' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleUploadClick = (key) => {
    currentUploadKey.current = key
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const key = currentUploadKey.current
    if (!key) return

    setUploadingKey(key)
    try {
      const response = await uploadApi.uploadImage(file)
      // Lưu path tương đối để không dính localhost khi deploy
      const imagePath = response.data?.url || uploadApi.getImagePath(response.data.filename)
      handleInputChange(key, imagePath)
      setMessage({ type: 'success', text: 'Tải ảnh thành công!' })
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Lỗi khi tải ảnh lên' })
    } finally {
      setUploadingKey(null)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        settingKey: key,
        settingValue: value,
        category: key.startsWith('about_') ? 'about' : 'homepage'
      }))
      
      await siteSettingApi.saveAll(settingsToSave)
      setMessage({ type: 'success', text: 'Lưu cài đặt thành công!' })
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Có lỗi khi lưu cài đặt' })
    } finally {
      setSaving(false)
    }
  }

  const handleSyncToCode = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await siteSettingApi.syncToCode()
      setMessage({ 
        type: 'success', 
        text: response.data?.message || 'Đã đồng bộ dữ liệu vào code thành công! Vui lòng commit file data/site-settings.json vào git.' 
      })
    } catch (error) {
      console.error('Sync error:', error)
      setMessage({ type: 'error', text: 'Có lỗi khi đồng bộ dữ liệu vào code' })
    } finally {
      setSaving(false)
    }
  }

  const handleSyncAllToCode = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await siteSettingApi.syncAllToCode()
      setMessage({ 
        type: 'success', 
        text: response.data?.message || 'Đã đồng bộ tất cả dữ liệu vào code thành công! Vui lòng commit các file trong thư mục data/ và uploads/ vào git.' 
      })
    } catch (error) {
      console.error('Sync all error:', error)
      setMessage({ type: 'error', text: 'Có lỗi khi đồng bộ tất cả dữ liệu vào code' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Quản lý hình ảnh trang</h1>
          <p>Thay đổi các hình ảnh hiển thị trên trang chủ và các trang khác</p>
        </motion.div>

        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {settingsConfig.map((section, sectionIndex) => (
          <motion.div
            key={section.category}
            className="settings-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <h2 className="section-title">{section.title}</h2>
            
            <div className="settings-grid">
              {section.items.map((item) => (
                <div key={item.key} className="setting-item">
                  <div className="setting-info">
                    <label>{item.label}</label>
                    <span className="setting-description">{item.description}</span>
                  </div>
                  
                  <div className="setting-input-group">
                    <div className="image-upload-wrapper">
                      <div className="upload-methods">
                        <button
                          type="button"
                          className="btn-upload"
                          onClick={() => handleUploadClick(item.key)}
                          disabled={uploadingKey === item.key}
                        >
                          {uploadingKey === item.key ? (
                            <>
                              <span className="spinner small"></span>
                              Đang tải...
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                              </svg>
                              Tải ảnh
                            </>
                          )}
                        </button>
                        <span className="upload-divider">hoặc</span>
                        <input
                          type="text"
                          value={settings[item.key] || ''}
                          onChange={(e) => handleInputChange(item.key, e.target.value)}
                          placeholder="Nhập URL ảnh..."
                          className="url-input"
                        />
                      </div>
                      
                      {settings[item.key] && (
                        <div className="image-preview-small">
                          <img 
                            src={resolveMediaUrl(settings[item.key])} 
                            alt={item.label}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          <button
                            type="button"
                            className="remove-image"
                            onClick={() => handleInputChange(item.key, '')}
                            title="Xóa ảnh"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="admin-actions">
          <button 
            className="btn-save-all" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner small"></span>
                Đang lưu...
              </>
            ) : (
              'Lưu tất cả thay đổi'
            )}
          </button>
          <button 
            className="btn-sync-code" 
            onClick={handleSyncToCode}
            disabled={saving}
            style={{ 
              marginLeft: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? (
              <>
                <span className="spinner small"></span>
                Đang đồng bộ...
              </>
            ) : (
              '🔄 Đồng bộ Site Settings'
            )}
          </button>
          <button 
            className="btn-sync-all-code" 
            onClick={handleSyncAllToCode}
            disabled={saving}
            style={{ 
              marginLeft: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              fontWeight: 'bold'
            }}
          >
            {saving ? (
              <>
                <span className="spinner small"></span>
                Đang đồng bộ...
              </>
            ) : (
              '🚀 Đồng bộ TẤT CẢ vào Code'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSiteSettingsPage
