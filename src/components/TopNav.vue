<!-- TopNavbar.vue -->
<template>
  <!-- 顶部导航栏 -->
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="site-topnav-row max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
      <!-- 左侧Logo -->
      <a href="#" class="flex items-center gap-2 shrink-0 no-underline" @click.prevent="goToHome">
        <i class="fa fa-fish text-2xl text-xianyuText" aria-hidden="true"></i>
        <h1 class="text-xl font-bold text-xianyuText m-0">荔园交易</h1>
      </a>

      <!-- 中间搜索区域 -->
      <div class="searchBox">
        <div class="searchRow">
          <input
            type="text"
            v-model="searchInput"
            placeholder="搜索闲置物品"
            @keypress.enter="handleSearch"
          />
          <button @click="handleSearch"><i class="fa fa-search"></i></button>
        </div>
        <div class="hotTags">
          <span>热门：</span>
          <a
            href="#"
            v-for="tag in hotTags"
            :key="tag"
            @click.prevent="searchTag(tag)"
            >{{ tag }}</a
          >
        </div>
      </div>

      <!-- 右侧导航链接 -->
      <nav class="navLinks">
        <a href="#" @click.prevent="goToForum">
          <i class="fa fa-comments"></i>
          社区
        </a>
        <a href="#" @click.prevent="goToCart">
          <i class="fa fa-shopping-cart"></i>
          购物车
        </a>
        <a href="#" @click.prevent="goToMessage">
          <i class="fa fa-bell"></i>
          消息
        </a>
        <template v-if="userStore.isLoggedIn">
          <a href="#" @click.prevent="goToUserCenter">
            <i class="fa fa-user"></i>
            我的
          </a>
        </template>
        <template v-else>
          <a href="#" @click.prevent="goToLogin">
            <i class="fa fa-user"></i>
            登录/注册
          </a>
        </template>
      </nav>
    </div>
  </header>
  
   <div class="floatTools">
      <button v-for="t in floatingTools" :key="t.id" class="floatBtn" @click="handleTool(t)">
        <i :class="t.icon"></i>
        <span class="floatTip">{{ t.label }}</span>
      </button>
    </div>
</template>

<script setup lang="ts">
// 导入Vue组合式API和状态管理
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore' // 请根据您的实际路径调整

const floatingTools = [
  { id: 1, icon: 'fa fa-plus', label: '发闲置', action: 'publish' },
  { id: 2, icon: 'fa fa-envelope', label: '消息', action: 'message' },
  { id: 3, icon: 'fa fa-qrcode', label: '二维码', action: 'qrcode' },
  { id: 4, icon: 'fa fa-mobile', label: 'APP', action: 'app' },
  { id: 5, icon: 'fa fa-commenting', label: '反馈', action: 'feedback' },
  { id: 6, icon: 'fa fa-headphones', label: '客服', action: 'service' }
]

const handleTool = (t: { action: string }) => {
  if (t.action === 'publish') {
    router.push('/publish')
    return
  }

  if (t.action === 'message') {
    goToChat()
    return
  }

  const msgs: Record<string, string> = {
    qrcode: '商品码功能开发中',
    app: '打开应用商店下载荔园APP',
    feedback: '欢迎提出宝贵意见和建议！',
    service: '正在为您连接客服...'
  }
  alert(msgs[t.action] || '功能开发中')
}
const goToChat = () => {
  router.push('/chat')
}
// 初始化路由和状态管理
const router = useRouter()
const userStore = useUserStore()

// 搜索输入框的响应式数据
const searchInput = ref('')

// 热门标签数据
const hotTags = ['iPhone', '小米手机', '数码相机', '闲置衣服']

/**
 * 处理搜索功能
 * 当点击搜索按钮或按下回车时触发
 */
const handleSearch = () => {
  if (searchInput.value.trim()) {
    // 跳转到搜索页面，并携带查询参数
    router.push({ path: '/search', query: { q: searchInput.value.trim() } })
  }
}

/**
 * 点击热门标签进行搜索
 * @param tag - 被点击的标签文本
 */
const searchTag = (tag: string) => {
  searchInput.value = tag
  handleSearch()
}

/**
 * 导航到论坛页面
 */
const goToForum = () => {
  router.push('/forum')
}

const goToHome = () => {
  router.push('/')
}
/**
 * 导航到用户中心页面
 */
const goToUserCenter = () => {
  router.push('/user/center')
}

/**
 * 导航到购物车页面
 */
const goToCart = () => {
  router.push('/cart')
}

/**
 * 导航到消息页面
 */
const goToMessage = () => {
  router.push('/chat')
}

/**
 * 导航到登录页面
 */
const goToLogin = () => {
  router.push('/user/login')
}
</script>

<style scoped>
/* 顶栏布局与字号由模板上的 Tailwind 类控制，与 ForumLayout 保持一致 */
/* 悬浮工具栏 */
.floatTools {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 30;
}

.floatBtn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--panel);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text);
  position: relative;
  transition: transform 120ms ease, background 120ms ease;
}

.floatBtn:hover {
  transform: translateY(-2px);
  background: #f5f5f5;
}

.floatTip {
  position: absolute;
  right: calc(100% + 8px);
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms;
}

.floatBtn:hover .floatTip {
  opacity: 1;
}

/* 搜索框容器 */
.searchBox {
  flex: 1;
  max-width: 560px;
  margin: 0 auto;
}

/* 搜索输入行 */
.searchRow {
  display: flex;
}

.searchRow input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-right: none;
  border-radius: 20px 0 0 20px;
  background: #f3f4f6;
  outline: none;
  font-size: 14px;
}

.searchRow input:focus {
  background: #fff;
  border-color: rgba(249, 115, 22, 0.58);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.16);
}

.searchRow button {
  width: 56px;
  height: 40px;
  border: none;
  border-radius: 0 20px 20px 0;
  background: #f97316; /* 主色调橙色 */
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.searchRow button:hover {
  background: #ea580c; /* 悬停时深橙色 */
}

/* 热门标签区域 */
.hotTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280; /* 灰色文字 */
}

.hotTags a {
  color: #6b7280;
  text-decoration: none;
  transition: color 200ms;
}

.hotTags a:hover {
  color: #f97316; /* 悬停时变为主题橙色 */
}

/* 右侧导航链接 */
.navLinks {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}

.navLinks a {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition: color 200ms;
}

.navLinks a:hover {
  color: #f97316;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .site-topnav-row {
    flex-wrap: wrap;
  }
  .searchBox {
    order: 3;
    flex-basis: 100%;
    max-width: none;
    margin-top: 12px;
  }
}

@media (max-width: 600px) {
  .navLinks {
    font-size: 13px;
    gap: 15px;
  }
}
</style>