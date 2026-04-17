<template>
  <div class="lg:col-span-1 user-side-wrap">
    <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
      <div class="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
        <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden ring-2 ring-orange-100">
          <img v-if="avatarUrl" :src="avatarUrl" alt="头像" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-white text-2xl">
            <i class="fa fa-user"></i>
          </div>
        </div>
        <div>
          <h2 class="font-semibold text-lg">{{ displayName }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ userStore.isLoggedIn ? '欢迎回来' : '未登录' }}</p>
          <div class="flex gap-4 mt-2 text-sm text-gray-600" v-if="userStore.isLoggedIn">
            <span>资料完整度 80%</span>
          </div>
        </div>
      </div>

      <nav class="space-y-2">
        <router-link
          to="/user/center" 
          :class="linkClass('/user/center')"
        >
          <i class="fa fa-cube w-5"></i>
          <span>我的商品</span>
        </router-link>

        <router-link
          to="/user/orders" 
          :class="linkClass('/user/orders')"
        >
          <i class="fa fa-exchange w-5"></i>
          <span>我的交易</span>
        </router-link>

        <router-link
          to="/user/favorites" 
          :class="linkClass('/user/favorites')"
        >
          <i class="fa fa-heart w-5"></i>
          <span>我的收藏</span>
        </router-link>

        <router-link
          to="/user/profile" 
          :class="linkClass('/user/profile')"
        >
          <i class="fa fa-user-circle w-5"></i>
          <span>个人资料</span>
        </router-link>

        <router-link
          to="/user/address"
          :class="linkClass('/user/address')"
        >
          <i class="fa fa-map-marker w-5"></i>
          <span>地址管理</span>
        </router-link>

        <router-link
          to="/user/setting" 
          :class="linkClass('/user/setting')"
        >
          <i class="fa fa-cog w-5"></i>
          <span>账号与安全</span>
        </router-link>
      </nav>

      <button
        @click="$router.push('/publish')"
        class="mt-6 w-full bg-xianyuText text-white py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors flex items-center justify-center gap-2 hover:-translate-y-[1px]"
      >
        <i class="fa fa-plus"></i>
        <span>卖闲置</span>
      </button>

      <button
        v-if="userStore.isLoggedIn"
        @click="handleLogout"
        class="mt-3 w-full border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        退出登录
      </button>


    <div class="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
      <h3 class="font-semibold text-lg mb-4">信用及评价</h3>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600">信用分</span>
            <span class="font-semibold text-xianyuText">{{ creditScore }}</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-xianyuText rounded-full" :style="{ width: Math.min(creditScore / 10, 100) + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600">好评率</span>
            <span class="font-semibold text-xianyuText">{{ positiveRate }}%</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full" :style="{ width: positiveRate + '%' }"></div>
          </div>
        </div>
      </div>
      <button class="mt-4 w-full text-sm text-xianyuText hover:text-xianyuText/80" @click="$router.push('/user/setting')">
        查看详情 >
      </button>
    </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const avatarUrl = computed(() => userStore.userInfo?.avatar || '')
const displayName = computed(() => userStore.userInfo?.username || '未登录用户')
const creditScore = 100
const positiveRate = 99

const linkClass = (path: string) => {
  const active = route.path === path || route.path.startsWith(`${path}/`)
  return [
    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
    active ? 'bg-orange-50 text-xianyuText font-semibold shadow-sm' : 'hover:bg-gray-50 text-gray-700',
  ]
}

const handleLogout = () => {
  userStore.logout()
  router.push('/user/login')
}
</script>

<style scoped>
.user-side-wrap {
  animation: slide-in 260ms ease both;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .user-side-wrap > div {
    position: static;
  }
}
</style>