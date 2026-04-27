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
        <div class="text-sm text-gray-600">
          总评价数：<span class="font-semibold text-xianyuText">{{ totalReviewCount }}</span>
        </div>
      </div>
      <button class="mt-4 w-full text-sm text-xianyuText hover:text-xianyuText/80" @click="$router.push('/user/setting')">
        查看详情 >
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
      <h3 class="font-semibold text-lg mb-4">用户统计</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg bg-gray-50 p-3">
          <div class="text-gray-500">商品数</div>
          <div class="text-lg font-semibold text-xianyuText">{{ userStats.productCount }}</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-3">
          <div class="text-gray-500">订单数</div>
          <div class="text-lg font-semibold text-xianyuText">{{ userStats.orderCount }}</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-3">
          <div class="text-gray-500">收藏数</div>
          <div class="text-lg font-semibold text-xianyuText">{{ userStats.favoriteCount }}</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-3">
          <div class="text-gray-500">关注数</div>
          <div class="text-lg font-semibold text-xianyuText">{{ userStats.followCount }}</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-3 col-span-2">
          <div class="text-gray-500">粉丝数</div>
          <div class="text-lg font-semibold text-xianyuText">{{ userStats.followerCount }}</div>
        </div>
      </div>
    </div>
        </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { logoutApi, getUserCreditScoreApi, getUserStatsApi } from '@/api/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const avatarUrl = computed(() => userStore.userInfo?.avatar || '')
const displayName = computed(() => userStore.userInfo?.username || '未登录用户')
const creditScore = ref<number>(0)
const positiveRate = ref<number>(0)
const totalReviewCount = ref<number>(0)
const userStats = ref({
  productCount: 0,
  orderCount: 0,
  favoriteCount: 0,
  followCount: 0,
  followerCount: 0,
})

const resetCreditData = () => {
  creditScore.value = 0
  positiveRate.value = 0
  totalReviewCount.value = 0
}

const resetUserStats = () => {
  userStats.value = {
    productCount: 0,
    orderCount: 0,
    favoriteCount: 0,
    followCount: 0,
    followerCount: 0,
  }
}

const fetchCreditScore = async () => {
  if (!userStore.isLoggedIn) {
    resetCreditData()
    return
  }
  try {
    const result = await getUserCreditScoreApi()
    // 使用 ?? 保留后端返回的 0 值，避免 0 被错误替换为默认值
    creditScore.value = Math.max(0, Number(result.creditScore ?? 0))
    positiveRate.value = Math.max(0, Math.min(100, Number(result.positiveRate ?? 0)))
    totalReviewCount.value = Math.max(0, Number(result.totalReviewCount ?? 0))
  } catch (error) {
    console.error('获取信用分失败:', error)
    resetCreditData()
  }
}

const fetchUserStats = async () => {
  if (!userStore.isLoggedIn) {
    resetUserStats()
    return
  }
  try {
    const stats = await getUserStatsApi()
    userStats.value = {
      productCount: Math.max(0, Number(stats.productCount ?? 0)),
      orderCount: Math.max(0, Number(stats.orderCount ?? 0)),
      favoriteCount: Math.max(0, Number(stats.favoriteCount ?? 0)),
      followCount: Math.max(0, Number(stats.followCount ?? 0)),
      followerCount: Math.max(0, Number(stats.followerCount ?? 0)),
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    resetUserStats()
  }
}

onMounted(() => {
  console.log('✅ 用户侧边栏组件已挂载')
  fetchCreditScore()
  fetchUserStats()
})

watch(
  () => userStore.isLoggedIn,
  () => {
    fetchCreditScore()
    fetchUserStats()
  }
)
const linkClass = (path: string) => {
  const active = route.path === path || route.path.startsWith(`${path}/`)
  return [
    'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
    active ? 'bg-orange-50 text-xianyuText font-semibold shadow-sm' : 'hover:bg-gray-50 text-gray-700',
  ]
}

const handleLogout = async () => {
  try {
    await logoutApi()
  } catch (error) {
    // 即使后端登出失败，也清除本地登录态，避免用户被卡住
    console.error('登出接口调用失败:', error)
  } finally {
    userStore.logout()
    router.push('/user/login')
  }
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