<template>
  <div class="chat-page">
    <aside class="friend-sidebar" :class="{ open: sidebarOpen }">
      <div class="friend-header">
        <h3>消息</h3>
        <span v-if="totalUnreadCount > 0" class="friend-count">{{ unreadCountDisplay }}</span>
      </div>

      <div v-if="threads.length === 0" class="friend-empty">
        暂无会话，去商品页点击“咨询卖家”开始聊天
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
              <img v-if="thread.partner.avatar" :src="thread.partner.avatar" :alt="thread.partner.name">
              <div v-else class="avatar-placeholder small">
                {{ thread.partner.name.charAt(0) }}
              </div>
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
              <img v-if="activePartner.avatar" :src="activePartner.avatar" :alt="activePartner.name">
              <div v-else class="avatar-placeholder">
                {{ activePartner.name.charAt(0) }}
              </div>
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
          <p class="product-price">¥{{ activeProductCard.price }}</p>
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

          <transition-group name="message-pop" tag="div" class="msg-group">
            <div
              v-for="msg in displayMessages"
              :key="msg.id"
              :class="['message-item', msg.type === 'sent' ? 'sent' : 'received']"
            >
              <div v-if="msg.type === 'received'" class="message-avatar">
                <img v-if="activePartner.avatar" :src="activePartner.avatar" :alt="activePartner.name">
                <div v-else class="avatar-placeholder small">
                  {{ activePartner.name.charAt(0) }}
                </div>
              </div>

              <div class="message-main">
                <div class="message-bubble">
                  <div v-if="msg.contentType === 'text'" class="text-content">
                    {{ msg.content }}
                  </div>
                  <div v-else-if="msg.contentType === 'image'" class="image-content">
                    <img :src="msg.content" alt="图片消息">
                  </div>
                  <div v-else-if="msg.contentType === 'product'" class="product-content" @click="viewProductDetail">
                    <div class="product-mini">
                      <img :src="msg.product?.image || PLACEHOLDER_IMG" :alt="msg.product?.title || '商品'">
                      <div class="product-mini-info">
                        <p class="product-mini-title">{{ msg.product?.title || '商品卡片' }}</p>
                        <p class="product-mini-price">¥{{ msg.product?.price ?? 0 }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="message-time">{{ formatTime(msg.createdAt) }}</p>
              </div>

              <div v-if="msg.type === 'sent'" class="message-status">
                <i v-if="msg.status === 'sending'" class="fa fa-clock-o sending"></i>
                <i v-else-if="msg.status === 'sent'" class="fa fa-check sent"></i>
                <i v-else-if="msg.status === 'delivered'" class="fa fa-check-double delivered"></i>
                <i v-else class="fa fa-exclamation-circle failed"></i>
              </div>
            </div>
          </transition-group>
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
          <button class="toolbar-btn" @click="openImagePicker">
            <i class="fa fa-image"></i>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/goods'
import { resolveUserDisplayProfile, isFallbackUserLabel } from '@/api/user'
import { useUserStore } from '@/stores/userStore'
import { useChatStore, type ChatProductCard, type ChatUserProfile } from '@/stores/chatStore'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

defineOptions({ name: 'ChatPage' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const chatStore = useChatStore()

const CHAT_FRIENDS_STORAGE_KEY = 'chat_friends'
const quickReplies = ['你好，在吗？', '这个还有货吗？', '可以小刀吗？', '支持面交吗？', '什么时候方便？']

const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const imageInput = ref<HTMLInputElement>()
const inputMessage = ref('')
const showQuickReplies = ref(false)
const showMoreOptions = ref(false)
const sidebarOpen = ref(false)

const activeConversationId = ref('')
const pendingProduct = ref<ChatProductCard | null>(null)

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

const unreadCountDisplay = computed(() =>
  totalUnreadCount.value > 99 ? '99+' : String(totalUnreadCount.value)
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
  return activeThread.value?.linkedProduct || pendingProduct.value
})

const displayMessages = computed(() => {
  if (!activeConversationId.value || !currentUserProfile.value.id) return []
  return chatStore.getConversationMessages(activeConversationId.value).map((message) => ({
    ...message,
    type: message.senderId === currentUserProfile.value.id ? 'sent' : 'received',
  }))
})

const formatTime = (timestamp: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  return isToday
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString()
}

const getLegacyFriend = (targetId: number) => {
  const legacy = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as ChatUserProfile[]
  return legacy.find((friend) => Number(friend.id) === targetId) || null
}

const createConversationFromRoute = async () => {
  const current = currentUserProfile.value
  if (!current.id) return
  const routeFriendId = Number(route.query.friendId || route.query.sellerId || 0)
  if (!routeFriendId || routeFriendId === current.id) return

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
  const conversation = chatStore.ensureConversation(current, target, activeProductCard.value || undefined)
  if (conversation) {
    activeConversationId.value = conversation.id
  }
}

const initProductFromQuery = async () => {
  const productId = Number(route.query.productId || 0)
  if (!productId) return
  try {
    const detail = await getProductDetail(productId)
    const image = detail.image
      ? getImageUrl(detail.image)
      : Array.isArray(detail.images) && detail.images[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? getImageUrl(((detail.images[0] as any).url || (detail.images[0] as any).imageUrl || ''))
        : PLACEHOLDER_IMG
    pendingProduct.value = {
      id: detail.id,
      title: detail.title || `商品${detail.id}`,
      price: Number(detail.sellingPrice ?? detail.price ?? 0),
      image,
    }
  } catch (error) {
    console.error('加载咨询商品失败', error)
  }
}

const syncActiveConversation = () => {
  if (!threads.value.length) {
    activeConversationId.value = ''
    return
  }
  const stillExists = threads.value.some((thread) => thread.conversationId === activeConversationId.value)
  if (!stillExists) {
    activeConversationId.value = threads.value[0]?.conversationId || ''
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const switchThread = (conversationId: string) => {
  activeConversationId.value = conversationId
  sidebarOpen.value = false
  if (currentUserProfile.value.id) {
    chatStore.markConversationRead(conversationId, currentUserProfile.value.id)
  }
}

const sendMessagePayload = (payload: { contentType: 'text' | 'image' | 'product'; content: string; product?: ChatProductCard }) => {
  if (!activeConversationId.value || !currentUserProfile.value.id) {
    ElMessage.info('请先选择会话')
    return
  }
  chatStore.sendMessage({
    conversationId: activeConversationId.value,
    senderId: currentUserProfile.value.id,
    contentType: payload.contentType,
    content: payload.content,
    product: payload.product,
  })
  chatStore.markConversationRead(activeConversationId.value, currentUserProfile.value.id)
  scrollToBottom()
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

const handleImageSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    sendMessagePayload({
      contentType: 'image',
      content: String(e.target?.result || ''),
    })
  }
  reader.readAsDataURL(file)
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

const goBack = () => {
  router.back()
}

const viewSellerProfile = () => {
  if (!activePartner.value.id) return
  router.push({
    path: `/user/home/${activePartner.value.id}`,
    query: {
      name: activePartner.value.name,
      avatar: activePartner.value.avatar,
      location: activePartner.value.location || '未知',
    },
  })
}

const viewProductDetail = () => {
  if (!activeProductCard.value?.id) return
  router.push({ name: 'goods-detail', params: { id: activeProductCard.value.id } })
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

watch(
  () => activeConversationId.value,
  (conversationId) => {
    if (!conversationId || !currentUserProfile.value.id) return
    chatStore.markConversationRead(conversationId, currentUserProfile.value.id)
    scrollToBottom()
  },
  { immediate: true }
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
    if (!conv.participantIds.includes(userId)) continue
    const partnerId = conv.participantIds[0] === userId ? conv.participantIds[1] : conv.participantIds[0]
    const partner = conv.participants[String(partnerId)]
    if (partner && isFallbackUserLabel(partner.name, partnerId)) {
      partnerIds.add(partnerId)
    }
  }

  for (const partnerId of partnerIds) {
    try {
      const profile = await resolveUserDisplayProfile(partnerId)
      chatStore.updateParticipantProfile(partnerId, {
        name: profile.nickname,
        avatar: profile.avatarUrl || '',
      })
    } catch (error) {
      console.error('刷新会话昵称失败:', error)
    }
  }
}

onMounted(async () => {
  chatStore.initialize()
  if (!currentUserProfile.value.id) {
    ElMessage.info('请先登录再使用消息功能')
    router.push('/user/login')
    return
  }
  await refreshFallbackPartnerNames()
  await initProductFromQuery()
  await createConversationFromRoute()
  syncActiveConversation()
  if (activeConversationId.value) {
    chatStore.markConversationRead(activeConversationId.value, currentUserProfile.value.id)
  }
  sidebarOpen.value = false
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
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

.product-price {
  margin: 0;
  color: #f97316;
  font-weight: 700;
}

.btn-view-product {
  border: none;
  background: transparent;
  color: #9ca3af;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  flex-direction: row-reverse;
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
}

.product-mini-price {
  margin: 0;
  font-weight: 700;
  color: #f97316;
}

.message-item.sent .product-mini-price {
  color: #fff;
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

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
</style>
