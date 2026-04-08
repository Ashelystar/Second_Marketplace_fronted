import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserAccount } from '@/types'
import { getProfile, login as apiLogin, logout as apiLogout, register as apiRegister, updateProfile, getUserStats } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const profile = ref<UserAccount | null>(null)
  const stats = ref({
    total_orders: 0,
    total_favorites: 0,
    total_customers: 0,
    total_reviews: 0,
    credit_score: 0,
    positive_rate: 0,
  })
  const loading = ref(false)

  async function login(payload: { account: string; password: string }) {
    loading.value = true
    const result = await apiLogin(payload)
    token.value = result.token
    profile.value = result.profile
    loading.value = false
    return result
  }

  async function register(payload: { username: string; nickname: string; phone?: string; password: string }) {
    loading.value = true
    const result = await apiRegister(payload)
    token.value = result.token
    profile.value = result.profile
    loading.value = false
    return result
  }

  async function logout() {
    loading.value = true
    await apiLogout()
    token.value = ''
    profile.value = null
    loading.value = false
  }

  async function fetchProfile() {
    loading.value = true
    profile.value = await getProfile()
    loading.value = false
  }

  async function saveProfile(payload: Partial<UserAccount>) {
    loading.value = true
    profile.value = await updateProfile(payload)
    loading.value = false
    return profile.value
  }

  async function fetchStats() {
    loading.value = true
    stats.value = await getUserStats()
    loading.value = false
  }

  return {
    token,
    profile,
    stats,
    loading,
    login,
    register,
    logout,
    fetchProfile,
    saveProfile,
    fetchStats,
  }
})
