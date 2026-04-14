import type { TradeOrder, Product } from '@/types'

// 模拟订单数据
const mockOrders: TradeOrder[] = []

// 获取订单列表
export async function listOrders(status?: string): Promise<TradeOrder[]> {
  // TODO: 调用真实 API
  return mockOrders.filter(o => !status || o.status === status)
}

// 获取订单详情
export async function getOrderDetail(orderId: number): Promise<TradeOrder | null> {
  // TODO: 调用真实 API
  return mockOrders.find(o => o.id === orderId) || null
}

// 获取订单商品
export async function getOrderItems(_orderId: number): Promise<Product[]> {
  // TODO: 调用真实 API
  return []
}

// 取消订单
export async function cancelOrder(_orderId: number): Promise<TradeOrder | null> {
  // TODO: 调用真实 API
  return null
}

// 确认收货
export async function confirmReceipt(_orderId: number): Promise<TradeOrder | null> {
  // TODO: 调用真实 API
  return null
}
