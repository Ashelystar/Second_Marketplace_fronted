import type { Product } from '@/types'

// ==========================================
// 1. 接口请求/响应类型定义
// ==========================================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// ==========================================
// 2. 通用的底层请求处理函数
// ==========================================

async function handleRequest<T>(url: string, options: RequestInit, errorMsg: string): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('[API请求]', options.method || 'GET', url)

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  console.log('[API响应]', response.status, response.statusText)

  if (!response.ok) {
    const text = await response.text()
    console.error('[API错误]', text)
    throw new Error(text || `网络错误：${response.status}`)
  }

  const text = await response.text()
  console.log('[API返回文本]', text.substring(0, 500))

  if (!text) {
    throw new Error('接口返回为空')
  }

  try {
    const json = JSON.parse(text) as ApiResponse<T>
    console.log('[API解析成功]', json)
    // 只要 data 存在且不为 null，就视为成功（兼容各种 code 值）
    if (json.data === null || json.data === undefined) {
      throw new Error(json.message || errorMsg)
    }
    return json.data
  } catch (e) {
    console.error('[API解析失败]', e)
    if (e instanceof Error) {
      throw e  // 抛出原始错误
    }
    throw new Error('解析 JSON 失败')
  }
}

// ==========================================
// 3. 商品相关 API 函数
// ==========================================

/** 获取商品详情 */
export async function getProductDetail(id: number): Promise<Product> {
  return handleRequest<Product>(`/api/product/${id}`, { method: 'GET' }, '获取商品详情失败')
}

/** 下架商品（将商品置为下架状态，非真删除） */
export async function offShelfProduct(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}`, { method: 'DELETE' }, '下架商品失败')
}

/** 重新上架商品 */
export async function relistProduct(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}/relist`, { method: 'PUT' }, '重新上架失败')
}

/** 提交商品审核（草稿/驳回 → 待审核 pending_review） */
export async function submitForReview(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}/submit-review`, { method: 'PUT' }, '提交审核失败')
}

/** 撤销商品审核（待审核 pending_review → 撤回至草稿 draft） */
export async function revokeReview(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}/revoke-review`, { method: 'PUT' }, '撤销审核失败')
}

/** 管理员审核商品（通过/驳回） */
export interface AdminAuditParams {
  approved: boolean
  rejectReason?: string
}

export async function adminAuditProduct(id: number, params: AdminAuditParams): Promise<string> {
  return handleRequest<string>(`/api/product/admin/audit/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  }, '审核操作失败')
}

/** 商品简要统计 */
export interface ProductStats {
  viewCount: number
  favoriteCount: number
  orderCount: number
}

/** 获取商品简要统计 */
export async function getProductStats(id: number): Promise<ProductStats> {
  return handleRequest<ProductStats>(`/api/product/${id}/stats`, { method: 'GET' }, '获取商品统计失败')
}

/** 增加商品浏览量 */
export async function incrementProductView(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}/view`, { method: 'PUT' }, '增加浏览量失败')
}

/** 商品修改参数（与后端接口对齐，字段值为英文枚举） */
export interface UpdateProductParams {
  /** 商品分类 ID（必填）*/
  categoryId: number
  /** 商品名称/标题（必填）*/
  title: string
  /** 副标题（可选）*/
  subtitle?: string
  /** 商品描述（必填）*/
  description: string
  /** 品牌（可选）*/
  brand?: string
  /** 型号（可选）*/
  model?: string
  /** 成色级别（必填）：new/almost_new/good/fair/poor */
  conditionLevel: 'new' | 'almost_new' | 'good' | 'fair' | 'poor'
  /** 购买年份（可选）*/
  purchaseYear?: number
  /** 原价（元，必填）*/
  originalPrice: number
  /** 售价（元，必填）*/
  sellingPrice: number
  /** 交易方式（必填）：pickup/shipping/both */
  tradeMode: 'pickup' | 'shipping' | 'both'
  /** 自提城市（可选）*/
  pickupCity?: string
  /** 自提详细地址（可选）*/
  pickupAddress?: string
  /** 纬度坐标（可选）*/
  locationLat?: number
  /** 经度坐标（可选）*/
  locationLng?: number
  /** 图片数组（可选，对象格式匹配后端接口）*/
  images?: { imageUrl?: string; url?: string; id?: number; isCover?: boolean; sortNum?: number }[]
}

/** 修改商品信息 */
export async function updateProduct(id: number, params: UpdateProductParams): Promise<string> {
  return handleRequest<string>(`/api/product/${id}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  }, '修改商品信息失败')
}

/** 查询商品单独状态 */
export async function getProductStatus(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/status?id=${id}`, { method: 'GET' }, '查询商品状态失败')
}

/** 商品分类 */
export interface Category {
  id: number
  categoryName: string
  sortNo: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

/** 获取商品分类列表 */
export async function getCategoryList(): Promise<Category[]> {
  return handleRequest<Category[]>('/api/product/categorylist', { method: 'GET' }, '获取分类列表失败')
}

/** 发布新商品参数（与修改参数相同） */
export type CreateProductParams = UpdateProductParams

/** 发布新商品 */
export async function createProduct(params: CreateProductParams): Promise<Product> {
  return handleRequest<Product>('/api/product/create', {
    method: 'POST',
    body: JSON.stringify(params),
  }, '发布商品失败')
}

/** 保存商品至草稿箱 */
export async function saveToDraft(params: CreateProductParams): Promise<Product> {
  return handleRequest<Product>('/api/product/draft', {
    method: 'POST',
    body: JSON.stringify(params),
  }, '保存草稿失败')
}

/** 获取当前用户的草稿列表 */
export async function getDraftList(): Promise<PageProductResponse> {
  return handleRequest<PageProductResponse>('/api/product/list', {
    method: 'POST',
    body: JSON.stringify({ publishStatus: 'draft', current: 1, size: 50 }),
  }, '获取草稿列表失败')
}

/** 上传商品图片，返回图片 URL */
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('token')

  const formData = new FormData()
  formData.append('file', file)

  console.log('[图片上传] 开始上传:', file.name, '大小:', (file.size / 1024).toFixed(1) + 'KB', '类型:', file.type)

  const response = await fetch('/api/product/upload-image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const rawText = await response.text()
  console.log('[图片上传] 响应状态:', response.status, '响应内容:', rawText.substring(0, 500))

  if (!response.ok) {
    // 非 2xx 状态码
    let errMsg = rawText
    try {
      const errJson = JSON.parse(rawText)
      errMsg = errJson.message || rawText
    } catch { /* 不是 JSON，用原文 */ }
    throw new Error(errMsg || `上传失败：${response.status}`)
  }

  // 解析成功响应
  try {
    const json = JSON.parse(rawText) as ApiResponse<unknown>
    console.log('[图片上传] 解析结果:', json)

    // 情况1：后端在 200 中返回了错误（data 为空）
    if (json.data === null || json.data === undefined) {
      throw new Error(json.message || '后端返回数据为空')
    }

    // 情况2：data 直接是字符串 URL
    if (typeof json.data === 'string') return json.data

    // 情况3：data 是对象 { url: "..." }
    if (json.data && typeof json.data === 'object' && 'url' in json.data) {
      return (json.data as { url: string }).url
    }

    // 兜底：整个 data 转字符串
    throw new Error(`未知返回格式：${typeof json.data}`)
  } catch (e) {
    // JSON 解析失败的兜底
    if (e instanceof Error) throw e
    console.error('[图片上传] JSON解析失败, 原始响应:', rawText)
    throw new Error('上传接口返回格式异常：' + rawText.substring(0, 200))
  }
}

/** 分页查询商品参数 */
export interface PageProductParams {
  /** 页码 */
  current?: number
  /** 每页条数 */
  size?: number
  /** 商品 ID（精确查询时使用） */
  id?: number
  /** 搜索关键词 */
  keyword?: string
  /** 分类 ID */
  categoryId?: number
  /** 发布状态：on_sale/offline/draft 等 */
  publishStatus?: string
  /** 成色级别：new/almost_new/good/fair/poor */
  conditionLevel?: string
  /** 品牌 */
  brand?: string
  /** 型号 */
  model?: string
  /** 原价筛选（元） */
  originalPrice?: number
  /** 售价筛选（元） */
  sellingPrice?: number
  /** 价格区间-最低价 */
  priceMin?: number
  /** 价格区间-最高价 */
  priceMax?: number
  /** 是否全新 */
  isNew?: boolean
  /** 交易方式：pickup/delivery 等 */
  tradeMode?: string
  /** 自提城市 */
  pickupCity?: string
  /** 自提地址（模糊匹配） */
  pickupAddress?: string
  /** 库存数量 */
  stock?: number
  /** 排序字段：price/sellingPrice/viewCount/publishedAt 等 */
  sortField?: string
  /** 排序方向：asc/desc */
  sortOrder?: 'asc' | 'desc'
  /** 卖家 ID（用于查询指定卖家的商品） */
  sellerId?: number
}

/** 分页查询商品响应 */
export interface PageProductResponse {
  records: Product[]
  total: number
  size: number
  current: number
  pages: number
}

/** 分页查询商品（用于搜索/列表页面） */
export async function getProductPage(params: PageProductParams): Promise<PageProductResponse> {
  const body: Record<string, unknown> = {}
  if (params.current !== undefined) body.current = params.current
  if (params.size !== undefined) body.size = params.size
  if (params.id !== undefined) body.id = params.id
  if (params.keyword !== undefined && params.keyword !== '') body.keyword = params.keyword
  if (params.categoryId !== undefined) body.categoryId = params.categoryId
  if (params.publishStatus !== undefined && params.publishStatus !== '') body.publishStatus = params.publishStatus
  if (params.conditionLevel !== undefined && params.conditionLevel !== '') body.conditionLevel = params.conditionLevel
  if (params.brand !== undefined && params.brand !== '') body.brand = params.brand
  if (params.model !== undefined && params.model !== '') body.model = params.model
  if (params.originalPrice !== undefined) body.originalPrice = params.originalPrice
  if (params.sellingPrice !== undefined) body.sellingPrice = params.sellingPrice
  if (params.priceMin !== undefined) body.priceMin = params.priceMin
  if (params.priceMax !== undefined) body.priceMax = params.priceMax
  if (params.isNew !== undefined) body.isNew = params.isNew
  if (params.tradeMode !== undefined && params.tradeMode !== '') body.tradeMode = params.tradeMode
  if (params.pickupCity !== undefined && params.pickupCity !== '') body.pickupCity = params.pickupCity
  if (params.pickupAddress !== undefined && params.pickupAddress !== '') body.pickupAddress = params.pickupAddress
  if (params.stock !== undefined) body.stock = params.stock
  if (params.sortField !== undefined && params.sortField !== '') body.sortField = params.sortField
  if (params.sortOrder !== undefined) body.sortOrder = params.sortOrder
  if (params.sellerId !== undefined) body.sellerId = params.sellerId

  return handleRequest<PageProductResponse>('/api/product/list', {
    method: 'POST',
    body: JSON.stringify(body),
  }, '获取商品列表失败')
}
