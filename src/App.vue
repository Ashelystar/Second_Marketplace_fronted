<template>
  <div class="app-container">
    <div v-if="isNavigating" class="route-loading-indicator">
      <div class="loading-bar"></div>
    </div>
    <router-view v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'

const router = useRouter()
const productStore = useProductStore()
const isNavigating = ref(false)

router.beforeEach(() => isNavigating.value = true)
router.afterEach(() => setTimeout(() => isNavigating.value = false, 100))

onMounted(() => {
  // 添加Font Awesome
  const link = document.createElement('link')
  link.href = 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
  
  // 添加Tailwind CSS
  const script = document.createElement('script')
  script.src = 'https://cdn.tailwindcss.com'
  document.head.appendChild(script)
  
  productStore.initialize()
})
</script>

<style>
:root {
  --xianyu: #FF6E27;
  --xianyu-text: #FF6E27;
  --xianyu-hover: #E55C15;
  --xianyu-bg: #F8F9FA;
  --page-bg: #FFFFFF;
  --text-main: #333333;
  --text-gray: #666666;
  --accent-blue: #007AFF;
  --accent-green: #34C759;
  --search-bg: #FFD700;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; }

.route-loading-indicator {
  position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 9999; overflow: hidden;
}
.loading-bar {
  height: 100%; background: linear-gradient(90deg, #FF6E27, #FF8C42, #FFA95C);
  animation: loadingProgress 1.5s ease-in-out infinite; width: 60%;
}
@keyframes loadingProgress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }

button:active { transform: scale(0.98); }
img { transition: opacity 0.3s; }
img.loading { opacity: 0.3; }
html { scroll-behavior: smooth; }
</style>
