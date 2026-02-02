import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminOrderApi } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [actionLoading, setActionLoading] = useState('')

  // Order detail modal
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/dang-nhap')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      navigate('/')
      return
    }
    loadOrders()
  }, [navigate])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await adminOrderApi.getAll()
      setOrders(res.data || [])
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'Không tải được danh sách đơn hàng' })
    } finally {
      setLoading(false)
    }
  }

  const viewOrderDetail = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedOrder(null)
  }

  const statusLabel = (s) => {
    if (s === 'CHO_XAC_NHAN') return 'Chờ xác nhận'
    if (s === 'DA_XAC_NHAN_DANG_CHUAN_BI') return 'Đã xác nhận • Đang chuẩn bị'
    if (s === 'GIAO_HANG_THANH_CONG') return 'Giao hàng thành công'
    if (s === 'DA_HUY') return 'Đã hủy'
    return s
  }

  const statusClass = (s) => {
    if (s === 'CHO_XAC_NHAN') return 'inactive'
    if (s === 'DA_XAC_NHAN_DANG_CHUAN_BI') return 'active'
    if (s === 'GIAO_HANG_THANH_CONG') return 'active'
    if (s === 'DA_HUY') return 'inactive'
    return 'inactive'
  }

  const confirmOrder = async (orderId) => {
    setActionLoading(orderId)
    setMessage({ type: '', text: '' })
    try {
      await adminOrderApi.confirm(orderId)
      setMessage({ type: 'success', text: `Đã xác nhận đơn ${orderId}` })
      await loadOrders()
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'Xác nhận đơn thất bại' })
    } finally {
      setActionLoading('')
    }
  }

  const cancelOrder = async (orderId) => {
    const ok = window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')
    if (!ok) return

    setActionLoading(orderId)
    setMessage({ type: '', text: '' })
    try {
      await adminOrderApi.cancel(orderId)
      setMessage({ type: 'success', text: `Đã hủy đơn ${orderId}` })
      await loadOrders()
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'Hủy đơn thất bại' })
    } finally {
      setActionLoading('')
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ'

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">
            <h1>Quản lý đơn hàng</h1>
            <p>Xác nhận / hủy đơn và theo dõi trạng thái</p>
          </div>
          <button className="btn-add" onClick={loadOrders} disabled={loading}>
            Làm mới
          </button>
        </div>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {message.type === 'success' ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              )}
            </svg>
            {message.text}
          </div>
        )}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Thanh toán</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <p>Đang tải đơn hàng...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <p>Chưa có đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>
                      <span className="slug-text">{o.id}</span>
                    </td>
                    <td>
                      <div className="product-name">{o.fullName}</div>
                      <div className="product-slug">{o.phone}</div>
                    </td>
                    <td>{o.createdAt}</td>
                    <td>{o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}</td>
                    <td className="price">{formatPrice(o.total)}</td>
                    <td>
                      <span className={`status-badge ${statusClass(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action view"
                          title="Xem chi tiết"
                          onClick={() => viewOrderDetail(o)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="btn-action edit"
                          title="Xác nhận"
                          disabled={actionLoading === o.id || o.status !== 'CHO_XAC_NHAN'}
                          onClick={() => confirmOrder(o.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          className="btn-action delete"
                          title="Hủy đơn"
                          disabled={actionLoading === o.id || o.status === 'DA_HUY' || o.status === 'GIAO_HANG_THANH_CONG'}
                          onClick={() => cancelOrder(o.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetailModal}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '700px' }}
            >
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button className="close-btn" onClick={closeDetailModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="order-detail-content" style={{ padding: '1.5rem' }}>
                {/* Customer Info */}
                <div className="order-section" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Thông tin khách hàng
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div><strong>Họ tên:</strong> {selectedOrder.fullName}</div>
                    <div><strong>SĐT:</strong> {selectedOrder.phone}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Email:</strong> {selectedOrder.email || 'N/A'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Địa chỉ:</strong> {selectedOrder.address || 'N/A'}</div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="order-section" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Thông tin đơn hàng
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <div><strong>Ngày đặt:</strong> {selectedOrder.createdAt}</div>
                    <div><strong>Thanh toán:</strong> {selectedOrder.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}</div>
                    <div>
                      <strong>Trạng thái:</strong>{' '}
                      <span className={`status-badge ${statusClass(selectedOrder.status)}`} style={{ marginLeft: '0.25rem' }}>
                        {statusLabel(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                  {selectedOrder.note && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <strong>Ghi chú:</strong>
                      <p style={{ margin: '0.25rem 0', padding: '0.5rem', background: 'var(--color-bg-alt)', borderRadius: '4px' }}>
                        {selectedOrder.note}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="order-section">
                  <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Sản phẩm đặt mua
                  </h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-bg-alt)' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left' }}>Sản phẩm</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', width: '80px' }}>SL</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', width: '120px' }}>Đơn giá</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', width: '120px' }}>Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx} style={{ borderTop: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '0.75rem' }}>{item.productName || item.name || `Sản phẩm #${item.productId}`}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                {formatPrice(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ borderTop: '2px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
                            <td colSpan="3" style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                              Tổng cộng:
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '700', color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                              {formatPrice(selectedOrder.total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-light)' }}>Không có thông tin sản phẩm</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeDetailModal}>
                  Đóng
                </button>
                {selectedOrder.status === 'CHO_XAC_NHAN' && (
                  <button
                    className="btn-save"
                    onClick={() => { confirmOrder(selectedOrder.id); closeDetailModal(); }}
                  >
                    Xác nhận đơn
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminOrdersPage
