import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, FilterState, SortOption } from '@/types'
import { getProductPage } from '@/api/goods'

// 成色等级映射
const conditionLevelMap: Record<string, string> = {
  'new': '全新',
  'almost_new': '99新',
  'good': '95新',
  'fair': '9成新',
  'poor': '8成新及以下'
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const filteredProducts = ref<Product[]>([])
  const currentSort = ref<SortOption>('default')
  const userLocation = ref({ lat: 39.9042, lng: 116.4074, city: '北京' })
  const filterState = ref<FilterState>({ minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' })
  const isLoading = ref(false)
  const totalProducts = ref(0)

  // 计算距离
  const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
  }

  // API 字段映射为前端格式
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapApiProduct = (p: any): Product => ({
    id: p.id as number,
    title: p.title as string || '',
    price: String(p.sellingPrice || 0),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    image: Array.isArray(p.images) && p.images.length > 0 
      ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as { url?: string }).url || '') 
      : '',
    location: p.pickupCity as string || '',
    condition: conditionLevelMap[p.conditionLevel as string] || (p.conditionLevel as string) || '',
    tags: Array.isArray(p.tags) ? p.tags as string[] : [],
    description: p.description as string || p.subtitle as string || '',
    sellerId: p.sellerId as number || 0,
    sellerName: p.sellerName as string || '',
    coordinates: p.latitude && p.longitude ? { lat: p.latitude as number, lng: p.longitude as number } : undefined
  })

  // 加载商品列表
  const loadProducts = async (params?: { current?: number; size?: number; categoryId?: number; keyword?: string }) => {
    isLoading.value = true
    try {
      const result = await getProductPage({
        current: params?.current || 1,
        size: params?.size || 50,
        categoryId: params?.categoryId,
        keyword: params?.keyword
      })
      // 兼容 data 直接是数组或 { records: [...] } 格式
      const records = Array.isArray(result) ? result : (result.records || [])
      const mapped = records.map(mapApiProduct)
      products.value = mapped
      totalProducts.value = Array.isArray(result) ? result.length : (result.total || 0)
      filteredProducts.value = [...products.value]
    } catch (error) {
      console.error('加载商品失败:', error)
      products.value = []
      filteredProducts.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 初始化
  const initialize = async () => {
    await loadProducts()
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
    const sorted = [...filteredProducts.value]
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

  return { products, filteredProducts, currentSort, userLocation, filterState, isLoading, totalProducts, initialize, loadProducts, performSearch, applyFilter, resetFilter, sortProducts, getProductById, getRecommendations, getUserLocation }
})
