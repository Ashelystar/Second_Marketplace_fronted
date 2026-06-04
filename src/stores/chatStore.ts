import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

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
  image: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: number
  receiverId: number
  contentType: ChatContentType
  content: string
  product?: ChatProductCard
  createdAt: number
  status: 'sending' | 'sent' | 'delivered' | 'failed'
}

interface ChatConversation {
  id: string
  participantIds: [number, number]
  participants: Record<string, ChatUserProfile>
  updatedAt: number
  createdAt: number
  lastMessagePreview: string
  readCursor: Record<string, number>
  linkedProduct?: ChatProductCard
}

interface ChatPersistedData {
  conversations: ChatConversation[]
  messages: ChatMessage[]
}

const STORAGE_KEY = 'chat_module_v1'
const CHAT_FRIENDS_STORAGE_KEY = 'chat_friends'

const nowTs = () => Date.now()

const safeJsonParse = <T>(input: string | null, fallback: T): T => {
  if (!input) return fallback
  try {
    return JSON.parse(input) as T
  } catch {
    return fallback
  }
}

const toConversationId = (userA: number, userB: number) => {
  const [left, right] = [userA, userB].sort((a, b) => a - b)
  return `conv_${left}_${right}`
}

const toPreviewText = (message: Pick<ChatMessage, 'contentType' | 'content' | 'product'>) => {
  if (message.contentType === 'image') return '[图片]'
  if (message.contentType === 'product') return `[商品] ${message.product?.title || '商品卡片'}`
  return message.content
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<ChatConversation[]>([])
  const messages = ref<ChatMessage[]>([])
  const initialized = ref(false)

  const messageMapByConversation = computed(() => {
    const map = new Map<string, ChatMessage[]>()
    for (const msg of messages.value) {
      const list = map.get(msg.conversationId) ?? []
      list.push(msg)
      map.set(msg.conversationId, list)
    }
    for (const entry of map.values()) {
      entry.sort((a, b) => a.createdAt - b.createdAt)
    }
    return map
  })

  const persist = () => {
    const payload: ChatPersistedData = {
      conversations: conversations.value,
      messages: messages.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const hydrate = () => {
    const data = safeJsonParse<ChatPersistedData>(localStorage.getItem(STORAGE_KEY), {
      conversations: [],
      messages: [],
    })
    conversations.value = Array.isArray(data.conversations) ? data.conversations : []
    messages.value = Array.isArray(data.messages) ? data.messages : []
    dedupeConversations()
  }

  /** 合并同一对用户之间的重复会话（历史 bug 可能用商品 id 误建会话） */
  const dedupeConversations = () => {
    const canonicalMap = new Map<string, ChatConversation>()
    const idRemap = new Map<string, string>()

    for (const conv of conversations.value) {
      const [left, right] = [...conv.participantIds].sort((a, b) => a - b)
      const canonicalId = toConversationId(left, right)
      idRemap.set(conv.id, canonicalId)

      const existing = canonicalMap.get(canonicalId)
      if (!existing) {
        canonicalMap.set(canonicalId, {
          ...conv,
          id: canonicalId,
          participantIds: [left, right],
        })
        continue
      }

      existing.participants = { ...existing.participants, ...conv.participants }
      if (conv.updatedAt >= existing.updatedAt) {
        existing.updatedAt = conv.updatedAt
        existing.lastMessagePreview = conv.lastMessagePreview || existing.lastMessagePreview
      }
      if (conv.linkedProduct) existing.linkedProduct = conv.linkedProduct
      existing.createdAt = Math.min(existing.createdAt, conv.createdAt)
      for (const [uid, ts] of Object.entries(conv.readCursor)) {
        existing.readCursor[uid] = Math.max(existing.readCursor[uid] ?? 0, ts)
      }
    }

    let messagesChanged = false
    for (const msg of messages.value) {
      const canonicalId = idRemap.get(msg.conversationId)
      if (canonicalId && canonicalId !== msg.conversationId) {
        msg.conversationId = canonicalId
        messagesChanged = true
      }
    }

    const merged = Array.from(canonicalMap.values())
    const changed =
      merged.length !== conversations.value.length ||
      messagesChanged ||
      merged.some((c, i) => c.id !== conversations.value[i]?.id)

    conversations.value = merged
    if (changed) persist()
  }

  const initialize = () => {
    if (initialized.value) return
    hydrate()
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return
      hydrate()
    })
    initialized.value = true
  }

  const upsertLegacyFriend = (friend: ChatUserProfile) => {
    const raw = safeJsonParse<ChatUserProfile[]>(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY), [])
    const map = new Map<number, ChatUserProfile>()
    for (const item of raw) {
      if (item && typeof item.id === 'number' && item.id > 0) {
        map.set(item.id, item)
      }
    }
    map.set(friend.id, friend)
    localStorage.setItem(CHAT_FRIENDS_STORAGE_KEY, JSON.stringify(Array.from(map.values())))
  }

  const ensureConversation = (
    currentUser: ChatUserProfile,
    targetUser: ChatUserProfile,
    linkedProduct?: ChatProductCard
  ) => {
    if (!currentUser.id || !targetUser.id || currentUser.id === targetUser.id) return null
    const conversationId = toConversationId(currentUser.id, targetUser.id)
    const existing = conversations.value.find((c) => c.id === conversationId)
    const timestamp = nowTs()
    if (existing) {
      existing.participants[String(currentUser.id)] = currentUser
      existing.participants[String(targetUser.id)] = targetUser
      if (linkedProduct) {
        existing.linkedProduct = linkedProduct
      }
      persist()
      upsertLegacyFriend(targetUser)
      return existing
    }

    const conversation: ChatConversation = {
      id: conversationId,
      participantIds: [Math.min(currentUser.id, targetUser.id), Math.max(currentUser.id, targetUser.id)],
      participants: {
        [String(currentUser.id)]: currentUser,
        [String(targetUser.id)]: targetUser,
      },
      updatedAt: timestamp,
      createdAt: timestamp,
      lastMessagePreview: '',
      readCursor: {
        [String(currentUser.id)]: timestamp,
        [String(targetUser.id)]: 0,
      },
      linkedProduct,
    }
    conversations.value.unshift(conversation)
    persist()
    upsertLegacyFriend(targetUser)
    return conversation
  }

  const getConversationMessages = (conversationId: string) => {
    return messageMapByConversation.value.get(conversationId) ?? []
  }

  const sendMessage = (params: {
    conversationId: string
    senderId: number
    contentType: ChatContentType
    content: string
    product?: ChatProductCard
  }) => {
    const conversation = conversations.value.find((item) => item.id === params.conversationId)
    if (!conversation) return null
    const receiverId =
      conversation.participantIds[0] === params.senderId
        ? conversation.participantIds[1]
        : conversation.participantIds[0]

    const message: ChatMessage = {
      id: `msg_${params.senderId}_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
      conversationId: conversation.id,
      senderId: params.senderId,
      receiverId,
      contentType: params.contentType,
      content: params.content,
      product: params.product,
      createdAt: nowTs(),
      status: 'delivered',
    }

    messages.value.push(message)
    conversation.updatedAt = message.createdAt
    conversation.lastMessagePreview = toPreviewText(message)
    conversation.readCursor[String(params.senderId)] = message.createdAt
    persist()
    return message
  }

  const clearConversation = (conversationId: string) => {
    messages.value = messages.value.filter((item) => item.conversationId !== conversationId)
    const target = conversations.value.find((item) => item.id === conversationId)
    if (target) {
      target.lastMessagePreview = ''
      target.updatedAt = nowTs()
    }
    persist()
  }

  const markConversationRead = (conversationId: string, userId: number) => {
    const target = conversations.value.find((item) => item.id === conversationId)
    if (!target) return
    target.readCursor[String(userId)] = nowTs()
    persist()
  }

  const getConversationsForUser = (userId: number) => {
    const mapped = conversations.value
      .filter((conversation) => conversation.participantIds.includes(userId))
      .map((conversation) => {
        const partnerId = conversation.participantIds[0] === userId
          ? conversation.participantIds[1]
          : conversation.participantIds[0]
        const partner = conversation.participants[String(partnerId)]
        const readAt = conversation.readCursor[String(userId)] ?? 0
        const unread = messages.value.filter(
          (msg) =>
            msg.conversationId === conversation.id &&
            msg.receiverId === userId &&
            msg.createdAt > readAt
        ).length
        return {
          conversationId: conversation.id,
          partner,
          partnerId,
          unread,
          updatedAt: conversation.updatedAt,
          lastMessagePreview: conversation.lastMessagePreview,
          linkedProduct: conversation.linkedProduct,
        }
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)

    const byPartner = new Map<number, (typeof mapped)[number]>()
    for (const thread of mapped) {
      if (!thread.partnerId) continue
      const prev = byPartner.get(thread.partnerId)
      if (!prev || thread.updatedAt >= prev.updatedAt) {
        byPartner.set(thread.partnerId, thread)
      }
    }
    return Array.from(byPartner.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  const getUnreadCountForUser = (userId: number) => {
    return getConversationsForUser(userId).reduce((sum, item) => sum + item.unread, 0)
  }

  const updateParticipantProfile = (userId: number, patch: Partial<ChatUserProfile>) => {
    let changed = false
    for (const conv of conversations.value) {
      if (!conv.participantIds.includes(userId)) continue
      const key = String(userId)
      const current = conv.participants[key]
      if (!current) continue
      conv.participants[key] = { ...current, ...patch, id: userId }
      changed = true
    }
    if (changed) persist()
  }

  return {
    conversations,
    messages,
    initialize,
    ensureConversation,
    updateParticipantProfile,
    sendMessage,
    clearConversation,
    markConversationRead,
    getConversationMessages,
    getConversationsForUser,
    getUnreadCountForUser,
  }
})
