// ==========================================
// 1. 接口请求/响应类型定义
// ==========================================

interface ApiResponse<T = unknown> {
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

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[会话API错误]', text)
    throw new Error(text || `网络错误：${response.status}`)
  }

  const text = await response.text()

  if (!text) {
    throw new Error('接口返回为空')
  }

  try {
    const json = JSON.parse(text) as ApiResponse<T>
    // 只要 data 存在且不为 null，就视为成功
    if (json.data === null || json.data === undefined) {
      throw new Error(json.message || errorMsg)
    }
    return json.data
  } catch (e) {
    if (e instanceof Error) {
      throw e
    }
    throw new Error('解析 JSON 失败')
  }
}

// ==========================================
// 3. 会话类型定义
// ==========================================

/** 会话类型 */
export type ConversationType = 'product_consult' | 'order_service'

/** 创建会话请求参数 */
export interface CreateConversationParams {
  /** 会话类型：product_consult=商品咨询，order_service=订单售后 */
  conversationType: ConversationType
  /** 商品ID（product_consult 时必填） */
  productId?: number
  /** 订单ID（order_service 时必填） */
  orderId?: number
  /** 目标用户ID（卖家ID） */
  userId?: number
}

/** 会话信息 */
export interface Conversation {
  id: number
  conversationType: ConversationType
  productId: number | null
  orderId: number | null
  userId: number
  userNickname: string
  lastMessageContent: string | null
  lastMessageAt: string | null
  createdAt: string
  unreadCount: number
}

// ==========================================
// 4. 消息类型定义（放在会话 API 之前，因为会话详情含消息列表）
// ==========================================

/** 消息类型 */
export type MessageType = 'text' | 'image' | 'product_card' | 'order_card' | 'system'

/** 服务端返回的消息 */
export interface MessageVO {
  id: number
  conversationId: number
  senderId: number
  senderNickname: string
  messageType: MessageType
  content: string | null
  extJson: string | null
  sentAt: string
  recalled: boolean
}

/** 会话详情（含消息列表），对应 GET /api/conversation/{id} */
export interface ConversationDetail extends Conversation {
  userAvatar: string | null
  messages: MessageVO[]
}

// ==========================================
// 5. 会话 API 函数
// ==========================================

/** 获取会话列表请求参数 */
export interface ConversationListParams {
  pageNum?: number
  pageSize?: number
}

/** 会话列表返回结果 */
export interface ConversationListResult {
  records: Conversation[]
  total: number
  pages: number
  current: number
}

/** 创建会话 */
export async function createConversation(params: CreateConversationParams): Promise<Conversation> {
  return handleRequest<Conversation>('/api/conversation/create', {
    method: 'POST',
    body: JSON.stringify(params),
  }, '创建会话失败')
}

/** 获取单个会话详情（含消息列表） */
export async function getConversationDetail(conversationId: number): Promise<ConversationDetail> {
  return handleRequest<ConversationDetail>(`/api/conversation/${conversationId}`, {
    method: 'GET',
  }, '获取会话详情失败')
}

/** 标记会话已读 */
export async function markConversationRead(conversationId: number): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/conversation/${conversationId}/read`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[会话API错误] 标记已读失败:', text)
    throw new Error(text || `网络错误：${response.status}`)
  }
}

/** 获取会话未读消息数 */
export async function getConversationUnreadCount(conversationId: number): Promise<number> {
  return handleRequest<number>(`/api/conversation/${conversationId}/unread-count`, {
    method: 'GET',
  }, '获取未读消息数失败')
}

/** 获取总未读消息数 */
export async function getTotalUnreadCount(): Promise<number> {
  return handleRequest<number>('/api/conversation/unread/total', {
    method: 'GET',
  }, '获取总未读消息数失败')
}

/** 聊天图片上传返回 */
export interface ChatImageResult {
  url: string
  extJson: {
    filename: string
    size: number
    width: number
    height: number
  }
}

/** 上传聊天图片，multipart/form-data */
export async function uploadChatImage(file: File): Promise<ChatImageResult> {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/chat-image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const rawText = await response.text()

  if (!response.ok) {
    let errMsg = rawText
    try {
      const errJson = JSON.parse(rawText)
      errMsg = errJson.message || rawText
    } catch { /* 不是 JSON */ }
    throw new Error(errMsg || `上传失败：${response.status}`)
  }

  try {
    const json = JSON.parse(rawText) as ApiResponse<ChatImageResult>
    if (!json.data) throw new Error(json.message || '上传聊天图片失败')
    return json.data
  } catch (e) {
    if (e instanceof Error) throw e
    throw new Error('解析上传结果失败')
  }
}

// ==========================================
// 6. 消息 API
// ==========================================

/** 发送消息请求参数 */
export interface SendMessageParams {
  conversationId: number
  messageType: MessageType
  /** 文本内容 / 图片URL */
  content?: string
  /** JSON 字符串，附加信息（图片元信息、商品信息等） */
  extJson?: string
  /** product_card 时必填 */
  productId?: number
  /** order_card 时必填 */
  orderId?: number
}

/** 发送消息 */
export async function sendMessage(params: SendMessageParams): Promise<MessageVO> {
  return handleRequest<MessageVO>('/api/message/send', {
    method: 'POST',
    body: JSON.stringify(params),
  }, '发送消息失败')
}

/** 获取消息列表请求参数 */
export interface GetMessageListParams {
  /** 会话ID */
  conversationId: number
  /** 页码，默认1 */
  pageNum?: number
  /** 每页条数，默认20 */
  pageSize?: number
}

/**
 * 获取消息列表（含已撤回消息）
 * 每个 MessageVO 包含 recalled 字段，前端需判断是否显示为"消息已撤回"
 */
export async function getMessageList(params: GetMessageListParams): Promise<MessageVO[]> {
  const { conversationId, pageNum = 1, pageSize = 20 } = params
  const url = `/api/message/list?conversationId=${conversationId}&pageNum=${pageNum}&pageSize=${pageSize}`
  return handleRequest<MessageVO[]>(url, { method: 'GET' }, '获取消息列表失败')
}

/** 撤回消息（5分钟内有效），返回 data 为 null，故独立实现 */
export async function recallMessage(messageId: number): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/message/recall/${messageId}`, {
    method: 'POST',
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[消息API错误] 撤回失败:', text)
    throw new Error(text || `网络错误：${response.status}`)
  }
}

/** 获取会话列表 */
export async function getConversationList(params: ConversationListParams = {}): Promise<Conversation[]> {
  const { pageNum = 1, pageSize = 10 } = params
  const url = `/api/conversation/list?pageNum=${pageNum}&pageSize=${pageSize}`

  const token = localStorage.getItem('token')
  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { method: 'GET', headers })

  if (!response.ok) {
    const text = await response.text()
    console.error('[会话API错误]', text)
    throw new Error(text || `网络错误：${response.status}`)
  }

  const text = await response.text()
  if (!text) throw new Error('接口返回为空')

  try {
    const json = JSON.parse(text) as ApiResponse<Conversation[]>
    if (json.data === null || json.data === undefined) {
      throw new Error(json.message || '获取会话列表失败')
    }
    return json.data
  } catch (e) {
    if (e instanceof Error) throw e
    throw new Error('解析 JSON 失败')
  }
}

// ==========================================
// 7. 通知类型定义 & API
// ==========================================

/** 通知类型 */
export type NoticeType = 'system' | 'announcement' | 'warning' | 'notification'

/** 通知读取状态 */
export type ReadStatusFilter = 'all' | 'unread' | 'read'

/** 服务端返回的通知 */
export interface NoticeVO {
  inboxId: number
  noticeId: number
  title: string
  content: string
  noticeType: NoticeType
  readStatus: 'unread' | 'read'
  deliveredAt: string
  readAt: string | null
}

/** 获取通知列表请求参数 */
export interface GetNoticeListParams {
  /** 筛选读取状态：all / unread / read，默认 all */
  readStatus?: ReadStatusFilter
  pageNum?: number
  pageSize?: number
}

/**
 * 获取通知列表
 * 与聊天消息不同：通知是平台统一推送的（系统公告、规则更新等），单向接收，不涉及会话
 */
export async function getNoticeList(params: GetNoticeListParams = {}): Promise<NoticeVO[]> {
  const { readStatus = 'all', pageNum = 1, pageSize = 10 } = params
  const query = new URLSearchParams({ readStatus, pageNum: String(pageNum), pageSize: String(pageSize) })
  return handleRequest<NoticeVO[]>(`/api/notice/list?${query.toString()}`, { method: 'GET' }, '获取通知列表失败')
}

/** 未读通知数量返回结果 */
export interface UnreadNoticeCountResult {
  unreadCount: number
}

/** 获取未读通知数量 */
export async function getUnreadNoticeCount(): Promise<UnreadNoticeCountResult> {
  return handleRequest<UnreadNoticeCountResult>('/api/notice/unread-count', { method: 'GET' }, '获取未读通知数量失败')
}

/** 标记单条通知已读，返回 data 为 null，故独立实现 */
export async function markNoticeRead(inboxId: number): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`/api/notice/${inboxId}/read`, {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[通知API错误] 标记已读失败:', text)
    throw new Error(text || `网络错误：${response.status}`)
  }
}

/** 标记所有通知为已读，返回 data 为 null，故独立实现 */
export async function markAllNoticesRead(): Promise<void> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch('/api/notice/read-all', {
    method: 'PUT',
    headers,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[通知API错误] 全部标记已读失败:', text)
    throw new Error(text || `网络错误：${response.status}`)
  }
}
