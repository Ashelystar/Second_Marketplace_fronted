import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email?: string
  phone?: string
  createTime: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const avatar = computed(() => userInfo.value?.avatar || '/default-avatar.png')
  const nickname = computed(() => userInfo.value?.nickname || '用户')
  
  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken
    // 可以在这里设置axios拦截器
  }
  
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }
  
  const clearUserInfo = () => {
    token.value = ''
    userInfo.value = null
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    avatar,
    nickname,
    setToken,
    setUserInfo,
    clearUserInfo
  }
}, {
  persist: true // 开启持久化
})