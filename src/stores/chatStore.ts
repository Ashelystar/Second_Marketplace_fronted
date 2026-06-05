import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createConversation as apiCreateConversation,
  getConversationList,
  getConversationDetail,
  sendMessage as apiSendMessage,
  markConversationRead as apiMarkRead,
  recallMessage as apiRecallMessage,
  type Conversation,
  type MessageVO,
  type MessageType,
  type SendMessageParams,
} from '@/api/chat'

// ==========================================
// 类型导出（保持与 Index.vue 兼容）
// ==========================================

export type ChatContentType = 'text' | 'image' | 'product'

export interface ChatUserProfile {
  id: number
  name: string
  avatar: string
  location?: string
  rating?: number
}

export interface ChatProductCard {
  id: number
  title: string
  price: number
  originalPrice?: number
  image: string
}

/** 适配后的消息（前端统一格式） */
export interface ChatMessage {
  id: number
  conversationId: number
  senderId: number
  senderNickname: string
  contentType: ChatContentType
  content: string
  product?: ChatProductCard
  createdAt: number
  recalled: boolean
}

/** 会话列表项（前端统一格式） */
export interface ChatThread {
  conversationId: number
  partner: ChatUserProfile
  partnerId: number
  productId: number | null
  unread: number
  updatedAt: number
  lastMessagePreview: string
}

// ==========================================
// 内部工具函数
// ==========================================

function parseExtJson(extJson: string | null): Record<string, unknown> {
  if (!extJson) return {}
  try {
    return JSON.parse(extJson) as Record<string, unknown>
  } catch {
    return {}
  }
}

function mapContentType(type: string): ChatContentType {
  if (type === 'image') return 'image'
  if (type === 'product_card') return 'product'
  return 'text'
}

function mapMessageType(local: ChatContentType): MessageType {
  if (local === 'image') return 'image'
  if (local === 'product') return 'product_card'
  return 'text'
}

function toTimestamp(iso: string | null): number {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return isNaN(t) ? 0 : t
}

function voToMessage(vo: MessageVO): ChatMessage {
  const ext = parseExtJson(vo.extJson)
  let product = ext.product as ChatProductCard | undefined

  // 兜底：extJson 没有 product 时，尝试从 content 解析（发送时做了双写备份）
  if (!product && vo.messageType === 'product_card' && vo.content) {
    try {
      const parsed = JSON.parse(vo.content)
      if (parsed && typeof parsed === 'object' && 'id' in parsed) {
        product = parsed as ChatProductCard
      }
    } catch {
      /* content 不是 JSON，忽略 */
    }
  }

  // product_card 类型的消息内容不展示文本，由 product 对象渲染卡片
  const isProductCard = vo.messageType === 'product_card'

  return {
    id: vo.id,
    conversationId: vo.conversationId,
    senderId: vo.senderId,
    senderNickname: vo.senderNickname || '',
    contentType: mapContentType(vo.messageType),
    content: vo.recalled ? '[消息已撤回]' : (isProductCard ? '' : (vo.content || '')),
    product,
    createdAt: toTimestamp(vo.sentAt),
    recalled: vo.recalled,
  }
}

// ==========================================
// Store 定义
// ==========================================

export const useChatStore = defineStore('chat', () => {
  /** 服务端会话列表 */
  const conversations = ref<Conversation[]>([])

  /** 消息缓存: conversationId → ChatMessage[] */
  const messageCache = ref<Record<number, ChatMessage[]>>({})

  const initialized = ref(false)

  // ---------- 初始化 ----------

  const initialize = async () => {
    if (initialized.value) return
    try {
      const list = await getConversationList({ pageSize: 50 })
      // 仅当真正拿到数据时才覆盖 conversations
      conversations.value = list
      initialized.value = true

      // 对预览文案有歧义的会话（撤回/商品/空），预取消息到缓存
      // 这样 getConversationsForUser 才能根据 senderId 区分"你"和"对方"
      for (const conv of list) {
        const preview = conv.lastMessageContent || ''
        const needsCache =
          preview === RECALL_TEXT ||
          !preview ||
          (preview.startsWith('{') && preview.includes('"id"'))
        if (needsCache) {
          try {
            await fetchMessages(conv.id)
          } catch {
            // 静默忽略单条失败
          }
        }
      }
    } catch (e) {
      console.error('[ChatStore] 加载会话列表失败:', e)
      // 失败时不设置 initialized，下次进入时自动重试
    }
  }

  // ---------- 会话管理 ----------

  /**
   * 创建/获取服务端会话
   * @returns 服务端 Conversation 或 null
   */
  const ensureConversation = async (
    currentUser: ChatUserProfile,
    targetUser: ChatUserProfile,
    product?: ChatProductCard,
  ): Promise<Conversation | null> => {
    if (!currentUser.id || !targetUser.id || currentUser.id === targetUser.id) return null
    try {
      const conv = await apiCreateConversation({
        conversationType: 'product_consult',
        userId: targetUser.id,
        productId: product?.id,
      })
      // 去重后插入列表头部
      const idx = conversations.value.findIndex((c) => c.id === conv.id)
      if (idx >= 0) {
        conversations.value[idx] = conv
      } else {
        conversations.value.unshift(conv)
      }
      return conv
    } catch (e) {
      console.error('[ChatStore] 创建会话失败:', e)
      return null
    }
  }

  // ---------- 消息 ----------

  /** 从服务端拉取消息并缓存 */
  const fetchMessages = async (conversationId: number): Promise<ChatMessage[]> => {
    // 已有缓存直接返回
    if (messageCache.value[conversationId]) {
      return messageCache.value[conversationId]
    }
    try {
      const detail = await getConversationDetail(conversationId)
      const msgs: ChatMessage[] = (detail.messages || [])
        .map(voToMessage)
        .sort((a, b) => a.createdAt - b.createdAt)
      messageCache.value[conversationId] = msgs
      // 同步 conversation 列表中的 userAvatar（Conversation 类型不含，但 Detail 有）
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv && detail.userAvatar) {
        ;(conv as Record<string, unknown>).userAvatar = detail.userAvatar
      }
      return msgs
    } catch (e) {
      console.error('[ChatStore] 获取消息失败:', e)
      return []
    }
  }

  /** 同步获取已缓存的消息（不发起请求） */
  const getConversationMessages = (conversationId: number): ChatMessage[] => {
    return messageCache.value[conversationId] || []
  }

  /** 发送消息 */
  const sendMessage = async (params: {
    conversationId: number
    senderId: number
    contentType: ChatContentType
    content: string
    product?: ChatProductCard
  }): Promise<ChatMessage | null> => {
    const apiParams: SendMessageParams = {
      conversationId: params.conversationId,
      messageType: mapMessageType(params.contentType),
    }

    if (params.contentType === 'product') {
      apiParams.productId = params.product?.id
      apiParams.extJson = JSON.stringify({ product: params.product })
      // 同时把商品信息写入 content，防止服务端 extJson 丢失时还能恢复
      apiParams.content = JSON.stringify(params.product)
    } else {
      apiParams.content = params.content
    }

    try {
      const vo = await apiSendMessage(apiParams)
      const msg = voToMessage(vo)

      // 写入缓存
      const cache = messageCache.value[params.conversationId]
      if (!cache) {
        messageCache.value[params.conversationId] = [msg]
      } else {
        cache.push(msg)
      }

      // 更新会话列表的最后消息预览
      const conv = conversations.value.find((c) => c.id === params.conversationId)
      if (conv) {
        if (params.contentType === 'product') {
          conv.lastMessageContent = '你发送了一份商品信息'
        } else {
          conv.lastMessageContent = msg.content.slice(0, 30)
        }
        conv.lastMessageAt = vo.sentAt
      }

      return msg
    } catch (e) {
      console.error('[ChatStore] 发送消息失败:', e)
      throw e
    }
  }

  // ---------- 撤回 ----------

  const RECALL_TEXT = '[消息已撤回]'

  const recallMessage = async (
    messageId: number,
    conversationId: number,
    currentUserId: number,
  ): Promise<void> => {
    await apiRecallMessage(messageId)

    const msgs = messageCache.value[conversationId]
    let isLastMsg = false
    let senderId = 0

    if (msgs) {
      const idx = msgs.findIndex((m) => m.id === messageId)
      const msg = msgs[idx]
      if (idx >= 0 && msg) {
        msg.recalled = true
        msg.content = RECALL_TEXT
        msg.product = undefined
        senderId = msg.senderId
        isLastMsg = idx === msgs.length - 1
      }
    }

    // 如果被撤回的是最后一条消息，同步更新会话列表预览
    const conv = conversations.value.find((c) => c.id === conversationId)
    if (conv && isLastMsg) {
      const isOwn = senderId === currentUserId
      conv.lastMessageContent = isOwn ? '你撤回了一条消息' : '对方撤回了一条消息'
    }
  }

  // ---------- 已读 ----------

  const markConversationRead = async (conversationId: number, _userId: number) => {
    try {
      await apiMarkRead(conversationId)
      const conv = conversations.value.find((c) => c.id === conversationId)
      if (conv) conv.unreadCount = 0
    } catch (e) {
      console.error('[ChatStore] 标记已读失败:', e)
    }
  }

  // ---------- 会话列表（侧边栏用） ----------

  const getConversationsForUser = (_userId: number): ChatThread[] => {
    return conversations.value
      .map((conv) => {
        const partner: ChatUserProfile = {
          id: conv.userId,
          name: conv.userNickname || `用户${conv.userId}`,
          avatar: (conv as Record<string, unknown>).userAvatar as string || '',
          location: '',
          rating: 5,
        }

        // 会话列表最后一条消息预览
        let preview = conv.lastMessageContent || ''

        // 撤回消息友好文案（只看最后一条）
        if (preview === RECALL_TEXT) {
          const cachedMsgs = messageCache.value[conv.id]
          const lastMsg = cachedMsgs?.[cachedMsgs.length - 1]
          const senderId = lastMsg?.senderId ?? 0
          preview = senderId === _userId ? '你撤回了一条消息' : '对方撤回了一条消息'
        }

        // 商品卡片消息：preview 为空或 JSON 时，从缓存推断文案
        if (!preview || (preview.startsWith('{') && preview.includes('"id"'))) {
          const cachedMsgs = messageCache.value[conv.id]
          const lastMsg = cachedMsgs?.[cachedMsgs.length - 1]
          if (lastMsg && lastMsg.contentType === 'product') {
            preview = lastMsg.senderId === _userId ? '你发送了一份商品信息' : '对方发送了一份商品信息'
          }
          // 如果缓存也没有，且 preview 是 JSON 或空，显示兜底
          if (!preview || (preview.startsWith('{') && preview.includes('"id"'))) {
            preview = preview && preview.startsWith('{') ? '发送了一份商品信息' : '开始聊天吧'
          }
        }

        return {
          conversationId: conv.id,
          partner,
          partnerId: conv.userId,
          productId: conv.productId ?? null,
          unread: conv.unreadCount || 0,
          updatedAt: toTimestamp(conv.lastMessageAt || conv.createdAt),
          lastMessagePreview: preview,
        }
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  }

  const getUnreadCountForUser = (_userId: number): number => {
    return conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  }

  // ---------- 其他 ----------

  /** 重置整个 store（退出登录或切换账号时调用） */
  const reset = () => {
    conversations.value = []
    messageCache.value = {}
    initialized.value = false
  }

  const clearConversation = (conversationId: number) => {
    delete messageCache.value[conversationId]
  }

  /**
   * 更新会话中对方用户的展示名/头像
   * 用于 fallback 昵称刷新场景
   */
  const updateParticipantProfile = (userId: number, patch: Partial<ChatUserProfile>) => {
    const convs = conversations.value.filter((c) => c.userId === userId)
    for (const conv of convs) {
      if (patch.name) conv.userNickname = patch.name
      if (patch.avatar !== undefined) {
        ;(conv as Record<string, unknown>).userAvatar = patch.avatar
      }
    }
  }

  return {
    conversations,
    messageCache,
    initialize,
    reset,
    ensureConversation,
    fetchMessages,
    sendMessage,
    markConversationRead,
    recallMessage,
    getConversationMessages,
    getConversationsForUser,
    getUnreadCountForUser,
    clearConversation,
    updateParticipantProfile,
  }
})
