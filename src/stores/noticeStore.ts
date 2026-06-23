import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { NoticeVO } from '@/api/chat'
import { getNoticeListApi, type SystemNoticeVO } from '@/api/notification'
import { useUserStore } from '@/stores/userStore'

const READ_KEY = 'notice_read_ids'

/** 从 localStorage 读取已读通知ID集合 */
function getReadIds(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

/** 持久化已读通知ID集合 */
function saveReadIds(ids: Set<number>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
}

/** 将管理员通知视图转为用户通知视图 */
function toNoticeVO(notice: SystemNoticeVO, readIds: Set<number>): NoticeVO {
  return {
    inboxId: notice.id,
    noticeId: notice.id,
    title: notice.title,
    content: notice.content,
    noticeType: notice.noticeType as NoticeVO['noticeType'],
    readStatus: readIds.has(notice.id) ? 'read' : 'unread',
    deliveredAt: notice.publishedAt || notice.createdAt,
    readAt: null,
  }
}

export const useNoticeStore = defineStore('notice', () => {
  // ========== 状态 ==========
  const notices = ref<NoticeVO[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)

  // 已读通知ID集合（内存 + localStorage 持久化）
  let readIds = getReadIds()

  // ========== 计算属性 ==========
  const unreadNotices = computed(() =>
    notices.value.filter((n) => n.readStatus === 'unread')
  )

  // ========== 方法 ==========

  /** 加载通知列表（使用管理员通知接口，所有用户都能看到已发布的通知） */
  const fetchNotices = async () => {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      console.log('[通知Store] 未登录，跳过加载通知列表')
      return
    }

    isLoading.value = true
    try {
      readIds = getReadIds() // 每次加载前刷新已读集合
      const result = await getNoticeListApi({
        publishStatus: 'published',
        pageNum: 1,
        pageSize: 20,
      })
      console.log('[通知Store] 通知列表加载成功, 数量:', result?.length)
      notices.value = (result || []).map((n) => toNoticeVO(n, readIds))
      unreadCount.value = notices.value.filter((n) => n.readStatus === 'unread').length
    } catch (err) {
      console.error('[通知Store] 加载通知列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /** 标记单条已读（纯前端本地记录） */
  const markRead = async (noticeId: number) => {
    readIds.add(noticeId)
    saveReadIds(readIds)
    const notice = notices.value.find((n) => n.inboxId === noticeId)
    if (notice && notice.readStatus === 'unread') {
      notice.readStatus = 'read'
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  /** 全部标记已读 */
  const markAllRead = async () => {
    notices.value.forEach((n) => {
      readIds.add(n.noticeId)
      n.readStatus = 'read'
    })
    saveReadIds(readIds)
    unreadCount.value = 0
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
    readIds = new Set()
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
