<!-- src/components/layout/UserSidebar.vue -->
<template>
  <div class="lg:col-span-1">
    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <!-- 用户信息卡片 -->
      <div class="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
        <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-white text-2xl">
            <i class="fa fa-user"></i>
          </div>
        </div>
        <div>
          <h2 class="font-semibold text-lg">{{ userStore.user?.nickname || '未登录用户' }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ userStore.user?.location || '未设置所在地' }}</p>
          <div class="flex gap-4 mt-2 text-sm text-gray-600">
            <span>{{ userStore.user?.followers || 0 }} 粉丝</span>
            <span>{{ userStore.user?.following || 0 }} 关注</span>
          </div>
        </div>
      </div>

      <!-- 菜单项 -->
      <nav class="space-y-2">
        <!-- 注意：这里的路由链接指向嵌套路由路径 -->
        <router-link 
          to="/user/center" 
          :class="['flex items-center gap-3 p-3 rounded-lg transition-colors', 
            $route.path.startsWith('/user/center/my-goods') ? 'bg-xianyuBg text-xianyuText' : 'hover:bg-gray-50']"
        >
          <i class="fa fa-cube w-5"></i>
          <span>我的商品</span>
        </router-link>
        
        <router-link 
          to="/user/orders" 
          :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
        >
          <i class="fa fa-exchange w-5"></i>
          <span>我的交易</span>
        </router-link>
        
        <router-link 
          to="/user/favorites" 
          :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
        >
          <i class="fa fa-heart w-5"></i>
          <span>我的收藏</span>
        </router-link>
        
        <router-link 
          to="/user/profile" 
          :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
        >
          <i class="fa fa-user-circle w-5"></i>
          <span>个人资料</span>
        </router-link>
        
        <router-link 
          to="/user/setting" 
          :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
        >
          <i class="fa fa-cog w-5"></i>
          <span>账号与安全</span>
        </router-link>
      </nav>
      
      <!-- 卖闲置按钮 -->
      <button 
        @click="$router.push('/publish')"
        class="mt-6 w-full bg-xianyuText text-white py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors flex items-center justify-center gap-2"
      >
        <i class="fa fa-plus"></i>
        <span>卖闲置</span>
      </button>

    
    <!-- 信用评价卡片 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h3 class="font-semibold text-lg mb-4">信用及评价</h3>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600">信用分</span>
            <span class="font-semibold text-xianyuText">{{ userStore.user?.creditScore || 0 }}</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-xianyuText rounded-full" :style="{ width: Math.min((userStore.user?.creditScore || 0) / 10, 100) + '%' }"></div>
          </div>
        </div>
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-600">好评率</span>
            <span class="font-semibold text-xianyuText">{{ userStore.user?.positiveRate || 0 }}%</span>
          </div>
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full" :style="{ width: (userStore.user?.positiveRate || 0) + '%' }"></div>
          </div>
        </div>
      </div>
      <button class="mt-4 w-full text-sm text-xianyuText hover:text-xianyuText/80">
        查看详情 >
      </button>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>