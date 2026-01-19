import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { orderApi } from '../services/api'
import '../styles/pages/CheckoutSuccessPage.css'

function CheckoutSuccessPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderApi.myOrderById(orderId)
        setOrder(res.data)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [orderId])

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ'

  const statusMeta = (status) => {
    if (status === 'DA_HUY') {
      return {
        headerTitle: 'Chi tiết đơn hàng',
        headerSubtitle: 'Đơn hàng đã bị hủy',
        iconType: 'cancel',
        title: 'Đơn hàng đã bị hủy',
        note: 'Đơn hàng này đã bị hủy và sẽ không được xử lý tiếp.',
        badge: { text: 'Đã hủy', tone: 'cancel' },
      }
    }
    if (status === 'GIAO_HANG_THANH_CONG') {
      return {
        headerTitle: 'Chi tiết đơn hàng',
        headerSubtitle: 'Giao hàng thành công',
        iconType: 'success',
        title: 'Giao hàng thành công',
        note: 'Cảm ơn bạn! Đơn hàng đã được hoàn tất.',
        badge: { text: 'Thành công', tone: 'success' },
      }
    }
    if (status === 'DA_XAC_NHAN_DANG_CHUAN_BI') {
      return {
        headerTitle: 'Chi tiết đơn hàng',
        headerSubtitle: 'Đã xác nhận • Đang chuẩn bị hàng',
        iconType: 'success',
        title: 'Đơn hàng đã được xác nhận',
        note: 'Shop đang chuẩn bị hàng, bạn vui lòng chờ nhé.',
        badge: { text: 'Đã xác nhận', tone: 'success' },
      }
    }
    // CHO_XAC_NHAN (default)
    return {
      headerTitle: 'Chi tiết đơn hàng',
      headerSubtitle: 'Đang chờ xác nhận',
      iconType: 'pending',
      title: 'Đơn hàng đang chờ xác nhận',
      note: 'Shop sẽ xác nhận đơn sớm nhất có thể.',
      badge: { text: 'Chờ xác nhận', tone: 'pending' },
    }
  }

  const meta = statusMeta(order?.status)

  return (
    <div className="checkout-success-page">
      <section className="success-header">
        <div className="container">
          <h1>{meta.headerTitle}</h1>
          <p>{meta.headerSubtitle}</p>
        </div>
      </section>

      <section className="success-content">
        <div className="container">
          <motion.div
            className="success-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`success-icon ${meta.iconType}`}>
              {meta.iconType === 'cancel' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : meta.iconType === 'pending' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            <h3>{meta.title}</h3>
            <p className="muted">
              {order ? (
                <>
                  Mã đơn: <strong>{order.id}</strong> • Tổng tiền:{' '}
                  <strong>{formatPrice(order.total)}</strong>
                </>
              ) : (
                <>Không tìm thấy thông tin đơn hàng.</>
              )}
            </p>

            {order && (
              <div className="success-summary">
                <div className="row">
                  <span>Trạng thái</span>
                  <strong>
                    <span className={`order-status ${meta.badge.tone}`}>{meta.badge.text}</span>
                  </strong>
                </div>
                <div className="row">
                  <span>Người nhận</span>
                  <strong>{order.fullName}</strong>
                </div>
                <div className="row">
                  <span>Số điện thoại</span>
                  <strong>{order.phone}</strong>
                </div>
                <div className="row">
                  <span>Địa chỉ</span>
                  <strong>{order.address}</strong>
                </div>
                <div className="row">
                  <span>Thanh toán</span>
                  <strong>
                    {order.paymentMethod === 'BANK' ? 'Chuyển khoản' : 'COD'}
                  </strong>
                </div>
              </div>
            )}

            <p className="status-note">{meta.note}</p>

            <div className="success-actions">
              <Link to="/don-hang" className="btn-secondary">
                Xem đơn hàng
              </Link>
              <Link to="/san-pham" className="btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CheckoutSuccessPage

