<template>
  <div class="forum-layout">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2" @click.prevent="router.push('/')">
          <i class="fa fa-fish text-2xl text-xianyuText"></i>
          <h1 class="text-xl font-bold text-xianyuText">闲鱼</h1>
        </a>

        <div class="flex-1 max-w-xl mx-4">
          <div class="relative">
            <input
              v-model="searchInput"
              type="text"
              placeholder="搜索闲置物品"
              class="w-full h-10 px-4 pr-10 rounded-full bg-gray-100 border border-gray-300 placeholder-gray-500 focus:bg-white focus:border-accentBlue focus:outline-none transition-all"
              @keypress.enter="handleSearch"
            />
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-xianyuText"
              @click="handleSearch"
            >
              <i class="fa fa-search"></i>
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
            <span>热门：</span>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('iPhone')">iPhone</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('小米手机')">小米手机</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('数码相机')">数码相机</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('闲置衣服')">闲置衣服</a>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-5 text-sm text-gray-700">
          <button class="hover:text-xianyuText flex items-center gap-1" @click="router.push('/forum')">
            <i class="fa fa-comments"></i>
            社区
          </button>
          <template v-if="userStore.isLoggedIn">
            <button class="hover:text-xianyuText flex items-center gap-1">
              <i class="fa fa-shopping-bag"></i>
              订单
            </button>
            <button class="hover:text-xianyuText flex items-center gap-1">
              <i class="fa fa-user"></i>
              我的
            </button>
          </template>
          <template v-else>
            <button class="hover:text-xianyuText flex items-center gap-1" @click="handleLogin">
              <i class="fa fa-user"></i>
              登录/注册
            </button>
          </template>
        </div>
      </div>
    </header>
    <main class="container forum-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const searchInput = ref('')

const handleSearch = () => {
  const keyword = searchInput.value.trim()
  if (!keyword) return
  router.push({ path: '/search', query: { q: keyword } })
}

const searchTag = (tag: string) => {
  searchInput.value = tag
  handleSearch()
}

const handleLogin = () => {
  userStore.login({ id: 1, username: '用户' })
  alert('登录成功！')
}
</script>

<style scoped>
.forum-layout {
  min-height: 100vh;
}

.forum-main {
  padding-top: 18px;
  padding-bottom: 24px;
}

.forum-main :deep(.btn-primary) {
  border-color: #f97316;
  background: #f97316;
  color: #fff;
}

.forum-main :deep(.btn-primary:hover) {
  border-color: #ea580c;
  background: #ea580c;
}

.forum-main :deep(.input:focus),
.forum-main :deep(.textarea:focus) {
  border-color: rgba(249, 115, 22, 0.58);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.16);
}
</style>
