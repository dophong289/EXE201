import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { orderApi } from '../services/api'
import '../styles/pages/OrdersPage.css'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmOrderId, setConfirmOrderId] = useState('')
  const [confirmError, setConfirmError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await orderApi.myOrders()
      setOrders(res.data || [])
    } catch (e) {
      console.error(e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ'

  const formatDate = (s) => s || ''

  const statusLabel = (s) => {
    if (s === 'CHO_XAC_NHAN') return 'Chờ xác nhận'
    if (s === 'DA_XAC_NHAN_DANG_CHUAN_BI') return 'Đã xác nhận • Đang chuẩn bị hàng'
    if (s === 'GIAO_HANG_THANH_CONG') return 'Giao hàng thành công'
    if (s === 'DA_HUY') return 'Đã hủy đơn hàng'
    return 'Đang xử lý'
  }

  const openConfirm = (orderId) => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      alert('Bạn cần đăng nhập để xác nhận đã nhận hàng.')
      return
    }
    setConfirmOrderId(orderId)
    setConfirmError('')
    setConfirmOpen(true)
  }

  const closeConfirm = () => {
    if (actionLoading) return
    setConfirmOpen(false)
    setConfirmOrderId('')
    setConfirmError('')
  }

  const handleReceived = async () => {
    if (!confirmOrderId) return
    setActionLoading(confirmOrderId)
    try {
      await orderApi.markReceived(confirmOrderId)
      await loadOrders()
    } catch (e) {
      console.error(e)
      const status = e?.response?.status
      const msg = e?.response?.data?.message
      if (status === 401) {
        setConfirmError(msg || 'Bạn cần đăng nhập để thực hiện thao tác này.')
      } else if (status === 403) {
        setConfirmError(msg || 'Bạn không có quyền thực hiện thao tác này.')
      } else {
        setConfirmError(msg || 'Không thể xác nhận đã nhận hàng. Vui lòng thử lại.')
      }
      return
    } finally {
      setActionLoading('')
    }
    closeConfirm()
  }

  return (
    <div className="orders-page">
      <section className="orders-header">
        <div className="container">
          <h1>Đơn hàng</h1>
          <p>{orders.length ? `Bạn có ${orders.length} đơn hàng` : 'Chưa có đơn hàng nào'}</p>
        </div>
      </section>

      <section className="orders-content">
        <div className="container">
          {loading ? (
            <motion.div
              className="orders-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p>Đang tải đơn hàng...</p>
            </motion.div>
          ) : orders.length === 0 ? (
            <motion.div
              className="orders-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3>Chưa có đơn hàng</h3>
              <p>Hãy chọn sản phẩm bạn yêu thích và đặt hàng nhé.</p>
              <Link to="/san-pham" className="btn-primary">
                Khám phá bộ sưu tập
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="orders-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {orders.map((o) => (
                <div key={o.id} className="order-card">
                  <div className="order-top">
                    <div className="left">
                      <div className="order-id">{o.id}</div>
                      <div className="order-date">{formatDate(o.createdAt)}</div>
                    </div>
                    <div className="right">
                      <span className={`status status-${o.status}`}>{statusLabel(o.status)}</span>
                      <div className="order-total">{formatPrice(o.total)}</div>
                    </div>
                  </div>
                  <div className="order-items">
                    {(o.items || []).slice(0, 3).map((it) => (
                      <div key={it.productId} className="order-item">
                        <span className="name">{it.name}</span>
                        <span className="qty">{`x${it.quantity}`}</span>
                      </div>
                    ))}
                    {(o.items || []).length > 3 && (
                      <div className="order-more">{`+${o.items.length - 3} sản phẩm khác`}</div>
                    )}
                  </div>
                  <div className="order-footer">
                    <span className="pay">
                      Thanh toán: <strong>{o.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}</strong>
                    </span>
                    <div className="order-actions">
                      {o.status === 'DA_XAC_NHAN_DANG_CHUAN_BI' && (
                        <button
                          className="btn-received"
                          onClick={() => openConfirm(o.id)}
                          disabled={actionLoading === o.id}
                        >
                          {actionLoading === o.id ? 'Đang xử lý...' : 'Đã nhận hàng'}
                        </button>
                      )}
                      <Link to={`/thanh-toan/thanh-cong/${o.id}`} className="link-detail">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirm-modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <div className="confirm-header">
                <h3 id="confirm-title">Xác nhận nhận hàng</h3>
                <button className="confirm-close" onClick={closeConfirm} disabled={!!actionLoading} aria-label="Đóng">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="confirm-body">
                <p>Bạn xác nhận <strong>đã nhận được hàng</strong> cho đơn này?</p>
                <p className="confirm-note">Sau khi xác nhận, trạng thái sẽ chuyển sang <strong>Giao hàng thành công</strong>.</p>
                {confirmError && <div className="confirm-error">{confirmError}</div>}
              </div>

              <div className="confirm-actions">
                <button className="btn-cancel" type="button" onClick={closeConfirm} disabled={!!actionLoading}>
                  Hủy
                </button>
                <button className="btn-ok" type="button" onClick={handleReceived} disabled={!!actionLoading}>
                  {actionLoading ? 'Đang xử lý...' : 'OK'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrdersPage

