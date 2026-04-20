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

export interface ResetPasswordResponse {
  code: number
  message: string
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

// --- 下面是重点修改的地方，全部改回相对路径 ---

export async function loginApi(body: LoginRequest): Promise<LoginResponseData> {
  const url = `/api/user/login` // 改回去了
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
): Promise<ResetPasswordResponse> {
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

  const json = await parseResponse<ApiResponse<ResetPasswordResponse>>(response)
  if (json.code !== 200) {
    throw new Error(json.message || '重置密码失败')
  }

  return json.data
}
