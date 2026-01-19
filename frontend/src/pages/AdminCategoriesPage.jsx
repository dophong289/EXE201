import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productCategoryApi } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminCategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    displayOrder: 0,
    active: true
  })

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

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
    loadCategories()
  }, [navigate])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await productCategoryApi.getAll()
      setCategories(response.data || [])
    } catch (err) {
      setError('Không thể tải danh sách danh mục')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name) => {
    return name
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
    
    if (name === 'name' && modalMode === 'add') {
      setFormData({
        ...formData,
        name: value,
        slug: generateSlug(value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      displayOrder: 0,
      active: true
    })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setModalMode('edit')
    setSelectedCategory(category)
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder || 0,
      active: category.active !== false
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCategory(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const data = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0
      }
      
      if (modalMode === 'add') {
        await productCategoryApi.create(data)
        setSuccess('Thêm danh mục thành công!')
      } else {
        await productCategoryApi.update(selectedCategory.id, data)
        setSuccess('Cập nhật danh mục thành công!')
      }

      closeModal()
      loadCategories()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (category) => {
    setCategoryToDelete(category)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      await productCategoryApi.delete(categoryToDelete.id)
      setSuccess('Xóa danh mục thành công!')
      setShowDeleteConfirm(false)
      setCategoryToDelete(null)
      loadCategories()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Không thể xóa danh mục.')
      setShowDeleteConfirm(false)
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
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title">
            <h1>Quản lý danh mục sản phẩm</h1>
            <p>Thêm, sửa, xóa danh mục hiển thị trên trang sản phẩm</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm danh mục
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

        {/* Categories Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                      </svg>
                      <p>Chưa có danh mục nào</p>
                      <button onClick={openAddModal}>Thêm danh mục đầu tiên</button>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category.id}>
                    <td>
                      <span className="id-badge">{category.displayOrder || index + 1}</span>
                    </td>
                    <td>
                      <div className="category-name">{category.name}</div>
                    </td>
                    <td>
                      <code className="slug-text">{category.slug}</code>
                    </td>
                    <td>
                      <div className="description-text">
                        {category.description || <span className="text-muted">Chưa có mô tả</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${category.active ? 'active' : 'inactive'}`}>
                        {category.active ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => openEditModal(category)}
                          title="Sửa"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => confirmDelete(category)}
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
              className="modal-content modal-small"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h2>
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
                  <label>Tên danh mục *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Set quà Tết"
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
                      placeholder="set-qua-tet"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thứ tự hiển thị</label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả ngắn về danh mục..."
                    rows="3"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Hiển thị danh mục trên trang sản phẩm
                  </label>
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
                      modalMode === 'add' ? 'Thêm danh mục' : 'Lưu thay đổi'
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
              <p>Bạn có chắc chắn muốn xóa danh mục <strong>"{categoryToDelete?.name}"</strong>?</p>
              <p className="warning">Hành động này không thể hoàn tác.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  Xóa danh mục
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminCategoriesPage
