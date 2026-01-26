import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { menuApi } from '../services/api'
import '../styles/pages/MenuPage.css'

// Data mặc định từ bảng menu
const defaultMenuData = [
  {
    setName: 'Set vuông - 2 hạt - 1 rượu - 1 chè',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ vuông', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 2, price: 120000 },
      { product: 'Rượu', quantity: 1, price: 70000 },
      { product: 'Chè', quantity: 1, price: 30000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set vuông - 4 hạt',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ vuông', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 4, price: 240000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set tròn - 3 hạt - 1 rượu',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ tròn', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 3, price: 180000 },
      { product: 'Rượu', quantity: 1, price: 70000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set tròn - 4 hạt',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ tròn', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 4, price: 240000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set chữ nhật - 4 hạt - 1 rượu - 1 chè',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ chữ nhật', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 4, price: 240000 },
      { product: 'Rượu', quantity: 1, price: 70000 },
      { product: 'Chè', quantity: 1, price: 30000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set chữ nhật - 6 hạt',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ chữ nhật', quantity: 1, price: 90000 },
      { product: 'Hạt', quantity: 6, price: 360000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
  {
    setName: 'Set chữ nhật - 3 rượu',
    items: [
      { product: 'Vải', quantity: 1, price: 100000 },
      { product: 'Giỏ chữ nhật', quantity: 1, price: 90000 },
      { product: 'Rượu', quantity: 3, price: 210000 },
      { product: 'Phụ kiện', quantity: 1, price: 30000 },
    ]
  },
]

function MenuPage() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuData, setMenuData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedSets, setExpandedSets] = useState(new Set())
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSetModal, setShowSetModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingSet, setEditingSet] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [editingSetIndex, setEditingSetIndex] = useState(-1)
  const [editingItemIndex, setEditingItemIndex] = useState(-1)
  
  // Form states
  const [setForm, setSetForm] = useState({ setName: '' })
  const [itemForm, setItemForm] = useState({ product: '', quantity: '', price: '' })

  // Load user và check admin
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAdmin(userData.role === 'ADMIN')
    }
  }, [])

  // Load menu data from API
  useEffect(() => {
    loadMenuData()
  }, [])

  const loadMenuData = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await menuApi.getAll()
      const data = response.data || []
      
      // Convert API format to display format
      const formattedData = data.map(set => ({
        id: set.id,
        setName: set.setName,
        items: (set.items || []).map(item => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          price: item.price
        }))
      }))
      
      setMenuData(formattedData)
      
      // If no data, initialize with default data
      if (formattedData.length === 0 && defaultMenuData.length > 0) {
        await initializeDefaultData()
      }
    } catch (error) {
      console.error('Error loading menu data:', error)
      setError('Không thể tải dữ liệu menu. Vui lòng thử lại sau.')
      // Fallback to default data
      setMenuData(defaultMenuData.map((set, index) => ({
        id: null,
        setName: set.setName,
        items: set.items.map((item, itemIndex) => ({
          id: null,
          ...item
        }))
      })))
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultData = async () => {
    try {
      for (const set of defaultMenuData) {
        await menuApi.create({
          setName: set.setName,
          items: set.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price
          }))
        })
      }
      await loadMenuData()
    } catch (error) {
      console.error('Error initializing default data:', error)
    }
  }

  const toggleSet = (setName) => {
    const newExpanded = new Set(expandedSets)
    if (newExpanded.has(setName)) {
      newExpanded.delete(setName)
    } else {
      newExpanded.add(setName)
    }
    setExpandedSets(newExpanded)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫'
  }

  const calculateSetTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0)
  }

  // Edit Set functions
  const handleEditSet = (setIndex) => {
    const set = menuData[setIndex]
    setEditingSet(set)
    setEditingSetIndex(setIndex)
    setSetForm({ setName: set.setName })
    setShowSetModal(true)
  }

  const handleSaveSet = async () => {
    if (!setForm.setName.trim()) {
      alert('Vui lòng nhập tên set')
      return
    }

    try {
      if (editingSetIndex >= 0 && menuData[editingSetIndex].id) {
        // Edit existing set
        const set = menuData[editingSetIndex]
        await menuApi.update(set.id, {
          setName: setForm.setName,
          items: set.items.map(item => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            price: item.price
          }))
        })
      } else {
        // Add new set
        await menuApi.create({
          setName: setForm.setName,
          items: []
        })
      }
      await loadMenuData()
      setShowSetModal(false)
      setEditingSet(null)
      setEditingSetIndex(-1)
      setSetForm({ setName: '' })
    } catch (error) {
      console.error('Error saving set:', error)
      alert('Không thể lưu set. Vui lòng thử lại.')
    }
  }

  const handleDeleteSet = async (setIndex) => {
    if (!window.confirm('Bạn có chắc muốn xóa set này?')) {
      return
    }

    const set = menuData[setIndex]
    if (!set.id) {
      alert('Không thể xóa set này')
      return
    }

    try {
      await menuApi.delete(set.id)
      await loadMenuData()
    } catch (error) {
      console.error('Error deleting set:', error)
      alert('Không thể xóa set. Vui lòng thử lại.')
    }
  }

  // Edit Item functions
  const handleEditItem = (setIndex, itemIndex) => {
    const item = menuData[setIndex].items[itemIndex]
    setEditingItem(item)
    setEditingSetIndex(setIndex)
    setEditingItemIndex(itemIndex)
    setItemForm({
      product: item.product,
      quantity: item.quantity.toString(),
      price: item.price.toString()
    })
    setShowItemModal(true)
  }

  const handleAddItem = (setIndex) => {
    setEditingSetIndex(setIndex)
    setEditingItemIndex(-1)
    setItemForm({ product: '', quantity: '', price: '' })
    setShowItemModal(true)
  }

  const handleSaveItem = async () => {
    if (!itemForm.product.trim() || !itemForm.quantity || !itemForm.price) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    const set = menuData[editingSetIndex]
    if (!set.id) {
      alert('Không thể thêm/sửa thành phần cho set chưa được lưu')
      return
    }

    try {
      const itemData = {
        product: itemForm.product.trim(),
        quantity: parseInt(itemForm.quantity),
        price: parseInt(itemForm.price)
      }

      if (editingItemIndex >= 0 && set.items[editingItemIndex].id) {
        // Edit existing item
        await menuApi.updateItem(set.items[editingItemIndex].id, itemData)
      } else {
        // Add new item
        await menuApi.addItem(set.id, itemData)
      }
      
      await loadMenuData()
      setShowItemModal(false)
      setEditingItem(null)
      setEditingSetIndex(-1)
      setEditingItemIndex(-1)
      setItemForm({ product: '', quantity: '', price: '' })
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Không thể lưu thành phần. Vui lòng thử lại.')
    }
  }

  const handleDeleteItem = async (setIndex, itemIndex) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành phần này?')) {
      return
    }

    const item = menuData[setIndex].items[itemIndex]
    if (!item.id) {
      alert('Không thể xóa thành phần này')
      return
    }

    try {
      await menuApi.deleteItem(item.id)
      await loadMenuData()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Không thể xóa thành phần. Vui lòng thử lại.')
    }
  }

  return (
    <div className="menu-page">
      <section className="page-header">
        <div className="header-content">
          <div>
            <h1>Menu Sản Phẩm</h1>
            <p className="page-subtitle">Xem chi tiết giá và thành phần của từng set quà tặng</p>
          </div>
          {isAdmin && (
            <div className="admin-actions">
              <button
                className="btn-edit-menu"
                onClick={() => {
                  setEditingSetIndex(-1)
                  setSetForm({ setName: '' })
                  setShowSetModal(true)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Thêm Set
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="menu-content">
        <div className="container">
          {loading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && menuData.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p>Chưa có dữ liệu menu.</p>
              {isAdmin && (
                <button className="btn btn-primary" onClick={() => {
                  setEditingSetIndex(-1)
                  setSetForm({ setName: '' })
                  setShowSetModal(true)
                }}>
                  Thêm Set Đầu Tiên
                </button>
              )}
            </div>
          )}
          
          {!loading && !error && menuData.length > 0 && (
            <div className="menu-sets-grid">
              {menuData.map((set, setIndex) => {
                const isExpanded = expandedSets.has(set.setName)
                const totalPrice = calculateSetTotal(set.items)
                
                return (
                  <motion.div
                    key={setIndex}
                    className="menu-set-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: setIndex * 0.1, duration: 0.5 }}
                  >
                    {/* Set Header */}
                    <div className="set-card-header">
                      <div className="set-header-content">
                        <h3 className="set-card-title">{set.setName}</h3>
                        <div className="set-card-meta">
                          <span className="set-item-count">{set.items.length} thành phần</span>
                          <span className="set-divider">•</span>
                          <span className="set-total-price">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="set-header-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleEditSet(setIndex)}
                            title="Sửa set"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleDeleteSet(setIndex)}
                            title="Xóa set"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Items List */}
                    <div className={`set-items-container ${set.items.length > 3 && !isExpanded ? 'collapsed' : ''}`}>
                      <div className="set-items-list">
                        {set.items.map((item, itemIndex) => {
                          // Show first 3 items when collapsed, all when expanded
                          if (set.items.length > 3 && !isExpanded && itemIndex >= 3) {
                            return null
                          }
                          
                          return (
                            <motion.div
                              key={itemIndex}
                              className="menu-item-row"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIndex * 0.05 }}
                            >
                              <div className="item-info">
                                <div className="item-product">
                                  <span className="item-name">{item.product}</span>
                                  {isAdmin && (
                                    <div className="item-actions-inline">
                                      <button
                                        className="btn-icon-small"
                                        onClick={() => handleEditItem(setIndex, itemIndex)}
                                        title="Sửa"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                      </button>
                                      <button
                                        className="btn-icon-small btn-icon-danger"
                                        onClick={() => handleDeleteItem(setIndex, itemIndex)}
                                        title="Xóa"
                                      >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                          <polyline points="3 6 5 6 21 6" />
                                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="item-details">
                                  <span className="item-quantity">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                    </svg>
                                    {item.quantity}
                                  </span>
                                  <span className="item-price">{formatPrice(item.price)}</span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                      
                      {isAdmin && (
                        <button
                          className="btn-add-item-to-set"
                          onClick={() => handleAddItem(setIndex)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          Thêm thành phần
                        </button>
                      )}
                    </div>

                    {/* Expand/Collapse Button */}
                    {set.items.length > 3 && (
                      <button
                        className="btn-expand-set"
                        onClick={() => toggleSet(set.setName)}
                      >
                        <span>{isExpanded ? 'Thu gọn' : `Xem thêm ${set.items.length - 3} thành phần`}</span>
                        <svg
                          className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Edit Set Modal */}
      <AnimatePresence>
        {showSetModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSetModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{editingSetIndex >= 0 ? 'Sửa Set' : 'Thêm Set Mới'}</h2>
              <div className="form-group">
                <label>Tên Set</label>
                <input
                  type="text"
                  value={setForm.setName}
                  onChange={(e) => setSetForm({ setName: e.target.value })}
                  placeholder="Ví dụ: Set vuông - 2 hạt - 1 rượu"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowSetModal(false)}>
                  Hủy
                </button>
                <button className="btn-save" onClick={handleSaveSet}>
                  Lưu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowItemModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{editingItemIndex >= 0 ? 'Sửa Thành Phần' : 'Thêm Thành Phần'}</h2>
              <div className="form-group">
                <label>Tên Sản Phẩm</label>
                <input
                  type="text"
                  value={itemForm.product}
                  onChange={(e) => setItemForm({ ...itemForm, product: e.target.value })}
                  placeholder="Ví dụ: Vải, Giỏ vuông, Hạt..."
                />
              </div>
              <div className="form-group">
                <label>Số Lượng</label>
                <input
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="form-group">
                <label>Thành Giá (₫)</label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowItemModal(false)}>
                  Hủy
                </button>
                <button className="btn-save" onClick={handleSaveItem}>
                  Lưu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuPage
