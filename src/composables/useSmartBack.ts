import { useRouter, useRoute } from 'vue-router'
import { didEnterFromLogin, clearEnterFromLogin, getBackDestination } from '@/router'

/**
 * 智能返回 composable
 * - 从登录页进入的 → 跳过登录页，回到来源页（没有则回 fallbackPath）
 * - 正常进入的 → router.back()
 * - 无历史的 → fallbackPath
 */
export function useSmartBack(fallbackPath: string = '/') {
  const router = useRouter()
  const route = useRoute()

  const goBack = () => {
    const currentPath = route.path
    if (didEnterFromLogin(currentPath)) {
      clearEnterFromLogin(currentPath)
      router.push(getBackDestination(currentPath))
      return
    }
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }

  return { goBack }
}
