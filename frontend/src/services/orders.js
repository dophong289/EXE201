const ORDERS_KEY = 'goimay_orders'
const CHECKOUT_CUSTOMER_KEY = 'goimay_checkout_customer'

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json)
    return v ?? fallback
  } catch {
    return fallback
  }
}

export function getOrders() {
  const raw = localStorage.getItem(ORDERS_KEY)
  const orders = safeParse(raw, [])
  return Array.isArray(orders) ? orders : []
}

export function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function createOrder(order) {
  const orders = getOrders()
  orders.unshift(order)
  saveOrders(orders)
  return order
}

export function getOrderById(orderId) {
  return getOrders().find((o) => o.id === orderId) || null
}

export function saveCheckoutCustomer(customer) {
  localStorage.setItem(CHECKOUT_CUSTOMER_KEY, JSON.stringify(customer))
}

export function getCheckoutCustomer() {
  const raw = localStorage.getItem(CHECKOUT_CUSTOMER_KEY)
  return safeParse(raw, null)
}

