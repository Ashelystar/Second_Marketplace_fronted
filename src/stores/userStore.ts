import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  favoriteProductApi,
  unfavoriteProductApi,
  getFavoriteIdsApi,
} from '@/api/user'

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
  const favoriteIds = ref<number[]>([])

  const isLoggedIn = computed(() => !!token.value)

  const isFavorited = (productId: number) => {
    return favoriteIds.value.includes(productId) || favorites.value.some(item => item.id === productId)
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

  const toggleFavorite = async (product: FavoriteItem) => {
    if (isFavorited(product.id)) {
      removeFavorite(product.id)
      favoriteIds.value = favoriteIds.value.filter(id => id !== product.id)
      try {
        if (isLoggedIn.value) {
          await unfavoriteProductApi(product.id)
        }
      } catch (error) {
        addFavorite(product)
        favoriteIds.value.push(product.id)
        throw error
      }
      return
    }

    addFavorite(product)
    if (!favoriteIds.value.includes(product.id)) {
      favoriteIds.value.push(product.id)
    }
    try {
      if (isLoggedIn.value) {
        await favoriteProductApi(product.id)
      }
    } catch (error) {
      removeFavorite(product.id)
      favoriteIds.value = favoriteIds.value.filter(id => id !== product.id)
      throw error
    }
  }

  const loadFavoriteIds = async () => {
    if (!isLoggedIn.value) {
      favoriteIds.value = favorites.value.map(item => item.id)
      return
    }
    try {
      favoriteIds.value = await getFavoriteIdsApi()
    } catch (error) {
      console.error('加载收藏ID失败:', error)
      favoriteIds.value = favorites.value.map(item => item.id)
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
    loadFavoriteIds()
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    favoriteIds.value = favorites.value.map(item => item.id)
  }

  loadFavoriteIds()

  return {
    userInfo,
    isLoggedIn,
    favorites,
    favoriteIds,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavoriteIds,
    login,
    logout
  }
})
