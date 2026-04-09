import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 强制设置为未登录状态，不从 localStorage 读取
  const userInfo = ref<{ id?: number; username?: string; avatar?: string } | null>(null)

  const isLoggedIn = computed(() => !!userInfo.value)

  const login = (user: typeof userInfo.value) => {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  const logout = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
  }

  return { userInfo, isLoggedIn, login, logout }
})
