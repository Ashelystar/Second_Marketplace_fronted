// 订单相关类型

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_title: string
  product_image: string
  price: string
  quantity: number
  sku_info?: string
}

export interface TradeOrder {
  id: number
  order_no: string
  order_status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunding'
  pay_amount: string
  total_amount: string
  freight: string
  trade_mode: 'shipping' | 'pickup'
  created_at: string
  updated_at: string
  seller_id: number
  seller_name: string
  buyer_id: number
  buyer_name: string
  receiver_name?: string
  receiver_phone?: string
  receiver_address?: string
  pickup_location?: string
  shipping_no?: string
  remark?: string
  items?: OrderItem[]
}

// API函数类型定义
export interface ListOrdersParams {
  status?: string
  page?: number
  pageSize?: number
}

// 创建订单请求
export interface CreateOrderRequest {
  sellerId: number
  tradeMode: 'shipping' | 'pickup'
  freightAmount: number
  remark?: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  pickupLocation?: string
  items: Array<{
    productId: number
    quantity: number
  }>
}

// 支付相关
export interface CreatePaymentRequest {
  paymentChannel: 'alipay' | 'wechat' | 'balance'
}

export interface PaymentCallbackRequest {
  paymentId: number
  paymentStatus: 'paid' | 'failed'
  paidAmount: number
  channelTradeNo: string
}

// 物流相关
export interface CreateShipmentRequest {
  logisticsCompany: string
  trackingNo: string
}

export interface AddTraceRequest {
  traceTime: string
  traceStatus: string
  traceDetail: string
  traceLocation: string
}
