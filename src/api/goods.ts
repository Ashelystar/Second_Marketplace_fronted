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

/** 增加商品浏览量 */
export async function incrementProductView(id: number): Promise<string> {
  return handleRequest<string>(`/api/product/${id}/view`, { method: 'PUT' }, '增加浏览量失败')
}

/** 商品修改参数 */
export interface UpdateProductParams {
  categoryId: number
  title: string
  subtitle?: string
  description: string
  brand?: string
  model?: string
  conditionLevel: 'new' | 'almost_new' | 'good' | 'fair' | 'poor'
  purchaseYear?: number
  originalPrice: number
  sellingPrice: number
  tradeMode: 'both' | 'pickup' | 'delivery'
  pickupCity?: string
  pickupAddress?: string
  locationLat?: number
  locationLng?: number
  images?: string[]
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

/** 分页查询商品参数 */
export interface PageProductParams {
  current?: number
  size?: number
  categoryId?: number
  publishStatus?: string
  keyword?: string
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
  const query = new URLSearchParams()
  if (params.current) query.set('current', String(params.current))
  if (params.size) query.set('size', String(params.size))
  if (params.categoryId) query.set('categoryId', String(params.categoryId))
  if (params.publishStatus) query.set('publishStatus', params.publishStatus)
  if (params.keyword) query.set('keyword', params.keyword)

  const url = `/api/product/seller/page?${query.toString()}`
  return handleRequest<PageProductResponse>(url, { method: 'GET' }, '获取商品列表失败')
}
