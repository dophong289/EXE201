import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { adminOrderApi } from '../services/api'
import '../styles/pages/AdminPage.css'

function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [actionLoading, setActionLoading] = useState('')

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
    </div>
  )
}

export default AdminOrdersPage

