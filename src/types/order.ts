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
  order_status: string
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
  shipping_no?: string
  remark?: string
}

// API函数类型定义
export interface ListOrdersParams {
  status?: string
  page?: number
  pageSize?: number
}
