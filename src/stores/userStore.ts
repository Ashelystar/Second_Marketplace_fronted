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

export const useUserStore = defineStore('user', () => {
  // 强制设置为未登录状态，不从 localStorage 读取
  const userInfo = ref<{ id?: number; username?: string; avatar?: string } | null>(null)

  // 收藏列表
  const favorites = ref<FavoriteItem[]>(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  )

  const isLoggedIn = computed(() => !!userInfo.value)

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

  const login = (user: typeof userInfo.value) => {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  const logout = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
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
