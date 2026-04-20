import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FavoriteItem {
  id: number
  title: string
  price: string
  image: string
  condition: string
  location: string
  addTime: string
}

export interface UserInfo {
  id?: number
  username?: string
  nickname?: string
  avatar?: string | null
  avatarUrl?: string | null
  phone?: string
  email?: string
  userStatus?: string
  lastLoginAt?: string
  registeredAt?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )

  // 收藏列表
  const favorites = ref<FavoriteItem[]>(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  )

  const isLoggedIn = computed(() => !!token.value)

  const isFavorited = (productId: number) => {
    return favorites.value.some(item => item.id === productId)
  }

  const addFavorite = (product: FavoriteItem) => {
    if (!isFavorited(product.id)) {
      favorites.value.push(product)
      saveFavorites()
    }
  }

  const removeFavorite = (productId: number) => {
    favorites.value = favorites.value.filter(item => item.id !== productId)
    saveFavorites()
  }

  const toggleFavorite = (product: FavoriteItem) => {
    if (isFavorited(product.id)) {
      removeFavorite(product.id)
    } else {
      addFavorite(product)
    }
  }

  const saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const login = (user: typeof userInfo.value, tokenValue?: string) => {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
      token.value = tokenValue
    }
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    isLoggedIn,
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    login,
    logout
  }
})
