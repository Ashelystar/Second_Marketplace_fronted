import type { TradeOrder } from '@/types'

// ==========================================
// 1. 所有的接口请求/响应类型定义 (Interfaces)
// ==========================================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页查询参数
export interface ListOrdersParams {
  role?: 'buyer' | 'seller'
  status?: string
  page?: number
  pageSize?: number
}

// 分页返回包装
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 创建订单参数
export interface CreateOrderRequest {
  sellerId: number
  tradeMode: string
  freightAmount: number
  remark: string
  pickupLocation: string
  items: { productId: number; quantity: number }[]
}

// 各种操作的请求体
export interface CancelOrderRequest { cancelReason: string }
export interface CreatePaymentRequest { paymentChannel: 'alipay' | 'wechat' | 'balance' }
export interface CreateShipmentRequest {
  shipmentType: 'shipping' | 'pickup'
  logisticsCompany?: string  // shipping 场景必填
  trackingNo?: string        // shipping 场景必填
  pickupCode?: string        // pickup 场景可选
}
export interface PickupVerifyRequest { pickupCode: string }

// 支付结果
export interface PaymentResult {
  paymentId: number
  paymentStatus: string
  paidAmount: number
  channelTradeNo: string
}

// 物流轨迹
export interface LogisticsTrace {
  id: number
  shipmentId: number
  traceTime: string
  traceStatus: string
  traceDetail: string
  traceLocation: string
  createdAt: string
}

// ==========================================
// 2. 通用的底层请求处理函数 (handleRequest)
// ==========================================

async function handleRequest<T>(url: string, options: RequestInit, errorMsg: string): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  })
  console.log(`请求 ${url} 返回状态码:`, response.status)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const text = await response.text()
  if (!text) {
    throw new Error('接口返回为空')
  }

  try {
    const json = JSON.parse(text) as ApiResponse<T>
    if (json.code !== 200) {
      throw new Error(json.message || errorMsg)
    }
    return json.data
  } catch {
    throw new Error('解析 JSON 失败')
  }
}

// ==========================================
// 3. 核心 API 函数导出 (订单 + 支付 + 物流)
// ==========================================

/** 1. 创建订单 - POST /orders */
export async function createOrder(data: CreateOrderRequest): Promise<TradeOrder> {
  return handleRequest<TradeOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }, '创建订单失败')
}

/** 2. 获取订单列表 - GET /orders */
export async function listOrders(params: ListOrdersParams): Promise<PageResult<TradeOrder>> {
  const query = new URLSearchParams()
  if (params.role) query.append('role', params.role)
  if (params.status) query.append('status', params.status)
  if (params.page) query.append('page', params.page.toString())
  if (params.pageSize) query.append('pageSize', params.pageSize.toString())

  return handleRequest<PageResult<TradeOrder>>(`/api/orders?${query.toString()}`, {
    method: 'GET'
  }, '获取列表失败')
}

/** 3. 订单详情 - GET /orders/{orderId} */
export async function getOrderDetail(orderId: number): Promise<TradeOrder> {
  return handleRequest<TradeOrder>(`/api/orders/${orderId}`, { method: 'GET' }, '获取详情失败')
}

/** 4. 创建支付单 - POST /orders/{orderId}/payments */
export async function createPayment(orderId: number, data: CreatePaymentRequest): Promise<number> {
  return handleRequest<number>(`/api/orders/${orderId}/payments`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, '创建支付单失败')
}

/** 5. 发起支付 - POST /payments/{paymentId}/pay */
export async function payOrder(paymentId: number): Promise<unknown> {
  return handleRequest<unknown>(`/api/payments/${paymentId}/pay`, {
    method: 'POST'
  }, '支付失败')
}

/** 6. 取消订单 - POST /orders/{orderId}/cancel */
export async function cancelOrder(orderId: number, body: CancelOrderRequest): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '取消失败')
}

/** 7. 确认收货 - POST /orders/{orderId}/confirm-receipt */
export async function confirmReceipt(orderId: number): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/confirm-receipt`, { method: 'POST' }, '操作失败')
}

/** 8. 创建发货记录 - POST /orders/{orderId}/shipments */
export async function shipOrder(orderId: number, body: CreateShipmentRequest): Promise<number> {
  return handleRequest<number>(`/api/orders/${orderId}/shipments`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '发货失败')
}

/** 9. 查询物流轨迹 - GET /orders/{orderId}/shipments/{shipmentId}/traces */
export async function getLogisticsTrace(orderId: number, shipmentId: number): Promise<LogisticsTrace[]> {
  return handleRequest<LogisticsTrace[]>(`/api/orders/${orderId}/shipments/${shipmentId}/traces`, {
    method: 'GET'
  }, '获取轨迹失败')
}

/** 10. 签收 - POST /orders/{orderId}/shipments/{shipmentId}/sign */
export async function signShipment(orderId: number, shipmentId: number): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/shipments/${shipmentId}/sign`, {
    method: 'POST'
  }, '签收失败')
}

/** 11. 自提核销 - POST /orders/{orderId}/shipments/{shipmentId}/pickup-verify */
export async function verifyPickup(orderId: number, shipmentId: number, data: PickupVerifyRequest): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/shipments/${shipmentId}/pickup-verify`, {
    method: 'POST',
    body: JSON.stringify(data)
  }, '自提核销失败')
}
