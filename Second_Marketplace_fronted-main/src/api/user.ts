import type { UserAccount } from '@/types'

const storageKey = 'sales-system-user'

const defaultProfile: UserAccount = {
  id: 1,
  username: 'sales_user',
  nickname: '销售顾问',
  phone: '150****2799',
  email: 'user@example.com',
  can_buy: 1,
  can_sell: 1,
  is_admin: 0,
  user_status: 'active',
  last_login_at: new Date().toISOString(),
  registered_at: new Date().toISOString(),
  avatar_url: '',
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function login(payload: { account: string; password: string }) {
  await delay(500)
  if (!payload.account || !payload.password) {
    throw new Error('请输入用户名/手机号/邮箱和密码')
  }
  const token = `mock-token-${Date.now()}`
  localStorage.setItem(storageKey, JSON.stringify({ token, profile: defaultProfile }))
  return { token, profile: defaultProfile }
}

export async function register(payload: { username: string; nickname: string; phone?: string; password: string }) {
  await delay(600)
  if (!payload.username || !payload.password) {
    throw new Error('用户名和密码不能为空')
  }
  const profile: UserAccount = {
    ...defaultProfile,
    id: Date.now(),
    username: payload.username,
    nickname: payload.nickname || payload.username,
    phone: payload.phone,
    registered_at: new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  }
  const token = `mock-token-${Date.now()}`
  localStorage.setItem(storageKey, JSON.stringify({ token, profile }))
  return { token, profile }
}

export async function logout() {
  localStorage.removeItem(storageKey)
  await delay(150)
  return true
}

export async function getProfile() {
  await delay(300)
  const storage = localStorage.getItem(storageKey)
  if (!storage) {
    throw new Error('未登录，请先登录')
  }
  const data = JSON.parse(storage) as { token: string; profile: UserAccount }
  return data.profile
}

export async function updateProfile(payload: Partial<UserAccount>) {
  await delay(400)
  const storage = localStorage.getItem(storageKey)
  if (!storage) throw new Error('未登录')
  const data = JSON.parse(storage) as { token: string; profile: UserAccount }
  const profile = { ...data.profile, ...payload }
  localStorage.setItem(storageKey, JSON.stringify({ token: data.token, profile }))
  return profile
}

export async function getUserStats() {
  await delay(200)
  return {
    total_orders: 18,
    total_favorites: 12,
    total_customers: 24,
    total_reviews: 8,
    credit_score: 96,
    positive_rate: 98.5,
  }
}
