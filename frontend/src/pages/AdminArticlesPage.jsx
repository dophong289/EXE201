import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { articleApi, categoryApi, uploadApi } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminArticlesPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnail: '',
    author: '',
    categoryId: '',
    featured: false,
    published: true
  })

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState(null)
  
  // Image upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

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
    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [articlesRes, categoriesRes] = await Promise.all([
        articleApi.getAll(0, 100),
        categoryApi.getAll()
      ])
      setArticles(articlesRes.data.content || articlesRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadArticles = async () => {
    try {
      const response = await articleApi.getAll(0, 100)
      setArticles(response.data.content || response.data || [])
    } catch (err) {
      setError('Không thể tải danh sách bài viết')
      console.error(err)
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'title' && modalMode === 'add') {
      setFormData({
        ...formData,
        title: value,
        slug: generateSlug(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const response = await uploadApi.uploadImage(file)
      const imageUrl = 'http://localhost:8080' + response.data.url
      setFormData({
        ...formData,
        thumbnail: imageUrl
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      title: '',
      slug: '',
      summary: '',
      content: '',
      thumbnail: '',
      author: '',
      categoryId: '',
      featured: false,
      published: true
    })
    setShowModal(true)
  }

  const openEditModal = (article) => {
    setModalMode('edit')
    setSelectedArticle(article)
    setFormData({
      title: article.title || '',
      slug: article.slug || '',
      summary: article.summary || '',
      content: article.content || '',
      thumbnail: article.thumbnail || '',
      author: article.author || '',
      categoryId: article.categoryId || '',
      featured: article.featured || false,
      published: article.published !== false
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedArticle(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const articleData = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
      }

      if (modalMode === 'add') {
        await articleApi.create(articleData)
        setSuccess('Thêm bài viết thành công!')
      } else {
        await articleApi.update(selectedArticle.id, articleData)
        setSuccess('Cập nhật bài viết thành công!')
      }

      closeModal()
      loadArticles()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (article) => {
    setArticleToDelete(article)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!articleToDelete) return

    try {
      await articleApi.delete(articleToDelete.id)
      setSuccess('Xóa bài viết thành công!')
      setShowDeleteConfirm(false)
      setArticleToDelete(null)
      loadArticles()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Không thể xóa bài viết')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.name || 'Chưa phân loại'
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
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title">
            <h1>Quản lý bài viết</h1>
            <p>Thêm, sửa, xóa bài viết câu chuyện</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm bài viết
          </button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {success && (
            <motion.div 
              className="alert alert-success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              {success}
            </motion.div>
          )}
          {error && !showModal && (
            <motion.div 
              className="alert alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Articles Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <p>Chưa có bài viết nào</p>
                      <button onClick={openAddModal}>Thêm bài viết đầu tiên</button>
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="product-thumb">
                        {article.thumbnail ? (
                          <img src={article.thumbnail} alt={article.title} />
                        ) : (
                          <div className="no-image">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name">{article.title}</div>
                      <div className="product-slug">{article.slug}</div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {article.categoryName || getCategoryName(article.categoryId)}
                      </span>
                    </td>
                    <td>{article.author || '-'}</td>
                    <td>{formatDate(article.publishedAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`status-badge ${article.published ? 'active' : 'inactive'}`}>
                          {article.published ? 'Đã đăng' : 'Nháp'}
                        </span>
                        {article.featured && (
                          <span className="status-badge active" style={{ background: '#fef3c7', color: '#d97706' }}>
                            Nổi bật
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => openEditModal(article)}
                          title="Sửa"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => confirmDelete(article)}
                          title="Xóa"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              style={{ maxWidth: '800px' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{modalMode === 'add' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}</h2>
                <button className="close-btn" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {error && showModal && (
                <div className="modal-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Làng nghề mây tre đan Phú Vinh"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="lang-nghe-may-tre-dan-phu-vinh"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tác giả</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Tên tác giả"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ảnh đại diện</label>
                  <div className="image-upload-wrapper">
                    <div className="upload-methods">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
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
                            Tải ảnh lên
                          </>
                        )}
                      </button>
                      <span className="upload-divider">hoặc</span>
                      <input
                        type="text"
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={handleInputChange}
                        placeholder="Nhập URL ảnh..."
                        className="url-input"
                      />
                    </div>
                    {formData.thumbnail && (
                      <div className="image-preview">
                        <img src={formData.thumbnail} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => setFormData({...formData, thumbnail: ''})}
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

                <div className="form-group">
                  <label>Tóm tắt</label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Tóm tắt ngắn về bài viết..."
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Nội dung bài viết</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Nội dung chi tiết bài viết..."
                    rows="8"
                    style={{ minHeight: '200px' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Xuất bản bài viết
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Bài viết nổi bật
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner"></span>
                        Đang lưu...
                      </>
                    ) : (
                      modalMode === 'add' ? 'Thêm bài viết' : 'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div 
              className="modal-content delete-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3>Xác nhận xóa</h3>
              <p>Bạn có chắc chắn muốn xóa bài viết <strong>"{articleToDelete?.title}"</strong>?</p>
              <p className="warning">Hành động này không thể hoàn tác.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  Xóa bài viết
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminArticlesPage
