// ==========================================
// 管理员通知/公告 API
// ==========================================

// 通用响应类型
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 通用请求处理
async function handleRequest<T>(url: string, options: RequestInit, errorMsg: string): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // 只有非 GET/HEAD 请求才设置 Content-Type，避免干扰 GET 请求的查询参数解析
  const method = (options.method || 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[API错误]', url, response.status, text)
    throw new Error(text || `网络错误：${response.status}`)
  }

  const text = await response.text()
  if (!text) throw new Error('接口返回为空')

  console.log('[API] 响应体:', text.substring(0, 500))

  try {
    const json = JSON.parse(text) as ApiResponse<T>
    if (json.code !== 200) {
      throw new Error(json.message || errorMsg)
    }
    return json.data
  } catch (e) {
    if (e instanceof Error) throw e
    throw new Error('解析 JSON 失败')
  }
}

// ==========================================
// 类型定义
// ==========================================

/** 通知类型 */
export type NoticeType = 'system' | 'order' | 'after_sale' | 'promotion'

/** 目标范围 */
export type TargetScope = 'all' | 'role' | 'user'

/** 发布状态 */
export type PublishStatus = 'draft' | 'published' | 'revoked'

/** 系统通知视图对象 */
export interface SystemNoticeVO {
  id: number
  noticeType: NoticeType
  title: string
  content: string
  targetScope: TargetScope
  targetRoleCode?: string
  targetUserId?: number
  publishStatus: PublishStatus
  publishedAt?: string
  createdBy: number
  createdAt: string
  updatedAt: string
}

/** 发布通知请求参数 */
export interface PublishNoticeDTO {
  noticeType: NoticeType
  title: string
  content: string
  targetScope: TargetScope
  targetRoleCode?: string
  targetUserId?: number
}

/** 查询通知列表参数 */
export interface NoticeQueryDTO {
  noticeType?: NoticeType
  publishStatus?: PublishStatus
  pageNum?: number
  pageSize?: number
}

// ==========================================
// API 函数
// ==========================================

/**
 * 管理员发布通知
 * POST /api/admin/notification/publish
 */
export async function publishNoticeApi(params: PublishNoticeDTO): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch('/api/admin/notification/publish', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `发布通知失败：${response.status}`)
  }

  const data = await response.json() as ApiResponse
  if (data.code !== 200) {
    throw new Error(data.message || '发布通知失败')
  }
}

/**
 * 管理员获取通知列表
 * GET /api/admin/notification/list
 */
export async function getNoticeListApi(params: NoticeQueryDTO = {}): Promise<SystemNoticeVO[]> {
  const { noticeType, publishStatus, pageNum = 1, pageSize = 10 } = params
  const query = new URLSearchParams()
  // 只添加有值的参数，避免空字符串被后端当作有效条件导致查不到数据
  if (noticeType && noticeType.trim()) query.append('noticeType', noticeType)
  if (publishStatus && publishStatus.trim()) query.append('publishStatus', publishStatus)
  query.append('pageNum', String(pageNum))
  query.append('pageSize', String(pageSize))

  return handleRequest<SystemNoticeVO[]>(
    `/api/admin/notification/list?${query.toString()}`,
    { method: 'GET' },
    '获取通知列表失败'
  )
}

/**
 * 管理员撤回通知
 * POST /api/admin/notification/revoke/{noticeId}
 */
export async function revokeNoticeApi(noticeId: number): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/admin/notification/revoke/${noticeId}`, {
    method: 'POST',
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `撤回通知失败：${response.status}`)
  }

  const data = await response.json() as ApiResponse
  if (data.code !== 200) {
    throw new Error(data.message || '撤回通知失败')
  }
}

/**
 * 管理员获取通知详情
 * GET /api/admin/notification/{noticeId}
 */
export async function getNoticeDetailApi(noticeId: number): Promise<SystemNoticeVO> {
  return handleRequest<SystemNoticeVO>(
    `/api/admin/notification/${noticeId}`,
    { method: 'GET' },
    '获取通知详情失败'
  )
}
