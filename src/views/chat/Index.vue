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
      <div class="product-card" v-if="product" @click="viewProductDetail()">
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

          <template
            v-for="(msg, index) in messages"
            :key="msg.id"
          >
            <!-- 动态时间分隔线：当前消息与前一条不在同一天时显示 -->
            <div
              v-if="showDateDivider(index, msg.timestamp)"
              class="time-divider"
            >
              <span class="time-text">{{ formatDateLabel(msg.timestamp) }}</span>
            </div>
            <!-- 已撤回消息：居中提示 -->
            <div v-if="msg.recalled" class="recall-notice">
              <span class="recall-notice-text">
                {{ msg.senderId !== conversationOtherUserId ? '你' : '对方' }}撤回了一条消息
              </span>
            </div>

            <!-- 正常消息 -->
            <div v-else :class="['message-item', msg.type === 'sent' ? 'sent' : 'received']">
              <div v-if="msg.type === 'received'" class="message-avatar">
                <img v-if="seller.avatar" :src="seller.avatar" :alt="seller.name">
                <div v-else class="avatar-placeholder small">
                  {{ seller.name?.charAt(0) || '卖' }}
                </div>
              </div>

              <div
                class="message-bubble"
                @contextmenu.prevent="onMessageContextMenu($event, msg)"
              >
                <div v-if="msg.contentType === 'text'" class="text-content">
                  {{ msg.content }}
                </div>

                <div v-else-if="msg.contentType === 'image'" class="image-content">
                  <img :src="msg.content" alt="图片消息">
                </div>

                <div v-else-if="msg.contentType === 'product'" class="product-content">
                  <div class="product-mini" @click.stop="viewProductDetail(msg.productId)">
                    <img :src="msg.productImage || PLACEHOLDER_IMG" :alt="msg.productTitle" @error="(e: Event) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG">
                    <div class="product-mini-info">
                      <p class="product-mini-title">{{ msg.productTitle }}</p>
                      <p class="product-mini-price">¥{{ msg.productPrice }}</p>
                    </div>
                  </div>
                </div>

                <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
              </div>

              <div v-if="msg.type === 'sent'" class="message-status">
                <i v-if="msg.status === 'sending'" class="fa fa-clock-o sending"></i>
                <i v-else-if="msg.status === 'sent'" class="fa fa-check sent"></i>
                <i v-else-if="msg.status === 'delivered'" class="fa fa-check-double delivered"></i>
                <i v-else-if="msg.status === 'failed'" class="fa fa-exclamation-circle failed"></i>
              </div>
            </div>
          </template>
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

    <!-- 右键撤回菜单 -->
    <Teleport to="body">
      <div
        v-if="recallMenu.visible"
        class="recall-overlay"
        @click="hideRecallMenu"
        @contextmenu.prevent="hideRecallMenu"
      >
        <div
          class="recall-menu"
          :style="{ left: recallMenu.x + 'px', top: recallMenu.y + 'px' }"
          @click.stop
        >
          <button class="recall-item" @click="handleRecall">
            <i class="fa fa-undo"></i>
            <span>撤回消息</span>
          </button>
        </div>
      </div>
    </Teleport>

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
import { getConversationList, getConversationDetail, markConversationRead, createConversation, uploadChatImage, sendMessage as sendMessageApi, getMessageList, recallMessage, type Conversation, type MessageVO } from '@/api/chat'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import { useUserStore } from '@/stores/userStore'

defineOptions({ name: 'ChatPage' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
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
  /** 扩展：会话关联的商品ID */
  _productId?: number
  /** 扩展：会话关联的订单ID */
  _orderId?: number
  /** 扩展：会话类型 */
  _conversationType?: string
  /** 扩展：对方用户ID */
  _userId?: number
}

interface Message {
  id: number
  type: 'sent' | 'received'
  contentType: 'text' | 'image' | 'product'
  content: string
  productTitle?: string
  productPrice?: number
  productImage?: string
  /** 关联的商品ID（product_card 类型的消息） */
  productId?: number
  timestamp: string
  status: 'sending' | 'sent' | 'delivered' | 'failed'
  senderId?: number
  /** 消息是否已被撤回 */
  recalled?: boolean
}

/** 当前会话中对方的用户ID，由加载会话时设置，用于精确判定消息方向 */
const conversationOtherUserId = ref<number>(0)

/** 将 API 返回的 MessageVO 转为本地 Message */
const toMessage = (vo: MessageVO): Message => {
  const otherId = conversationOtherUserId.value
  let isMine: boolean

  if (otherId > 0) {
    // ★ 优选：用会话上下文判定 —— 非对方发的就是我发的
    isMine = Number(vo.senderId) !== Number(otherId)
    console.debug('[toMessage] 会话上下文判定: senderId=', vo.senderId,
      '| otherUserId=', otherId,
      '| isMine=', isMine,
      '| content=', (vo.content || '').slice(0, 30))
  } else {
    // 兜底：localStorage 猜测（此分支不应在正常流程触发）
    const myId = getMyUserId()
    isMine = myId > 0 && Number(vo.senderId) === myId
    console.debug('[toMessage] localStorage 兜底: senderId=', vo.senderId,
      '| myId=', myId,
      '| isMine=', isMine,
      '| content=', (vo.content || '').slice(0, 30))
  }

  // 被撤回的消息：保留原始方向用于判断"你"/"对方"
  if (vo.recalled) {
    return {
      id: vo.id,
      type: isMine ? 'sent' : 'received',
      contentType: 'text',
      content: '',
      timestamp: vo.sentAt,
      status: 'delivered',
      senderId: vo.senderId,
      recalled: true,
    }
  }
  return {
    id: vo.id,
    type: isMine ? 'sent' : 'received',
    contentType: vo.messageType === 'product_card' ? 'product' : vo.messageType === 'image' ? 'image' : 'text',
    content: vo.content || '',
    timestamp: vo.sentAt,
    status: 'delivered',
    senderId: vo.senderId,
    // 尝试从 extJson 中解析商品信息
    ...(vo.messageType === 'product_card' && vo.extJson
      ? (() => {
          const p = parseProductExtJson(vo.extJson)
          if (p.productImage) p.productImage = getImageUrl(p.productImage)
          return p
        })()
      : {}),
  }
}

/** 从 extJson 中解析商品ID等信息 */
const parseProductExtJson = (extJson: string): { productId?: number; productTitle?: string; productPrice?: number; productImage?: string } => {
  try {
    const parsed = JSON.parse(extJson)
    return {
      productId: parsed.productId ?? parsed.id ?? undefined,
      productTitle: parsed.title ?? parsed.productTitle ?? undefined,
      productPrice: parsed.price ?? parsed.productPrice ?? undefined,
      productImage: parsed.image ?? parsed.productImage ?? undefined,
    }
  } catch {
    return {}
  }
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

/** 
 * 从 localStorage 直接读取当前登录用户ID。
 * 不使用 computed/Pinia ref，避免 async 上下文里的响应式时序问题。
 */
const getMyUserId = (): number => {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: number | string }
      if (parsed?.id != null) return Number(parsed.id)
    }
  } catch { /* ignore */ }
  // 兜底：再试试 Pinia store
  const storeId = userStore.userInfo?.id
  return storeId != null ? Number(storeId) : 0
}

// 单击撤回菜单
const recallMenu = ref<{ visible: boolean; x: number; y: number; messageId: number }>({
  visible: false,
  x: 0,
  y: 0,
  messageId: 0,
})

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
        // 回退：从 localStorage 读取缓存的商品信息
        const cached = localStorage.getItem(`chat_product_${productId}`)
        if (cached) {
          try {
            const info = JSON.parse(cached)
            product.value = {
              id: info.id,
              title: info.title || '',
              price: Number(info.price ?? 0),
              image: info.image || PLACEHOLDER_IMG,
            }
          } catch { /* ignore */ }
        }
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

const friends = ref<Friend[]>([])

/** 从 API 拉取真实会话列表，映射为 Friend */
const fetchConversations = async () => {
  try {
    const list = await getConversationList({ pageNum: 1, pageSize: 50 })
    const apiFriends: Friend[] = list.map((c: Conversation) => ({
      id: c.id,
      name: c.userNickname || '对方用户',
      avatar: '',
      lastMessage: c.lastMessageContent || '暂无消息',
      lastTime: formatLastTime(c.lastMessageAt),
      unread: c.unreadCount ?? 0,
      rating: 5,
      location: '',
      _conversationType: c.conversationType,
      _productId: c.productId ?? undefined,
      _orderId: c.orderId ?? undefined,
      _userId: c.userId,
    }))
    // 合并 localStorage 中的兜底好友（如果 API 返回为空时仍有兜底）
    // 过滤掉旧版缓存：没有 _conversationType 的条目是错误缓存（存的是 userId 而非 conversationId）
    const stored = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as Friend[]
    const existingIds = new Set(apiFriends.map(f => f.id))
    for (const sf of stored) {
      if (!existingIds.has(sf.id) && sf._conversationType) {
        apiFriends.push(sf)
      }
    }
    friends.value = apiFriends
    // 如果有路由参数 conversationId，自动选中
    const convId = Number(route.query.conversationId)
    if (Number.isFinite(convId)) {
      const target = friends.value.find(f => f.id === convId)
      if (target) {
        seller.value = target
        if (target.unread) {
          target.unread = 0
          markConversationRead(target.id).catch(err =>
            console.error('标记会话已读失败:', err),
          )
        }
        // 加载该会话关联的商品
        if (target._productId) {
          loadProductForConversation(target._productId)
        }
      }
    }
  } catch (err) {
    console.error('获取会话列表失败:', err)
    // 回退到 localStorage
    mergeStoredFriends()
  }
}

/** 消息气泡时间：只显示具体钟点，日期由分隔线提供 */
const formatTime = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/** 会话列表最后消息时间：今天显示时间，昨天显示"昨天"，其余显示月日 */
const formatLastTime = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (msgDay.getTime() >= today.getTime()) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  if (msgDay.getTime() >= yesterday.getTime()) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 判断是否需要在当前消息前插入日期/时间分隔线（第一条、跨天、或间隔>5分钟） */
const showDateDivider = (index: number, iso?: string | null): boolean => {
  if (!iso) return false
  if (index === 0) return true
  const prevMsg = messages.value[index - 1]
  if (!prevMsg?.timestamp) return false
  try {
    const cur = new Date(iso)
    const prev = new Date(prevMsg.timestamp)
    if (isNaN(cur.getTime()) || isNaN(prev.getTime())) return false
    // 跨天
    if (cur.toDateString() !== prev.toDateString()) return true
    // 同天内间隔超过 5 分钟
    return cur.getTime() - prev.getTime() > 5 * 60 * 1000
  } catch {
    return false
  }
}

/** 日期分隔线文案：包含具体时间 */
const formatDateLabel = (iso?: string | null): string => {
  if (!iso) return ''
  const d = new Date(iso)
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

const mergeStoredFriends = () => {
  const stored = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as Friend[]
  if (!Array.isArray(stored) || stored.length === 0) return

  const friendMap = new Map<number, Friend>()
  for (const friend of friends.value) {
    friendMap.set(friend.id, friend)
  }
  for (const friend of stored) {
    if (typeof friend.id === 'number' && friend.id > 0 && friend._conversationType) {
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

const product = ref<Product | null>(null)

const messages = ref<Message[]>([])

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

const switchFriend = async (friend: Friend) => {
  seller.value = friend
  // ★ 先设置对方用户ID，确保 toMessage 能正确判断方向
  conversationOtherUserId.value = friend._userId ?? 0
  if (friend.unread) {
    friend.unread = 0
    // 调用后端标记已读
    markConversationRead(friend.id).catch(err =>
      console.error('标记会话已读失败:', err),
    )
  }
  // 从后端加载会话详情（含消息列表），一次请求获取全部数据
  try {
    const detail = await getConversationDetail(friend.id)
    // ★ API 返回的 userId 是对方ID，覆盖为更权威的值
    conversationOtherUserId.value = detail.userId
    messages.value = detail.messages.map(toMessage)
    console.debug('[switchFriend] 已加载会话', detail.id,
      '| otherUserId=', conversationOtherUserId.value,
      '| 消息数=', messages.value.length,
      '| sent数=', messages.value.filter(m => m.type === 'sent').length,
      '| received数=', messages.value.filter(m => m.type === 'received').length)
    // 同步更新好友信息（昵称、头像等可能变更）
    friend.name = detail.userNickname || friend.name
    friend._userId = detail.userId
    if (detail.productId) {
      friend._productId = detail.productId
      loadProductForConversation(detail.productId)
    }
  } catch (err) {
    console.error('加载会话详情失败，回退到消息列表接口:', err)
    // 回退：用独立消息列表接口兜底（otherUserId 已在上面设置）
    try {
      const msgList = await getMessageList({ conversationId: friend.id })
      messages.value = msgList.map(toMessage)
    } catch (err2) {
      console.error('加载消息列表也失败:', err2)
      messages.value = []
    }
    // 回退时也加载商品信息
    if (friend._productId) {
      loadProductForConversation(friend._productId)
    }
  }
  scrollToBottom()
}

const goBack = () => {
  router.back()
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || !seller.value?.id) return

  // 插入一条"sending"占位
  const placeholderId = Date.now()
  messages.value.push({
    id: placeholderId,
    type: 'sent',
    contentType: 'text',
    content: text,
    timestamp: new Date().toISOString(),
    status: 'sending',
  })
  inputMessage.value = ''
  if (textareaRef.value) textareaRef.value.style.height = 'auto'
  scrollToBottom()

  try {
    const result = await sendMessageApi({
      conversationId: seller.value.id,
      messageType: 'text',
      content: text,
    })
    // 替换占位消息
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) {
      const msg = toMessage(result)
      msg.type = 'sent' // 确保自己发的消息在右侧
      messages.value[idx] = msg
    }
    // 更新好友列表最后消息
    const friend = friends.value.find(f => f.id === seller.value.id)
    if (friend) {
      friend.lastMessage = text
      friend.lastTime = formatLastTime(result.sentAt)
    }
  } catch (err) {
    console.error('发送消息失败:', err)
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) messages.value[idx]!.status = 'failed'
    alert(err instanceof Error ? err.message : '发送消息失败')
  }
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

const handleImageSelect = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !seller.value?.id) return

  // 先展示一个"上传中"的占位消息
  const placeholderId = Date.now()
  messages.value.push({
    id: placeholderId,
    type: 'sent',
    contentType: 'image',
    content: '',
    timestamp: new Date().toISOString(),
    status: 'sending',
  })
  scrollToBottom()

  try {
    const uploadResult = await uploadChatImage(file)
    // 上传成功后，发送图片消息
    const result = await sendMessageApi({
      conversationId: seller.value.id,
      messageType: 'image',
      content: uploadResult.url,
      extJson: JSON.stringify(uploadResult.extJson),
    })
    // 替换占位
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) {
      const msg = toMessage(result)
      msg.type = 'sent' // 确保自己发的消息在右侧
      messages.value[idx] = msg
    }
  } catch (err) {
    console.error('发送图片失败:', err)
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) messages.value[idx]!.status = 'failed'
    alert('图片发送失败，请重试')
  }
}

const sendProductCard = async () => {
  if (!product.value || !seller.value?.id) return

  const placeholderId = Date.now()
  messages.value.push({
    id: placeholderId,
    type: 'sent',
    contentType: 'product',
    content: '',
    productTitle: product.value.title,
    productPrice: product.value.price,
    productImage: product.value.image,
    productId: product.value.id,
    timestamp: new Date().toISOString(),
    status: 'sending',
  })
  scrollToBottom()

  try {
    const result = await sendMessageApi({
      conversationId: seller.value.id,
      messageType: 'product_card',
      productId: product.value.id,
      // ★ 把商品图片/标题/价格写入 extJson，确保后端存下的数据完整
      extJson: JSON.stringify({
        image: product.value.image,
        title: product.value.title,
        price: product.value.price,
        productId: product.value.id,
      }),
    })
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) {
      const msg = toMessage(result)
      msg.type = 'sent' // 确保自己发的消息在右侧
      // ★ 以占位消息为权威源，保证和上方商品链接完全同步
      const pimg = messages.value[idx]!.productImage
      const ptitle = messages.value[idx]!.productTitle
      const pprice = messages.value[idx]!.productPrice
      msg.productImage = pimg || msg.productImage
      msg.productTitle = ptitle || msg.productTitle
      msg.productPrice = pprice ?? msg.productPrice
      messages.value[idx] = msg
    }
  } catch (err) {
    console.error('发送商品卡片失败:', err)
    const idx = messages.value.findIndex(m => m.id === placeholderId)
    if (idx !== -1) messages.value[idx]!.status = 'failed'
    alert('发送商品卡片失败，请重试')
  }
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
  const userId = seller.value?._userId
  if (!userId) return
  // 保存当前会话上下文，返回时恢复
  if (seller.value.id) {
    sessionStorage.setItem('chat_return_conv', JSON.stringify({
      id: seller.value.id,
      name: seller.value.name,
      avatar: seller.value.avatar,
      _userId: seller.value._userId,
      _productId: seller.value._productId,
      _conversationType: seller.value._conversationType,
    }))
  }
  router.push({
    path: `/user/home/${userId}`,
    query: {
      name: seller.value!.name || '',
      avatar: seller.value!.avatar || '',
      location: seller.value!.location || '未知',
    },
  })
}

/** 根据商品ID加载并设置当前会话的商品信息 */
const loadProductForConversation = (productId: number) => {
  productLoading.value = true
  getProductDetail(productId)
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
      // ★ 无条件同步：上方商品链接更新后，消息列表中同 productId 的卡片全部同步
      for (const m of messages.value) {
        if (m.contentType === 'product' && m.productId === productId) {
          m.productImage = imageUrl || PLACEHOLDER_IMG
          m.productTitle = data.title || m.productTitle || ''
          m.productPrice = product.value.price ?? m.productPrice
        }
      }
    })
    .catch(err => {
      console.error('加载会话商品失败:', err)
      // API 失败时保留现有值（模拟数据兜底）
    })
    .finally(() => {
      productLoading.value = false
    })
}

const viewProductDetail = (pId?: number) => {
  const targetId = pId ?? product.value?.id
  if (targetId) {
    // 保存当前会话上下文，返回时恢复
    if (seller.value.id) {
      sessionStorage.setItem('chat_return_conv', JSON.stringify({
        id: seller.value.id,
        name: seller.value.name,
        avatar: seller.value.avatar,
        _userId: seller.value._userId,
        _productId: seller.value._productId,
        _conversationType: seller.value._conversationType,
      }))
    }
    router.push({ name: 'goods-detail', params: { id: targetId } })
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

// ===== 右键撤回菜单 =====
const onMessageContextMenu = (e: MouseEvent, msg: Message) => {
  // 只对自己发送的、未撤回、非发送中的消息显示撤回菜单
  if (msg.type !== 'sent' || msg.recalled || msg.status === 'sending') return
  showRecallMenu(e, msg)
}

const showRecallMenu = (e: MouseEvent, msg: Message) => {
  recallMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    messageId: msg.id,
  }
}

const hideRecallMenu = () => {
  recallMenu.value.visible = false
}

const handleRecall = async () => {
  const msgId = recallMenu.value.messageId
  hideRecallMenu()
  try {
    await recallMessage(msgId)
    // 更新本地消息状态
    const msg = messages.value.find(m => m.id === msgId)
    if (msg) {
      msg.recalled = true
      msg.content = '消息已被撤回'
      msg.contentType = 'text'
    }
  } catch (err) {
    console.error('撤回失败:', err)
    // 后端返回的具体错误（如"超过5分钟"），尝试解析
    let errText = '撤回失败，请重试'
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message)
        errText = parsed.message || errText
      } catch { errText = err.message || errText }
    }
    alert(errText)
  }
}

onMounted(async () => {
  await fetchConversations()
  // 初始化商品信息（从商品详情页跳转过来时）
  initProduct()
  // 如果没有通过 productId 跳转过来，直接给默认商品卡片，避免异步等待期间空白
  if (!route.query.productId && !product.value) {
    product.value = {
      id: 1,
      title: '九成新iPhone 13 Pro 256G',
      price: 4599,
      image: 'https://via.placeholder.com/300x300?text=iPhone+13+Pro',
    }
  }
  const selectedFriendId = Number(route.query.friendId)
  if (Number.isFinite(selectedFriendId) && selectedFriendId > 0) {
    const target = friends.value.find(friend => friend.id === selectedFriendId)
    // 只接受来自 API 的有效会话（有 _conversationType 标记），忽略旧版错误缓存
    if (target && target._conversationType) {
      seller.value = target
      if (target.unread) {
        target.unread = 0
        markConversationRead(target.id).catch(err =>
          console.error('标记会话已读失败:', err),
        )
      }
      // 加载该会话关联的商品（兜底：localStorage 中可能缓存了 _productId）
      if (target._productId) {
        loadProductForConversation(target._productId)
      }
    }
  }
  // 兜底：如果是从其他页面跳转过来但 createConversation 失败了，
  // 此时只有 route.sellerId（userId）没有 conversationId，需要在此补建会话
  const routeSellerId = Number(route.query.sellerId)
  const routeProductId = Number(route.query.productId)
  if (!route.query.conversationId && Number.isFinite(routeSellerId) && routeSellerId > 0) {
    const hasProductId = Number.isFinite(routeProductId) && routeProductId > 0
    const existing = friends.value.find(f => {
      if (f._userId !== routeSellerId) return false
      return hasProductId ? f._productId === routeProductId : true
    })
    if (existing) {
      seller.value = existing
      if (existing.unread) {
        existing.unread = 0
        markConversationRead(existing.id).catch(err => console.error('标记已读失败:', err))
      }
      if (existing._productId) {
        loadProductForConversation(existing._productId)
      }
    } else {
      try {
        const conv = await createConversation({
          conversationType: 'product_consult',
          ...(hasProductId ? { productId: routeProductId } : {}),
          userId: routeSellerId,
        })
        seller.value = {
          id: conv.id,
          name: conv.userNickname || seller.value.name,
          avatar: seller.value.avatar,
          lastMessage: '',
          lastTime: '',
          unread: 0,
          rating: 5,
          location: '',
          _conversationType: conv.conversationType,
          _productId: conv.productId ?? undefined,
          _orderId: conv.orderId ?? undefined,
          _userId: conv.userId,
        }
        friends.value.unshift(seller.value)
      } catch (convErr) {
        console.error('自动创建会话失败:', convErr)
        alert('创建会话失败，请稍后重试')
        seller.value.id = 0
      }
    }
  }
  // 如果以上都没有找到会话，尝试从 sessionStorage 恢复（从商品详情页返回时）
  if (!seller.value.id) {
    try {
      const savedConv = sessionStorage.getItem('chat_return_conv')
      if (savedConv) {
        const ctx = JSON.parse(savedConv) as Friend
        const existing = friends.value.find(f => f.id === ctx.id)
        if (existing) {
          seller.value = existing
        } else {
          // 会话还在列表中找不到，直接用保存的上下文
          seller.value = ctx
          friends.value.unshift(ctx)
        }
        if (ctx._productId) {
          loadProductForConversation(ctx._productId)
        }
      }
    } catch { /* ignore */ }
  }
  // 如果有选中的会话，通过详情接口加载消息列表
  if (seller.value.id) {
    // ★ 先设置对方用户ID，确保 toMessage 能正确判断消息方向
    conversationOtherUserId.value = seller.value._userId ?? 0
    try {
      const detail = await getConversationDetail(seller.value.id)
      // ★ API 返回的 userId 是对方ID，覆盖为权威值
      conversationOtherUserId.value = detail.userId
      seller.value._userId = detail.userId
      messages.value = detail.messages.map(toMessage)
      console.debug('[onMounted] 已加载会话', detail.id,
        '| otherUserId=', conversationOtherUserId.value,
        '| 消息数=', messages.value.length,
        '| sent数=', messages.value.filter(m => m.type === 'sent').length,
        '| received数=', messages.value.filter(m => m.type === 'received').length)
      // 同步商品信息
      if (detail.productId) {
        seller.value._productId = detail.productId
        loadProductForConversation(detail.productId)
      }
    } catch (err) {
      console.error('加载会话详情失败，回退到消息列表接口:', err)
      try {
        const msgList = await getMessageList({ conversationId: seller.value.id })
        messages.value = msgList.map(toMessage)
      } catch (err2) {
        console.error('加载消息列表也失败:', err2)
      }
    }
  }
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
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
  min-height: 0;
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

/* 消息撤回居中提示 */
.recall-notice {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.recall-notice-text {
  color: #9ca3af;
  font-size: 12px;
  padding: 4px 0;
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

.message-time {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.65;
  text-align: right;
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

/* 右键撤回菜单 */
.recall-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.recall-menu {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 140px;
  animation: recallMenuIn 120ms ease both;
  z-index: 1000;
}

.recall-item {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  transition: background 120ms;
}

.recall-item:hover {
  background: #fef2f2;
  color: #ef4444;
}

.recall-item i {
  width: 16px;
  text-align: center;
  color: #9ca3af;
}

.recall-item:hover i {
  color: #ef4444;
}

@keyframes recallMenuIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>