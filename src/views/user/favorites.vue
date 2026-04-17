<template>
  <div>
    <!-- 页面标题 -->
    <div class="user-page-card p-6 mb-6">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-heart text-xianyuText"></i>
        我的收藏
      </h1>
      
      <!-- 收藏分类筛选 -->
      <div class="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="activeCategory = category.id"
          :class="['px-4 py-2 rounded-lg whitespace-nowrap transition-colors', 
            activeCategory === category.id ? 'bg-xianyuText text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
        >
          {{ category.label }}
        </button>
      </div>
      
      <!-- 收藏列表 -->
      <div v-if="favorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="item in filteredFavorites" 
          :key="item.id"
          class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="aspect-square overflow-hidden relative cursor-pointer" @click="viewDetail(item.id)">
            <img 
              :src="item.images[0]" 
              :alt="item.title"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            >
            <!-- 收藏按钮 -->
            <button 
              @click.stop="toggleFavorite(item.id)"
              class="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white"
            >
              <i class="fa fa-heart text-red-500 text-lg"></i>
            </button>
          </div>
          
          <div class="p-4">
            <h3 class="font-medium text-gray-800 mb-2 line-clamp-2 cursor-pointer" @click="viewDetail(item.id)">
              {{ item.title }}
            </h3>
            
            <div class="flex items-center justify-between mb-3">
              <span class="text-xl font-semibold text-xianyuText">¥{{ item.price }}</span>
              <span class="text-sm text-gray-500">{{ item.collectedAt }}</span>
            </div>
            
            <!-- 卖家信息 -->
            <div class="flex items-center gap-2 py-3 border-t border-gray-100">
              <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                <img v-if="item.sellerAvatar" :src="item.sellerAvatar" alt="卖家" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-white text-xs">
                  {{ item.sellerName?.charAt(0) || '卖' }}
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700">{{ item.sellerName }}</p>
                <p class="text-xs text-gray-500">{{ item.sellerLocation }}</p>
              </div>
              <span class="text-sm text-gray-500">{{ item.sellerRating }}分</span>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex gap-2 mt-3">
              <button 
                @click.stop="contactSeller(item.id)"
                class="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <i class="fa fa-comment"></i>
                <span>联系卖家</span>
              </button>
              <button 
                @click.stop="viewDetail(item.id)"
                class="flex-1 bg-xianyuText text-white py-2 rounded hover:bg-xianyuText/90 transition-colors"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无收藏状态 -->
      <div v-else class="py-12 text-center">
        <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
          <i class="fa fa-heart text-4xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">暂无收藏</h3>
        <p class="text-gray-500 mb-6">您还没有收藏任何商品</p>
        <button 
          @click="$router.push('/goods')"
          class="bg-xianyuText text-white px-6 py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors inline-flex items-center gap-2"
        >
          <i class="fa fa-shopping-bag"></i>
          <span>去逛逛</span>
        </button>
      </div>
    </div>
    
    <!-- 收藏统计 -->
    <div class="user-page-card p-6">
      <h3 class="font-semibold text-lg mb-4">收藏统计</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-3xl font-semibold text-xianyuText mb-2">{{ favoriteStats.total }}</div>
          <p class="text-sm text-gray-500">收藏总数</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-semibold text-green-500 mb-2">{{ favoriteStats.active }}</div>
          <p class="text-sm text-gray-500">在售商品</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-semibold text-blue-500 mb-2">{{ favoriteStats.sold }}</div>
          <p class="text-sm text-gray-500">已售商品</p>
        </div>
        <div class="text-center">
          <div class="text-3xl font-semibold text-orange-500 mb-2">{{ favoriteStats.sellers }}</div>
          <p class="text-sm text-gray-500">关注卖家</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCategory = ref('all')

const categories = [
  { id: 'all', label: '全部' },
  { id: 'digital', label: '数码电子' },
  { id: 'clothing', label: '服装服饰' },
  { id: 'book', label: '图书教材' },
  { id: 'daily', label: '日用百货' }
]

const favorites = ref<any[]>([
  {
    id: 1,
    title: '九成新iPhone 13 Pro 256G 远峰蓝',
    price: 4599,
    images: ['https://via.placeholder.com/300x300?text=iPhone+13+Pro'],
    sellerName: '数码小王子',
    sellerAvatar: '',
    sellerLocation: '北京',
    sellerRating: 4.8,
    collectedAt: '昨天',
    category: 'digital',
    isActive: true
  },
  {
    id: 2,
    title: '华为MateBook 14 2022款 银色',
    price: 3200,
    images: ['https://via.placeholder.com/300x300?text=Huawei+MateBook'],
    sellerName: '电脑专家',
    sellerAvatar: 'https://via.placeholder.com/100x100?text=Seller',
    sellerLocation: '深圳',
    sellerRating: 4.9,
    collectedAt: '3天前',
    category: 'digital',
    isActive: true
  },
  {
    id: 3,
    title: '索尼PS5游戏机 光驱版 双手柄',
    price: 2800,
    images: ['https://via.placeholder.com/300x300?text=PS5'],
    sellerName: '游戏达人',
    sellerAvatar: '',
    sellerLocation: '上海',
    sellerRating: 4.7,
    collectedAt: '1周前',
    category: 'digital',
    isActive: false
  }
])

const favoriteStats = ref({
  total: 24,
  active: 18,
  sold: 6,
  sellers: 8
})

const filteredFavorites = computed(() => {
  if (activeCategory.value === 'all') return favorites.value
  return favorites.value.filter(item => item.category === activeCategory.value)
})

const toggleFavorite = (id: number) => {
  if (confirm('确定要取消收藏吗？')) {
    favorites.value = favorites.value.filter(item => item.id !== id)
  }
}

const viewDetail = (id: number) => {
  router.push({ name: 'goods-detail', params: { id } })
}

const contactSeller = (id: number) => {
  router.push({ name: 'chat-room', params: { id: 'seller_' + id } })
}

onMounted(() => {
  // 这里可以加载收藏数据
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>