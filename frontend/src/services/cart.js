const CART_KEY = 'goimay_cart'

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json)
    return v ?? fallback
  } catch {
    return fallback
  }
}

function emitCartUpdated() {
  window.dispatchEvent(new Event('cart_updated'))
}

export function getCart() {
  const raw = localStorage.getItem(CART_KEY)
  const cart = safeParse(raw, { items: [] })
  if (!cart.items || !Array.isArray(cart.items)) return { items: [] }
  return cart
}

export function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  emitCartUpdated()
}

export function clearCart() {
  setCart({ items: [] })
}

export function getCartItemCount() {
  const cart = getCart()
  return cart.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)
}

export function getCartTotal() {
  const cart = getCart()
  return cart.items.reduce((sum, it) => {
    const price = Number(it.salePrice ?? it.price ?? 0) || 0
    const qty = Number(it.quantity) || 0
    return sum + price * qty
  }, 0)
}

export function addToCart(product, quantity = 1) {
  if (!product?.id) return

  const cart = getCart()
  const qty = Math.max(1, Number(quantity) || 1)
  const existing = cart.items.find((it) => it.productId === product.id)
  const maxStock = Number(product.stock) > 0 ? Number(product.stock) : undefined

  if (existing) {
    const nextQty = existing.quantity + qty
    existing.quantity = maxStock ? Math.min(nextQty, maxStock) : nextQty
  } else {
    cart.items.unshift({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      thumbnail: product.thumbnail,
      price: product.price,
      salePrice: product.salePrice,
      productCategory: product.productCategory,
      stock: product.stock,
      quantity: maxStock ? Math.min(qty, maxStock) : qty,
      addedAt: new Date().toISOString(),
    })
  }

  setCart(cart)
}

export function updateCartItemQuantity(productId, quantity) {
  const cart = getCart()
  const it = cart.items.find((x) => x.productId === productId)
  if (!it) return

  const q = Number(quantity) || 0
  if (q <= 0) {
    cart.items = cart.items.filter((x) => x.productId !== productId)
  } else {
    const maxStock = Number(it.stock) > 0 ? Number(it.stock) : undefined
    it.quantity = maxStock ? Math.min(q, maxStock) : q
  }

  setCart(cart)
}

export function removeFromCart(productId) {
  const cart = getCart()
  cart.items = cart.items.filter((x) => x.productId !== productId)
  setCart(cart)
}

