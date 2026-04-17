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

      <!-- 右侧导航链接（结构与社区 ForumLayout 顶栏一致） -->
      <nav class="navLinks">
        <a href="#" @click.prevent="goToForum">
          <i class="fa fa-comments"></i>
          社区
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
</template>

<script setup lang="ts">
// 导入Vue组合式API和状态管理
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore' // 请根据您的实际路径调整

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
 * 导航到登录页面
 */
const goToLogin = () => {
  router.push('/user/login')
}
</script>

<style scoped>
/* 顶栏布局与字号由模板上的 Tailwind 类控制，与 ForumLayout 保持一致 */

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