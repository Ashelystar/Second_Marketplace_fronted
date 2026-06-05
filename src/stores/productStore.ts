import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, FilterState, SortOption } from '@/types'
import { getProductPage, type PageProductParams } from '@/api/goods'

// 成色等级映射（与详情页 formatCondition 保持一致）
const conditionLevelMap: Record<string, string> = {
  'new': '全新',
  'almost_new': '99新',
  'good': '9成新',
  'fair': '8成新',
  'poor': '7成新及以下'
}

// 反向映射：前端显示值 → 后端 conditionLevel 值
const reverseConditionMap: Record<string, string> = {
  '全新': 'new',
  '99新': 'almost_new',
  '9成新': 'good',
  '8成新': 'fair',
  '7成新及以下': 'poor'
}

// 城市名 → 大致坐标（兜底：后端没返经纬度时按城市排距离）
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9042, lng: 116.4074 },
  '上海': { lat: 31.2304, lng: 121.4737 },
  '广州': { lat: 23.1291, lng: 113.2644 },
  '深圳': { lat: 22.5431, lng: 114.0579 },
  '杭州': { lat: 30.2741, lng: 120.1551 },
  '南京': { lat: 32.0603, lng: 118.7969 },
  '成都': { lat: 30.5728, lng: 104.0668 },
  '武汉': { lat: 30.5928, lng: 114.3055 },
  '西安': { lat: 34.3416, lng: 108.9398 },
  '重庆': { lat: 29.5630, lng: 106.5516 },
  '天津': { lat: 39.0842, lng: 117.2009 },
  '苏州': { lat: 31.2989, lng: 120.5853 },
  '长沙': { lat: 28.2280, lng: 112.9388 },
  '郑州': { lat: 34.7466, lng: 113.6253 },
  '青岛': { lat: 36.0671, lng: 120.3826 },
  '东莞': { lat: 22.9460, lng: 113.7470 },
  '佛山': { lat: 23.0218, lng: 113.1219 },
  '宁波': { lat: 29.8683, lng: 121.5440 },
  '厦门': { lat: 24.4798, lng: 118.0894 },
}

/** 从详细地址中提取城市名（如"深圳市南山区" -> "深圳"） */
const extractCity = (addr: string): string | undefined => {
  if (!addr) return undefined
  const cities = Object.keys(cityCoordinates)
  for (const city of cities) {
    if (addr.includes(city)) return city
  }
  return undefined
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
    sellerAvatar: p.sellerAvatar as string || '',
    // 卖家信用数据（后端 ProductVO 可能不包含，按运行时取值，缺失则为默认值）
    sellerRating: Number(p.sellerRating ?? p.sellerScore ?? 0),
    sellerVerified: Boolean(p.sellerVerified ?? false),
    sellerGoodRate: Number(p.sellerGoodRate ?? p.goodRate ?? 0),
    sellerOnSale: Number(p.sellerOnSale ?? p.onSaleCount ?? 0),
    sellerSold: Number(p.sellerSold ?? p.soldCount ?? 0),
    viewCount: Number(p.viewCount ?? 0),
    favoriteCount: Number(p.favoriteCount ?? 0),
    coordinates: p.latitude && p.longitude
      ? { lat: p.latitude as number, lng: p.longitude as number }
      : (cityCoordinates[extractCity(p.pickupCity as string) || ''] || undefined)
  })

  // ========== 本地排序（前端兜底） ==========

  /** 本地排序函数（后端不支持该排序字段时兜底，或做二次确认） */
  const applyLocalSort = (list: Product[], sortType: SortOption) => {
    switch (sortType) {
      case 'price-low':
        list.sort((a, b) => parseFloat(a.price || '0') - parseFloat(b.price || '0'))
        break
      case 'price-high':
        list.sort((a, b) => parseFloat(b.price || '0') - parseFloat(a.price || '0'))
        break
      case 'credit-high':
        // 信用排序：按 sellerRating 降序，无评分排在最后
        list.sort((a, b) => (b.sellerRating ?? 0) - (a.sellerRating ?? 0))
        break
      case 'distance-near':
        // 距离排序：按 distance 升序，无距离数据排在最后
        list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        break
      default:
        break
    }
  }

  // ========== 核心加载方法（直接走后端API）==========

  /**
   * 加载商品列表 — 所有筛选/搜索/排序/分页参数都通过 PageProductParams 传给后端
   */
  const loadProducts = async (params?: Partial<PageProductParams>, append = false) => {
    isLoading.value = true
    try {
      // 合并外部参数到 queryState
      if (params) {
        // 先清除传入 undefined 的字段（Object.assign 会跳过 undefined 值）
        for (const key of Object.keys(params) as (keyof PageProductParams)[]) {
          if (params[key] === undefined) {
            delete (queryState.value as Record<string, unknown>)[key]
          }
        }
        Object.assign(queryState.value, params)
      }

      const result = await getProductPage(queryState.value)
      // 兼容 data 直接是数组或 { records: [...] } 格式
      const records = Array.isArray(result) ? result : (result.records || [])
      const mapped = records.map(mapApiProduct)
      if (append) {
        products.value.push(...mapped)
        filteredProducts.value.push(...mapped)
      } else {
        products.value = mapped
        filteredProducts.value = mapped
      }
      totalProducts.value = Array.isArray(result) ? result.length : (result.total || 0)
      currentPage.value = Array.isArray(result) ? 1 : (result.current || queryState.value.current || 1)

      // 计算距离
      products.value.forEach(p => {
        if (p.coordinates) p.distance = calcDistance(userLocation.value.lat, userLocation.value.lng, p.coordinates.lat, p.coordinates.lng)
      })

      // 本地排序兜底：如果当前有非默认排序且不是追加模式，对结果再排一次
      // 后端支持排序时结果一致；后端不支持时保证前端排序生效
      if (!append && currentSort.value !== 'default') {
        applyLocalSort(filteredProducts.value, currentSort.value)
      }
    } catch (error) {
      console.error('加载商品失败:', error)
      if (!append) {
        products.value = []
        filteredProducts.value = []
      }
    } finally {
      isLoading.value = false
    }
  }

  /** 切换页码 */
  const changePage = (page: number) => {
    queryState.value.current = page
    // page > 1 时追加，page = 1 时覆盖
    loadProducts(undefined, page > 1)
  }

  // ========== 搜索（走后端API）==========

  /**
   * 搜索 — 将关键词传入后端进行服务端检索
   */
  const performSearch = (query: string) => {
    // 搜索时清除分类筛选，避免 categoryId 与 keyword 交叉干扰
    queryState.value.categoryId = undefined
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
    queryState.value.minPrice = filter.minPrice ? parseFloat(filter.minPrice) : undefined
    queryState.value.maxPrice = filter.maxPrice ? parseFloat(filter.maxPrice) : undefined
    
    // 成色 → 转换为后端 conditionLevels 数组
    if (filter.conditions && filter.conditions.length > 0) {
      const levelValues = filter.conditions.map(c => reverseConditionMap[c] || c).filter(Boolean)
      queryState.value.conditionLevels = levelValues
    } else {
      queryState.value.conditionLevels = undefined
    }

    // 发货地 → 映射到 pickupCities 数组
    if (filter.locations && filter.locations.length > 0) {
      queryState.value.pickupCities = filter.locations
    } else {
      queryState.value.pickupCities = undefined
    }

    // 时间范围 → 可映射为 publishedAt 的排序方向（可选）
    // 这里暂不处理时间范围，如需支持可扩展
    
    queryState.value.current = 1  // 切换筛选时回到第1页
    loadProducts()
  }

  const resetFilter = () => {
    filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
    // 清空所有筛选项（包括关键词和分类）
    queryState.value.keyword = undefined
    queryState.value.categoryId = undefined
    queryState.value.minPrice = undefined
    queryState.value.maxPrice = undefined
    queryState.value.conditionLevels = undefined
    queryState.value.pickupCities = undefined
    queryState.value.publishStatus = undefined
    queryState.value.brand = undefined
    queryState.value.model = undefined
    queryState.value.isNew = undefined
    queryState.value.tradeMode = undefined
    // 重置排序为默认
    queryState.value.sortField = undefined
    queryState.value.sortOrder = undefined
    currentSort.value = 'default'
    queryState.value.current = 1
    loadProducts()
  }

  // ========== 排序（后端API优先 + 前端本地兜底）==========

  /**
   * 排序 — 将排序字段和方向传给后端，加载完成后前端再做本地排序兜底
   */
  const sortProducts = async (sortType: SortOption) => {
    currentSort.value = sortType

    // 1. 构造后端排序参数（优先让后端排序）
    switch (sortType) {
      case 'price-low':
        queryState.value.sortField = 'sellingPrice'
        queryState.value.sortOrder = 'asc'
        break
      case 'price-high':
        queryState.value.sortField = 'sellingPrice'
        queryState.value.sortOrder = 'desc'
        break
      case 'credit-high':
        // 尝试请求后端按信用排序
        queryState.value.sortField = 'sellerRating'
        queryState.value.sortOrder = 'desc'
        break
      case 'distance-near':
        // 距离排序完全走后端默认（不传排序参数），前端兜底
        delete queryState.value.sortField
        delete queryState.value.sortOrder
        break
      default:
        // 综合排序：清空排序字段，后端按默认规则
        delete queryState.value.sortField
        delete queryState.value.sortOrder
        break
    }

    queryState.value.current = 1  // 排序时回到第1页
    await loadProducts()
    // 二次强制兜底：距离排序必须在 loadProducts 后再排一次，确保近的在前面
    if (sortType === 'distance-near') {
      applyLocalSort(filteredProducts.value, 'distance-near')
    }
  }

  // ========== 初始化 ==========
  const initialize = async () => {
    // 重置查询条件，避免从其他页面（如搜索页）返回时携带旧的筛选参数
    queryState.value = { current: 1, size: 20 }
    currentSort.value = 'default'
    filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
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

  /**
   * 更新用户位置并刷新所有商品距离
   */
  const updateLocationAndDistances = (lat: number, lng: number, city: string) => {
    userLocation.value = { lat, lng, city }
    const refreshDistances = (list: Product[]) => {
      list.forEach((p) => {
        if (p.coordinates)
          p.distance = calcDistance(lat, lng, p.coordinates.lat, p.coordinates.lng)
      })
    }
    refreshDistances(products.value)
    refreshDistances(filteredProducts.value)
  }

  /**
   * IP 地理定位兜底：浏览器定位失败时，通过 IP 推断城市
   * 使用 ipapi.co（免费、HTTPS、JSONP 模式兼容 HTTP 开发环境）
   */
  const requestLocationByIP = async (): Promise<boolean> => {
    try {
      // ipapi.co 免费额度充足，且支持 HTTP/HTTPS
      const resp = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
      if (!resp.ok) return false
      const data = await resp.json()
      const city = data?.city as string | undefined
      if (!city) return false
      const coords = cityCoordinates[city]
      if (!coords) return false
      updateLocationAndDistances(coords.lat, coords.lng, city)
      return true
    } catch {
      return false
    }
  }

  /**
   * 请求用户真实地理位置（Google Chrome 等可能拒绝，失败则用 IP 定位兜底）
   * 在加载数据前调用，确保距离计算基准正确
   */
  const requestLocation = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // 不支持浏览器定位，直接用 IP 定位
        requestLocationByIP().finally(resolve)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocationAndDistances(pos.coords.latitude, pos.coords.longitude, '您的位置')
          resolve()
        },
        async () => {
          // 浏览器定位失败 → IP 定位兜底
          await requestLocationByIP()
          resolve()
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 },
      )
    })
  }

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
    getUserLocation,
    requestLocation,
  }
})
