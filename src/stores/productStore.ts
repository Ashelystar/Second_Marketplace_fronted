import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, FilterState, SortOption } from '@/types'

const mockProducts: Product[] = [
  { 
    id: 1, title: "iPhone 14 Pro Max 256G 暗紫色 国行", 
    price: "6299", originalPrice: "8999", 
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop&q=80",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=800&fit=crop&q=80", alt: "iPhone正面" },
      { id: 2, url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&h=800&fit=crop&q=80", alt: "iPhone侧面" },
      { id: 3, url: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop&q=80", alt: "iPhone背面" },
      { id: 4, url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop&q=80", alt: "iPhone包装" },
      { id: 5, url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=800&fit=crop&q=80", alt: "iPhone屏幕" },
      { id: 6, url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop&q=80", alt: "iPhone摄像头" },
      { id: 7, url: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=800&fit=crop&q=80", alt: "iPhone侧面" },
      { id: 8, url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop&q=80", alt: "iPhone细节" }
    ],
    location: "北京", condition: "99新", conditionDetail: "屏幕无划痕，机身无磕碰，电池健康度98%，所有功能正常",
    brand: "Apple/苹果", category: "手机",
    tags: ["苹果", "旗舰", "5G"],
    description: "2022年10月购入，一直贴膜戴壳使用，屏幕无划痕，机身无磕碰。电池健康度98%，续航给力。包装配件齐全，支持当面验货。有意者请联系~",
    attributes: [
      { name: "颜色", value: "暗紫色" },
      { name: "内存", value: "256G" },
      { name: "版本", value: "国行" }
    ],
    specifications: [
      { name: "屏幕", value: "6.7英寸 OLED" },
      { name: "处理器", value: "A16仿生" },
      { name: "电池", value: "4323mAh" }
    ],
    sellerId: 1001, sellerName: "数码小达人", sellerAvatar: "https://i.pravatar.cc/150?img=1",
    sellerRating: 4.8, sellerVerified: true, sellerOnSale: 12, sellerSold: 156, sellerGoodRate: 98.5,
    sellerDeliverySpeed: 4.9, sellerServiceAttitude: 4.7,
    viewCount: 1256, favoriteCount: 89, isNew: false, canBargain: true, freight: 0,
    coordinates: { lat: 39.9042, lng: 116.4074 }
  },
  { 
    id: 2, title: "小米13 Ultra 12+256G 黑色", 
    price: "3999", originalPrice: "5999", 
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop&q=80",
    location: "上海", condition: "95新", conditionDetail: "轻微使用痕迹，功能正常",
    brand: "小米", category: "手机",
    tags: ["徕卡影像", "骁龙8+", "旗舰"],
    description: "徕卡影像系统，专业摄影。手机摄影爱好者的首选。",
    attributes: [
      { name: "颜色", value: "黑色" },
      { name: "内存", value: "12+256G" }
    ],
    sellerId: 1002, sellerName: "米粉精选", sellerAvatar: "https://i.pravatar.cc/150?img=2",
    sellerRating: 4.6, sellerVerified: true, sellerOnSale: 8, sellerSold: 89, sellerGoodRate: 96.2,
    sellerDeliverySpeed: 4.5, sellerServiceAttitude: 4.8,
    viewCount: 892, favoriteCount: 56, isNew: false, canBargain: true, freight: 0,
    coordinates: { lat: 31.2304, lng: 121.4737 }
  },
  { 
    id: 3, title: "华为Mate 60 Pro 12+512G 雅川青", 
    price: "6999", originalPrice: "7999", 
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&q=80",
    location: "深圳", condition: "全新", conditionDetail: "未拆封未激活",
    brand: "华为", category: "手机",
    tags: ["麒麟9000S", "卫星通信", "5G"],
    description: "华为旗舰，支持卫星通信。全新未拆封，官网正品，假一赔十。",
    attributes: [
      { name: "颜色", value: "雅川青" },
      { name: "内存", value: "12+512G" },
      { name: "版本", value: "国行" }
    ],
    sellerId: 1003, sellerName: "华为官方认证", sellerAvatar: "https://i.pravatar.cc/150?img=3",
    sellerRating: 4.9, sellerVerified: true, sellerOnSale: 25, sellerSold: 328, sellerGoodRate: 99.8,
    sellerDeliverySpeed: 5.0, sellerServiceAttitude: 4.8,
    viewCount: 2341, favoriteCount: 178, isNew: true, canBargain: false, freight: 0,
    coordinates: { lat: 22.5431, lng: 114.0579 }
  },
  { 
    id: 4, title: "三星S23 Ultra 12+256G", price: "5599", originalPrice: "8999", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&q=80", location: "广州", condition: "9成新", brand: "三星", category: "手机", tags: ["S Pen", "2亿像素", "旗舰"], description: "S Pen手写笔，专业摄影",
    sellerId: 1004, sellerName: "数码掌柜", sellerAvatar: "https://i.pravatar.cc/150?img=4",
    sellerRating: 4.5, sellerVerified: true, sellerOnSale: 5, sellerSold: 45, sellerGoodRate: 94.3,
    viewCount: 567, favoriteCount: 34, isNew: false, canBargain: true, freight: 10, 
    coordinates: { lat: 23.1291, lng: 113.2644 }
  },
  { 
    id: 5, title: "索尼A7M4 全画幅相机", price: "13999", originalPrice: "16999", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop&q=80", location: "杭州", condition: "95新", brand: "索尼", category: "数码", tags: ["全画幅", "专业级", "4K"], description: "专业摄影，视频拍摄利器",
    sellerId: 1005, sellerName: "摄影老王", sellerAvatar: "https://i.pravatar.cc/150?img=5",
    sellerRating: 4.7, sellerVerified: false, sellerOnSale: 3, sellerSold: 28, sellerGoodRate: 96.8,
    viewCount: 423, favoriteCount: 45, isNew: false, canBargain: true, freight: 0, 
    coordinates: { lat: 30.2741, lng: 120.1551 }
  },
  { 
    id: 6, title: "佳能EOS R6 Mark II", price: "11999", originalPrice: "14999", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop&q=80", location: "南京", condition: "99新", brand: "佳能", category: "数码", tags: ["全画幅", "高速连拍", "专业"], description: "高速连拍，专业摄影",
    sellerId: 1006, sellerName: "佳能玩家", sellerAvatar: "https://i.pravatar.cc/150?img=6",
    sellerRating: 4.8, sellerVerified: true, sellerOnSale: 6, sellerSold: 67, sellerGoodRate: 97.5,
    viewCount: 356, favoriteCount: 28, isNew: false, canBargain: true, freight: 0, 
    coordinates: { lat: 32.0603, lng: 118.7969 }
  },
  { 
    id: 7, title: "iPad Pro 12.9寸 2022款", price: "6299", originalPrice: "8999", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&q=80", location: "成都", condition: "9成新", brand: "Apple/苹果", category: "平板", tags: ["M2芯片", "Liquid视网膜", "Pro"], description: "M2芯片，生产力工具",
    sellerId: 1007, sellerName: "苹果控", sellerAvatar: "https://i.pravatar.cc/150?img=7",
    sellerRating: 4.6, sellerVerified: true, sellerOnSale: 9, sellerSold: 112, sellerGoodRate: 95.8,
    viewCount: 678, favoriteCount: 52, isNew: false, canBargain: true, freight: 0, 
    coordinates: { lat: 30.5728, lng: 104.0668 }
  },
  { 
    id: 8, title: "MacBook Air M2 16+512G", price: "8999", originalPrice: "11999", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&q=80", location: "武汉", condition: "99新", brand: "Apple/苹果", category: "电脑", tags: ["M2芯片", "超薄", "高性能"], description: "M2芯片，续航超长",
    sellerId: 1008, sellerName: "果粉之家", sellerAvatar: "https://i.pravatar.cc/150?img=8",
    sellerRating: 4.9, sellerVerified: true, sellerOnSale: 15, sellerSold: 234, sellerGoodRate: 99.2,
    viewCount: 534, favoriteCount: 41, isNew: false, canBargain: false, freight: 0, 
    coordinates: { lat: 30.5928, lng: 114.3055 }
  },
  { 
    id: 9, title: "Switch OLED 日版", price: "1699", originalPrice: "2099", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop&q=80", location: "西安", condition: "95新", brand: "任天堂", category: "游戏机", tags: ["OLED屏幕", "游戏机", "便携"], description: "新款OLED屏幕，色彩鲜艳",
    sellerId: 1009, sellerName: "游戏达人", sellerAvatar: "https://i.pravatar.cc/150?img=9",
    sellerRating: 4.7, sellerVerified: false, sellerOnSale: 4, sellerSold: 38, sellerGoodRate: 95.6,
    viewCount: 892, favoriteCount: 67, isNew: false, canBargain: true, freight: 15, 
    coordinates: { lat: 34.3416, lng: 108.9398 }
  },
  { 
    id: 10, title: "大疆Mini 3 Pro无人机", price: "4299", originalPrice: "4788", image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop&q=80", location: "重庆", condition: "9成新", brand: "大疆", category: "数码", tags: ["4K航拍", "三向避障", "智能跟随"], description: "4K高清航拍，智能跟随",
    sellerId: 1010, sellerName: "航拍爱好者", sellerAvatar: "https://i.pravatar.cc/150?img=10",
    sellerRating: 4.5, sellerVerified: true, sellerOnSale: 2, sellerSold: 19, sellerGoodRate: 93.8,
    viewCount: 445, favoriteCount: 38, isNew: false, canBargain: true, freight: 0, 
    coordinates: { lat: 29.5630, lng: 106.5516 }
  }
]

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>(mockProducts)
  const filteredProducts = ref<Product[]>([])
  const currentSort = ref<SortOption>('default')
  const userLocation = ref({ lat: 39.9042, lng: 116.4074, city: '北京' })
  const filterState = ref<FilterState>({ minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' })

  // 计算距离
  const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
  }

  // 初始化
  const initialize = () => {
    filteredProducts.value = [...products.value]
    products.value.forEach(p => {
      if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
    })
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: '您的位置' }
        products.value.forEach(p => {
          if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
        })
      }, () => {}, { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 })
    }
  }

  // 搜索
  const performSearch = (query: string) => {
    if (!query.trim()) { filteredProducts.value = [...products.value]; return }
    const q = query.toLowerCase()
    filteredProducts.value = products.value.filter(p => 
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  // 筛选
  const applyFilter = (filter: FilterState) => {
    filterState.value = { ...filter }
    let result = [...products.value]
    if (filter.minPrice) result = result.filter(p => parseFloat(p.price) >= parseFloat(filter.minPrice))
    if (filter.maxPrice) result = result.filter(p => parseFloat(p.price) <= parseFloat(filter.maxPrice))
    if (filter.conditions.length) result = result.filter(p => filter.conditions.includes(p.condition))
    if (filter.locations.length) result = result.filter(p => filter.locations.includes(p.location))
    // 时间筛选
    if (filter.timeRange) {
      result = result.filter(p => {
        switch (filter.timeRange) {
          case 'latest': return true
          case 'today': return p.id >= 21
          case 'three-days': return p.id >= 19
          case 'week': return p.id >= 18
          case 'month': return p.id >= 12
          default: return true
        }
      })
    }
    filteredProducts.value = result
  }

  const resetFilter = () => {
    filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
    filteredProducts.value = [...products.value]
  }

  // 排序
  const sortProducts = (sortType: SortOption) => {
    currentSort.value = sortType
    const sorted = [...filteredProducts.value]
    switch (sortType) {
      case 'price-low': sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break
      case 'price-high': sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break
      case 'distance-near': sorted.filter(p => p.distance !== undefined).sort((a, b) => (a.distance || 0) - (b.distance || 0)); break
      case 'credit-high': sorted.sort((a, b) => (b.sellerRating || 0) - (a.sellerRating || 0)); break
    }
    filteredProducts.value = sorted
  }

  const getProductById = (id: number) => products.value.find(p => p.id === id)
  const getRecommendations = (excludeId: number, limit = 6) => products.value.filter(p => p.id !== excludeId).slice(0, limit)
  const getUserLocation = () => initialize()

  return { products, filteredProducts, currentSort, userLocation, filterState, initialize, performSearch, applyFilter, resetFilter, sortProducts, getProductById, getRecommendations, getUserLocation }
})
