// ==========================================
// 资金账户（钱包）相关 API
// ==========================================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 钱包账户对象 */
export interface WalletAccount {
  id: number
  userId: number
  accountStatus: 'active' | 'frozen' | 'closed'
  availableBalance: number
  frozenBalance: number
  totalIncome: number
  totalWithdraw: number
  createdAt: string
  updatedAt: string
}

/** 钱包流水对象 */
export interface WalletLedger {
  id: number
  bizType: 'order_income' | 'refund_out' | 'withdraw_freeze' | 'withdraw_success' | 'withdraw_reject' | 'manual_adjust'
  bizId?: number
  changeAmount: number
  balanceAfter: number
  frozenAfter: number
  note?: string
  createdAt: string
}

/** 提现对象 */
export interface Withdrawal {
  id: number
  withdrawalNo: string
  userId: number
  walletAccountId: number
  amount: number
  feeAmount: number
  channel: 'wechat' | 'alipay' | 'bank_card'
  channelAccountMask: string
  withdrawalStatus: 'pending' | 'approved' | 'rejected' | 'processing' | 'paid' | 'failed'
  reviewedBy?: number
  reviewedAt?: string
  paidAt?: string
  rejectReason?: string
  createdAt: string
  updatedAt: string
}

/** 分页对象 */
export interface PageResult<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

/** 手工调账请求 */
export interface ManualAdjustRequest {
  userId: number
  changeAmount: number // 正数加款，负数减款，不能为0
  note?: string
}

/** 提现申请请求 */
export interface CreateWithdrawalRequest {
  amount: number // 必须 > 0
  channel: 'wechat' | 'alipay' | 'bank_card'
  channelAccountMask: string // 长度 <= 100
}

/** 驳回提现请求 */
export interface RejectWithdrawalRequest {
  rejectReason: string // 长度 <= 255
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

// ==================== 钱包模块 API ====================

/** 查询钱包账户 */
export const getWalletAccount = () =>
  request<WalletAccount>('/api/wallet/account')

/** 查询钱包流水 */
export const getWalletLedger = (params?: {
  bizType?: string
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  if (params?.bizType) query.append('bizType', params.bizType)
  if (params?.page) query.append('page', params.page.toString())
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString())

  const queryString = query.toString()
  return request<PageResult<WalletLedger>>(`/api/wallet/ledger${queryString ? `?${queryString}` : ''}`)
}

/** 管理员手工调账 */
export const manualAdjust = (data: ManualAdjustRequest) =>
  request('/api/wallet/manual-adjust', {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 发起提现申请 */
export const createWithdrawal = (data: CreateWithdrawalRequest) =>
  request<number>('/api/wallet/withdrawals', {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 获取提现列表 */
export const getWithdrawalList = (params?: {
  status?: string
  userId?: number // 仅 admin 生效
  page?: number
  pageSize?: number
}) => {
  const query = new URLSearchParams()
  if (params?.status) query.append('status', params.status)
  if (params?.userId) query.append('userId', params.userId.toString())
  if (params?.page) query.append('page', params.page.toString())
  if (params?.pageSize) query.append('pageSize', params.pageSize.toString())

  const queryString = query.toString()
  return request<PageResult<Withdrawal>>(`/api/wallet/withdrawals${queryString ? `?${queryString}` : ''}`)
}

/** 获取提现详情 */
export const getWithdrawalDetail = (withdrawalId: number) =>
  request<Withdrawal>(`/api/wallet/withdrawals/${withdrawalId}`)

/** 审核通过提现 */
export const approveWithdrawal = (withdrawalId: number) =>
  request(`/api/wallet/withdrawals/${withdrawalId}/approve`, {
    method: 'POST'
  })

/** 驳回提现 */
export const rejectWithdrawal = (withdrawalId: number, data: RejectWithdrawalRequest) =>
  request(`/api/wallet/withdrawals/${withdrawalId}/reject`, {
    method: 'POST',
    body: JSON.stringify(data)
  })

/** 执行打款 */
export const payWithdrawal = (withdrawalId: number) =>
  request(`/api/wallet/withdrawals/${withdrawalId}/pay`, {
    method: 'POST'
  })
