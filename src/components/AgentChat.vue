<template>
  <Teleport to="body">
    <transition name="dialog-fade">
      <div 
        v-if="visible" 
        class="agent-dialog-container"
        :class="{ 'mobile-fullscreen': isMobile }"
      >
        <div class="agent-dialog">
          <div class="dialog-header">
            <div class="header-left">
              <div class="agent-avatar">
                <i class="fa fa-robot"></i>
              </div>
              <div class="agent-info">
                <h3>智能小荔</h3>
                <p>深大二手交易 AI 助手</p>
              </div>
            </div>
            <button class="close-btn" @click="closeDialog">
              <i class="fa fa-times"></i>
            </button>
          </div>

          <div class="dialog-body" ref="messageContainer">
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="welcome-icon">
                <i class="fa fa-comments"></i>
              </div>
              <p>嗨！我是智能小荔 👋</p>
              <p>随时为你解答平台相关问题！</p>
              
              <div class="quick-questions">
                <span 
                  v-for="q in quickQuestions" 
                  :key="q"
                  class="quick-tag"
                  @click="sendQuickQuestion(q)"
                >
                  {{ q }}
                </span>
              </div>
            </div>

            <div 
              v-for="(msg, index) in messages" 
              :key="index"
              class="message-item"
              :class="{ 'user-msg': msg.role === 'user' }"
            >
              <div class="msg-avatar">
                <i :class="msg.role === 'user' ? 'fa fa-user' : 'fa fa-robot'"></i>
              </div>
              <div class="msg-content">
                <div class="msg-bubble" v-html="formatMessage(msg.content)"></div>
                
                <!-- 商品网格展示（如果是搜索结果） -->
                <div v-if="msg.isSearchResult && msg.products && msg.products.length > 0" class="chat-product-grid">
                  <div
                    v-for="p in msg.products"
                    :key="p.id"
                    class="chat-product-card"
                    @click="goToDetail(p)"
                  >
                    <div class="chat-product-img">
                      <img 
                        :src="getImageUrl(p.images?.[0]?.imageUrl) || PLACEHOLDER_IMG" 
                        :alt="p.title" 
                        @error="(e) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG"
                      />
                      <span v-if="p.conditionLevel" class="chat-condition">{{ formatCondition(p.conditionLevel) }}</span>
                    </div>
                    <div class="chat-product-info">
                      <h4 class="chat-product-title">{{ p.title }}</h4>
                      <p v-if="p.subtitle" class="chat-product-subtitle">{{ p.subtitle }}</p>
                      <div class="chat-product-footer">
                        <div class="chat-price">
                          <span class="chat-current-price">¥{{ p.sellingPrice }}</span>
                          <span v-if="p.originalPrice" class="chat-original-price">¥{{ p.originalPrice }}</span>
                        </div>
                        <div class="chat-stats">
                          <span v-if="p.viewCount" class="chat-view-count">
                            <i class="fa fa-eye"></i> {{ p.viewCount }}
                          </span>
                          <span v-if="p.favoriteCount" class="chat-fav-count">
                            <i class="fa fa-heart"></i> {{ p.favoriteCount }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>

            <div v-if="isTyping" class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <div class="input-wrapper">
              <textarea
                ref="inputRef"
                v-model="inputMessage"
                @input="adjustInputHeight"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.shift.enter="newLine"
                placeholder="输入问题..."
                rows="1"
              ></textarea>
              <button 
                class="send-btn"
                :disabled="!inputMessage.trim() || isTyping"
                @click="sendMessage"
              >
                <i class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getProductDetail, type ProductVO } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:visible', 'close'])

// 响应式数据
const messages = reactive<any[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const isMobile = ref(false)

// 路由和用户存储
const router = useRouter()
const userStore = useUserStore()

// 快速问题
const quickQuestions = [
  '3000以下苹果手机',
  '平台热门商品',
  'iPhone行情',
  '禁售物品'
]

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
  emit('close')
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return

  const userMsg = {
    role: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }
  
  messages.push(userMsg)
  const question = inputMessage.value
  inputMessage.value = ''
  
  // 重置输入框高度并触发滚动
  adjustInputHeight()
  scrollToBottom()
  
  isTyping.value = true

  try {
    console.log('发送问题:', question)  
    const response = await fetchAgentResponse(question)
    
    setTimeout(async () => {
      isTyping.value = false
      
      // 检查是否是搜索商品的动作
      const isSearchAction = response.actions && 
        response.actions.some((action: any) => action.type === 'SEARCH_PRODUCTS')
      
      let productDetails: ProductVO[] = []
      
      // 如果是搜索商品且有商品ID，获取商品详情
      if (isSearchAction && response.product_ids && response.product_ids.length > 0) {
        productDetails = await fetchProductDetails(response.product_ids.slice(0, 6)) // 最多6个
      }
      
      messages.push({
        role: 'assistant',
        content: response.message || '抱歉，我暂时无法回答。',
        timestamp: new Date(),
        products: productDetails, // 添加商品详情
        isSearchResult: isSearchAction // 标记是否为搜索结果
      })
      scrollToBottom()
    }, 1000)
    
  } catch (error) {
    isTyping.value = false
    messages.push({
      role: 'assistant',
      content: '连接服务器失败，请稍后再试。',
      timestamp: new Date()
    })
    scrollToBottom()
  }
}

// 获取商品详情（使用你的 TypeScript API）
const fetchProductDetails = async (productIds: number[]): Promise<ProductVO[]> => {
  try {
    const promises = productIds.map(id => getProductDetail(id))
    const results = await Promise.all(promises)
    return results.filter((product): product is ProductVO => product !== null)
  } catch (error) {
    console.error('获取商品详情失败:', error)
    return []
  }
}

// 跳转到商品详情页（与首页逻辑完全一致）
const goToDetail = (p: ProductVO) => {
  const currentUserId = userStore.userInfo?.id
  if (currentUserId && p.sellerId && Number(currentUserId) === Number(p.sellerId)) {
    router.push({ path: '/seller/product', query: { id: p.id.toString() } })
  } else {
    router.push({ path: '/detail', query: { id: p.id.toString() } })
  }
}

// 调用后端 API
const fetchAgentResponse = async (question: string) => {
  try {
    const payload = { message: question, user_id: 1 }
    console.log("Sending to backend:", payload)
    
    const response = await fetch('/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    console.log("Received from backend:", data)
    
    if (!response.ok) throw new Error(data.detail || 'API error')
    return data
  } catch (error) {
    console.error('API 调用失败:', error)
    return getMockResponse(question)
  }
}

// 模拟响应
const getMockResponse = (question: string) => {
  const q = question.toLowerCase()
  if (q.includes('苹果') || q.includes('iphone')) {
    return { 
      success: true,
      message: '为您找到相关苹果手机：',
      actions: [{ type: 'SEARCH_PRODUCTS', description: '已找到商品' }],
      product_ids: [101, 102]
    }
  }
  if (q.includes('热门')) {
    return { 
      success: true,
      message: '🔥 当前热门商品：',
      actions: [{ type: 'SEARCH_PRODUCTS', description: '已找到商品' }],
      product_ids: [101, 102, 103]
    }
  }
  if (q.includes('禁售')) {
    return { 
      success: true,
      message: '🚫 禁售物品：\n• 易燃易爆品\n• 管制刀具\n• 食品药品\n• 违规电器\n• 贴身旧物',
      actions: [{ type: 'SEARCH_PRODUCTS', description: '了解平台规则' }],
      product_ids: []
    }
  }
  return { 
    success: false,
    message: '我可以帮你：\n• 搜索商品\n• 查询价格\n• 了解规则\n• 查看热门',
    actions: [{ type: 'SEARCH_PRODUCTS', description: '尝试搜索商品' }],
    product_ids: []
  }
}

// 快速问题
const sendQuickQuestion = (question: string) => {
  inputMessage.value = question
  sendMessage()
}

// 换行
const newLine = () => {
  inputMessage.value += '\n'
  nextTick(() => adjustInputHeight())
}

// 调整输入框高度
const adjustInputHeight = () => {
  const textarea = inputRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px'
    scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTo({
      top: messageContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// 格式化消息
const formatMessage = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 格式化成色
const formatCondition = (condition: string) => {
  const map: Record<string, string> = {
    'new': '全新',
    'almost_new': '九成新',
    'good': '八成新',
    'fair': '七成新',
    'poor': '五成新'
  }
  return map[condition] || condition
}

// 监听显示状态变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus()
      scrollToBottom()
    })
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>


<style scoped>
/* 对话框容器 */
.agent-dialog-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  background: #fff;
  animation: slideInRight 0.3s ease-out;
}

/* 保证内部主体撑满容器，建立严格的 Flex 上下布局 */
.agent-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; 
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  flex-shrink: 0; 
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.agent-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.agent-info p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  transition: all 120ms ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 消息区域 */
.dialog-body {
  flex: 1 1 0%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  background: #f9fafb;
  scrollbar-width: thin; 
  scrollbar-color: #c1c1c1 #f1f1f1; 
}

.dialog-body::-webkit-scrollbar {
  width: 6px; 
}

.dialog-body::-webkit-scrollbar-track {
  background: #f1f1f1; 
  border-radius: 10px;
}

.dialog-body::-webkit-scrollbar-thumb {
  background: #c1c1c1; 
  border-radius: 10px;
  transition: background 0.3s;
}

.dialog-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8; 
}

.welcome-message {
  text-align: center;
  padding: 24px 16px;
  color: #6b7280;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.welcome-message p {
  margin: 4px 0;
  font-size: 14px;
}

.quick-questions {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-tag {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 120ms ease;
}

.quick-tag:hover {
  background: #f97316;
  color: white;
  border-color: #f97316;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.user-msg {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  flex-shrink: 0;
}

.user-msg .msg-avatar {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.msg-content {
  max-width: 80%;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  word-break: break-word;
}

.user-msg .msg-bubble {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.msg-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  text-align: right;
}

.user-msg .msg-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  background: white;
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

/* 输入区域 */
.dialog-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0; 
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.input-wrapper textarea {
  flex: 1;
  min-height: 36px;
  max-height: 80px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 18px;
  background: #f9fafb;
  outline: none;
  font-size: 14px;
  resize: none;
  transition: border-color 120ms ease;
  font-family: inherit;
  overflow-y: auto; 
}

.input-wrapper textarea:focus {
  background: white;
  border-color: rgba(249, 115, 22, 0.58);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.16);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f97316;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 120ms ease;
  flex-shrink: 0;
}

.send-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .agent-dialog-container {
    width: 100%;
  }
}

/* ========================================== */
/* 关键修改：商品网格 - 横向排列，横向滚动 */
/* ========================================== */
.chat-product-grid {
  margin-top: 12px;
  display: flex;
  flex-direction: row; /* 水平排列：商品从左到右排列 */
  flex-wrap: nowrap; /* 不换行，确保所有商品都在同一行 */
  overflow-x: auto; /* 横向滚动 */
  overflow-y: hidden; /* 隐藏垂直滚动 */
  gap: 12px;
  max-width: 100%;
  height: auto;
  padding-bottom: 8px; /* 为滚动条留出空间 */
  scrollbar-width: thin; /* Firefox 滚动条样式 */
  scrollbar-color: #c1c1c1 #f1f1f1; /* Firefox 滚动条颜色 */
}

/* Webkit 滚动条样式 */
.chat-product-grid::-webkit-scrollbar {
  height: 6px; /* 水平滚动条高度 */
}

.chat-product-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-product-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
  transition: background 0.3s;
}

.chat-product-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.chat-product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  flex: 0 0 auto; /* 不伸缩，不收缩，自动宽度 */
  width: 180px; /* 固定宽度 */
  margin-right: 0; /* 使用 gap 代替 margin-right */
}

.chat-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #f97316;
}

.chat-product-img {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
}

.chat-product-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.chat-product-card:hover .chat-product-img img {
  transform: scale(1.05);
}

.chat-condition {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.chat-product-info {
  padding: 12px;
}

.chat-product-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-product-subtitle {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.chat-current-price {
  font-size: 16px;
  font-weight: 700;
  color: #f97316;
}

.chat-original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.chat-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #888;
}

.chat-view-count, .chat-fav-count {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 用户消息中的商品卡片样式调整 */
.user-msg .chat-product-card {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(255, 255, 255, 0.3);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .chat-product-grid {
    gap: 8px;
    padding-bottom: 6px;
  }
  
  .chat-product-card {
    width: 150px; /* 移动端稍微窄一点 */
  }
  
  .chat-product-img {
    height: 100px;
  }
  
  .chat-product-info {
    padding: 8px;
  }
  
  .chat-product-title {
    font-size: 13px;
  }
  
  .chat-current-price {
    font-size: 14px;
  }
}
</style>
