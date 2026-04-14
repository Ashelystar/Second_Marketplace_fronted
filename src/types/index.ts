// 类型定义
export interface Product {
  id: number
  title: string
  price: string
  originalPrice: string
  image: string
  images?: ProductImage[]
  location: string
  condition: string
  conditionDetail?: string
  brand?: string
  category?: string
  tags: string[]
  description: string
  attributes?: { name: string; value: string }[]
  specifications?: { name: string; value: string }[]
  videoUrl?: string
  sellerId: number
  sellerName: string
  sellerAvatar?: string
  sellerRating?: number
  sellerVerified?: boolean
  sellerOnSale?: number      // 在售数量
  sellerSold?: number        // 已售数量
  sellerGoodRate?: number    // 好评率
  sellerDeliverySpeed?: number   // 发货速度评分
  sellerServiceAttitude?: number // 服务态度评分
  viewCount?: number
  favoriteCount?: number
  isNew?: boolean
  canBargain?: boolean
  freight?: number
  distance?: number
  coordinates?: { lat: number; lng: number }
}

export interface FilterState {
  minPrice: string
  maxPrice: string
  conditions: string[]
  locations: string[]
  timeRange: string
}

export interface UserLocation {
  lat: number
  lng: number
  city: string
}

export type SortOption = 'default' | 'price-low' | 'price-high' | 'distance-near' | 'credit-high'

export interface ProductImage {
  id: number
  url: string
  alt: string
}

// 订单类型
export interface TradeOrder {
  id: number
  order_no: string
  order_status: string
  status: string
  statusText: string
  total_amount: string
  trade_mode: string
  freight_amount: string
  pay_amount: string
  remark?: string
  created_at: string
  paid_at?: string
  ship_time?: string
  receive_time?: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  pickup_location?: string
  products: OrderProduct[]
}

export interface OrderProduct {
  id: number
  product_id: number
  product_title: string
  product_image_url: string
  quantity: number
  subtotal_amount: string
  price: string
}
