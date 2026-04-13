export interface UserAccount {
  id: number
  username: string
  nickname: string
  phone?: string
  email?: string
  can_buy: 0 | 1
  can_sell: 0 | 1
  is_admin: 0 | 1
  user_status: 'pending_review' | 'active' | 'suspended' | 'banned' | 'deleted'
  last_login_at?: string
  registered_at: string
  avatar_url?: string
}

export interface UserProfile {
  user_id: number
  avatar_url?: string
  gender: 'unknown' | 'male' | 'female'
  birthday?: string
  bio?: string
  city?: string
  district?: string
  credit_score: number
  positive_rate: number
  total_review_count: number
}

export interface OrderItem {
  id: number
  product_title: string
  product_image_url: string
  quantity: number
  unit_price: number
  subtotal_amount: number
}

export interface TradeOrder {
  id: number
  order_no: string
  buyer_name: string
  seller_name: string
  order_status: 'pending_payment' | 'paid_pending_ship' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refund_in_progress' | 'closed'
  trade_mode: 'pickup' | 'shipping'
  total_amount: number
  freight_amount: number
  pay_amount: number
  remark?: string
  receiver_name: string
  receiver_phone: string
  receiver_address?: string
  pickup_location?: string
  cancel_reason?: string
  paid_at?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  created_at: string
}
