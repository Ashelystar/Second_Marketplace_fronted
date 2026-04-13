<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- 商品信息栏 -->
      <div class="goods-sidebar" v-if="currentGoods">
        <div class="sidebar-header">
          <h3>商品信息</h3>
          <RouterLink class="btn btn-outline btn-sm" :to="`/goods/${currentGoods.id}`">查看详情</RouterLink>
        </div>
        <div class="goods-preview">
          <img :src="currentGoods.coverUrl" :alt="currentGoods.name" />
          <div class="goods-info">
            <div class="goods-name">{{ currentGoods.name }}</div>
            <div class="goods-price">{{ currentGoods.priceText }}</div>
          </div>
        </div>
        <div class="goods-desc">
          {{ currentGoods.desc }}
        </div>
      </div>
      
      <!-- 聊天主区域 -->
      <div class="chat-main">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-partner">
            <div class="partner-avatar">👨‍💼</div>
            <div class="partner-info">
              <div class="partner-name">商家客服</div>
              <div class="partner-status online">在线</div>
            </div>
          </div>
          <div class="chat-actions">
            <button class="btn btn-outline btn-sm" @click="clearMessages">清空记录</button>
          </div>
        </div>
        
        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message', message.sender]"
          >
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-time">{{ formatTime(message.time) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="message-input">
          <div class="quick-questions" v-if="quickQuestions.length > 0">
            <button 
              v-for="(question, index) in quickQuestions" 
              :key="index"
              class="quick-question-btn"
              @click="sendQuickQuestion(question)"
            >
              {{ question }}
            </button>
          </div>
          
          <div class="input-area">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              class="message-input-field"
            />
            <button 
              class="send-btn" 
              @click="sendMessage"
              :disabled="!inputMessage.trim()"
            >
              发送
            </button>
          </div>
          
          <div class="input-hint">
            咨询商品相关问题，商家会尽快回复您
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../../stores/chat'

interface Message {
  text: string
  sender: 'user' | 'seller'
  time: Date
}

const router = useRouter()
const chatStore = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)

// 当前商品（从store获取）
const currentGoods = computed(() => chatStore.currentGoods)

// 消息列表
const messages = ref<Message[]>([
  { text: '您好！有什么可以帮您？', sender: 'seller', time: new Date(Date.now() - 300000) },
  { text: '我想咨询一下这个商品的详细信息', sender: 'user', time: new Date(Date.now() - 120000) },
  { text: '很高兴为您服务！这款商品目前有现货，支持7天无理由退换。您有什么具体问题吗？', sender: 'seller', time: new Date() }
])

// 输入的消息
const inputMessage = ref('')

// 快捷问题
const quickQuestions = ref([
  '商品有现货吗？',
  '什么时候发货？',
  '支持退换货吗？',
  '有优惠吗？',
  '质量怎么样？'
])

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  messages.value.push({
    text: inputMessage.value,
    sender: 'user',
    time: new Date()
  })
  
  // 模拟商家回复
  setTimeout(() => {
    const replies = [
      '好的，我了解您的需求。',
      '这款商品目前库存充足。',
      '我们支持7天无理由退换。',
      '今天下单，一般明天发货。',
      '可以给您申请一个优惠券。'
    ]
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    
    messages.value.push({
      text: randomReply,
      sender: 'seller',
      time: new Date()
    })
    
    scrollToBottom()
  }, 1000)
  
  inputMessage.value = ''
  scrollToBottom()
}

// 发送快捷问题
const sendQuickQuestion = (question: string) => {
  messages.value.push({
    text: question,
    sender: 'user',
    time: new Date()
  })
  
  // 模拟商家回复
  setTimeout(() => {
    messages.value.push({
      text: `关于"${question}"，我可以为您详细解答。`,
      sender: 'seller',
      time: new Date()
    })
    scrollToBottom()
  }, 1000)
  
  scrollToBottom()
}

// 清空消息记录
const clearMessages = () => {
  if (confirm('确定要清空聊天记录吗？')) {
    messages.value = []
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (time: Date) => {
  return time.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  // 如果没有当前商品，返回商品列表
  if (!currentGoods.value) {
    router.push('/forum')
    return
  }
  
  scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 40px);
}

.chat-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  height: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.goods-sidebar {
  background: #f8f9fa;
  padding: 20px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.goods-preview {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.goods-preview img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #eee;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-price {
  color: #00a4bb;
  font-weight: 600;
  font-size: 16px;
}

.goods-desc {
  flex: 1;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  overflow-y: auto;
  padding-right: 8px;
}

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-partner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.partner-info {
  display: flex;
  flex-direction: column;
}

.partner-name {
  font-weight: 600;
  font-size: 16px;
}

.partner-status {
  font-size: 12px;
  color: #666;
}

.partner-status.online {
  color: #52c41a;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fafafa;
}

.message {
  display: flex;
  max-width: 70%;
}

.message.user {
  align-self: flex-end;
}

.message.seller {
  align-self: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  line-height: 1.4;
}

.message.user .message-content {
  background: #00a4bb;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.seller .message-content {
  background: white;
  color: #333;
  border: 1px solid #eee;
  border-bottom-left-radius: 4px;
}

.message-text {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.message-input {
  padding: 20px;
  border-top: 1px solid #eee;
  background: white;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-question-btn {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-question-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.input-area {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.message-input-field {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input-field:focus {
  border-color: #00a4bb;
}

.send-btn {
  padding: 12px 24px;
  background: #00a4bb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;
}

.send-btn:hover:not(:disabled) {
  background: #008c9e;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  font-size: 12px;
  color: #999;
  text-align: center;
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
  
  .goods-sidebar {
    display: none;
  }
  
  .message {
    max-width: 85%;
  }
}
</style>