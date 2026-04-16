<!-- src/components/layout/HeaderNav.vue -->
<template>
  <nav class="sticky top-0 z-50 bg-xianyuBg border-b border-gray-200 px-4 py-3">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-8">
        <router-link to="/" class="text-2xl font-bold text-xianyuText hover:opacity-80">
          首页
        </router-link>
        
        <!-- 搜索框 -->
        <div class="hidden md:block">
          <div class="relative">
            <input
              type="text"
              placeholder="搜索商品"
              class="w-64 px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>

      <!-- 右侧导航 -->
      <div class="flex items-center gap-6">
        <router-link to="/forum" class="hover:text-xianyuText flex items-center gap-1">
          <i class="fa fa-comments"></i>
          <span class="hidden sm:inline">社区</span>
        </router-link>
        
        <router-link to="/cart" class="hover:text-xianyuText flex items-center gap-1">
          <i class="fa fa-shopping-cart"></i>
          <span class="hidden sm:inline">购物车</span>
        </router-link>
        
        <router-link to="/chat" class="hover:text-xianyuText flex items-center gap-1">
          <i class="fa fa-comment"></i>
          <span class="hidden sm:inline">消息</span>
        </router-link>
        
        <router-link to="/order" class="hover:text-xianyuText flex items-center gap-1">
          <i class="fa fa-file-text-o"></i>
          <span class="hidden sm:inline">我的订单</span>
        </router-link>
        
        <!-- 用户头像/登录入口 -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
            <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-400 text-white">
              <i class="fa fa-user"></i>
            </div>
          </div>
          <span v-if="userStore.user" class="text-sm">{{ userStore.user.nickname }}</span>
          <button v-else class="hover:text-xianyuText flex items-center gap-1" @click="$router.push('/user/login')">
            <i class="fa fa-user"></i> 登录/注册
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// 这里可以导入全局的用户状态管理
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>