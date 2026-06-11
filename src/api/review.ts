// ==========================================
// 评价与售后相关 API
// ==========================================

// ==================== 通用类型定义 ====================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// ==================== 评价相关类型 ====================

/** 评价对象 */
export interface Review {
  id: number
  orderId: number
  orderItemId: number
  productId: number
  buyerId: number
  sellerId: number
  rating: number
  content: string
  isAnonymous: number
  hasSensitiveContent: number
  sellerReply?: string
  sellerReplyAt?: string
  createdAt: string
  images: string[]
}
/** 评价图片 */
export interface ReviewImage {
  id: number
  reviewId: number
  imageUrl: string
  sortNo: number
  createdAt: string
}

/** 提交评价请求 */
export interface CreateReviewRequest {
  orderId: number
  orderItemId: number
  rating: number
  content?: string
  isAnonymous?: boolean
}

/** 上传评价图片请求 */
export interface UploadReviewImageRequest {
  imageUrl: string
  sortNo?: number
}

/** 卖家回复评价请求 */
export interface ReplyReviewRequest {
  sellerReply: string
}

// ==================== 售后相关类型 ====================

/** 售后申请对象 */
export interface AfterSale {
  id: number
  afterSaleNo: string
  orderId: number
  orderItemId: number
  buyerId: number
  sellerId: number
  requestType: 'return_refund' | 'refund_only' | 'exchange' | 'complaint'
  requestReason: string
  detailDesc?: string
  requestedAmount?: number
  finalAmount?: number
  requestStatus: 'pending_seller' | 'pending_admin' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  sellerResponse?: string
  sellerRespondedAt?: string
  adminId?: number
  adminDecision?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
  evidences: AfterSaleEvidence[]
}

/** 售后凭证 */
export interface AfterSaleEvidence {
  id: number
  afterSaleId: number
  evidenceType: 'image' | 'video' | 'text' | 'logistics_doc'
  contentUrl?: string
  contentText?: string
  uploadedBy: number
  createdAt: string
}

/** 发起售后申请请求 */
export interface CreateAfterSaleRequest {
  orderId: number
  orderItemId: number
  requestType: 'return_refund' | 'refund_only' | 'exchange' | 'complaint'
  requestReason: string
  detailDesc?: string
  requestedAmount?: number
}

/** 上传售后凭证请求 */
export interface UploadEvidenceRequest {
  evidenceType: 'image' | 'video' | 'text' | 'logistics_doc'
  contentUrl?: string
  contentText?: string
}

/** 卖家处理意见请求 */
export interface SellerResponseRequest {
  sellerResponse: string
}

/** 买家取消售后请求 */
export interface CancelAfterSaleRequest {
  cancelReason?: string
}

/** 管理员裁决请求 */
export interface AdminDecisionRequest {
  decisionStatus: 'approved' | 'rejected' | 'completed'
  adminDecision?: string
  finalAmount?: number
}

// ==================== 通用请求函数 ====================

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    throw new Error(`网络错误: ${response.status}`)
  }

  const json: ApiResponse<T> = await response.json()
  if (json.code !== 200) {
    throw new Error(json.message || '请求失败')
  }
  return json.data
}

// ==================== 评价模块 API ====================

/** 提交订单评价 */
export const createReview = (data: CreateReviewRequest) =>
  request<number>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 获取评价列表 */
export const getReviewList = (params?: {
  sellerId?: number
  productId?: number
  orderId?: number
}) => {
  const query = new URLSearchParams()
  if (params?.sellerId) query.append('sellerId', params.sellerId.toString())
  if (params?.productId) query.append('productId', params.productId.toString())
  if (params?.orderId) query.append('orderId', params.orderId.toString())

  const queryString = query.toString()
  return request<Review[]>(`/api/reviews${queryString ? `?${queryString}` : ''}`)
}

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface ReviewsResponse {
  code: number
  message: string
  data: Review[]
}
/** 获取评价详情 */
export const getProductReviews = async (productId: number): Promise<ReviewsResponse> => {
  console.log('🚀 Fetching reviews for productId:', productId)

  // ✅ 使用 URLSearchParams 拼接参数
  const query = new URLSearchParams({
    productId: String(productId) // 确保转为字符串
  })

  const url = `/api/reviews?${query.toString()}`
  console.log('📡 请求 URL:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result: ReviewsResponse = await response.json()
    console.log('✅ 评论接口返回数据:', result)
    
    return result
  } catch (error) {
    console.error('❌ 获取评论失败:', error)
    // 返回一个符合类型的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : '请求失败',
      data: []
    }
  }
}

/** 上传评价图片 */
export const uploadReviewImage = (reviewId: number, data: UploadReviewImageRequest) =>
  request<number>(`/api/reviews/${reviewId}/images`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 卖家回复评价 */
export const replyReview = (reviewId: number, data: ReplyReviewRequest) =>
  request(`/api/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

// ==================== 售后申请模块 API ====================

/** 发起售后申请 */
export const createAfterSale = (data: CreateAfterSaleRequest) =>
  request<number>('/api/after-sales', {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 获取售后列表 */
export const getAfterSaleList = (params?: {
  orderId?: number
  status?: string
  requestType?: string
}) => {
  const query = new URLSearchParams()
  if (params?.orderId) query.append('orderId', params.orderId.toString())
  if (params?.status) query.append('status', params.status)
  if (params?.requestType) query.append('requestType', params.requestType)

  const queryString = query.toString()
  return request<AfterSale[]>(`/api/after-sales${queryString ? `?${queryString}` : ''}`)
}

/** 获取售后详情 */
export const getAfterSaleDetail = (afterSaleId: number) =>
  request<AfterSale>(`/api/after-sales/${afterSaleId}`)

/** 上传售后凭证 */
export const uploadEvidence = (afterSaleId: number, data: UploadEvidenceRequest) =>
  request<number>(`/api/after-sales/${afterSaleId}/evidences`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 卖家处理意见 */
export const sellerResponse = (afterSaleId: number, data: SellerResponseRequest) =>
  request(`/api/after-sales/${afterSaleId}/seller-response`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 买家取消售后申请 */
export const cancelAfterSale = (afterSaleId: number, data?: CancelAfterSaleRequest) =>
  request(`/api/after-sales/${afterSaleId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(data || {})
  })

/** 管理员裁决 */
export const adminDecision = (afterSaleId: number, data: AdminDecisionRequest) =>
  request(`/api/after-sales/${afterSaleId}/admin-decision`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
