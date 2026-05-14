export interface LoginRequest {
  account: string
  password: string
}

export interface LoginUserInfo {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  avatarUrl: string | null
  userStatus: string
  lastLoginAt: string
  registeredAt: string
  avatar: string | null
}

export interface LoginResponseData {
  token: string
  userInfo: LoginUserInfo
}

export interface RegisterRequest {
  username: string
  nickname: string
  phone?: string
  password: string
}

export interface RegisterResponse {
  userInfo: LoginUserInfo
  token: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  account: string
}

export interface UpdateUserProfileRequest {
  nickname: string
  avatarUrl?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  bio?: string
  city?: string
  district?: string
}

export interface UserProfileData {
  id: number
  username: string
  nickname: string
  avatarUrl: string | null
  gender: 'male' | 'female' | 'other' | null
  birthday: string | null
  bio: string | null
  city: string | null
  district: string | null
  email?: string | null
  phone?: string | null
  userStatus?: string | null
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface UserPermissions {
  canBuy: boolean
  canSell: boolean
  isAdmin: boolean
}

export interface UserCreditScoreData {
  nickname: string
  avatarUrl: string | null
  gender: string | null
  birthday: string | null
  bio: string | null
  city: string | null
  district: string | null
  creditScore: number
  positiveRate: number
  totalReviewCount: number
}

export interface SellerReputationSnapshot {
  creditScore: number
  positiveRate: number
  totalOrders: number
  completedOrders: number
  totalReviewCount: number
}

export interface SellerReputationHistoryItem {
  snapshotDate: string
  creditScore: number
  positiveRate: number
  totalOrders: number
  completedOrders: number
}

export interface UserStatsData {
  productCount: number
  orderCount: number
  favoriteCount: number
  followCount: number
  followerCount: number
}

export interface UserAddressItem {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

export interface UserAddressPayload {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

export interface BindPhoneRequest {
  phone: string
  verifyCode: string
}

export interface BindEmailRequest {
  email: string
  verifyCode: string
}

export interface RealNameVerificationRequest {
  realName: string
  idCardNumber: string
}

export interface VerificationStatusItem {
  id?: number | string
  verificationId?: number | string
  verifyType: string
  verifyStatus: string
  rejectReason: string | null
  submittedAt: string | null
}

export interface VerificationDetailData {
  id: number
  verifyType: string
  realName: string
  idCardNumber: string
  verifyStatus: string
  rejectReason: string | null
  submittedAt: string | null
  reviewedAt: string | null
}

export async function favoriteProductApi(productId: number | string): Promise<void> {
  const response = await fetch(`/api/user/favorite/${productId}`, {
    method: 'POST',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '收藏商品失败')
  }
}

export async function unfavoriteProductApi(productId: number | string): Promise<void> {
  const response = await fetch(`/api/user/favorite/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '取消收藏失败')
  }
}

export async function getFavoriteIdsApi(): Promise<number[]> {
  const response = await fetch('/api/user/favorites', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<Array<number | string>>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取收藏列表失败')
  }
  return (json.data || [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

export async function followUserApi(userId: number | string): Promise<void> {
  const response = await fetch(`/api/user/follow/${userId}`, {
    method: 'POST',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '关注用户失败')
  }
}

export async function unfollowUserApi(userId: number | string): Promise<void> {
  const response = await fetch(`/api/user/follow/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '取消关注失败')
  }
}

export async function getFollowIdsApi(): Promise<number[]> {
  const response = await fetch('/api/user/follows', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<Array<number | string>>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取关注列表失败')
  }
  return (json.data || [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

export async function getFollowerIdsApi(): Promise<number[]> {
  const response = await fetch('/api/user/followers', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<Array<number | string>>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取粉丝列表失败')
  }
  return (json.data || [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    throw new Error('接口返回为空')
  }
  return JSON.parse(text) as T
}

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// --- 下面是重点修改的地方，全部改回相对路径 ---

export async function loginApi(body: LoginRequest): Promise<LoginResponseData> {
  const url = `/api/user/login`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<LoginResponseData>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '登录失败')
  }

  return json.data
}

export async function registerApi(
  body: RegisterRequest
): Promise<RegisterResponse> {
  const url = `/api/user/register` // 改回去了
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<RegisterResponse>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '注册失败')
  }

  return json.data
}

export async function resetPasswordApi(
  body: ResetPasswordRequest
): Promise<void> {
  const url = `/api/user/reset-password` // 改回去了
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '重置密码失败')
  }
}

export async function forgotPasswordApi(body: ForgotPasswordRequest): Promise<void> {
  const url = `/api/user/forgot-password?account=${encodeURIComponent(body.account)}`
  const response = await fetch(url, {
    method: 'POST',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '忘记密码请求失败')
  }
}

export async function logoutApi(): Promise<void> {
  const response = await fetch('/api/user/logout', {
    method: 'POST',
    headers: getAuthHeader(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }

  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '退出登录失败')
  }
}

export async function getUserStatusApi(): Promise<string> {
  const response = await fetch('/api/user/status', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<string>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '查询用户状态失败')
  }
  return json.data
}

export async function getUserPermissionsApi(): Promise<UserPermissions> {
  const response = await fetch('/api/user/permissions', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<UserPermissions>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '查询用户权限失败')
  }
  return json.data
}

export async function getUserCreditScoreApi(): Promise<UserCreditScoreData> {
  const response = await fetch('/api/user/credit-score', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<UserCreditScoreData>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '查询信用分失败')
  }
  return json.data
}

export async function getSellerReputationSnapshotApi(
  sellerId: number | string
): Promise<SellerReputationSnapshot> {
  const response = await fetch(`/api/user/reputation/${sellerId}`, {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<SellerReputationSnapshot>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取卖家信誉快照失败')
  }
  return json.data
}

export async function getSellerReputationHistoryApi(
  sellerId: number | string,
  days?: number | string
): Promise<SellerReputationHistoryItem[]> {
  const query = new URLSearchParams()
  if (days !== undefined && days !== null && String(days).trim() !== '') {
    query.set('days', String(days))
  }
  const queryPart = query.toString() ? `?${query.toString()}` : ''
  const response = await fetch(`/api/user/reputation/${sellerId}/history${queryPart}`, {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<SellerReputationHistoryItem[]>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取信誉历史趋势失败')
  }
  return json.data || []
}

export async function getUserStatsApi(): Promise<UserStatsData> {
  const response = await fetch('/api/user/stats', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<UserStatsData>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取用户统计失败')
  }
  return json.data
}

export async function changePasswordApi(body: ChangePasswordRequest): Promise<void> {
  const response = await fetch('/api/user/change-password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '修改密码失败')
  }
}

export async function uploadAvatarApi(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<string>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '上传头像失败')
  }
  return json.data
}

export async function updateUserProfileApi(body: UpdateUserProfileRequest): Promise<void> {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '更新个人信息失败')
  }
}

export async function getUserProfileApi(): Promise<UserProfileData> {
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<UserProfileData>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取个人信息失败')
  }
  return json.data
}

export async function getAddressListApi(): Promise<UserAddressItem[]> {
  const response = await fetch('/api/user/addresses', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<UserAddressItem[]>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '获取地址列表失败')
  }
  return json.data || []
}

export async function createAddressApi(body: UserAddressPayload): Promise<void> {
  const response = await fetch('/api/user/address', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '新增地址失败')
  }
}

export async function updateAddressApi(addressId: number | string, body: UserAddressPayload): Promise<void> {
  const response = await fetch(`/api/user/address/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '更新地址失败')
  }
}

export async function deleteAddressApi(addressId: number | string): Promise<void> {
  const response = await fetch(`/api/user/address/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '删除地址失败')
  }
}

export async function setDefaultAddressApi(addressId: number | string): Promise<void> {
  const response = await fetch(`/api/user/address/${addressId}/default`, {
    method: 'PUT',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '设置默认地址失败')
  }
}

export async function bindPhoneApi(body: BindPhoneRequest): Promise<void> {
  const query = new URLSearchParams({
    phone: body.phone,
    verifyCode: body.verifyCode,
  })
  const response = await fetch(`/api/user/bind-phone?${query.toString()}`, {
    method: 'PUT',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const text = await response.text()
  if (!text.trim()) {
    return
  }
  const json = JSON.parse(text) as Partial<ApiResponse<null>>
  if (typeof json.code === 'number' && json.code !== 200) {
    throw new Error(json.message || '绑定手机号失败')
  }
}

export async function unbindPhoneApi(): Promise<void> {
  const response = await fetch('/api/user/unbind-phone', {
    method: 'PUT',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const text = await response.text()
  if (!text.trim()) {
    return
  }
  const json = JSON.parse(text) as Partial<ApiResponse<null>>
  if (typeof json.code === 'number' && json.code !== 200) {
    throw new Error(json.message || '解绑手机号失败')
  }
}

export async function bindEmailApi(body: BindEmailRequest): Promise<void> {
  const query = new URLSearchParams({
    email: body.email,
    verifyCode: body.verifyCode,
  })
  const response = await fetch(`/api/user/bind-email?${query.toString()}`, {
    method: 'PUT',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const text = await response.text()
  if (!text.trim()) {
    return
  }
  const json = JSON.parse(text) as Partial<ApiResponse<null>>
  if (typeof json.code === 'number' && json.code !== 200) {
    throw new Error(json.message || '绑定邮箱失败')
  }
}

export async function submitRealNameVerificationApi(body: RealNameVerificationRequest): Promise<void> {
  const response = await fetch('/api/user/verification/realname', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '提交实名认证失败')
  }
}

export async function getVerificationStatusApi(): Promise<VerificationStatusItem[]> {
  const response = await fetch('/api/user/verification/status', {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<VerificationStatusItem[]>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '查询认证状态失败')
  }
  return json.data || []
}

export async function getVerificationDetailApi(
  verificationId: number | string
): Promise<VerificationDetailData> {
  const response = await fetch(`/api/user/verification/detail/${verificationId}`, {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<VerificationDetailData>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '查询认证记录详情失败')
  }
  return json.data
}

export async function resubmitVerificationApi(
  verificationId: number | string,
  body: RealNameVerificationRequest
): Promise<void> {
  const query = new URLSearchParams({
    realName: body.realName,
    idCardNumber: body.idCardNumber,
  })
  const response = await fetch(`/api/user/verification/${verificationId}/resubmit?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const json = await parseResponse<ApiResponse<null>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '重新提交认证失败')
  }
}

export async function unbindEmailApi(): Promise<void> {
  const response = await fetch('/api/user/unbind-email', {
    method: 'PUT',
    headers: getAuthHeader(),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `网络错误：${response.status}`)
  }
  const text = await response.text()
  if (!text.trim()) {
    return
  }
  const json = JSON.parse(text) as Partial<ApiResponse<null>>
  if (typeof json.code === 'number' && json.code !== 200) {
    throw new Error(json.message || '解绑邮箱失败')
  }
}
