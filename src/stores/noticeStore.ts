import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getNoticeList,
  getUnreadNoticeCount,
  markNoticeRead,
  markAllNoticesRead,
  type NoticeVO,
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

  /** 加载通知列表（用户端接口 /api/notice/list） */
  const fetchNotices = async () => {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      console.log('[通知Store] 未登录，跳过加载通知列表')
      return
    }

    isLoading.value = true
    try {
      const result = await getNoticeList({ pageNum: 1, pageSize: 20 })
      console.log('[通知Store] 通知列表加载成功, 数量:', result?.length)
      notices.value = result || []
      // 同时拉取服务端未读数
      try {
        const countResult = await getUnreadNoticeCount()
        unreadCount.value = countResult?.unreadCount ?? 0
      } catch {
        // 未读数接口失败则回退到本地计算
        unreadCount.value = notices.value.filter((n) => n.readStatus === 'unread').length
      }
    } catch (err) {
      console.error('[通知Store] 加载通知列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 标记单条已读（调用后端接口） */
  const markRead = async (inboxId: number) => {
    try {
      await markNoticeRead(inboxId)
      // 调用成功后更新本地状态
      const notice = notices.value.find((n) => n.inboxId === inboxId)
      if (notice && notice.readStatus === 'unread') {
        notice.readStatus = 'read'
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      console.error('[通知Store] 标记已读失败:', err)
      throw err
    }
  }

  /** 全部标记已读（调用后端接口） */
  const markAllRead = async () => {
    try {
      await markAllNoticesRead()
      // 调用成功后更新本地状态
      notices.value.forEach((n) => {
        n.readStatus = 'read'
      })
      unreadCount.value = 0
    } catch (err) {
      console.error('[通知Store] 全部标记已读失败:', err)
      throw err
    }
  }

  /** 全量刷新（列表 + 未读数） */
  const refresh = async () => {
    await fetchNotices()
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
    markRead,
    markAllRead,
    refresh,
    reset,
  }
})
