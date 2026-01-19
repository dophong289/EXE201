import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clearCart, getCart, getCartTotal } from '../services/cart'
import { orderApi } from '../services/api'
import { getCheckoutCustomer, saveCheckoutCustomer } from '../services/orders'
import '../styles/pages/CheckoutPage.css'

function CheckoutPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(() => getCart())
  const savedCustomer = getCheckoutCustomer()

  const [form, setForm] = useState({
    fullName: savedCustomer?.fullName || '',
    phone: savedCustomer?.phone || '',
    address: savedCustomer?.address || '',
    email: savedCustomer?.email || '',
    note: '',
    paymentMethod: 'COD', // COD | BANK
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const refresh = () => setCart(getCart())
    window.addEventListener('cart_updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('cart_updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const total = useMemo(() => getCartTotal(), [cart])
  const itemCount = useMemo(
    () => cart.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0),
    [cart]
  )

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN').format(price) + 'đ'

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const validate = () => {
    if (!form.fullName.trim()) return 'Vui lòng nhập họ và tên'
    if (!form.phone.trim()) return 'Vui lòng nhập số điện thoại'
    const phoneOk = /^(0|\+84)\d{9,10}$/.test(form.phone.trim().replace(/\s/g, ''))
    if (!phoneOk) return 'Số điện thoại chưa đúng định dạng'
    if (!form.address.trim()) return 'Vui lòng nhập địa chỉ giao hàng'
    return ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (cart.items.length === 0) return

    const userStr = localStorage.getItem('user')
    if (!userStr) {
      navigate('/dang-nhap')
      return
    }

    const msg = validate()
    if (msg) {
      setError(msg)
      return
    }

    setSubmitting(true)
    try {
      const customer = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
      }
      saveCheckoutCustomer(customer)

      const payload = {
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
        note: form.note?.trim() || '',
        paymentMethod: form.paymentMethod,
        items: cart.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      }

      const res = await orderApi.create(payload)
      const orderId = res.data?.id
      clearCart()
      navigate(`/thanh-toan/thanh-cong/${orderId}`)
    } catch (err) {
      console.error(err)
      setError('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <section className="checkout-header">
          <div className="container">
            <h1>Thanh toán</h1>
            <p>Giỏ hàng đang trống</p>
          </div>
        </section>
        <section className="checkout-content">
          <div className="container">
            <div className="checkout-empty">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h3>Bạn chưa có sản phẩm nào</h3>
              <p>Hãy chọn sản phẩm bạn yêu thích và quay lại thanh toán nhé.</p>
              <Link to="/san-pham" className="btn-primary">
                Quay lại bộ sưu tập
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <section className="checkout-header">
        <div className="container">
          <h1>Thanh toán</h1>
          <p>{`Xác nhận thông tin giao hàng • ${itemCount} sản phẩm`}</p>
        </div>
      </section>

      <section className="checkout-content">
        <div className="container checkout-grid">
          <motion.form
            className="checkout-form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card">
              <h3>Thông tin giao hàng</h3>

              {error && <div className="form-error">{error}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={onChange}
                    placeholder="VD: Nguyễn Văn A"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="VD: 0901234567"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ *</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (tuỳ chọn)</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="VD: email@domain.com"
                />
              </div>

              <div className="form-group">
                <label>Ghi chú (tuỳ chọn)</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  rows="3"
                  placeholder="Ghi chú cho người bán (thời gian nhận hàng, hướng dẫn giao...)"
                />
              </div>
            </div>

            <div className="card">
              <h3>Phương thức thanh toán</h3>

              <div className="payment-options">
                <label className={`payment-option ${form.paymentMethod === 'COD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={form.paymentMethod === 'COD'}
                    onChange={onChange}
                  />
                  <div className="payment-content">
                    <strong>Thanh toán khi nhận hàng (COD)</strong>
                    <span>Nhận hàng rồi thanh toán cho shipper.</span>
                  </div>
                </label>

                <label className={`payment-option ${form.paymentMethod === 'BANK' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK"
                    checked={form.paymentMethod === 'BANK'}
                    onChange={onChange}
                  />
                  <div className="payment-content">
                    <strong>Chuyển khoản ngân hàng</strong>
                    <span>Chuyển khoản theo thông tin bên dưới.</span>
                  </div>
                </label>
              </div>

              {form.paymentMethod === 'BANK' && (
                <div className="bank-box">
                  <div className="bank-row">
                    <span>Ngân hàng</span>
                    <strong>Vietcombank</strong>
                  </div>
                  <div className="bank-row">
                    <span>Số tài khoản</span>
                    <strong>0123456789</strong>
                  </div>
                  <div className="bank-row">
                    <span>Chủ tài khoản</span>
                    <strong>GOI MAY</strong>
                  </div>
                  <p className="bank-note">
                    Nội dung chuyển khoản: <strong>HỌ TÊN - SĐT</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <Link to="/gio-hang" className="btn-secondary">
                Quay lại giỏ hàng
              </Link>
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </motion.form>

          <motion.aside
            className="checkout-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="card summary-card">
              <h3>Đơn hàng của bạn</h3>
              <div className="summary-items">
                {cart.items.map((it) => {
                  const unitPrice = Number(it.salePrice ?? it.price ?? 0) || 0
                  const qty = Number(it.quantity) || 1
                  return (
                    <div key={it.productId} className="summary-item">
                      <div className="left">
                        <span className="name">{it.name}</span>
                        <span className="meta">{`x${qty}`}</span>
                      </div>
                      <div className="right">{formatPrice(unitPrice * qty)}</div>
                    </div>
                  )
                })}
              </div>

              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div className="summary-row">
                <span>Vận chuyển</span>
                <strong className="muted">Tính khi xác nhận</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Tổng</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="summary-note">
                Bạn có thể kiểm tra đơn trong mục <strong>Đơn hàng</strong> sau khi đặt.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}

export default CheckoutPage

