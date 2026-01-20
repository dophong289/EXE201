import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { productApi, uploadApi, productCategoryApi, resolveMediaUrl, normalizeApiPath } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    salePrice: '',
    thumbnail: '',
    images: [],
    productCategory: '',
    stock: '',
    active: true
  })

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  
  // Image upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Check if user is logged in and is admin
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
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll(0, 100),
        productCategoryApi.getActive()
      ])
      setProducts(productsRes.data.content || [])
      setCategories(categoriesRes.data || [])
    } catch (err) {
      setError('Không thể tải dữ liệu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll(0, 100)
      setProducts(response.data.content || [])
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm')
      console.error(err)
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
      const nextValue =
        name === 'thumbnail'
          ? normalizeApiPath(value)
          : (type === 'checkbox' ? checked : value)

      setFormData({
        ...formData,
        [name]: nextValue
      })
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const response = await uploadApi.uploadImage(file)
      // Lưu path tương đối để không dính localhost khi deploy
      const imagePath = response.data?.url || uploadApi.getImagePath(response.data.filename)
      setFormData({
        ...formData,
        thumbnail: imagePath,
        images: (formData.images && formData.images.length > 0) ? formData.images : [imagePath]
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleMultiImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setError('')
    try {
      const uploadedUrls = []
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 5 * 1024 * 1024) continue
        const res = await uploadApi.uploadImage(file)
        uploadedUrls.push(res.data?.url || uploadApi.getImagePath(res.data.filename))
      }

      const nextImages = [...(formData.images || []), ...uploadedUrls].filter(Boolean)
      setFormData({
        ...formData,
        images: nextImages,
        thumbnail: formData.thumbnail || nextImages[0] || ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi upload ảnh')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeGalleryImage = (url) => {
    const nextImages = (formData.images || []).filter((u) => u !== url)
    const nextThumbnail = formData.thumbnail === url ? (nextImages[0] || '') : formData.thumbnail
    setFormData({ ...formData, images: nextImages, thumbnail: nextThumbnail })
  }

  const setThumbnailFromGallery = (url) => {
    setFormData({ ...formData, thumbnail: url })
  }

  const openAddModal = () => {
    setModalMode('add')
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      salePrice: '',
      thumbnail: '',
      images: [],
      productCategory: '',
      stock: '',
      active: true
    })
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setModalMode('edit')
    setSelectedProduct(product)
    const normalize = (v) => normalizeApiPath(v || '')

    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price || '',
      salePrice: product.salePrice || '',
      thumbnail: normalize(product.thumbnail),
      images: (product.images && product.images.length > 0
        ? product.images
        : (product.thumbnail ? [product.thumbnail] : [])
      ).map(normalize),
      productCategory: product.productCategory || '',
      stock: product.stock || '',
      active: product.active !== false
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProduct(null)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const productData = {
        ...formData,
        thumbnail: normalizeApiPath(formData.thumbnail),
        images: (formData.images || []).map((u) => normalizeApiPath(u)),
        price: parseFloat(formData.price) || 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: parseInt(formData.stock) || 0
      }

      if (modalMode === 'add') {
        await productApi.create(productData)
        setSuccess('Thêm sản phẩm thành công!')
      } else {
        await productApi.update(selectedProduct.id, productData)
        setSuccess('Cập nhật sản phẩm thành công!')
      }

      closeModal()
      loadProducts()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = (product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await productApi.delete(productToDelete.id)
      setSuccess('Xóa sản phẩm thành công!')
      setShowDeleteConfirm(false)
      setProductToDelete(null)
      loadProducts()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Không thể xóa sản phẩm')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
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
            <h1>Quản lý sản phẩm</h1>
            <p>Thêm, sửa, xóa sản phẩm của cửa hàng</p>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm sản phẩm
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

        {/* Products Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Giá KM</th>
                <th>Kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-content">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                      <p>Chưa có sản phẩm nào</p>
                      <button onClick={openAddModal}>Thêm sản phẩm đầu tiên</button>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-thumb">
                        {product.thumbnail ? (
                          <img src={resolveMediaUrl(product.thumbnail)} alt={product.name} />
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
                      <div className="product-name">{product.name}</div>
                      <div className="product-slug">{product.slug}</div>
                    </td>
                    <td>
                      <span className="category-badge">{product.productCategory || 'Chưa phân loại'}</span>
                    </td>
                    <td className="price">{formatPrice(product.price)}</td>
                    <td className="price sale">
                      {product.salePrice ? formatPrice(product.salePrice) : '-'}
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${product.active ? 'active' : 'inactive'}`}>
                        {product.active ? 'Đang bán' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => openEditModal(product)}
                          title="Sửa"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-action delete"
                          onClick={() => confirmDelete(product)}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="VD: Set quà Tết cao cấp"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="set-qua-tet-cao-cap"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ảnh sản phẩm</label>
                  <div className="image-upload-wrapper">
                    <div className="upload-methods">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <input
                        type="file"
                        onChange={handleMultiImageUpload}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        id="images-upload"
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
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => document.getElementById('images-upload')?.click()}
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
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            Tải nhiều ảnh
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
                        <img src={resolveMediaUrl(formData.thumbnail)} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
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

                    {(formData.images || []).length > 0 && (
                      <div className="gallery-preview">
                        <div className="gallery-title">Thư viện ảnh (bấm ảnh để đặt làm thumbnail)</div>
                        <div className="gallery-grid">
                          {(formData.images || []).map((url) => (
                            <div key={url} className={`gallery-item ${formData.thumbnail === url ? 'active' : ''}`}>
                              <button type="button" className="gallery-pick" onClick={() => setThumbnailFromGallery(url)} title="Đặt làm ảnh đại diện">
                                <img src={resolveMediaUrl(url)} alt="Gallery" />
                              </button>
                              <button type="button" className="remove-image" onClick={() => removeGalleryImage(url)} title="Xóa ảnh">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả sản phẩm</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    rows="4"
                  />
                </div>

                <div className="form-row three-cols">
                  <div className="form-group">
                    <label>Giá gốc (VNĐ) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="500000"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá khuyến mãi</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleInputChange}
                      placeholder="450000"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số lượng kho</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="100"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select
                      name="productCategory"
                      value={formData.productCategory}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
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
                      Hiển thị sản phẩm
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
                      modalMode === 'add' ? 'Thêm sản phẩm' : 'Lưu thay đổi'
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
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete?.name}"</strong>?</p>
              <p className="warning">Hành động này không thể hoàn tác.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                  Hủy
                </button>
                <button className="btn-delete" onClick={handleDelete}>
                  Xóa sản phẩm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminProductsPage
