<template>
  <div class="user-layout min-h-screen bg-gray-50">
    <HeaderNav />

    <div class="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <UserSidebar />

        <div class="lg:col-span-3 user-main-wrap">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </div>
    </div>

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

<style scoped>
.user-main-wrap {
  animation: main-panel-in 280ms ease both;
}

@keyframes main-panel-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.user-fade-slide-enter-active),
:deep(.user-fade-slide-leave-active) {
  transition: all 220ms ease;
}

:deep(.user-fade-slide-enter-from),
:deep(.user-fade-slide-leave-to) {
  opacity: 0;
  transform: translateY(10px);
}

:deep(.user-page-card) {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 14px rgba(17, 24, 39, 0.06);
  border: 1px solid rgba(229, 231, 235, 0.9);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

:deep(.user-page-card:hover) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.12);
}

:deep(.user-page-title) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .user-layout {
    padding-bottom: 20px;
  }
}
</style>