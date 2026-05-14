import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, FilterState, SortOption } from '@/types'
import { getProductPage, type PageProductParams } from '@/api/goods'

// 成色等级映射
const conditionLevelMap: Record<string, string> = {
  'new': '全新',
  'almost_new': '99新',
  'good': '95新',
  'fair': '9成新',
  'poor': '8成新及以下'
}

// 反向映射：前端显示值 → 后端 conditionLevel 值
const reverseConditionMap: Record<string, string> = {
  '全新': 'new',
  '99新': 'almost_new',
  '95新': 'good',
  '9成新': 'fair',
  '8成新及以下': 'poor'
}

export const useProductStore = defineStore('product', () => {
  // ========== 状态 ==========
  const products = ref<Product[]>([])
  const filteredProducts = ref<Product[]>([])
  const currentSort = ref<SortOption>('default')
  const userLocation = ref({ lat: 39.9042, lng: 116.4074, city: '北京' })
  const filterState = ref<FilterState>({ minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' })
  const isLoading = ref(false)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)

  // ========== 内部查询状态（所有条件合并后传给后端）==========
  const queryState = ref<PageProductParams>({
    current: 1,
    size: 20,
  })

  // ========== 工具函数 ==========
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
      ? (typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as { imageUrl?: string; url?: string }).imageUrl || (p.images[0] as { url?: string }).url || '')
      : '',
    location: p.pickupCity as string || '',
    condition: conditionLevelMap[p.conditionLevel as string] || (p.conditionLevel as string) || '',
    tags: Array.isArray(p.tags) ? p.tags as string[] : [],
    description: p.description as string || p.subtitle as string || '',
    sellerId: p.sellerId as number || 0,
    sellerName: p.sellerName as string || '',
    coordinates: p.latitude && p.longitude ? { lat: p.latitude as number, lng: p.longitude as number } : undefined
  })

  // ========== 核心加载方法（直接走后端API）==========

  /**
   * 加载商品列表 — 所有筛选/搜索/排序/分页参数都通过 PageProductParams 传给后端
   */
  const loadProducts = async (params?: Partial<PageProductParams>) => {
    isLoading.value = true
    try {
      // 合并外部参数到 queryState
      if (params) {
        Object.assign(queryState.value, params)
      }

      const result = await getProductPage(queryState.value)
      // 兼容 data 直接是数组或 { records: [...] } 格式
      const records = Array.isArray(result) ? result : (result.records || [])
      const mapped = records.map(mapApiProduct)
      products.value = mapped
      filteredProducts.value = mapped
      totalProducts.value = Array.isArray(result) ? result.length : (result.total || 0)
      currentPage.value = Array.isArray(result) ? 1 : (result.current || queryState.value.current || 1)

      // 计算距离
      products.value.forEach(p => {
        if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
      })
    } catch (error) {
      console.error('加载商品失败:', error)
      products.value = []
      filteredProducts.value = []
    } finally {
      isLoading.value = false
    }
  }

  /** 切换页码 */
  const changePage = (page: number) => {
    queryState.value.current = page
    loadProducts()
  }

  // ========== 搜索（走后端API）==========

  /**
   * 搜索 — 将关键词传入后端进行服务端检索
   */
  const performSearch = (query: string) => {
    queryState.value.keyword = query.trim() || undefined
    queryState.value.current = 1  // 搜索时回到第1页
    loadProducts()
  }

  // ========== 筛选（走后端API）==========

  /**
   * 应用筛选 — 将前端筛选条件转换为后端参数，重新请求API
   */
  const applyFilter = (filter: FilterState) => {
    filterState.value = { ...filter }
    
    // 价格区间
    queryState.value.priceMin = filter.minPrice ? parseFloat(filter.minPrice) : undefined
    queryState.value.priceMax = filter.maxPrice ? parseFloat(filter.maxPrice) : undefined
    
    // 成色 → 转换为后端 conditionLevel（多选取第一个，或后端支持数组时可扩展）
    // 注意：后端 conditionLevel 是单值字符串，前端多选时可以后续改为逗号分隔或多次请求
    if (filter.conditions && filter.conditions.length > 0) {
      const levelValues = filter.conditions.map(c => reverseConditionMap[c] || c).filter(Boolean)
      queryState.value.conditionLevel = levelValues.join(',')
    } else {
      queryState.value.conditionLevel = undefined
    }

    // 城市 → 映射到 pickupCity
    if (filter.locations && filter.locations.length > 0) {
      queryState.value.pickupCity = filter.locations.join(',')
    } else {
      queryState.value.pickupCity = undefined
    }

    // 时间范围 → 可映射为 publishedAt 的排序方向（可选）
    // 这里暂不处理时间范围，如需支持可扩展
    
    queryState.value.current = 1  // 切换筛选时回到第1页
    loadProducts()
  }

  const resetFilter = () => {
    filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
    // 清除所有筛选项
    queryState.value.priceMin = undefined
    queryState.value.priceMax = undefined
    queryState.value.conditionLevel = undefined
    queryState.value.pickupCity = undefined
    queryState.value.publishStatus = undefined
    queryState.value.brand = undefined
    queryState.value.model = undefined
    queryState.value.isNew = undefined
    queryState.value.tradeMode = undefined
    queryState.value.current = 1
    loadProducts()
  }

  // ========== 排序（走后端API）==========

  /**
   * 排序 — 将排序字段和方向传给后端
   */
  const sortProducts = (sortType: SortOption) => {
    currentSort.value = sortType
    switch (sortType) {
      case 'price-low':
        queryState.value.sortField = 'sellingPrice'
        queryState.value.sortOrder = 'asc'
        break
      case 'price-high':
        queryState.value.sortField = 'sellingPrice'
        queryState.value.sortOrder = 'desc'
        break
      case 'distance-near':
        // 距离排序需要经纬度参数，后端可能不支持，回退到前端排序
        // 如果后端支持 latitude/longitude + sortField=distance 则可走API
        queryState.value.sortField = undefined
        queryState.value.sortOrder = undefined
        break
      default:
        queryState.value.sortField = undefined
        queryState.value.sortOrder = undefined
        break
    }
    queryState.value.current = 1  // 排序时回到第1页
    loadProducts()
  }

  // ========== 初始化 ==========
  const initialize = async () => {
    await loadProducts()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        userLocation.value = { lat: pos.coords.latitude, lng: pos.coords.longitude, city: '您的位置' }
        products.value.forEach(p => {
          if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
        })
        filteredProducts.value.forEach(p => {
          if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
        })
      }, () => {}, { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 })
    }
  }

  // ========== 辅助方法 ==========
  const getProductById = (id: number) => products.value.find(p => p.id === id)
  
  const getRecommendations = (excludeId: number, limit = 6) => 
    products.value.filter(p => p.id !== excludeId).slice(0, limit)

  const getUserLocation = () => initialize()

  return { 
    products, 
    filteredProducts, 
    currentSort, 
    userLocation, 
    filterState, 
    isLoading, 
    totalProducts, 
    currentPage,
    pageSize,
    initialize, 
    loadProducts, 
    changePage,
    performSearch, 
    applyFilter, 
    resetFilter, 
    sortProducts, 
    getProductById, 
    getRecommendations, 
    getUserLocation 
  }
})
