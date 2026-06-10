// ==========================================
// 交易纠纷相关 API
// ==========================================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 纠纷对象 */
export interface Dispute {
  id: number
  disputeNo: string
  orderId: number
  afterSaleId?: number
  buyerId: number
  sellerId: number
  currentStatus: 'open' | 'investigating' | 'waiting_evidence' | 'resolved' | 'closed'
  responsibility?: 'buyer' | 'seller' | 'both' | 'platform' | 'undetermined'
  resolutionResult?: string
  resolutionAmount?: number
  resolvedBy?: number
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  actions: DisputeActionLog[]
}

/** 纠纷动作日志 */
export interface DisputeActionLog {
  id: number
  disputeId: number
  actionBy: number
  actionType: 'submit' | 'append_evidence' | 'status_change' | 'admin_decision' | 'close'
  actionDesc: string
  nextStatus?: string
  createdAt: string
}

/** 创建纠纷请求 */
export interface CreateDisputeRequest {
  orderId: number
  afterSaleId?: number
  actionDesc: string
}

/** 记录纠纷动作请求 */
export interface DisputeActionRequest {
  actionType: 'submit' | 'append_evidence' | 'status_change' | 'admin_decision' | 'close'
  actionDesc: string
  nextStatus?: string
}

/** 纠纷裁决请求 */
export interface ResolveDisputeRequest {
  responsibility: 'buyer' | 'seller' | 'both' | 'platform' | 'undetermined'
  resolutionResult: string
  resolutionAmount?: number
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

// ==================== 纠纷模块 API ====================

/** 创建纠纷 */
export const createDispute = (data: CreateDisputeRequest) =>
  request<number>('/api/disputes', {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 获取纠纷列表 */
export const getDisputeList = (params?: {
  orderId?: number
  afterSaleId?: number
  status?: string
}) => {
  const query = new URLSearchParams()
  if (params?.orderId) query.append('orderId', params.orderId.toString())
  if (params?.afterSaleId) query.append('afterSaleId', params.afterSaleId.toString())
  if (params?.status) query.append('status', params.status)

  const queryString = query.toString()
  return request<Dispute[]>(`/api/disputes${queryString ? `?${queryString}` : ''}`)
}

/** 获取纠纷详情 */
export const getDisputeDetail = (disputeId: number) =>
  request<Dispute>(`/api/disputes/${disputeId}`)

/** 记录纠纷动作日志 */
export const addDisputeAction = (disputeId: number, data: DisputeActionRequest) =>
  request<number>(`/api/disputes/${disputeId}/actions`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 纠纷裁决并结案 */
export const resolveDispute = (disputeId: number, data: ResolveDisputeRequest) =>
  request(`/api/disputes/${disputeId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
