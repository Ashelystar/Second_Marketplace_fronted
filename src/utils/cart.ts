// 购物车工具函数

export interface CartItem {
  id: number
  title: string
  price: string
  image: string
  condition: string
  quantity: number
  selected: boolean
}

/**
 * 获取购物车列表
 */
export const getCartItems = (): CartItem[] => {
  const saved = localStorage.getItem('cart')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('解析购物车数据失败:', e)
      return []
    }
  }
  return []
}

/**
 * 保存购物车列表
 */
export const saveCartItems = (items: CartItem[]): void => {
  localStorage.setItem('cart', JSON.stringify(items))
}

/**
 * 添加商品到购物车
 */
export const addToCart = (product: {
  id: number
  title: string
  price: string | number
  image?: string
  condition?: string
}): void => {
  const cart = getCartItems()

  // 检查是否已存在
  const existingIndex = cart.findIndex(item => item.id === product.id)

  if (existingIndex >= 0) {
    // 已存在，数量+1
    cart[existingIndex].quantity++
  } else {
    // 不存在，添加新商品
    cart.push({
      id: product.id,
      title: product.title,
      price: String(product.price),
      image: product.image || '',
      condition: product.condition || '未知',
      quantity: 1,
      selected: false
    })
  }

  saveCartItems(cart)
}

/**
 * 从购物车移除商品
 */
export const removeFromCart = (productId: number): void => {
  const cart = getCartItems()
  const filtered = cart.filter(item => item.id !== productId)
  saveCartItems(filtered)
}

/**
 * 更新商品数量
 */
export const updateQuantity = (productId: number, quantity: number): void => {
  const cart = getCartItems()
  const item = cart.find(item => item.id === productId)
  if (item) {
    item.quantity = Math.max(1, quantity)
    saveCartItems(cart)
  }
}

/**
 * 清空购物车
 */
export const clearCart = (): void => {
  localStorage.removeItem('cart')
}

/**
 * 获取购物车商品数量
 */
export const getCartCount = (): number => {
  const cart = getCartItems()
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}
