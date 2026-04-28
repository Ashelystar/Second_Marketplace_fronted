import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProductDetail } from '@/api/goods'
import type { Product } from '@/types'
import {
  favoriteProductApi,
  unfavoriteProductApi,
  getFavoriteIdsApi,
  followUserApi,
  unfollowUserApi,
  getFollowIdsApi,
  getFollowerIdsApi,
  getUserStatusApi,
  getUserPermissionsApi,
  type UserPermissions,
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
  const cachedToken = localStorage.getItem('token') || ''
  const cachedUserInfo = localStorage.getItem('userInfo')

  let parsedUserInfo: UserInfo | null = null
  if (cachedUserInfo) {
    try {
      parsedUserInfo = JSON.parse(cachedUserInfo) as UserInfo | null
    } catch {
      parsedUserInfo = null
    }
  }

  const hasValidAuthCache = Boolean(cachedToken && parsedUserInfo)
  const token = ref<string>(hasValidAuthCache ? cachedToken : '')
  const userInfo = ref<UserInfo | null>(hasValidAuthCache ? parsedUserInfo : null)

  if (!hasValidAuthCache) {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 收藏列表
  const favorites = ref<FavoriteItem[]>(
    JSON.parse(localStorage.getItem('favorites') || '[]')
  )
  const favoriteIds = ref<number[]>([])
  const followIds = ref<number[]>([])
  const followerIds = ref<number[]>([])
  const userStatus = ref<string>(userInfo.value?.userStatus || '')
  const userPermissions = ref<UserPermissions>({
    canBuy: true,
    canSell: true,
    isAdmin: false,
  })

  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  const isFavorited = (productId: number) => {
    return favoriteIds.value.includes(productId) || favorites.value.some(item => item.id === productId)
  }

  const isFollowing = (targetUserId: number) => {
    return followIds.value.includes(targetUserId)
  }

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message
    return String(error ?? '')
  }

  const isAlreadyFavoritedError = (error: unknown) => {
    const msg = getErrorMessage(error)
    return /已经收藏|已收藏|already\s*favorited?|favorite\s*exists|数据验证约束|对象循环引用/i.test(msg)
  }

  const isNotFavoritedError = (error: unknown) => {
    const msg = getErrorMessage(error)
    return /未收藏|not\s*favorited?|favorite\s*not\s*found/i.test(msg)
  }

  const isAlreadyFollowedError = (error: unknown) => {
    const msg = getErrorMessage(error)
    return /已经关注|已关注|already\s*followed?|follow\s*exists|数据验证约束|对象循环引用/i.test(msg)
  }

  const isNotFollowedError = (error: unknown) => {
    const msg = getErrorMessage(error)
    return /未关注|not\s*followed?|follow\s*not\s*found/i.test(msg)
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
        if (isNotFavoritedError(error)) {
          return
        }
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
      if (isAlreadyFavoritedError(error)) {
        if (!favoriteIds.value.includes(product.id)) {
          favoriteIds.value.push(product.id)
        }
        addFavorite(product)
        return
      }
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

  const loadFollowIds = async () => {
    if (!isLoggedIn.value) {
      followIds.value = []
      return
    }
    try {
      followIds.value = await getFollowIdsApi()
    } catch (error) {
      console.error('加载关注ID失败:', error)
      followIds.value = []
    }
  }

  const loadFollowerIds = async () => {
    if (!isLoggedIn.value) {
      followerIds.value = []
      return
    }
    try {
      followerIds.value = await getFollowerIdsApi()
    } catch (error) {
      console.error('加载粉丝ID失败:', error)
      followerIds.value = []
    }
  }

  const toggleFollow = async (targetUserId: number) => {
    if (targetUserId <= 0) {
      throw new Error('用户ID无效')
    }
    if (!isLoggedIn.value) {
      throw new Error('请先登录')
    }
    if (userInfo.value?.id && Number(userInfo.value.id) === targetUserId) {
      throw new Error('不能关注自己')
    }

    if (isFollowing(targetUserId)) {
      followIds.value = followIds.value.filter((id) => id !== targetUserId)
      try {
        await unfollowUserApi(targetUserId)
      } catch (error) {
        if (isNotFollowedError(error)) {
          return
        }
        followIds.value.push(targetUserId)
        throw error
      }
      return
    }

    followIds.value.push(targetUserId)
    try {
      await followUserApi(targetUserId)
    } catch (error) {
      if (isAlreadyFollowedError(error)) {
        if (!followIds.value.includes(targetUserId)) {
          followIds.value.push(targetUserId)
        }
        return
      }
      followIds.value = followIds.value.filter((id) => id !== targetUserId)
      throw error
    }
  }

  const saveFavorites = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const toFavoriteItem = (product: Product): FavoriteItem => ({
    id: product.id,
    title: product.title || `商品${product.id}`,
    price: String(product.price ?? ''),
    image: product.image || '',
    condition: product.condition || '成色未知',
    location: product.location || '',
    addTime: new Date().toLocaleString(),
  })

  const syncFavoritesFromServer = async () => {
    if (!isLoggedIn.value) return
    await loadFavoriteIds()

    if (favoriteIds.value.length === 0) {
      favorites.value = []
      saveFavorites()
      return
    }

    const cachedMap = new Map(favorites.value.map((item) => [item.id, item]))
    const detailResults = await Promise.all(
      favoriteIds.value.map(async (id) => {
        try {
          const detail = await getProductDetail(id)
          return toFavoriteItem(detail)
        } catch (error) {
          console.warn(`加载收藏商品详情失败: ${id}`, error)
          return cachedMap.get(id) || null
        }
      })
    )

    favorites.value = detailResults.filter((item): item is FavoriteItem => item !== null)
    saveFavorites()
  }

  const loadUserSecurityInfo = async () => {
    if (!isLoggedIn.value) {
      userStatus.value = ''
      userPermissions.value = { canBuy: true, canSell: true, isAdmin: false }
      return
    }
    const [statusResult, permissionsResult] = await Promise.allSettled([
      getUserStatusApi(),
      getUserPermissionsApi(),
    ])
    if (statusResult.status === 'fulfilled') {
      userStatus.value = statusResult.value
      if (userInfo.value) {
        userInfo.value = {
          ...userInfo.value,
          userStatus: statusResult.value,
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    }
    if (permissionsResult.status === 'fulfilled') {
      userPermissions.value = permissionsResult.value
    }
  }

  const login = (user: typeof userInfo.value, tokenValue?: string) => {
    userInfo.value = user
    localStorage.setItem('userInfo', JSON.stringify(user))
    if (tokenValue) {
      localStorage.setItem('token', tokenValue)
      token.value = tokenValue
    } else {
      token.value = ''
      localStorage.removeItem('token')
    }
    loadFavoriteIds()
    void loadFollowIds()
    void loadFollowerIds()
    void syncFavoritesFromServer()
    void loadUserSecurityInfo()
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    userStatus.value = ''
    userPermissions.value = { canBuy: true, canSell: true, isAdmin: false }
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    favoriteIds.value = favorites.value.map(item => item.id)
    followIds.value = []
    followerIds.value = []
  }

  loadFavoriteIds()
  void loadFollowIds()
  void loadFollowerIds()
  void syncFavoritesFromServer()
  void loadUserSecurityInfo()

  return {
    userInfo,
    isLoggedIn,
    favorites,
    favoriteIds,
    followIds,
    followerIds,
    userStatus,
    userPermissions,
    isFavorited,
    isFollowing,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavoriteIds,
    loadFollowIds,
    loadFollowerIds,
    toggleFollow,
    syncFavoritesFromServer,
    loadUserSecurityInfo,
    login,
    logout
  }
})
