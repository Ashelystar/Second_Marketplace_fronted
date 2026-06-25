<template>
  <div class="chat-page">
    <aside class="friend-sidebar" :class="{ open: sidebarOpen }">
      <div class="friend-header">
        <h3>消息</h3>
        <span v-if="totalBadgeCount > 0" class="friend-count">{{ unreadCountDisplay }}</span>
      </div>

      <!-- 通知列表（置顶在消息列表上方） -->
      <div v-if="noticeStore.notices.length > 0" class="notice-list">
        <div
          v-for="notice in noticeStore.notices"
          :key="notice.inboxId"
          class="notice-item"
          :class="{ unread: notice.readStatus === 'unread', selected: selectedNotice?.inboxId === notice.inboxId }"
          @click="handleNoticeClick(notice)"
        >
          <div class="notice-icon" :class="'notice-' + notice.noticeType">
            <i :class="getNoticeIcon(notice.noticeType)"></i>
          </div>
          <div class="notice-info">
            <p class="notice-title">{{ notice.title }}</p>
            <p class="notice-preview">{{ notice.content }}</p>
          </div>
          <div class="notice-meta">
            <span class="notice-time">{{ formatNoticeTime(notice.deliveredAt) }}</span>
            <span v-if="notice.readStatus === 'unread'" class="notice-dot"></span>
          </div>
        </div>
      </div>

      <div v-if="threads.length === 0" class="friend-empty">
        暂无会话，去商品页点击"咨询卖家"开始聊天
      </div>

      <div v-else class="friend-list">
        <transition-group name="list-fade" tag="div">
          <div
            v-for="thread in threads"
            :key="thread.conversationId"
            class="friend-item"
            :class="{ active: thread.conversationId === activeConversationId }"
            @click="switchThread(thread.conversationId)"
          >
            <div class="friend-avatar">
              <UserAvatar :src="thread.partner.avatar" :name="thread.partner.name" />
            </div>
            <div class="friend-info">
              <p class="friend-name">{{ thread.partner.name }}</p>
              <p class="last-message">{{ thread.lastMessagePreview || '开始聊天吧' }}</p>
            </div>
            <div class="friend-meta">
              <span class="last-time">{{ formatTime(thread.updatedAt) }}</span>
              <span v-if="thread.unread > 0" class="unread-badge">{{ thread.unread > 99 ? '99+' : thread.unread }}</span>
            </div>
          </div>
        </transition-group>
      </div>
    </aside>

    <section class="chat-main">
      <!-- ========== 通知详情视图 ========== -->
      <template v-if="selectedNotice">
        <div class="notice-detail-header">
          <button class="back-btn" @click="clearSelectedNotice">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div class="notice-detail-header-info">
            <i :class="getNoticeDetailIcon(selectedNotice.noticeType)"></i>
            <span>通知详情</span>
          </div>
        </div>
        <div class="notice-detail-body">
          <h2 class="notice-detail-title">{{ selectedNotice.title }}</h2>
          <div class="notice-detail-meta">
            <span class="notice-detail-type">
              <el-tag :type="getNoticeTypeTag(selectedNotice.noticeType)" size="small">
                {{ getNoticeTypeLabel(selectedNotice.noticeType) }}
              </el-tag>
            </span>
            <span class="notice-detail-time">{{ formatNoticeDetailTime(selectedNotice.deliveredAt) }}</span>
          </div>
          <div class="notice-detail-divider"></div>
          <div class="notice-detail-content">{{ selectedNotice.content }}</div>
        </div>
      </template>

      <!-- ========== 聊天视图 ========== -->
      <template v-else>
      <div class="chat-header">
        <div class="header-inner">
          <button class="action-btn only-mobile" @click="sidebarOpen = !sidebarOpen">
            <i class="fa fa-bars"></i>
          </button>
          <button class="back-btn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div class="seller-info">
            <div class="seller-avatar">
              <UserAvatar :src="activePartner.avatar" :name="activePartner.name" />
            </div>
            <div class="seller-details">
              <h3 class="seller-name">{{ activePartner.name }}</h3>
              <p class="seller-status">
                <span class="online-dot"></span>
                在线
              </p>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn tip-btn" data-tip="ta的主页" @click="viewSellerProfile">
              <i class="fa fa-user"></i>
            </button>
            <button class="action-btn tip-btn" data-tip="设置" @click="showMoreOptions = !showMoreOptions">
              <i class="fa fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeProductCard" class="product-card" @click="viewProductDetail">
        <div class="product-image">
          <img :src="activeProductCard.image || PLACEHOLDER_IMG" :alt="activeProductCard.title">
        </div>
        <div class="product-info">
          <h4 class="product-title">{{ activeProductCard.title }}</h4>
          <div class="product-price-row">
            <span class="product-price">¥{{ activeProductCard.price }}</span>
            <span v-if="activeProductCard.originalPrice && activeProductCard.originalPrice > activeProductCard.price" class="product-original-price">¥{{ activeProductCard.originalPrice }}</span>
          </div>
        </div>
        <button class="btn-view-product" title="查看商品详情">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div class="message-list">
          <div class="system-message">
            <span class="system-text">消息会按登录用户分账号保存</span>
          </div>

          <div v-if="displayMessages.length === 0" class="messages-empty">
            还没有消息，发一句问候开始对话吧
          </div>

          <template
            v-for="(msg, index) in displayMessages"
            :key="msg.id"
          >
            <!-- 动态时间分隔线 -->
            <div
              v-if="showDateDivider(index, msg.createdAt)"
              class="time-divider"
            >
              <span class="time-text">{{ formatDateLabel(msg.createdAt) }}</span>
            </div>

            <!-- 撤回消息：居中系统提示 -->
            <div v-if="msg.recalled" class="recall-notice">
              <span class="recall-text">{{ msg.content }}</span>
            </div>

            <!-- 正常消息 -->
            <div
              v-else
              :class="['message-item', msg.type === 'sent' ? 'sent' : 'received']"
              @contextmenu.prevent="handleContextMenu($event, msg)"
            >
              <div v-if="msg.type === 'received'" class="message-avatar clickable" @click="goToUserProfile(activePartner.id, activePartner.name, activePartner.avatar, activePartner.location)">
                <UserAvatar :src="activePartner.avatar" :name="activePartner.name" />
              </div>

              <!-- 发出的消息：已读状态放在气泡前面 -->
              <div v-if="msg.type === 'sent'" class="message-status">
                <i v-if="(msg as any).status === 'sending'" class="fa fa-clock-o sending"></i>
                <i v-else-if="(msg as any).status === 'failed'" class="fa fa-exclamation-circle failed"></i>
                <i v-else class="fa fa-check delivered"></i>
              </div>

              <div class="message-main">
                <div class="message-bubble">
                  <div v-if="msg.contentType === 'text'" class="text-content">
                    {{ msg.content }}
                  </div>
                  <div v-else-if="msg.contentType === 'image'" class="image-content">
                    <img :src="msg.content" alt="图片消息">
                  </div>
                  <div v-else-if="msg.contentType === 'product'" class="product-content" @click="msg.product?.id ? goToProductDetail(msg.product) : undefined">
                    <div v-if="msg.product?.title" class="product-mini">
                      <img :src="(msg.product?.image ? getImageUrl(msg.product.image) : PLACEHOLDER_IMG)" :alt="msg.product?.title || '商品'">
                      <div class="product-mini-info">
                        <p class="product-mini-title">{{ msg.product?.title }}</p>
                        <div class="product-mini-price-row">
                          <span class="product-mini-price">¥{{ msg.product?.price ?? 0 }}</span>
                          <span v-if="msg.product?.originalPrice && msg.product.originalPrice > (msg.product.price ?? 0)" class="product-mini-original-price">¥{{ msg.product.originalPrice }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="product-mini product-mini-invalid">
                      <span class="product-mini-placeholder">商品信息已失效</span>
                    </div>
                  </div>
                </div>
                <p class="message-time">{{ formatMsgTime(msg.createdAt) }}</p>
              </div>

              <div v-if="msg.type === 'sent'" class="message-avatar clickable" @click="goToMyCenter">
                <UserAvatar :src="currentUserProfile.avatar" :name="currentUserProfile.name" />
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="quick-replies" v-if="showQuickReplies">
        <div class="quick-reply-list">
          <button
            v-for="reply in quickReplies"
            :key="reply"
            class="quick-reply-btn"
            @click="sendQuickReply(reply)"
          >
            {{ reply }}
          </button>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="input-toolbar">
          <button class="toolbar-btn" @click="toggleQuickReplies">
            <i class="fa fa-bolt"></i>
          </button>
          <button class="toolbar-btn" @click="openImagePicker" :disabled="imageUploading" :title="imageUploading ? '图片上传中...' : '发送图片'">
            <i v-if="imageUploading" class="fa fa-spinner fa-pulse"></i>
            <i v-else class="fa fa-image"></i>
          </button>
          <button class="toolbar-btn" @click="sendProductCard">
            <i class="fa fa-tag"></i>
          </button>
        </div>

        <div class="input-wrapper">
          <textarea
            v-model="inputMessage"
            class="message-input"
            placeholder="输入消息..."
            rows="1"
            @keydown.enter.exact.prevent="sendTextMessage"
            @input="autoResize"
            ref="textareaRef"
          ></textarea>
          <button
            class="send-btn"
            :class="{ active: inputMessage.trim().length > 0 }"
            @click="sendTextMessage"
            :disabled="inputMessage.trim().length === 0"
          >
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
      </template>
    </section>

    <div v-if="showMoreOptions" class="modal-overlay" @click="showMoreOptions = false">
      <div class="more-options-modal" @click.stop>
        <button class="option-item" @click="clearChat">
          <i class="fa fa-trash"></i>
          <span>清空聊天记录</span>
        </button>
        <button class="option-item" @click="reportUser">
          <i class="fa fa-flag"></i>
          <span>举报用户</span>
        </button>
        <button class="option-item" @click="blockUser">
          <i class="fa fa-ban"></i>
          <span>拉黑用户</span>
        </button>
      </div>
    </div>

    <!-- 消息右键菜单 -->
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuPos.x + 'px', top: contextMenuPos.y + 'px' }"
      @click.stop
    >
      <button class="context-menu-item" @click="handleRecall">
        <i class="fa fa-undo"></i>
        <span>撤回消息</span>
      </button>
    </div>

    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageSelect"
    >
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useSmartBack } from '@/composables/useSmartBack'
import { getProductDetail, getProductStatus, isOnSale } from '@/api/goods'
import { resolveUserDisplayProfile, isFallbackUserLabel } from '@/api/user'
import { useUserStore } from '@/stores/userStore'
import { useChatStore, type ChatProductCard, type ChatUserProfile } from '@/stores/chatStore'
import { useNoticeStore } from '@/stores/noticeStore'
import type { NoticeVO } from '@/api/chat'
import { uploadChatImage } from '@/api/chat'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import UserAvatar from '@/components/UserAvatar.vue'

defineOptions({ name: 'ChatPage' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const chatStore = useChatStore()
const noticeStore = useNoticeStore()

const CHAT_FRIENDS_STORAGE_KEY = 'chat_friends'
const quickReplies = ['你好，在吗？', '这个还有货吗？', '可以小刀吗？', '支持面交吗？', '什么时候方便？']

const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const imageInput = ref<HTMLInputElement>()
const inputMessage = ref('')
const showQuickReplies = ref(false)
const showMoreOptions = ref(false)
const sidebarOpen = ref(false)

const activeConversationId = ref<number>(0)
const pendingProduct = ref<ChatProductCard | null>(null)
const selectedNotice = ref<NoticeVO | null>(null)

// 上传状态
const imageUploading = ref(false)

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const contextMenuMessage = ref<{ id: number; type: string; senderId: number; createdAt: number } | null>(null)

// ============ 轮询 ============
const POLL_INTERVAL = 2000 // 每 2 秒轮询一次
let pollTimer: ReturnType<typeof setInterval> | null = null
let isPolling = false

/** 开始轮询：定时刷新会话列表 + 当前会话新消息 + 通知 */
const startPolling = () => {
  if (pollTimer) return
  pollTimer = setInterval(async () => {
    if (isPolling) return
    isPolling = true
    try {
      // 刷新会话列表（更新未读数、最后消息）
      await chatStore.pollConversationList()
      // 如果当前有活跃会话，轮询新消息
      if (activeConversationId.value && currentUserProfile.value.id) {
        await chatStore.pollNewMessages(activeConversationId.value)
      }
      // 轮询通知
      if (userStore.isLoggedIn) {
        await noticeStore.fetchNotices()
      }
    } catch {
      // 静默忽略
    } finally {
      isPolling = false
    }
  }, POLL_INTERVAL)
}

/** 停止轮询 */
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 页面不可见时暂停轮询，可见时恢复
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopPolling()
  } else {
    startPolling()
  }
}

// ============ 计算属性 ============

const currentUserProfile = computed<ChatUserProfile>(() => ({
  id: Number(userStore.userInfo?.id || 0),
  name: userStore.userInfo?.nickname || userStore.userInfo?.username || '当前用户',
  avatar: userStore.userInfo?.avatarUrl || userStore.userInfo?.avatar || '',
}))

const threads = computed(() => {
  if (!currentUserProfile.value.id) return []
  return chatStore.getConversationsForUser(currentUserProfile.value.id)
})

const totalUnreadCount = computed(() => {
  if (!currentUserProfile.value.id) return 0
  return chatStore.getUnreadCountForUser(currentUserProfile.value.id)
})

/** 总未读数 = 消息会话未读 + 通知未读 */
const totalBadgeCount = computed(() => totalUnreadCount.value + noticeStore.unreadCount)

const unreadCountDisplay = computed(() =>
  totalBadgeCount.value > 99 ? '99+' : String(totalBadgeCount.value)
)

const activeThread = computed(() =>
  threads.value.find((thread) => thread.conversationId === activeConversationId.value) || null
)

const activePartner = computed<ChatUserProfile>(() => {
  return activeThread.value?.partner || {
    id: 0,
    name: '请选择会话',
    avatar: '',
    location: '',
    rating: 0,
  }
})

const activeProductCard = computed<ChatProductCard | null>(() => {
  return pendingProduct.value
})

const displayMessages = computed(() => {
  if (!activeConversationId.value || !currentUserProfile.value.id) return []
  return chatStore.getConversationMessages(activeConversationId.value).map((message) => {
    // 每个商品卡片消息使用自身携带的 product 数据，
    // 不再用顶部商品卡片兜底（否则同一会话不同商品间切换会导致历史消息显示错误商品）
    return {
      ...message,
      type: message.senderId === currentUserProfile.value.id ? 'sent' : 'received',
    }
  })
})

/** 会话列表最后消息时间：今天显示时间，昨天显示"昨天"，其余显示月日 */
const formatTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (msgDay.getTime() >= today.getTime()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  if (msgDay.getTime() >= yesterday.getTime()) return '昨天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/** 消息气泡时间：只显示具体钟点 */
const formatMsgTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ============ 通知相关 ============

/** 通知时间格式化 */
const formatNoticeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const noticeDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (noticeDay.getTime() >= today.getTime()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  if (noticeDay.getTime() >= yesterday.getTime()) return '昨天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/** 通知类型对应图标 */
const getNoticeIcon = (type: string) => {
  const icons: Record<string, string> = {
    system: 'fa fa-cog',
    announcement: 'fa fa-bullhorn',
    warning: 'fa fa-exclamation-triangle',
    notification: 'fa fa-info-circle',
  }
  return icons[type] || 'fa fa-bell'
}

/** 通知详情页图标（更大号的） */
const getNoticeDetailIcon = (type: string) => {
  const icons: Record<string, string> = {
    system: 'fa fa-cog',
    announcement: 'fa fa-bullhorn',
    warning: 'fa fa-exclamation-triangle',
    notification: 'fa fa-info-circle',
    order: 'fa fa-shopping-cart',
    after_sale: 'fa fa-exchange',
    promotion: 'fa fa-gift',
  }
  return icons[type] || 'fa fa-bell'
}

/** 通知类型标签文案 */
const getNoticeTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    system: '系统通知',
    announcement: '公告',
    warning: '警告',
    notification: '通知',
    order: '订单通知',
    after_sale: '售后通知',
    promotion: '促销通知',
  }
  return map[type] || type
}

/** 通知类型标签颜色 */
const getNoticeTypeTag = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, string> = {
    system: 'primary',
    announcement: 'warning',
    warning: 'danger',
    notification: 'info',
    order: 'success',
    after_sale: 'warning',
    promotion: 'info',
  }
  return (map[type] || 'info') as 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

/** 通知详情页时间格式化（完整时间） */
const formatNoticeDetailTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 选中通知，右侧显示详情 */
const handleNoticeClick = async (notice: NoticeVO) => {
  selectedNotice.value = notice
  if (notice.readStatus === 'unread') {
    try {
      await noticeStore.markRead(notice.inboxId)
    } catch {
      // 静默忽略
    }
  }
}

/** 关闭通知详情，返回聊天 */
const clearSelectedNotice = () => {
  selectedNotice.value = null
}

/** 判断是否需要在当前消息前插入日期/时间分隔线（第一条、跨天、或间隔>5分钟） */
const showDateDivider = (index: number, ts: number): boolean => {
  if (!ts) return false
  if (index === 0) return true
  const prevMsg = displayMessages.value[index - 1]
  if (!prevMsg?.createdAt) return false
  try {
    const cur = new Date(ts)
    const prev = new Date(prevMsg.createdAt)
    if (isNaN(cur.getTime()) || isNaN(prev.getTime())) return false
    if (cur.toDateString() !== prev.toDateString()) return true
    return cur.getTime() - prev.getTime() > 5 * 60 * 1000
  } catch {
    return false
  }
}

/** 日期分隔线文案：今天只显示时间，昨天/更早显示日期+时间 */
const formatDateLabel = (ts: number): string => {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const timeStr = `${hh}:${mm}`
  if (d.toDateString() === today.toDateString()) return timeStr
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${timeStr}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${timeStr}`
}

const getLegacyFriend = (targetId: number) => {
  const legacy = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as ChatUserProfile[]
  return legacy.find((friend) => Number(friend.id) === targetId) || null
}

const createConversationFromRoute = async () => {
  const current = currentUserProfile.value
  if (!current.id) return

  // 1. 商品详情页已创建会话，直接用 conversationId
  const routeConversationId = Number(route.query.conversationId || 0)
  if (routeConversationId > 0) {
    // 检查是否已有同一卖家的其他会话（防止同一卖家多个会话）
    const routeConv = chatStore.conversations.find((c) => c.id === routeConversationId)
    if (routeConv) {
      const existingConv = chatStore.conversations.find(
        (c) => c.userId === routeConv.userId && c.id !== routeConversationId,
      )
      if (existingConv) {
        // 比较最后消息时间，使用更活跃的会话
        const existingTime = existingConv.lastMessageAt
          ? new Date(existingConv.lastMessageAt).getTime()
          : 0
        const routeTime = routeConv.lastMessageAt
          ? new Date(routeConv.lastMessageAt).getTime()
          : 0
        if (existingTime > routeTime) {
          // 已有会话更活跃，复用已有的
          activeConversationId.value = existingConv.id
          chatStore.touchConversation(existingConv.id)
          await chatStore.fetchMessages(existingConv.id)
          await router.replace({ query: { ...route.query, conversationId: undefined } })
          return
        }
      }
    }
    activeConversationId.value = routeConversationId
    // 进入已有对话时也置顶
    chatStore.touchConversation(routeConversationId)
    await chatStore.fetchMessages(routeConversationId)
    return
  }

  // 2. 商家主页/其他页面传来 friendId/sellerId
  const routeFriendId = Number(route.query.friendId || route.query.sellerId || 0)
  if (!routeFriendId || routeFriendId === current.id) return

  // 2a. 先查是否已有与该卖家的历史会话（复用，不创建新的）
  const existingConv = chatStore.conversations.find(
    (conv) => conv.userId === routeFriendId
  )
  if (existingConv) {
    activeConversationId.value = existingConv.id
    // 进入已有对话时也置顶
    chatStore.touchConversation(existingConv.id)
    await chatStore.fetchMessages(existingConv.id)
    // 清除 URL 中的 friendId，避免下次误判
    await router.replace({ query: { ...route.query, friendId: undefined, sellerId: undefined } })
    return
  }

  // 2b. 没有已有会话，创建新的
  const legacy = getLegacyFriend(routeFriendId)
  const profile = await resolveUserDisplayProfile(routeFriendId, {
    sellerName: route.query.sellerName,
    name: route.query.sellerName || route.query.name,
    sellerAvatar: route.query.sellerAvatar,
    avatar: route.query.sellerAvatar || legacy?.avatar,
    nickname: legacy?.name,
  })
  const target: ChatUserProfile = {
    id: routeFriendId,
    name: profile.nickname,
    avatar: profile.avatarUrl || String(route.query.sellerAvatar || legacy?.avatar || ''),
    location: String(legacy?.location || ''),
    rating: Number(legacy?.rating || 5),
  }
  // URL 有 productId 但 activeProductCard 还没加载时，先传简化对象让后端能创建会话
  let productForConv = activeProductCard.value || undefined
  if (!productForConv) {
    const routeProductId = Number(route.query.productId || 0)
    if (routeProductId > 0) {
      productForConv = { id: routeProductId, title: '', price: 0, image: '' }
    }
  }
  const conversation = await chatStore.ensureConversation(current, target, productForConv)
  if (conversation) {
    activeConversationId.value = conversation.id
    // 新建/进入对话时置顶
    chatStore.touchConversation(conversation.id)
    await chatStore.fetchMessages(conversation.id)
  }
}

/** 把商品详情 VO 转成聊天页顶部卡片对象 */
const buildProductCard = (detail: Awaited<ReturnType<typeof getProductDetail>>): ChatProductCard => {
  const image = detail.image
    ? getImageUrl(detail.image)
    : Array.isArray(detail.images) && detail.images[0]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? getImageUrl(((detail.images[0] as any).url || (detail.images[0] as any).imageUrl || ''))
      : PLACEHOLDER_IMG
  return {
    id: detail.id,
    title: detail.title || `商品${detail.id}`,
    price: Number(detail.sellingPrice ?? detail.price ?? 0),
    originalPrice: detail.originalPrice ? Number(detail.originalPrice) : undefined,
    image,
    sellerId: (detail as unknown as { sellerId?: number }).sellerId,
  }
}

const initProductFromQuery = async () => {
  const productId = Number(route.query.productId || 0)
  if (!productId) return
  try {
    // 先校验商品是否在售
    const status = await getProductStatus(productId)
    if (isOnSale(status)) {
      // 明确在售，正常加载
      const detail = await getProductDetail(productId)
      pendingProduct.value = buildProductCard(detail)
      return
    }
    // 非在售时尝试兜底：详情接口如果能查到就显示（兼容状态接口异常）
    console.warn('[initProductFromQuery] 状态非在售，尝试兜底加载详情:', { productId, status })
    const detail = await getProductDetail(productId)
    pendingProduct.value = buildProductCard(detail)
  } catch (error) {
    console.error('[initProductFromQuery] 加载商品失败，清空卡片:', error)
    pendingProduct.value = null
  }
}

/** 根据当前会话的 productId 加载商品详情到顶部卡片 */
const fetchActiveProduct = async () => {
  const thread = activeThread.value
  const routeProductId = Number(route.query.productId || 0)
  // URL 明确带了 productId → 用户从某个商品页进入，优先显示该商品（即使复用已有会话）
  // 否则 → 使用会话自身绑定的 productId
  const pid = routeProductId || thread?.productId || 0
  if (!pid) {
    console.warn('[fetchActiveProduct] 会话无 productId，清空卡片:', { conversationId: activeConversationId.value })
    pendingProduct.value = null
    return
  }
  // 已经是同一个商品就不重复请求
  if (pendingProduct.value?.id === pid) return
  try {
    // 先校验商品是否在售
    const status = await getProductStatus(pid)
    if (isOnSale(status)) {
      const detail = await getProductDetail(pid)
      pendingProduct.value = buildProductCard(detail)
      return
    }
    // 非在售时尝试兜底：详情接口如果能查到就显示（兼容状态接口异常或商品实际仍存在）
    console.warn('[fetchActiveProduct] 状态非在售，尝试兜底加载详情:', { pid, status, conversationId: activeConversationId.value })
    const detail = await getProductDetail(pid)
    pendingProduct.value = buildProductCard(detail)
  } catch (error) {
    console.error('[fetchActiveProduct] 加载会话商品失败，清空卡片:', error)
    pendingProduct.value = null
  }
}

const syncActiveConversation = () => {
  if (!threads.value.length) {
    activeConversationId.value = 0
    return
  }
  const stillExists = threads.value.some((thread) => thread.conversationId === activeConversationId.value)
  if (!stillExists) {
    activeConversationId.value = threads.value[0]?.conversationId || 0
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const switchThread = async (conversationId: number) => {
  // 切换到聊天会话时关闭通知详情
  selectedNotice.value = null
  activeConversationId.value = conversationId
  sidebarOpen.value = false
  // 切换会话时清除 URL 中的 productId，避免旧商品影响新会话
  if (route.query.productId) {
    await router.replace({ query: { ...route.query, productId: undefined } })
  }
  // 确保消息缓存已加载
  await chatStore.fetchMessages(conversationId)
  // 加载顶部商品卡片
  await fetchActiveProduct()
  if (currentUserProfile.value.id) {
    chatStore.markConversationRead(conversationId, currentUserProfile.value.id)
  }
}

const sendMessagePayload = async (payload: { contentType: 'text' | 'image' | 'product'; content: string; product?: ChatProductCard }) => {
  if (!activeConversationId.value || !currentUserProfile.value.id) {
    ElMessage.info('请先选择会话')
    return
  }
  try {
    await chatStore.sendMessage({
      conversationId: activeConversationId.value,
      senderId: currentUserProfile.value.id,
      contentType: payload.contentType,
      content: payload.content,
      product: payload.product,
    })
    chatStore.markConversationRead(activeConversationId.value, currentUserProfile.value.id)
    scrollToBottom()
  } catch (e) {
    ElMessage.error('发送消息失败，请重试')
    console.error('发送消息失败:', e)
  }
}

const sendTextMessage = () => {
  const text = inputMessage.value.trim()
  if (!text) return
  sendMessagePayload({
    contentType: 'text',
    content: text,
  })
  inputMessage.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

const sendQuickReply = (reply: string) => {
  inputMessage.value = reply
  sendTextMessage()
  showQuickReplies.value = false
}

const toggleQuickReplies = () => {
  showQuickReplies.value = !showQuickReplies.value
}

const openImagePicker = () => {
  imageInput.value?.click()
}

const handleImageSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    imageUploading.value = true
    ElMessage.info('图片上传中...')
    const result = await uploadChatImage(file)
    // 上传成功后发送图片消息（content 为服务端返回的 URL）
    await sendMessagePayload({
      contentType: 'image',
      content: result.url,
    })
    ElMessage.success('图片发送成功')
  } catch (e) {
    ElMessage.error('图片上传失败，请重试')
    console.error('图片上传失败:', e)
  } finally {
    imageUploading.value = false
    // 清空 input 以便重复选择同一文件
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

const sendProductCard = () => {
  const card = activeProductCard.value
  if (!card) {
    ElMessage.info('当前没有可发送的商品卡片')
    return
  }
  sendMessagePayload({
    contentType: 'product',
    content: '',
    product: card,
  })
}

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
}

const { goBack } = useSmartBack('/')

const viewSellerProfile = () => {
  if (!activePartner.value.id) return
  goToUserProfile(
    activePartner.value.id,
    activePartner.value.name,
    activePartner.value.avatar,
    activePartner.value.location,
  )
}

/** 点击消息头像跳转个人主页 */
const goToUserProfile = (userId: number, name?: string, avatar?: string, location?: string) => {
  if (!userId) return
  if (activeConversationId.value) {
    sessionStorage.setItem('chat_return_conv', JSON.stringify({
      conversationId: activeConversationId.value,
    }))
  }
  const query: Record<string, string | undefined> = {
    name,
    avatar,
    location: location || '未知',
  }
  // 带上当前正在聊的商品ID，回到主页点"沟通一下"时能恢复同一个商品
  const fromProductId = activeProductCard.value?.id
  if (fromProductId) {
    query.fromProductId = String(fromProductId)
  }
  router.push({
    path: `/user/home/${userId}`,
    query,
  })
}

/** 点击自己的头像 → 跳转个人中心（不是公开主页） */
const goToMyCenter = () => {
  if (!currentUserProfile.value.id) return
  router.push('/user/center')
}

const viewProductDetail = async () => {
  if (!activeProductCard.value?.id) return
  // 保存当前会话上下文，返回时恢复
  if (activeConversationId.value) {
    sessionStorage.setItem('chat_return_conv', JSON.stringify({
      conversationId: activeConversationId.value,
    }))
  }
  // 跳转前校验商品状态，已下架/删除的商品直接提示
  try {
    const raw = String(await getProductStatus(activeProductCard.value.id) || '').toLowerCase()
    if (raw === 'on_sale') {
      // 在售，允许跳转
    } else if (raw === 'deleted') {
      ElMessage.warning('该商品已被删除')
      return
    } else if (raw === 'draft') {
      ElMessage.warning('商品未上架')
      return
    } else if (raw === 'pending_review') {
      ElMessage.warning('商品审核中，暂时无法查看')
      return
    } else if (raw === 'rejected') {
      ElMessage.warning('商品审核未通过')
      return
    } else {
      ElMessage.warning('该商品已下架')
      return
    }
  } catch { /* 状态查询失败不阻塞跳转 */ }
  navigateToProductDetail(activeProductCard.value)
}

/** 点击消息中的商品卡片，跳转到对应商品详情 */
const goToProductDetail = async (card: ChatProductCard | undefined | null) => {
  if (!card?.id) return
  if (activeConversationId.value) {
    sessionStorage.setItem('chat_return_conv', JSON.stringify({
      conversationId: activeConversationId.value,
    }))
  }
  // 跳转前校验商品状态
  try {
    const raw = String(await getProductStatus(card.id) || '').toLowerCase()
    if (raw === 'on_sale') {
      // 在售，允许跳转
    } else if (raw === 'deleted') {
      ElMessage.warning('该商品已被删除')
      return
    } else if (raw === 'draft') {
      ElMessage.warning('商品未上架')
      return
    } else if (raw === 'pending_review') {
      ElMessage.warning('商品审核中，暂时无法查看')
      return
    } else if (raw === 'rejected') {
      ElMessage.warning('商品审核未通过')
      return
    } else {
      ElMessage.warning('该商品已下架')
      return
    }
  } catch { /* 状态查询失败不阻塞跳转 */ }
  navigateToProductDetail(card)
}

/** 根据当前用户是否是商品卖家，跳转卖家详情页或买家详情页 */
const navigateToProductDetail = (card: ChatProductCard) => {
  const currentUserId = currentUserProfile.value.id
  const isOwner = card.sellerId && currentUserId && card.sellerId === currentUserId
  if (isOwner) {
    router.push({ name: 'seller-product-detail', query: { id: String(card.id) } })
  } else {
    router.push({ name: 'goods-detail', params: { id: card.id } })
  }
}

const clearChat = () => {
  if (!activeConversationId.value) return
  if (!window.confirm('确定要清空聊天记录吗？')) return
  chatStore.clearConversation(activeConversationId.value)
  showMoreOptions.value = false
}

const reportUser = () => {
  ElMessage.success('举报已提交，我们会尽快处理')
  showMoreOptions.value = false
}

const blockUser = () => {
  ElMessage.info('拉黑功能开发中')
  showMoreOptions.value = false
}

/** 右键菜单：显示 */
const handleContextMenu = (event: MouseEvent, msg: { id: number; type: string; senderId: number; createdAt: number }) => {
  // 只能撤回自己 5 分钟内发送的消息
  const fiveMin = 5 * 60 * 1000
  const isOwn = msg.senderId === currentUserProfile.value.id
  const isWithin5Min = Date.now() - msg.createdAt < fiveMin
  if (!isOwn || !isWithin5Min) return

  contextMenuPos.value = { x: event.clientX, y: event.clientY }
  contextMenuMessage.value = msg
  contextMenuVisible.value = true
}

/** 右键菜单：隐藏 */
const hideContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuMessage.value = null
}

/** 撤回消息 */
const handleRecall = async () => {
  if (!contextMenuMessage.value || !activeConversationId.value) return
  try {
    await chatStore.recallMessage(contextMenuMessage.value.id, activeConversationId.value, currentUserProfile.value.id)
    ElMessage.success('消息已撤回')
  } catch (e) {
    ElMessage.error('撤回失败，可能已超过5分钟')
    console.error('撤回失败:', e)
  }
  hideContextMenu()
}

// 点击页面任意位置关闭右键菜单
window.addEventListener('click', hideContextMenu)

watch(
  () => activeConversationId.value,
  (conversationId) => {
    if (!conversationId || !currentUserProfile.value.id) return
    chatStore.markConversationRead(conversationId, currentUserProfile.value.id)
    fetchActiveProduct()
    scrollToBottom()
  },
  { immediate: true }
)

// 当通过路由切换商品（同一会话）时，更新顶部商品卡片
watch(
  () => route.query.productId,
  (productId) => {
    const pid = Number(productId || 0)
    if (pid && pid !== pendingProduct.value?.id) {
      initProductFromQuery()
    }
  }
)

watch(
  () => displayMessages.value.length,
  () => {
    scrollToBottom()
  }
)

const refreshFallbackPartnerNames = async () => {
  const userId = currentUserProfile.value.id
  if (!userId) return

  const partnerIds = new Set<number>()
  for (const conv of chatStore.conversations) {
    const partnerId = conv.userId
    const partnerName = conv.userNickname
    const userAvatar = (conv as Record<string, unknown>).userAvatar as string | undefined
    // 名字是兜底标签 或 缺少头像 → 需要刷新
    if (partnerId && (isFallbackUserLabel(partnerName, partnerId) || !userAvatar)) {
      partnerIds.add(partnerId)
    }
  }

  for (const partnerId of partnerIds) {
    try {
      const profile = await resolveUserDisplayProfile(partnerId)
      const patch: Partial<{ name: string; avatar: string }> = {}

      // 只在当前名字是兜底标签时才用 API 返回的名字覆盖，保护后端已返回的真实昵称
      const conv = chatStore.conversations.find((c) => c.userId === partnerId)
      if (conv && isFallbackUserLabel(conv.userNickname, partnerId)) {
        patch.name = profile.nickname
      }

      // 头像总是补充（因为进入此分支说明缺少头像）
      patch.avatar = profile.avatarUrl || ''

      chatStore.updateParticipantProfile(partnerId, patch)
    } catch (error) {
      console.error('刷新会话昵称/头像失败:', error)
    }
  }
}

onMounted(async () => {
  // 先检查登录状态，未登录就重定向，避免 initialize() 在未登录时拉取空数据
  if (!currentUserProfile.value.id) {
    ElMessage.info('请先登录再使用消息功能')
    router.push('/user/login')
    return
  }
  // 登录后再初始化会话列表
  await chatStore.initialize()
  // 初始化通知列表
  await noticeStore.refresh()
  // 检查是否从首页通知跳转过来，自动显示对应通知详情
  const noticeIdParam = route.query.noticeId
  if (noticeIdParam) {
    const numId = Number(noticeIdParam)
    const notice = noticeStore.notices.find(n => n.inboxId === numId)
    if (notice) {
      selectedNotice.value = notice
    }
  }
  await refreshFallbackPartnerNames()
  // 注意顺序：先创建/定位会话，再用 URL 的 productId 覆盖顶部商品卡片
  // 这样从不同商品进入同一卖家的会话时，顶部始终显示用户点进来的那个商品
  await createConversationFromRoute()
  await initProductFromQuery()
  // 无论通过哪种方式进入，加载当前会话绑定的商品卡片
  await fetchActiveProduct()
  // 如果没有加载到会话，尝试从 sessionStorage 恢复
  if (!activeConversationId.value) {
    try {
      const savedConv = sessionStorage.getItem('chat_return_conv')
      if (savedConv) {
        const ctx = JSON.parse(savedConv)
        if (ctx.conversationId) {
          activeConversationId.value = Number(ctx.conversationId)
          // 恢复后拉取消息缓存
          await chatStore.fetchMessages(Number(ctx.conversationId))
        }
      }
    } catch { /* ignore */ }
  }
  syncActiveConversation()
  if (activeConversationId.value) {
    chatStore.markConversationRead(activeConversationId.value, currentUserProfile.value.id)
  }
  sidebarOpen.value = false
  scrollToBottom()

  // 启动轮询
  startPolling()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #f5f7fb 0%, #f9fafc 100%);
  display: flex;
}

.friend-sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
}

/* ========== 通知列表（置顶在消息上方） ========== */

.notice-list {
  max-height: 200px;
  overflow-y: auto;
  border-bottom: 2px solid #e5e7eb;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 150ms;
  border-bottom: 1px solid #f5f5f5;
}

.notice-item:hover {
  background: #f9fafb;
}

.notice-item.unread {
  background: #eff6ff;
}

.notice-item.unread:hover {
  background: #dbeafe;
}

.notice-item.selected {
  background: #fff7ed;
  border-left: 3px solid #f97316;
}

.notice-item.selected:hover {
  background: #ffedd5;
}

.notice-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-icon.notice-system {
  background: #e0e7ff;
  color: #4f46e5;
}

.notice-icon.notice-announcement {
  background: #fef3c7;
  color: #d97706;
}

.notice-icon.notice-warning {
  background: #fce4ec;
  color: #dc2626;
}

.notice-icon.notice-notification {
  background: #dbeafe;
  color: #2563eb;
}

.notice-info {
  flex: 1;
  min-width: 0;
}

.notice-title {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-preview {
  margin: 0;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.notice-time {
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
}

/* ========== 消息列表 ========== */

.friend-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
}

.friend-header h3 {
  margin: 0;
}

.friend-count,
.unread-badge {
  background: #f97316;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  padding: 2px 8px;
}

.friend-list {
  flex: 1;
  overflow-y: auto;
}

.friend-empty {
  margin: 24px 16px;
  padding: 16px;
  border-radius: 12px;
  color: #6b7280;
  background: #f9fafb;
  font-size: 13px;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 180ms ease, transform 180ms ease;
}

.friend-item:hover {
  background: #f9fafb;
}

.friend-item.active {
  background: #fff7ed;
  border-left: 3px solid #f97316;
}

.friend-avatar,
.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.friend-avatar img,
.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: #f97316;
  color: #fff;
  font-weight: 700;
}

.avatar-placeholder.small {
  font-size: 12px;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 600;
}

.last-message {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.last-time {
  font-size: 11px;
  color: #9ca3af;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(6px);
}

.header-inner {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.seller-name {
  margin: 0;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seller-status {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
  background: #10b981;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn,
.back-btn,
.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 140ms ease;
}

.back-btn:hover,
.action-btn:hover,
.toolbar-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.tip-btn {
  position: relative;
}

.tip-btn::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.86);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
  white-space: nowrap;
}

.tip-btn:hover::after {
  opacity: 1;
}

.product-card {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: #fff;
  transition: box-shadow 180ms ease;
}

.product-card:hover {
  box-shadow: 0 8px 18px rgba(249, 115, 22, 0.12);
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-title {
  margin: 0 0 3px;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-price {
  margin: 0;
  color: #f97316;
  font-weight: 700;
}

.product-original-price {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-decoration: line-through;
}

.btn-view-product {
  border: none;
  background: transparent;
  color: #9ca3af;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.time-divider {
  display: flex;
  justify-content: center;
  margin: 4px 0;
}

.time-text {
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
}

.system-message {
  display: flex;
  justify-content: center;
}

.system-text {
  font-size: 12px;
  color: #6b7280;
  padding: 5px 10px;
  border-radius: 12px;
  background: #eef2ff;
}

.messages-empty {
  margin: 20px auto;
  color: #9ca3af;
  font-size: 13px;
}

.msg-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 86%;
}

.message-item.sent {
  margin-left: auto;
}

.message-main {
  display: flex;
  flex-direction: column;
}

.message-item.sent .message-main {
  align-items: flex-end;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
}

.message-avatar.clickable {
  cursor: pointer;
  transition: transform 0.15s;
}
.message-avatar.clickable:hover {
  transform: scale(1.1);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  box-shadow: 0 2px 10px rgba(30, 41, 59, 0.08);
  max-width: min(480px, 75vw);
}

.message-item.sent .message-bubble {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
  color: #fff;
}

.text-content {
  line-height: 1.5;
  word-break: break-word;
}

.image-content img {
  max-width: min(220px, 55vw);
  max-height: 220px;
  border-radius: 10px;
  display: block;
}

.product-content {
  cursor: pointer;
}

.product-mini {
  display: flex;
  gap: 8px;
  border-radius: 10px;
  padding: 8px;
  background: #f9fafb;
  min-width: 220px;
}

.message-item.sent .product-mini {
  background: rgba(255, 255, 255, 0.24);
}

.product-mini img {
  width: 54px;
  height: 54px;
  border-radius: 8px;
  object-fit: cover;
}

.product-mini-title {
  margin: 0 0 4px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-mini-price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.product-mini-price {
  margin: 0;
  font-weight: 700;
  color: #f97316;
}

.product-mini-original-price {
  margin: 0;
  font-size: 11px;
  color: #9ca3af;
  text-decoration: line-through;
}

.message-item.sent .product-mini-price {
  color: #fff;
}

.message-item.sent .product-mini-original-price {
  color: rgba(255, 255, 255, 0.6);
}

.product-mini-invalid {
  background: #f9fafb;
  justify-content: center;
  min-width: 180px;
  padding: 12px;
}

.product-mini-placeholder {
  font-size: 13px;
  color: #9ca3af;
}

.message-time {
  margin: 4px 2px 0;
  font-size: 11px;
  color: #9ca3af;
}

.message-status {
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
}

.sending,
.sent {
  color: #9ca3af;
}

.delivered {
  color: #3b82f6;
}

.failed {
  color: #ef4444;
}

.quick-replies {
  border-top: 1px solid #e5e7eb;
  background: #fff;
  padding: 10px 16px;
}

.quick-reply-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.quick-reply-list::-webkit-scrollbar {
  display: none;
}

.quick-reply-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background: #f3f4f6;
  color: #374151;
  white-space: nowrap;
  transition: background 120ms ease;
}

.quick-reply-btn:hover {
  background: #e5e7eb;
}

.chat-input-area {
  border-top: 1px solid #e5e7eb;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.input-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  padding: 10px 14px;
  max-height: 130px;
  resize: none;
  background: #f9fafb;
  outline: none;
}

.message-input:focus {
  border-color: #f97316;
  background: #fff;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.send-btn.active {
  background: #f97316;
  color: #fff;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.36);
  display: flex;
  align-items: flex-end;
  z-index: 50;
}

.more-options-modal {
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 12px;
  animation: modal-slide-in 180ms ease both;
}

.option-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 14px;
  border-radius: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.option-item:hover {
  background: #f3f4f6;
}

.hidden {
  display: none;
}

.only-mobile {
  display: none;
}

@media (max-width: 900px) {
  .only-mobile {
    display: grid;
  }

  .friend-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform 220ms ease;
    width: min(86vw, 320px);
  }

  .friend-sidebar.open {
    transform: translateX(0);
  }

  .message-item {
    max-width: 96%;
  }
}

@media (max-width: 600px) {
  .header-inner {
    padding: 10px 12px;
  }

  .chat-messages {
    padding: 10px 12px;
  }

  .chat-input-area {
    padding: 10px 12px;
  }

  .product-mini {
    min-width: 180px;
  }
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-fade-enter-active,
.list-fade-leave-active,
.message-pop-enter-active,
.message-pop-leave-active {
  transition: all 180ms ease;
}

.list-fade-enter-from,
.list-fade-leave-to,
.message-pop-enter-from,
.message-pop-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* 撤回提示 — 居中显示 */
.recall-notice {
  display: flex;
  justify-content: center;
  margin: 4px 0;
}

.recall-text {
  font-size: 12px;
  color: #9ca3af;
  padding: 4px 12px;
  border-radius: 999px;
  background: #f3f4f6;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  z-index: 100;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 120px;
  animation: modal-slide-in 120ms ease both;
}

.context-menu-item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 14px;
  border-radius: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu-item:hover {
  background: #f3f4f6;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

/* ========== 通知详情视图 ========== */

.notice-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(6px);
}

.notice-detail-header-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.notice-detail-header-info i {
  color: #f97316;
  font-size: 16px;
}

.notice-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.notice-detail-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
}

.notice-detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.notice-detail-time {
  font-size: 13px;
  color: #9ca3af;
}

.notice-detail-divider {
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 20px;
}

.notice-detail-content {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
