<template>
  <div class="chat-page">
    <!-- 好友列表侧边栏 -->
    <aside class="friend-sidebar">
      <div class="friend-header">
        <h3>消息</h3>
        <span v-if="totalUnreadCount > 0" class="friend-count">{{ unreadCountDisplay }}</span>
      </div>

      <div class="friend-list">
        <div
          v-for="friend in friends"
          :key="friend.id"
          class="friend-item"
          :class="{ active: friend.id === seller.id }"
          @click="switchFriend(friend)"
        >
          <div class="friend-avatar">
            <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.name">
            <div v-else class="avatar-placeholder small">
              {{ friend.name.charAt(0) }}
            </div>
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ friend.name }}</p>
            <p class="last-message">
              {{ friend.lastMessage }}
            </p>
          </div>
          <div class="friend-meta">
            <span class="last-time">{{ friend.lastTime }}</span>
            <span v-if="friend.unread" class="unread-badge">
              {{ friend.unread }}
            </span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 顶部导航 -->
      <div class="chat-header">
        <div class="header-inner">
          <button class="back-btn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <div class="seller-info">
            <div class="seller-avatar">
              <img v-if="seller.avatar" :src="seller.avatar" :alt="seller.name">
              <div v-else class="avatar-placeholder">
                {{ seller.name?.charAt(0) || '卖' }}
              </div>
            </div>
            <div class="seller-details">
              <h3 class="seller-name">{{ seller.name }}</h3>
              <p class="seller-status">
                <span class="online-dot"></span>
                在线 · 信用分 {{ seller.rating }}
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

      <!-- 商品信息卡片 -->
      <div class="product-card" v-if="product" @click="viewProductDetail">
        <div class="product-image">
          <img :src="product.image" :alt="product.title" @error="(e: Event) => { const t = e.target as HTMLImageElement; if (t) t.src = PLACEHOLDER_IMG }">
        </div>
        <div class="product-info">
          <h4 class="product-title">{{ product.title }}</h4>
          <p class="product-price">¥{{ product.price }}</p>
        </div>
        <button class="btn-view-product" title="查看商品详情">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div class="message-list">
          <div class="system-message">
            <span class="system-text">你们已成为好友，开始聊天吧</span>
          </div>

          <div class="time-divider">
            <span class="time-text">今天 14:30</span>
          </div>

          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message-item', msg.type === 'sent' ? 'sent' : 'received']"
          >
            <div v-if="msg.type === 'received'" class="message-avatar">
              <img v-if="seller.avatar" :src="seller.avatar" :alt="seller.name">
              <div v-else class="avatar-placeholder small">
                {{ seller.name?.charAt(0) || '卖' }}
              </div>
            </div>

            <div class="message-bubble">
              <div v-if="msg.contentType === 'text'" class="text-content">
                {{ msg.content }}
              </div>

              <div v-else-if="msg.contentType === 'image'" class="image-content">
                <img :src="msg.content" alt="图片消息">
              </div>

              <div v-else-if="msg.contentType === 'product'" class="product-content" @click="viewProductDetail">
                <div class="product-mini">
                  <img :src="msg.productImage" :alt="msg.productTitle">
                  <div class="product-mini-info">
                    <p class="product-mini-title">{{ msg.productTitle }}</p>
                    <p class="product-mini-price">¥{{ msg.productPrice }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="msg.type === 'sent'" class="message-status">
              <i v-if="msg.status === 'sending'" class="fa fa-clock-o sending"></i>
              <i v-else-if="msg.status === 'sent'" class="fa fa-check sent"></i>
              <i v-else-if="msg.status === 'delivered'" class="fa fa-check-double delivered"></i>
              <i v-else-if="msg.status === 'failed'" class="fa fa-exclamation-circle failed"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷回复 -->
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

      <!-- 输入区域 -->
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
            @keydown.enter.prevent="sendMessage"
            @input="autoResize"
            ref="textareaRef"
          ></textarea>
          <button
            class="send-btn"
            :class="{ active: inputMessage.trim().length > 0 }"
            @click="sendMessage"
            :disabled="inputMessage.trim().length === 0"
          >
            <i class="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 更多选项弹窗 -->
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
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

defineOptions({ name: 'ChatPage' })

const router = useRouter()
const route = useRoute()
const CHAT_FRIENDS_STORAGE_KEY = 'chat_friends'

interface Friend {
  id: number
  name: string
  avatar: string
  lastMessage: string
  lastTime: string
  unread?: number
  rating: number
  location: string
}

interface Message {
  id: number
  type: 'sent' | 'received'
  contentType: 'text' | 'image' | 'product'
  content: string
  productTitle?: string
  productPrice?: number
  productImage?: string
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'failed'
}

interface Product {
  id: number
  title: string
  price: number
  image: string
}

const messagesContainer = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()
const imageInput = ref<HTMLInputElement>()
const productLoading = ref(false)

// 从路由参数初始化商品信息
const initProduct = () => {
  const productId = route.query.productId
  const sellerId = route.query.sellerId
  const sellerName = route.query.sellerName
  const sellerAvatar = route.query.sellerAvatar
  if (productId) {
    productLoading.value = true
    getProductDetail(Number(productId))
      .then(data => {
        let imageUrl = ''
        if (data.image) {
          imageUrl = getImageUrl(data.image)
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          const firstImg = data.images[0]
          if (firstImg) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            imageUrl = getImageUrl((firstImg as any).url || (firstImg as any).imageUrl || '')
          }
        }
        product.value = {
          id: data.id,
          title: data.title || '',
          price: Number(data.sellingPrice ?? data.price ?? 0),
          image: imageUrl || PLACEHOLDER_IMG,
        }
      })
      .catch(err => {
        console.error('获取商品详情失败:', err)
      })
      .finally(() => {
        productLoading.value = false
      })
  }
  // 如果没有卖家信息但有 sellerId，也设置一下
  if (sellerId && sellerName && !seller.value.id) {
    seller.value = {
      id: Number(sellerId),
      name: String(sellerName),
      avatar: String(sellerAvatar || ''),
      lastMessage: '',
      lastTime: '',
      rating: 0,
      location: '',
    }
  }
}

const friends = ref<Friend[]>([
  {
    id: 1,
    name: '数码小王子',
    avatar: '',
    lastMessage: '还在的，成色很新',
    lastTime: '14:33',
    unread: 2,
    rating: 4.8,
    location: '北京'
  },
  {
    id: 2,
    name: '电脑专家',
    avatar: '',
    lastMessage: '可以面交',
    lastTime: '昨天',
    rating: 4.9,
    location: '深圳'
  },
  {
    id: 3,
    name: '游戏达人',
    avatar: '',
    lastMessage: '支持验机',
    lastTime: '3天前',
    rating: 4.7,
    location: '上海'
  }
])

const mergeStoredFriends = () => {
  const stored = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as Friend[]
  if (!Array.isArray(stored) || stored.length === 0) return

  const friendMap = new Map<number, Friend>()
  for (const friend of friends.value) {
    friendMap.set(friend.id, friend)
  }
  for (const friend of stored) {
    if (typeof friend.id === 'number' && friend.id > 0) {
      friendMap.set(friend.id, friend)
    }
  }
  friends.value = Array.from(friendMap.values())
}

const defaultSeller: Friend = {
  id: 0,
  name: '默认卖家',
  avatar: '',
  lastMessage: '',
  lastTime: '',
  rating: 5,
  location: ''
}
const seller = ref<Friend>(friends.value[0] ?? defaultSeller)

const product = ref<Product>({
  id: 1,
  title: '九成新iPhone 13 Pro 256G',
  price: 4599,
  image: 'https://via.placeholder.com/300x300?text=iPhone+13+Pro'
})

const messages = ref<Message[]>([
  {
    id: 1,
    type: 'received',
    contentType: 'text',
    content: '您好，这个手机还在吗？',
    timestamp: '14:30',
    status: 'delivered'
  },
  {
    id: 2,
    type: 'sent',
    contentType: 'text',
    content: '还在的，成色很新，电池健康度还有88%',
    timestamp: '14:31',
    status: 'delivered'
  },
  {
    id: 3,
    type: 'received',
    contentType: 'text',
    content: '能便宜一点吗？',
    timestamp: '14:32',
    status: 'delivered'
  },
  {
    id: 4,
    type: 'sent',
    contentType: 'text',
    content: '4500最低了，已经比市场价低很多了',
    timestamp: '14:33',
    status: 'delivered'
  }
])

const inputMessage = ref('')
const showQuickReplies = ref(false)
const showMoreOptions = ref(false)

const quickReplies = [
  '还在的',
  '最低价了',
  '可以面交',
  '包邮',
  '支持验机',
  '可以小刀'
]

const totalUnreadCount = computed(() =>
  friends.value.reduce((sum, friend) => sum + Math.max(friend.unread ?? 0, 0), 0)
)

const unreadCountDisplay = computed(() =>
  totalUnreadCount.value > 99 ? '99+' : String(totalUnreadCount.value)
)

const switchFriend = (friend: Friend) => {
  seller.value = friend
  if (friend.unread) {
    friend.unread = 0
  }
  // 实际项目中这里应加载该好友的消息记录
  messages.value = []
  scrollToBottom()
}

const goBack = () => {
  router.back()
}

const sendMessage = () => {
  if (inputMessage.value.trim().length === 0) return

  const newMessage: Message = {
    id: messages.value.length + 1,
    type: 'sent',
    contentType: 'text',
    content: inputMessage.value.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sending'
  }

  messages.value.push(newMessage)
  inputMessage.value = ''

  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  scrollToBottom()

  setTimeout(() => {
    const msg = messages.value.find(m => m.id === newMessage.id)
    if (msg) {
      msg.status = 'delivered'
    }
  }, 1000)

  setTimeout(() => {
    const autoReply: Message = {
      id: messages.value.length + 1,
      type: 'received',
      contentType: 'text',
      content: '好的，我考虑一下',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    }
    messages.value.push(autoReply)
    scrollToBottom()
  }, 2000)
}

const sendQuickReply = (reply: string) => {
  inputMessage.value = reply
  sendMessage()
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
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newMessage: Message = {
        id: messages.value.length + 1,
        type: 'sent',
        contentType: 'image',
        content: e.target?.result as string,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      }
      messages.value.push(newMessage)
      scrollToBottom()
    }
    reader.readAsDataURL(file)
  }
}

const sendProductCard = () => {
  if (!product.value) return

  const newMessage: Message = {
    id: messages.value.length + 1,
    type: 'sent',
    contentType: 'product',
    content: '',
    productTitle: product.value.title,
    productPrice: product.value.price,
    productImage: product.value.image,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'delivered'
  }
  messages.value.push(newMessage)
  scrollToBottom()
}

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const viewSellerProfile = () => {
  if (!seller.value?.id) return
  router.push({
    path: `/user/home/${seller.value.id}`,
    query: {
      name: seller.value.name || '',
      avatar: seller.value.avatar || '',
      location: seller.value.location || '未知',
    },
  })
}

const viewProductDetail = () => {
  if (product.value) {
    router.push({ name: 'goods-detail', params: { id: product.value.id } })
  }
}

const clearChat = () => {
  if (confirm('确定要清空聊天记录吗？')) {
    messages.value = []
    showMoreOptions.value = false
  }
}

const reportUser = () => {
  alert('举报功能开发中...')
  showMoreOptions.value = false
}

const blockUser = () => {
  if (confirm('确定要拉黑该用户吗？')) {
    alert('已拉黑该用户')
    showMoreOptions.value = false
  }
}

onMounted(() => {
  mergeStoredFriends()
  // 初始化商品信息（从商品详情页跳转过来时）
  initProduct()
  const selectedFriendId = Number(route.query.friendId)
  if (Number.isFinite(selectedFriendId) && selectedFriendId > 0) {
    const target = friends.value.find(friend => friend.id === selectedFriendId)
    if (target) {
      seller.value = target
      if (target.unread) {
        target.unread = 0
      }
    }
  }
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  animation: pageEnter 260ms ease both;
}

/* 好友列表 */
.friend-sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 20px rgba(17, 24, 39, 0.06);
}

.friend-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.friend-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.friend-count {
  background: #f97316;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.friend-list {
  flex: 1;
  overflow-y: auto;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 180ms, transform 180ms;
  border-bottom: 1px solid #f3f4f6;
  animation: listItemEnter 320ms ease both;
}

.friend-item:hover {
  background: #f9fafb;
  transform: translateX(2px);
}

.friend-item.active {
  background: #fff7ed;
  border-left: 3px solid #f97316;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.friend-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.last-time {
  font-size: 11px;
  color: #9ca3af;
}

.unread-badge {
  background: #f97316;
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 原有样式保持不变 */
.chat-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  backdrop-filter: blur(6px);
}

.header-inner {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 18px;
}

.seller-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.seller-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f97316;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.avatar-placeholder.small {
  font-size: 12px;
}

.seller-details {
  min-width: 0;
}

.seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 2px;
}

.seller-status {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms;
  position: relative;
}

.action-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.tip-btn::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(-2px);
  background: rgba(17, 24, 39, 0.88);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  border-radius: 999px;
  padding: 6px 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease, transform 150ms ease;
}

.tip-btn:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.product-card {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 150ms, box-shadow 180ms, transform 180ms;
  position: relative;
}

.product-card:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(249, 115, 22, 0.12);
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
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
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #f97316;
  margin: 0;
}

.btn-view-product {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  position: relative;
}

.btn-view-product::after {
  content: attr(title);
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) translateX(4px);
  background: rgba(17, 24, 39, 0.88);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  padding: 6px 10px;
  border-radius: 999px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
}

.btn-view-product:hover::after {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scroll-behavior: smooth;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.system-message {
  display: flex;
  justify-content: center;
  margin: 8px 0;
}

.system-text {
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 12px;
}

.time-divider {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.time-text {
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 10px;
}

.message-item {
  display: flex;
  gap: 8px;
  max-width: 80%;
  animation: bubbleIn 220ms ease both;
}

.message-item.sent {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-item.received {
  margin-right: auto;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #e5e7eb;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  background: #fff;
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 150ms, box-shadow 150ms;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(17, 24, 39, 0.1);
}

.message-item.sent .message-bubble {
  background: #f97316;
  color: #fff;
}

.text-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.image-content img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  display: block;
}

.product-content {
  cursor: pointer;
}

.product-mini {
  display: flex;
  gap: 8px;
  background: #f9fafb;
  padding: 8px;
  border-radius: 8px;
  min-width: 200px;
}

.message-item.sent .product-mini {
  background: rgba(255, 255, 255, 0.2);
}

.product-mini img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  object-fit: cover;
}

.product-mini-info {
  flex: 1;
  min-width: 0;
}

.product-mini-title {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-item.sent .product-mini-title {
  color: #fff;
}

.product-mini-price {
  font-size: 14px;
  font-weight: 600;
  color: #f97316;
  margin: 0;
}

.message-item.sent .product-mini-price {
  color: #fff;
}

.message-status {
  display: flex;
  align-items: flex-end;
  padding-bottom: 4px;
}

.message-status i {
  font-size: 12px;
}

.message-status .sending {
  color: #9ca3af;
}

.message-status .sent {
  color: #9ca3af;
}

.message-status .delivered {
  color: #3b82f6;
}

.message-status .failed {
  color: #ef4444;
}

.quick-replies {
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  animation: quickRepliesEnter 180ms ease both;
}

.quick-reply-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.quick-reply-list::-webkit-scrollbar {
  display: none;
}

.quick-reply-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms;
}

.quick-reply-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.chat-input-area {
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.input-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 150ms;
}

.toolbar-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  resize: none;
  outline: none;
  max-height: 120px;
  line-height: 1.5;
  background: #f9fafb;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
}

.send-btn.active {
  background: #f97316;
  color: #fff;
  cursor: pointer;
}

.send-btn.active:hover {
  background: #ea580c;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.more-options-modal {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  padding: 16px;
}

.option-item {
  width: 100%;
  padding: 16px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #374151;
  cursor: pointer;
  border-radius: 8px;
  transition: background 150ms;
}

.option-item:hover {
  background: #f3f4f6;
}

.option-item i {
  width: 24px;
  text-align: center;
  color: #6b7280;
}

.hidden {
  display: none;
}

/* 响应式 */
@media (max-width: 900px) {
  .friend-sidebar {
    display: none;
  }

  .chat-main {
    width: 100%;
  }

  .chat-header {
    position: sticky;
    top: 0;
  }

  .message-item {
    max-width: 92%;
  }
}

@media (max-width: 600px) {
  .header-inner {
    padding: 10px 12px;
  }

  .chat-messages {
    padding: 12px;
  }

  .chat-input-area {
    padding: 10px 12px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes listItemEnter {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes quickRepliesEnter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pageEnter {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>