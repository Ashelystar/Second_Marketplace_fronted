import type { TradeOrder, OrderProduct } from '@/types'

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

// 各种操作的请求体 (根据你提供的 JSON 结构)
export interface CancelOrderRequest { cancelReason: string }
export interface PayOrderRequest { paymentChannel: string }
export interface ShippingRequest { logisticsCompany: string; trackingNo: string }
export interface RejectRequest { rejectReason: string }
export interface WalletAdjustRequest { userId: number; changeAmount: number; note: string }
export interface WithdrawalRequest { amount: number; channel: string; channelAccountMask?: string }

// 具体的返回数据结构
export interface PaymentResult {
  paymentId: number
  paymentStatus: string
  paidAmount: number
  channelTradeNo: string
}

export interface LogisticsTrace {
  traceTime: string
  traceStatus: string
  traceDetail: string
  traceLocation: string
}

// ==========================================
// 2. 通用的底层请求处理函数 (handleRequest)
// ==========================================

async function handleRequest<T>(url: string, options: RequestInit, errorMsg: string): Promise<T> {
  // 自动从本地存储获取 Token 并加入 Header
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
// 3. 核心 API 函数导出 (订单 + 钱包)
// ==========================================

/** 1. 创建订单 */
export async function createOrder(data: CreateOrderRequest): Promise<TradeOrder> {
  return handleRequest<TradeOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }, '创建订单失败')
}

/** 2. 获取订单列表 (支持分页/搜索) */
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

/** 3. 订单详情/商品项 */
export async function getOrderDetail(orderId: number): Promise<TradeOrder> {
  return handleRequest<TradeOrder>(`/api/orders/${orderId}`, { method: 'GET' }, '获取详情失败')
}

export async function getOrderItems(orderId: number): Promise<OrderProduct[]> {
  return handleRequest<OrderProduct[]>(`/api/orders/${orderId}/items`, { method: 'GET' }, '获取详情失败')
}

/** 4. 支付订单 */
export async function payOrder(orderId: number, body: PayOrderRequest): Promise<PaymentResult> {
  return handleRequest<PaymentResult>(`/api/orders/${orderId}/pay`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '支付失败')
}

/** 5. 取消订单 */
export async function cancelOrder(orderId: number, body: CancelOrderRequest): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '取消失败')
}

/** 6. 确认收货 */
export async function confirmReceipt(orderId: number): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/confirm`, { method: 'POST' }, '操作失败')
}

/** 7. 卖家发货 (物流) */
export async function shipOrder(orderId: number, body: ShippingRequest): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/ship`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '发货失败')
}

/** 8. 获取物流轨迹 */
export async function getLogisticsTrace(orderId: number): Promise<LogisticsTrace[]> {
  return handleRequest<LogisticsTrace[]>(`/api/orders/${orderId}/logistics`, { method: 'GET' }, '获取轨迹失败')
}

/** 9. 获取自提码 */
export async function getPickupCode(orderId: number): Promise<{ pickupCode: string }> {
  return handleRequest<{ pickupCode: string }>(`/api/orders/${orderId}/pickup-code`, { method: 'GET' }, '获取提货码失败')
}

/** 10. 钱包余额调整 (后台/特定操作) */
export async function adjustWallet(body: WalletAdjustRequest): Promise<void> {
  return handleRequest<void>('/api/user/wallet/adjust', {
    method: 'POST',
    body: JSON.stringify(body)
  }, '调整余额失败')
}

/** 11. 提现申请 */
export async function requestWithdrawal(body: WithdrawalRequest): Promise<void> {
  return handleRequest<void>('/api/user/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(body)
  }, '提现失败')
}

/** 12. 拒绝/审核 */
export async function rejectOrder(orderId: number, body: RejectRequest): Promise<void> {
  return handleRequest<void>(`/api/orders/${orderId}/reject`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, '拒绝失败')
}
