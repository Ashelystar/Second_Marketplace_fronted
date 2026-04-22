import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, FilterState, SortOption } from '@/types'

const mockProducts: Product[] = [
  { id: 1, title: "iPhone 14 Pro Max 256G", price: "6299", originalPrice: "8999", image: "https://picsum.photos/id/1/300/300", location: "北京", condition: "99新", tags: ["苹果", "旗舰", "5G"], description: "国行，原装无拆修，电池健康度98%", sellerId: 101, sellerName: '数码小王子', coordinates: { lat: 39.9042, lng: 116.4074 } },
  { id: 2, title: "小米13 Ultra 12+256G", price: "3999", originalPrice: "5999", image: "https://picsum.photos/id/2/300/300", location: "上海", condition: "95新", tags: ["徕卡影像", "骁龙8+", "旗舰"], description: "徕卡影像系统，专业摄影", sellerId: 102, sellerName: '米家严选', coordinates: { lat: 31.2304, lng: 121.4737 } },
  { id: 3, title: "华为Mate 60 Pro 12+512G", price: "6999", originalPrice: "7999", image: "https://picsum.photos/id/3/300/300", location: "深圳", condition: "全新", tags: ["麒麟9000S", "卫星通信", "5G"], description: "华为旗舰，支持卫星通信", sellerId: 103, sellerName: '华城通信', coordinates: { lat: 22.5431, lng: 114.0579 } },
  { id: 4, title: "三星S23 Ultra 12+256G", price: "5599", originalPrice: "8999", image: "https://picsum.photos/id/4/300/300", location: "广州", condition: "9成新", tags: ["S Pen", "2亿像素", "旗舰"], description: "S Pen手写笔，专业摄影", sellerId: 104, sellerName: '手机汇', coordinates: { lat: 23.1291, lng: 113.2644 } },
  { id: 5, title: "索尼A7M4 全画幅相机", price: "13999", originalPrice: "16999", image: "https://picsum.photos/id/10/300/300", location: "杭州", condition: "95新", tags: ["全画幅", "专业级", "4K"], description: "专业摄影，视频拍摄利器", sellerId: 105, sellerName: '影像工坊', coordinates: { lat: 30.2741, lng: 120.1551 } },
  { id: 6, title: "佳能EOS R6 Mark II", price: "11999", originalPrice: "14999", image: "https://picsum.photos/id/20/300/300", location: "南京", condition: "99新", tags: ["全画幅", "高速连拍", "专业"], description: "高速连拍，专业摄影", sellerId: 106, sellerName: '相机控', coordinates: { lat: 32.0603, lng: 118.7969 } },
  { id: 7, title: "iPad Pro 12.9寸 2022", price: "6299", originalPrice: "8999", image: "https://picsum.photos/id/25/300/300", location: "成都", condition: "9成新", tags: ["M2芯片", "Liquid视网膜", "Pro"], description: "M2芯片，生产力工具", sellerId: 107, sellerName: '果粉生活', coordinates: { lat: 30.5728, lng: 104.0668 } },
  { id: 8, title: "MacBook Air M2 16+512G", price: "8999", originalPrice: "11999", image: "https://picsum.photos/id/30/300/300", location: "武汉", condition: "99新", tags: ["M2芯片", "超薄", "高性能"], description: "M2芯片，续航超长", sellerId: 108, sellerName: '轻薄本专营', coordinates: { lat: 30.5928, lng: 114.3055 } },
  { id: 9, title: "Switch OLED 日版", price: "1699", originalPrice: "2099", image: "https://picsum.photos/id/35/300/300", location: "西安", condition: "95新", tags: ["OLED屏幕", "游戏机", "便携"], description: "新款OLED屏幕，色彩鲜艳", sellerId: 109, sellerName: '游戏达人', coordinates: { lat: 34.3416, lng: 108.9398 } },
  { id: 10, title: "大疆Mini 3 Pro无人机", price: "4299", originalPrice: "4788", image: "https://picsum.photos/id/40/300/300", location: "重庆", condition: "9成新", tags: ["4K航拍", "三向避障", "智能跟随"], description: "4K高清航拍，智能跟随", sellerId: 110, sellerName: '航拍玩家', coordinates: { lat: 29.5630, lng: 106.5516 } }
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
    filteredProducts.value = result
  }

  const resetFilter = () => {
    filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
    filteredProducts.value = [...products.value]
  }

  // 排序
  const sortProducts = (sortType: SortOption) => {
    currentSort.value = sortType
    let sorted = [...filteredProducts.value]
    switch (sortType) {
      case 'price-low': sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break
      case 'price-high': sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break
      case 'distance-near': sorted.filter(p => p.distance !== undefined).sort((a, b) => (a.distance || 0) - (b.distance || 0)); break
    }
    filteredProducts.value = sorted
  }

  const getProductById = (id: number) => products.value.find(p => p.id === id)
  const getRecommendations = (excludeId: number, limit = 6) => products.value.filter(p => p.id !== excludeId).slice(0, limit)
  const getUserLocation = () => initialize()

  return { products, filteredProducts, currentSort, userLocation, filterState, initialize, performSearch, applyFilter, resetFilter, sortProducts, getProductById, getRecommendations, getUserLocation }
})
