import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { resolveMediaUrl } from '../services/api'
import ImageWithFallback from '../components/ImageWithFallback'
import {
  clearCart,
  getCart,
  getCartTotal,
  removeFromCart,
  updateCartItemQuantity,
} from '../services/cart'
import '../styles/pages/CartPage.css'

function CartPage() {
  const [cart, setCart] = useState(() => getCart())

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

  const setQty = (productId, qty) => {
    updateCartItemQuantity(productId, qty)
    setCart(getCart())
  }

  const remove = (productId) => {
    removeFromCart(productId)
    setCart(getCart())
  }

  const clear = () => {
    clearCart()
    setCart(getCart())
  }

  return (
    <div className="cart-page">
      <section className="cart-header">
        <div className="container">
          <h1>Giỏ hàng</h1>
          <p>{itemCount > 0 ? `Bạn có ${itemCount} sản phẩm trong giỏ` : 'Giỏ hàng đang trống'}</p>
        </div>
      </section>

      <section className="cart-content">
        <div className="container cart-grid">
          <motion.div
            className="cart-items"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {cart.items.length === 0 ? (
              <div className="cart-empty">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <h3>Chưa có sản phẩm nào</h3>
                <p>Hãy thêm sản phẩm bạn yêu thích vào giỏ hàng nhé.</p>
                <Link to="/san-pham" className="btn-primary">
                  Quay lại bộ sưu tập
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items-header">
                  <span>Sản phẩm</span>
                  <span>Đơn giá</span>
                  <span>Số lượng</span>
                  <span>Tạm tính</span>
                  <span></span>
                </div>

                <div className="cart-items-list">
                  {cart.items.map((it) => {
                    const unitPrice = Number(it.salePrice ?? it.price ?? 0) || 0
                    const qty = Number(it.quantity) || 1
                    const subtotal = unitPrice * qty
                    const maxStock = Number(it.stock) > 0 ? Number(it.stock) : 999

                    return (
                      <div key={it.productId} className="cart-item">
                        <Link to={`/san-pham/${it.slug || ''}`} className="cart-item-product">
                          <div className="thumb">
                            {it.thumbnail ? (
                              <ImageWithFallback src={resolveMediaUrl(it.thumbnail)} alt={it.name} />
                            ) : (
                              <div className="thumb-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="info">
                            <div className="name">{it.name}</div>
                            {it.productCategory && (
                              <div className="meta">{it.productCategory}</div>
                            )}
                          </div>
                        </Link>

                        <div className="cart-item-price">
                          {it.salePrice ? (
                            <>
                              <span className="sale">{formatPrice(unitPrice)}</span>
                              <span className="old">{formatPrice(Number(it.price) || 0)}</span>
                            </>
                          ) : (
                            <span className="normal">{formatPrice(unitPrice)}</span>
                          )}
                        </div>

                        <div className="cart-item-qty">
                          <div className="qty-control">
                            <button onClick={() => setQty(it.productId, qty - 1)} disabled={qty <= 1} aria-label="Giảm số lượng">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={qty}
                              onChange={(e) => setQty(it.productId, e.target.value)}
                            />
                            <button onClick={() => setQty(it.productId, qty + 1)} disabled={qty >= maxStock} aria-label="Tăng số lượng">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                            </button>
                          </div>
                          {Number(it.stock) === 0 && <span className="qty-note">Hết hàng</span>}
                        </div>

                        <div className="cart-item-subtotal">{formatPrice(subtotal)}</div>

                        <div className="cart-item-remove">
                          <button onClick={() => remove(it.productId)} title="Xóa sản phẩm" aria-label="Xóa sản phẩm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="cart-actions-row">
                  <Link to="/san-pham" className="btn-secondary">
                    Tiếp tục mua sắm
                  </Link>
                  <button className="btn-ghost" onClick={clear}>
                    Xóa tất cả
                  </button>
                </div>
              </>
            )}
          </motion.div>

          <motion.aside
            className="cart-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="summary-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="summary-row">
                <span>Tạm tính</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <strong className="muted">Tính khi thanh toán</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Tổng</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              {cart.items.length === 0 ? (
                <button className="btn-primary full" disabled>
                  Tiến hành thanh toán
                </button>
              ) : (
                <Link to="/thanh-toan" className="btn-primary full">
                  Tiến hành thanh toán
                </Link>
              )}
              <p className="summary-note">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản mua hàng của Gói Mây.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </div>
  )
}

export default CartPage

