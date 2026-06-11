<template>
  <!-- 遮罩层（可选，点击遮罩关闭） -->
  <Teleport to="body">
    <transition name="dialog-fade">
      <!-- 对话框容器 -->
      <div 
        v-if="visible" 
        class="agent-dialog-container"
        :class="{ 'mobile-fullscreen': isMobile }"
      >
        <!-- 对话框主体 -->
        <div class="agent-dialog">
          <!-- 头部 -->
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

          <!-- 消息区域 -->
          <div class="dialog-body" ref="messageContainer">
            <!-- 欢迎消息 -->
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

            <!-- 消息列表 -->
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
                <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
              </div>
            </div>

            <!-- 正在输入 -->
            <div v-if="isTyping" class="typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="dialog-footer">
            <div class="input-wrapper">
              <textarea
                ref="inputRef"
                v-model="inputMessage"
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

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue'

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
const messages = reactive([])
const inputMessage = ref('')
const isTyping = ref(false)
const messageContainer = ref(null)
const inputRef = ref(null)
const isMobile = ref(false)

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
  adjustInputHeight()
  
  scrollToBottom()
  isTyping.value = true

  try {
    // 调用后端 API
    const response = await fetchAgentResponse(question)
    
    setTimeout(() => {
      isTyping.value = false
      messages.push({
        role: 'assistant',
        content: response.answer || '抱歉，我暂时无法回答。',
        timestamp: new Date()
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
  }
}

// 调用后端 API
const fetchAgentResponse = async (question) => {
  // TODO: 替换为你的实际 API 地址
  const API_URL = 'http://localhost:8000/api/agent'
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question,
        user_id: 'szu_user',
        session_id: Date.now().toString()
      })
    })
    
    if (!response.ok) throw new Error('API error')
    return await response.json()
  } catch (error) {
    // 开发阶段使用模拟数据
    return getMockResponse(question)
  }
}

// 模拟响应
const getMockResponse = (question) => {
  const q = question.toLowerCase()
  
  if (q.includes('苹果') || q.includes('iphone')) {
    return {
      answer: '为您找到 2 款苹果手机：\n\n📱 **iPhone 13**\n¥2999 | 成色极佳\n📱 **iPhone 12**\n¥2200 | 功能完好'
    }
  }
  
  if (q.includes('热门')) {
    return {
      answer: '🔥 当前热门：\n1. iPhone 13 - ¥2999\n2. ThinkPad - ¥4500\n3. AirPods - ¥1200'
    }
  }
  
  if (q.includes('禁售')) {
    return {
      answer: '🚫 禁售物品：\n• 易燃易爆品\n• 管制刀具\n• 食品药品\n• 违规电器\n• 贴身旧物'
    }
  }
  
  return {
    answer: '我可以帮你：\n• 搜索商品\n• 查询价格\n• 了解规则\n• 查看热门'
  }
}

// 快速问题
const sendQuickQuestion = (question) => {
  inputMessage.value = question
  sendMessage()
}

// 换行
const newLine = () => {
  inputMessage.value += '\n'
}

// 调整输入框高度
const adjustInputHeight = () => {
  const textarea = inputRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px'
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// 格式化消息
const formatMessage = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 监听显示状态变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      inputRef.value?.focus()
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
/* Agent 悬浮对话框样式 - 与现有风格保持一致 */
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

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
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

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
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
  transition: all 120ms ease;
  font-family: inherit;
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
</style>