import type { TradeOrder, OrderProduct } from '@/types'

// --- 接口定义 ---

export interface CreateOrderRequest {
  sellerId: number;
  tradeMode: string;
  freightAmount: number;
  remark: string;
  pickupLocation: string;
  items: { productId: number; quantity: number }[];
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// --- 辅助工具函数 ---

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    throw new Error('接口返回为空')
  }
  try {
    return JSON.parse(text) as T
  } catch  {
    throw new Error('解析 JSON 失败')
  }
}

/**
 * 封装通用的 fetch 请求逻辑 (模仿你提供的结构)
 */
async function handleRequest<T>(url: string, options: RequestInit, errorMsg: string): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<T>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || errorMsg)
  }

  return json.data
}

// --- 重点修改后的 API 导出 ---

/**
 * 1. 创建交易订单
 */
export async function createOrder(body: CreateOrderRequest): Promise<TradeOrder> {
  return handleRequest<TradeOrder>(
    '/api/orders',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    '创建订单失败'
  )
}

/**
 * 2. 获取订单列表
 */
export async function listOrders(status?: string): Promise<TradeOrder[]> {
  // 处理查询参数
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return handleRequest<TradeOrder[]>(
    `/api/orders${query}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    '获取订单列表失败'
  )
}

/**
 * 3. 获取订单详情
 */
export async function getOrderDetail(orderId: number): Promise<TradeOrder> {
  return handleRequest<TradeOrder>(
    `/api/orders/${orderId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    '获取订单详情失败'
  )
}

/**
 * 4. 获取订单中的商品明细
 */
export async function getOrderItems(orderId: number): Promise<OrderProduct[]> {
  return handleRequest<OrderProduct[]>(
    `/api/orders/${orderId}/items`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
    '获取商品明细失败'
  )
}

/**
 * 5. 取消订单
 */
export async function cancelOrder(orderId: number): Promise<unknown> {
  return handleRequest<unknown>(
    `/api/orders/${orderId}/cancel`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    '取消订单失败'
  )
}

/**
 * 6. 确认收货
 */
export async function confirmReceipt(orderId: number): Promise<unknown> {
  return handleRequest<unknown>(
    `/api/orders/${orderId}/confirm`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    '确认收货失败'
  )
}
