// --- 基础定义 ---
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// --- 订单相关接口 ---
export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  sellerId: number;
  tradeMode: 'pickup' | 'shipping';
  freightAmount: number;
  remark: string;
  pickupLocation: string;
  items: OrderItem[];
}

export interface OrderListParams {
  role?: string;
  status?: string;
  page: number;
  pageSize: number;
}

// --- 支付相关接口 ---
export interface CreatePaymentRequest {
  paymentChannel: 'alipay' | 'wechat' | 'balance';
}

export interface PaymentCallbackRequest {
  paymentId: number;
  paymentStatus: 'paid' | 'failed';
  paidAmount: number;
  channelTradeNo: string;
}

// --- 物流相关接口 ---
export interface CreateShipmentRequest {
  logisticsCompany: string;
  trackingNo: string;
}

export interface AddTraceRequest {
  traceTime: string;
  traceStatus: string;
  traceDetail: string;
  traceLocation: string;
}

// --- 通用请求函数 (包含 Token 自动注入) ---
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token'); // 假设你存的是 token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // oxlint-disable-next-line unicorn/no-useless-fallback-in-spread
    ...((options.headers as unknown) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`网络错误: ${response.status}`);
  }

  const json: ApiResponse<T> = await response.json();
  if (json.code !== 200) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

// ===================== 订单主流程 =====================

/** 创建订单 */
export const createOrder = (data: CreateOrderRequest) =>
  request('/api/orders', { method: 'POST', body: JSON.stringify(data) });

/** 订单列表 */
export const getOrderList = (params: OrderListParams) => {
  // const query = new URLSearchParams(params as any).toString();
  // 将 params as any 改为：
const query = new URLSearchParams(params as unknown as Record<string, string>).toString();
  return request<unknown[]>(`/api/orders?${query}`);
};

/** 订单详情 */
export const getOrderDetail = (orderId: number) =>
  request(`/api/orders/${orderId}`);

/** 取消订单 */
export const cancelOrder = (orderId: number, reason: string) =>
  request(`/api/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ cancelReason: reason })
  });

/** 确认收货 */
export const confirmReceipt = (orderId: number) =>
  request(`/api/orders/${orderId}/confirm-receipt`, { method: 'POST' });

/** 订单状态日志 */
export const getOrderStatusLogs = (orderId: number) =>
  request(`/api/orders/${orderId}/status-logs`);


// ===================== 支付流程 =====================

/** 创建支付单 */
export const createPayment = (orderId: number, data: CreatePaymentRequest) =>
  request(`/api/orders/${orderId}/payments`, { method: 'POST', body: JSON.stringify(data) });

/** 支付单详情 */
export const getPaymentDetail = (orderId: number, paymentId: number) =>
  request(`/api/orders/${orderId}/payments/${paymentId}`);

/** 发起支付 (调用第三方支付) */
export const payOrder = (paymentId: number) =>
  request(`/api/payments/${paymentId}/pay`, { method: 'POST' });

/** 支付回调 (模拟) */
export const paymentCallback = (data: PaymentCallbackRequest) =>
  request(`/api/payments/callback`, { method: 'POST', body: JSON.stringify(data) });

/** 支付流水 */
export const getPaymentTransactions = (paymentId: number) =>
  request(`/api/payments/${paymentId}/transactions`);


// ===================== 发货物流流程 =====================

/** 创建发货记录 */
export const createShipment = (orderId: number, data: CreateShipmentRequest) =>
  request(`/api/orders/${orderId}/shipments`, { method: 'POST', body: JSON.stringify(data) });

/** 发货详情 */
export const getShipmentDetail = (orderId: number, shipmentId: number) =>
  request(`/api/orders/${orderId}/shipments/${shipmentId}`);

/** 新增物流轨迹 */
export const addShipmentTrace = (orderId: number, shipmentId: number, data: AddTraceRequest) =>
  request(`/api/orders/${orderId}/shipments/${shipmentId}/traces`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

/** 查询物流轨迹 */
export const getShipmentTraces = (orderId: number, shipmentId: number) =>
  request(`/api/orders/${orderId}/shipments/${shipmentId}/traces`);

/** 签收/自提核销 */
export const signShipment = (orderId: number, shipmentId: number, pickupCode?: string) =>
  request(`/api/orders/${orderId}/shipments/${shipmentId}/sign`, {
    method: 'POST',
    body: JSON.stringify({ pickupCode })
  });
