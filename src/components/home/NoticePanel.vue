<template>
  <div class="notice-panel" v-if="userStore.isLoggedIn">
    <div class="notice-header">
      <h3 class="notice-title">
        <i class="fa fa-bell"></i>
        平台通知
      </h3>
      <div class="notice-actions">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
          <span class="unread-label">未读</span>
        </el-badge>
        <el-button
          v-if="unreadCount > 0"
          link
          type="primary"
          size="small"
          @click="handleMarkAllRead"
        >
          全部已读
        </el-button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="notice-loading">
      <i class="fa fa-spinner fa-spin"></i>
      <span>加载中...</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="notices.length === 0" class="notice-empty">
      <i class="fa fa-bell-slash"></i>
      <span>暂无通知</span>
    </div>

    <!-- 通知列表 -->
    <div v-else class="notice-list">
      <div
        v-for="notice in notices"
        :key="notice.inboxId"
        class="notice-item"
        :class="{ unread: notice.readStatus === 'unread' }"
        @click="handleNoticeClick(notice)"
      >
        <div class="notice-icon">
          <i :class="getNoticeIcon(notice.noticeType)"></i>
        </div>
        <div class="notice-content">
          <div class="notice-item-title">{{ notice.title }}</div>
          <div class="notice-item-desc">{{ truncateContent(notice.content) }}</div>
          <div class="notice-item-time">{{ formatTime(notice.deliveredAt) }}</div>
        </div>
        <span v-if="notice.readStatus === 'unread'" class="unread-dot"></span>
      </div>
    </div>

    <!-- 查看更多 -->
    <div v-if="notices.length > 0" class="notice-footer">
      <el-button link type="primary" size="small" @click="goToChat">
        查看全部通知 <i class="fa fa-arrow-right"></i>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useNoticeStore } from '@/stores/noticeStore'
import type { NoticeVO } from '@/api/chat'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const noticeStore = useNoticeStore()
const { notices: storeNotices, unreadCount, isLoading } = storeToRefs(noticeStore)

const notices = computed(() => storeNotices.value.slice(0, 5))

// 监听登录状态变化，登录后自动刷新
watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    console.log('[NoticePanel] 检测到登录，刷新通知')
    noticeStore.refresh()
  }
}, { immediate: true })

onMounted(() => {
  console.log('[NoticePanel] 挂载，isLoggedIn:', userStore.isLoggedIn)
  if (userStore.isLoggedIn) {
    noticeStore.refresh()
  }
})

function getNoticeIcon(type: string): string {
  const map: Record<string, string> = {
    system: 'fa fa-bullhorn',
    announcement: 'fa fa-info-circle',
    warning: 'fa fa-exclamation-triangle',
    notification: 'fa fa-envelope',
    order: 'fa fa-shopping-cart',
    after_sale: 'fa fa-exchange',
    promotion: 'fa fa-gift',
  }
  return map[type] || 'fa fa-bell'
}

function truncateContent(content: string): string {
  if (!content) return ''
  return content.length > 40 ? content.substring(0, 40) + '...' : content
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

async function handleNoticeClick(notice: NoticeVO) {
  if (notice.readStatus === 'unread') {
    try {
      await noticeStore.markRead(notice.inboxId)
    } catch {
      ElMessage.error('标记已读失败')
    }
  }
  // 跳转到聊天页面的通知列表
  router.push('/chat')
}

async function handleMarkAllRead() {
  try {
    await noticeStore.markAllRead()
    ElMessage.success('已全部标记为已读')
  } catch {
    ElMessage.error('操作失败')
  }
}

function goToChat() {
  router.push('/chat')
}
</script>

<style scoped>
.notice-panel {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notice-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.notice-title i {
  color: #f97316;
  font-size: 14px;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unread-label {
  font-size: 12px;
  color: #999;
}

.notice-loading,
.notice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  color: #999;
  font-size: 13px;
  gap: 8px;
}

.notice-loading i,
.notice-empty i {
  font-size: 20px;
}

.notice-list {
  max-height: 320px;
  overflow-y: auto;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 150ms;
  border-bottom: 1px solid #fafafa;
  gap: 10px;
}

.notice-item:hover {
  background: #fafafa;
}

.notice-item.unread {
  background: #fff7ed;
}

.notice-item.unread:hover {
  background: #fff1e6;
}

.notice-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #f97316;
  background: #fff7ed;
  margin-top: 2px;
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-item-desc {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice-item-time {
  font-size: 11px;
  color: #bbb;
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f97316;
  margin-top: 8px;
}

.notice-footer {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

/* 滚动条 */
.notice-list::-webkit-scrollbar {
  width: 4px;
}

.notice-list::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}
</style>
