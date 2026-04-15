<!-- src/layouts/UserLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏组件 -->
    <HeaderNav />
    
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧菜单栏组件 -->
        <UserSidebar />
        
        <!-- 主内容区域：这里会根据路由动态变化 -->
        <div class="lg:col-span-3">
          <!-- Vue Router 的出口，不同的子路由组件会在这里渲染 -->
          <router-view></router-view>
        </div>
      </div>
    </div>
    
    <!-- 底部信息 (保持不变) -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">关于我们</h3>
            <p class="text-gray-300 text-sm">专注于二手商品交易的平台，让闲置物品流通起来。</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">资质证明</h3>
            <p class="text-gray-300 text-sm">营业执照编号: 91330110MA2H1CFF2D</p>
            <p class="text-gray-300 text-sm">备案号: B2-20241485</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <p class="text-gray-300 text-sm">客服邮箱: support@example.com</p>
            <p class="text-gray-300 text-sm">客服电话: 400-xxx-xxxx</p>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 我的商品平台 版权所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import HeaderNav from '@/components/layout/HeaderNav.vue'
import UserSidebar from '@/components/layout/UserSidebar.vue'
</script>