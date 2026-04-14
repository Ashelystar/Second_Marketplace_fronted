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
  orderNo: string
  status: string
  statusText: string
  totalAmount: string
  createTime: string
  payTime?: string
  shipTime?: string
  receiveTime?: string
  products: Product[]
  address: {
    receiver: string
    phone: string
    province: string
    city: string
    district: string
    detail: string
  }
}
