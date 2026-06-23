<template>
  <div class="admin-agent">
    <!-- 左侧对话区 -->
    <div class="agent-chat-panel">
      <div class="chat-header">
        <div class="agent-avatar">
          <i class="fa fa-robot"></i>
        </div>
        <div class="agent-info">
          <h3>智能小荔</h3>
          <p>管理员 AI 助手 · 支持 RAG 知识检索</p>
        </div>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div v-if="messages.length === 0" class="welcome-area">
          <div class="welcome-icon"><i class="fa fa-magic"></i></div>
          <p class="welcome-title">管理员 AI 助手</p>
          <p class="welcome-desc">我可以帮你搜索商品、查询规则、回答平台相关问题</p>
          <div class="quick-questions">
            <span v-for="q in quickQuestions" :key="q" class="quick-tag" @click="sendQuick(q)">{{ q }}</span>
          </div>
        </div>

        <div v-for="(msg, idx) in messages" :key="idx" class="msg-row" :class="{ user: msg.role === 'user' }">
          <div class="msg-avatar">
            <i :class="msg.role === 'user' ? 'fa fa-user-circle' : 'fa fa-robot'"></i>
          </div>
          <div class="msg-bubble">
            <div class="msg-text" v-html="formatMessage(msg.content)"></div>

            <!-- 商品卡片 -->
            <div v-if="msg.products?.length" class="msg-products">
              <div v-for="p in msg.products" :key="p.id" class="product-card" @click="goDetail(p.id)">
                <img :src="getProductImg(p)" class="product-img" />
                <div class="product-body">
                  <div class="product-title">{{ p.title }}</div>
                  <div class="product-price">¥{{ p.sellingPrice }}</div>
                </div>
              </div>
            </div>

            <div class="msg-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>

        <div v-if="isTyping" class="typing-row">
          <div class="msg-avatar"><i class="fa fa-robot"></i></div>
          <div class="msg-bubble typing-bubble">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <textarea
          ref="inputRef"
          v-model="inputText"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.shift.enter="inputText += '\n'"
          placeholder="输入问题，回车发送..."
          rows="1"
        ></textarea>
        <button class="send-btn" :disabled="!inputText.trim() || isTyping" @click="sendMessage">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- 右侧知识库管理 -->
    <div class="knowledge-panel">
      <div class="knowledge-header">
        <h3><i class="fa fa-database"></i> 知识库管理</h3>
        <p>上传文档到 RAG 知识库，AI 将基于这些知识回答问题</p>
      </div>

      <!-- 上传区域 -->
      <div class="upload-area">
        <input
          ref="fileInput"
          type="file"
          accept=".md,.txt,.pdf,.docx,.doc"
          style="display:none"
          @change="handleFileSelect"
        />
        <div class="upload-dropzone" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
          <i class="fa fa-cloud-upload"></i>
          <p>点击或拖拽文件到此处上传</p>
          <span>支持 .md / .txt / .pdf / .docx</span>
        </div>
        <div v-if="uploading" class="upload-progress">
          <i class="fa fa-spinner fa-spin"></i> 正在上传...
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list">
        <h4>已上传文件 ({{ files.length }})</h4>
        <div v-if="files.length === 0" class="empty-files">
          <i class="fa fa-folder-open"></i>
          <span>暂无上传文件</span>
        </div>
        <div v-for="f in files" :key="f.filename" class="file-item">
          <div class="file-info">
            <i :class="getFileIcon(f.filename)"></i>
            <span class="file-name" :title="f.filename">{{ f.filename }}</span>
            <span class="file-size">{{ formatSize(f.size) }}</span>
          </div>
          <button class="delete-file-btn" @click="deleteFile(f.filename)" :disabled="f.filename === 'platform_rules.md'">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import { ElMessage } from 'element-plus'

const AGENT_URL = 'http://localhost:8000'

const router = useRouter()
const userStore = useUserStore()

// 聊天状态
const messages = reactive<any[]>([])
const inputText = ref('')
const isTyping = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)

// 知识库状态
const files = ref<{ filename: string; size: number }[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const quickQuestions = [
  '最近有什么热门商品？',
  '平台有哪些交易规则？',
  '搜索一下 iPhone',
  '平台禁止哪些物品交易？',
  '用户纠纷怎么处理？'
]

onMounted(() => {
  loadFiles()
})

// ========== 聊天逻辑 ==========

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return
  inputText.value = ''

  messages.push({ role: 'user', content: text, timestamp: Date.now() })
  await scrollBottom()
  isTyping.value = true

  try {
    const userId = userStore.userInfo?.id || 1
    const res = await fetch(`${AGENT_URL}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, message: text })
    })
    const data = await res.json()

    if (data.success || data.code === 200) {
      messages.push({
        role: 'assistant',
        content: data.message || '收到，但暂无回复内容',
        products: data.product_ids?.length ? [] : undefined,
        timestamp: Date.now()
      })

      // 如果有商品ID，拉取商品详情
      if (data.product_ids?.length) {
        await loadProducts(data.product_ids)
      }
    } else {
      messages.push({
        role: 'assistant',
        content: data.message || '抱歉，处理出错，请重试',
        timestamp: Date.now()
      })
    }
  } catch (err: any) {
    messages.push({
      role: 'assistant',
      content: '⚠️ 连接 Agent 服务失败，请确认 Agent 已启动（端口 8000）',
      timestamp: Date.now()
    })
  } finally {
    isTyping.value = false
    await scrollBottom()
  }
}

async function loadProducts(ids: number[]) {
  const idx = messages.length - 1
  try {
    const { getProductDetail } = await import('@/api/goods')
    const products = await Promise.all(ids.map(id => getProductDetail(id).catch(() => null)))
    messages[idx].products = products.filter(Boolean)
  } catch {}
}

function sendQuick(q: string) {
  inputText.value = q
  sendMessage()
}

// ========== 知识库管理 ==========

async function loadFiles() {
  try {
    const res = await fetch(`${AGENT_URL}/knowledge/list`)
    const data = await res.json()
    if (data.code === 200) {
      files.value = data.data || []
    }
  } catch {
    console.error('加载知识库文件列表失败')
  }
}

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    await uploadFile(file)
    input.value = ''
  }
}

async function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) await uploadFile(file)
}

async function uploadFile(file: File) {
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${AGENT_URL}/knowledge/upload`, {
      method: 'POST',
      body: form
    })
    const data = await res.json()
    if (data.code === 200) {
      ElMessage.success(data.message)
      await loadFiles()
    } else {
      ElMessage.error(data.message || data.detail || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败，请检查 Agent 服务是否启动')
  } finally {
    uploading.value = false
  }
}

async function deleteFile(filename: string) {
  try {
    const res = await fetch(`${AGENT_URL}/knowledge/delete/${encodeURIComponent(filename)}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    if (data.code === 200) {
      ElMessage.success(data.message)
      await loadFiles()
    } else {
      ElMessage.error(data.message || data.detail || '删除失败')
    }
  } catch {
    ElMessage.error('删除失败')
  }
}

// ========== 工具函数 ==========

function formatMessage(text: string) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function formatTime(ts: number) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    md: 'fa fa-file-text',
    txt: 'fa fa-file-text-o',
    pdf: 'fa fa-file-pdf-o',
    docx: 'fa fa-file-word-o',
    doc: 'fa fa-file-word-o'
  }
  return map[ext || ''] || 'fa fa-file-o'
}

function getProductImg(p: any) {
  return getImageUrl(p.images?.[0]?.imageUrl) || PLACEHOLDER_IMG
}

function goDetail(id: number) {
  router.push(`/goods/${id}`)
}

async function scrollBottom() {
  await nextTick()
  const el = messageContainer.value
  if (el) el.scrollTop = el.scrollHeight
}

watch(() => inputText.value, async () => {
  await nextTick()
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
})
</script>

<style scoped>
.admin-agent {
  display: flex;
  gap: 24px;
  height: calc(100vh - 140px);
  min-height: 600px;
}

/* ========== 左侧聊天 ========== */
.agent-chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.agent-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.agent-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.agent-info p {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.85;
}

/* 消息区 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fc;
}

.welcome-area {
  text-align: center;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 12px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px;
}

.welcome-desc {
  color: #999;
  font-size: 13px;
  margin: 0 0 20px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-tag {
  padding: 6px 14px;
  background: #f0f0ff;
  color: #667eea;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  background: #667eea;
  color: #fff;
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #999;
  flex-shrink: 0;
}

.msg-row.user .msg-avatar {
  background: #667eea;
  color: #fff;
}

.msg-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.msg-row.user .msg-bubble {
  background: #667eea;
  color: #fff;
}

.msg-time {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.msg-row.user .msg-time {
  text-align: right;
}

.msg-products {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.product-card {
  width: 160px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.product-body {
  padding: 8px;
}

.product-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
  margin-top: 4px;
}

.typing-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 18px;
}

.typing-bubble .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-bubble .dot:nth-child(2) { animation-delay: 0.2s; }
.typing-bubble .dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区 */
.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
}

.chat-input-area textarea {
  flex: 1;
  resize: none;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
  max-height: 120px;
  line-height: 1.5;
}

.chat-input-area textarea:focus {
  border-color: #667eea;
}

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========== 右侧知识库 ========== */
.knowledge-panel {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.knowledge-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.knowledge-header h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.knowledge-header h3 i {
  color: #667eea;
}

.knowledge-header p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.upload-area {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.upload-dropzone {
  border: 2px dashed #d0d0d0;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.upload-dropzone i {
  font-size: 28px;
  color: #667eea;
  margin-bottom: 8px;
}

.upload-dropzone p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.upload-dropzone span {
  font-size: 11px;
  color: #bbb;
}

.upload-progress {
  text-align: center;
  padding: 12px;
  color: #667eea;
  font-size: 13px;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.file-list h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #666;
}

.empty-files {
  text-align: center;
  padding: 24px;
  color: #ccc;
}

.empty-files i {
  font-size: 24px;
  display: block;
  margin-bottom: 6px;
}

.empty-files span {
  font-size: 13px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8f9fc;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f0f0ff;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.file-info i {
  color: #667eea;
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #bbb;
  flex-shrink: 0;
}

.delete-file-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-file-btn:hover:not(:disabled) {
  background: #fef0f0;
  color: #f56c6c;
}

.delete-file-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 滚动条 */
.chat-messages::-webkit-scrollbar,
.file-list::-webkit-scrollbar {
  width: 4px;
}
.chat-messages::-webkit-scrollbar-thumb,
.file-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}
</style>
