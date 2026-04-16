<template>
  <div class="forum-layout">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2" @click.prevent="router.push('/')">
          <i class="fa fa-fish text-2xl text-xianyuText"></i>
          <h1 class="text-xl font-bold text-xianyuText">荔园交易</h1>
        </a>

        <div class="searchBox">
          <div class="searchRow">
            <input
              v-model="searchInput"
              type="text"
              placeholder="搜索闲置物品"
              @keypress.enter="handleSearch"
            />
            <button @click="handleSearch"><i class="fa fa-search"></i></button>
          </div>
          <div class="hotTags">
            <span>热门：</span>
            <a href="#" v-for="tag in hotTags" :key="tag" @click.prevent="searchTag(tag)">{{ tag }}</a>
          </div>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/forum')">
            <i class="fa fa-comments"></i>
            社区
          </a>
          <template v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="router.push('/user/center')">
              <i class="fa fa-user"></i>
              我的
            </a>
          </template>
          <template v-else>
            <a href="#" @click.prevent="handleLogin">
              <i class="fa fa-user"></i>
              登录/注册
            </a>
          </template>
        </nav>
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
const hotTags = ['iPhone', '小米手机', '数码相机', '闲置衣服']

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
  router.push('/user/login')
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

.searchBox {
  flex: 1;
  max-width: 560px;
  margin: 0 auto;
}

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
  border-color: #3b82f6;
}

.searchRow button {
  width: 56px;
  height: 40px;
  border: none;
  border-radius: 0 20px 20px 0;
  background: #f97316;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.searchRow button:hover {
  background: #ea580c;
}

.hotTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.hotTags a {
  color: #6b7280;
  text-decoration: none;
  transition: color 200ms;
}

.hotTags a:hover {
  color: #f97316;
}

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
