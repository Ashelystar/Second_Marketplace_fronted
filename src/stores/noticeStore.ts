import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { NoticeVO, GetNoticeListParams } from '@/api/chat'
import {
  getNoticeList,
  getUnreadNoticeCount,
  markNoticeRead as apiMarkNoticeRead,
  markAllNoticesRead,
} from '@/api/chat'
import { useUserStore } from '@/stores/userStore'

export const useNoticeStore = defineStore('notice', () => {
  // ========== 状态 ==========
  const notices = ref<NoticeVO[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)

  // ========== 计算属性 ==========
  const unreadNotices = computed(() =>
    notices.value.filter((n) => n.readStatus === 'unread')
  )

  // ========== 方法 ==========

  /** 加载通知列表 */
  const fetchNotices = async (params?: GetNoticeListParams) => {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) return

    isLoading.value = true
    try {
      notices.value = await getNoticeList({
        pageNum: 1,
        pageSize: 20,
        ...params,
      })
    } catch (err) {
      console.error('[通知Store] 加载通知列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 获取未读数量 */
  const fetchUnreadCount = async () => {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) return

    try {
      const result = await getUnreadNoticeCount()
      unreadCount.value = result.unreadCount || 0
    } catch (err) {
      console.error('[通知Store] 获取未读数量失败:', err)
    }
  }

  /** 标记单条已读 */
  const markRead = async (inboxId: number) => {
    try {
      await apiMarkNoticeRead(inboxId)
      // 本地立即更新状态
      const notice = notices.value.find((n) => n.inboxId === inboxId)
      if (notice && notice.readStatus === 'unread') {
        notice.readStatus = 'read'
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('[通知Store] 标记已读失败:', err)
    }
  }

  /** 全部标记已读 */
  const markAllRead = async () => {
    try {
      await markAllNoticesRead()
      notices.value.forEach((n) => {
        n.readStatus = 'read'
      })
      unreadCount.value = 0
    } catch (err) {
      console.error('[通知Store] 全部已读失败:', err)
    }
  }

  /** 全量刷新（列表 + 未读数） */
  const refresh = async () => {
    await Promise.all([fetchNotices(), fetchUnreadCount()])
  }

  /** 重置（退出登录时调用） */
  const reset = () => {
    notices.value = []
    unreadCount.value = 0
    isLoading.value = false
  }

  return {
    notices,
    unreadCount,
    isLoading,
    unreadNotices,
    fetchNotices,
    fetchUnreadCount,
    markRead,
    markAllRead,
    refresh,
    reset,
  }
})
