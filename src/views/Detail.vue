<template>
  <div class="bg-white min-h-screen">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 py-3">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <button class="text-gray-600 hover:text-xianyuText" @click="goBack"><i class="fa fa-arrow-left text-xl"></i></button>
            <router-link to="/" class="flex items-center gap-1"><i class="fa fa-fish text-2xl text-xianyuText"></i><h1 class="text-xl font-bold text-xianyuText hidden md:block">闲鱼</h1></router-link>
          </div>
          <div class="flex-1 max-w-md mx-4 hidden md:block">
            <div class="relative">
              <input type="text" placeholder="搜索闲置物品" v-model="searchInput" @keypress.enter="performSearch" class="w-full h-10 px-4 pr-10 rounded-full bg-gray-100 border border-gray-300 placeholder-gray-500 focus:bg-white focus:border-accentBlue focus:outline-none transition-all">
              <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-xianyuText" @click="performSearch"><i class="fa fa-search"></i></button>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button class="text-gray-600 hover:text-xianyuText" @click="goToEdit"><i class="fa fa-edit text-lg"></i></button>
            <button class="text-gray-600 hover:text-xianyuText"><i class="fa fa-share-alt text-lg"></i></button>
            <button class="text-gray-600 hover:text-xianyuText"><i class="fa fa-ellipsis-h text-lg"></i></button>
          </div>
        </div>
        <div class="flex items-center text-sm text-gray-600">
          <router-link to="/" class="hover:text-xianyuText">首页</router-link>
          <i class="fa fa-angle-right mx-2"></i><span class="text-gray-400">{{ product?.category || '手机数码' }}</span>
          <i class="fa fa-angle-right mx-2"></i><span class="text-gray-800">{{ product?.title || '商品详情' }}</span>
        </div>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="max-w-[1600px] mx-auto px-4 py-12 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-xianyuText mb-4"></div>
      <p class="text-gray-600">加载商品详情中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="max-w-[1600px] mx-auto px-4 py-12 text-center">
      <i class="fa fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
      <p class="text-gray-800 mb-4">{{ loadError }}</p>
      <button class="bg-xianyuText text-white px-4 py-2 rounded-lg" @click="loadDetails">重试</button>
    </div>

    <!-- 商品详情 -->
    <main v-else-if="product" class="max-w-[1600px] mx-auto px-4 py-6">
      <!-- 卖家信息卡片 - 顶部横跨整行 -->
      <div class="mb-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img v-if="product.sellerAvatar" :src="product.sellerAvatar" :alt="product.sellerName" class="w-12 h-12 rounded-full object-cover mr-3 border-2 border-orange-100">
            <div v-else class="w-12 h-12 rounded-full bg-xianyuText flex items-center justify-center mr-3 text-white font-bold text-lg">{{ product.sellerName?.charAt(0) }}</div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-semibold">{{ product.sellerName }}</h4>
                <span v-if="product.sellerVerified" class="flex items-center text-green-600 text-xs"><i class="fa fa-check-circle mr-0.5"></i>已实名</span>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                <span v-if="product.sellerRating" class="flex items-center text-orange-500"><i class="fa fa-star mr-0.5"></i>{{ product.sellerRating }}</span>
                <span v-if="product.sellerGoodRate" class="text-green-600">好评率 {{ product.sellerGoodRate }}%</span>
                <span class="flex items-center"><i class="fa fa-map-marker mr-1"></i>{{ product.location }}</span>
              </div>
            </div>
          </div>
          <button class="px-3 py-1.5 border border-xianyuText text-xianyuText rounded-full text-xs hover:bg-orange-50 transition-colors">
            <i class="fa fa-user mr-1"></i>查看主页
          </button>
        </div>
        <div class="flex items-center gap-6 mt-2 pt-2 border-t border-gray-100 text-sm">
          <div><span class="text-gray-500 mr-1">在售</span><span class="font-semibold text-gray-800">{{ product.sellerOnSale || 0 }}</span></div>
          <div><span class="text-gray-500 mr-1">已售</span><span class="font-semibold text-gray-800">{{ product.sellerSold || 0 }}</span></div>
          <div v-if="product.sellerDeliverySpeed"><span class="text-gray-500 mr-1">发货速度</span><span class="font-semibold text-gray-800">{{ product.sellerDeliverySpeed }}</span></div>
          <div v-if="product.sellerServiceAttitude"><span class="text-gray-500 mr-1">服务态度</span><span class="font-semibold text-gray-800">{{ product.sellerServiceAttitude }}</span></div>
        </div>
      </div>

      <!-- 图片和商品信息 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：图片 -->
        <div>
          <div class="bg-white rounded-xl overflow-hidden mb-4 relative max-w-xl mx-auto">
            <img :src="currentImage.url" :alt="currentImage.alt" class="w-full aspect-square object-contain bg-gray-50">
            <button class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg" @click="prevImage" :disabled="currentIndex === 0"><i class="fa fa-chevron-left text-gray-700"></i></button>
            <button class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg" @click="nextImage" :disabled="currentIndex === images.length - 1"><i class="fa fa-chevron-right text-gray-700"></i></button>
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">{{ currentIndex + 1 }}/{{ images.length }}</div>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-2 justify-center">
            <button v-for="(img, i) in images" :key="img.id" class="thumbnail-btn w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent shrink-0" :class="{ 'active': i === currentIndex }" @click="currentIndex = i">
              <img :src="img.url" :alt="img.alt" class="w-full h-full object-cover">
            </button>
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div>
          <!-- 价格区域 -->
          <div class="mb-4">
            <div class="flex items-baseline mb-2">
              <span class="text-3xl font-bold text-xianyuText mr-2">¥{{ product.price }}</span>
              <span class="text-lg text-gray-400 line-through">¥{{ product.originalPrice }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span v-if="product.canBargain" class="bg-red-50 text-red-600 px-2 py-0.5 rounded">可议价</span>
              <span v-if="product.freight === 0" class="bg-green-50 text-green-600 px-2 py-0.5 rounded">包邮</span>
              <span class="text-gray-500">快递: ¥{{ product.freight || 0 }}</span>
            </div>
          </div>

          <!-- 标题 -->
          <h1 class="text-xl font-bold text-gray-900 mb-3">{{ product.title }}</h1>

          <!-- 数据统计 -->
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b">
            <span><i class="fa fa-eye mr-1"></i>{{ product.viewCount || 0 }}人想要</span>
            <span><i class="fa fa-heart mr-1"></i>{{ product.favoriteCount || 0 }}人收藏</span>
            <span><i class="fa fa-clock-o mr-1"></i>{{ getPublishTime(product.id) }}</span>
          </div>

          <!-- 成色标签 -->
          <div class="flex items-center gap-2 mb-4">
            <span class="text-sm text-gray-600">成色</span>
            <span class="bg-xianyuText text-white text-xs px-2 py-1 rounded">{{ product.condition }}</span>
            <span v-if="product.isNew" class="bg-green-500 text-white text-xs px-2 py-1 rounded">全新</span>
          </div>

          <!-- 安全保障 -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center text-green-600"><i class="fa fa-shield mr-1"></i>交易安全</div>
              <div class="flex items-center text-green-600"><i class="fa fa-check-circle mr-1"></i>正品保障</div>
              <div class="flex items-center text-green-600"><i class="fa fa-undo mr-1"></i>7天无理由</div>
            </div>
          </div>

          <!-- 商品描述 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">商品描述</h3>
            <div class="text-gray-700 leading-relaxed whitespace-pre-line">{{ product.description }}</div>
          </div>

          <!-- 商品标签 -->
          <div v-if="product.tags?.length" class="mb-6">
            <span class="text-sm text-gray-600 mr-2">标签</span>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="space-y-3">
            <div class="flex gap-2">
              <button class="flex-1 border rounded-lg py-3 hover:bg-gray-50 transition-all" 
                      :class="isFavorited ? 'border-yellow-400 bg-yellow-50 text-yellow-600' : 'border-gray-300 text-gray-700'"
                      @click="toggleFavorite">
                <i class="fa mr-2" :class="isFavorited ? 'fa-star text-yellow-400' : 'fa-star-o'"></i>{{ isFavorited ? '已收藏' : '收藏' }}
              </button>
              <button class="flex-1 border border-gray-300 text-gray-700 rounded-lg py-3 hover:bg-gray-50"><i class="fa fa-share-alt mr-2"></i>分享</button>
            </div>
            <div class="flex gap-2">
              <button class="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 hover:bg-gray-200"><i class="fa fa-comment mr-2"></i>聊一聊</button>
              <button class="flex-1 bg-xianyuText text-white rounded-lg py-3 hover:bg-xianyuHover font-medium">立即购买</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 猜你喜欢 -->
      <section class="bg-gray-50 py-8 mt-12 rounded-xl">
        <div class="flex justify-between items-center mb-6">
          <div><h2 class="text-xl font-bold text-gray-900">猜你喜欢</h2><p class="text-gray-500 text-sm mt-1">根据您的浏览记录推荐</p></div>
          <button class="text-sm text-xianyuText hover:text-xianyuHover" @click="loadRecs"><i class="fa fa-refresh mr-1"></i>换一批</button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          <div v-for="r in recommendations" :key="r.id" class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer" @click="goToDetail(r.id)">
            <div class="aspect-square overflow-hidden relative">
              <img :src="r.image" :alt="r.title" class="w-full h-full object-cover hover:scale-105 transition-transform">
              <div class="absolute top-1 right-1"><span class="text-[8px] bg-white/90 text-gray-700 px-1 py-0.5 rounded-full">{{ r.condition }}</span></div>
            </div>
            <div class="p-1.5">
              <h4 class="text-[10px] font-medium mb-0.5 line-clamp-2">{{ r.title }}</h4>
              <div class="flex items-center justify-between"><span class="text-xianyuText text-[11px] font-bold">¥{{ r.price }}</span></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 商品不存在 -->
    <div v-else class="max-w-[1600px] mx-auto px-4 py-12 text-center">
      <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"><i class="fa fa-exclamation-triangle text-3xl text-gray-400"></i></div>
      <h3 class="text-xl font-medium text-gray-700 mb-2">商品不存在或已下架</h3>
      <p class="text-gray-500 mb-6">该商品可能已被卖家删除或下架</p>
      <button class="btn-primary px-6 py-2" @click="router.push('/')">返回首页</button>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
      <div class="flex flex-col gap-2">
        <button v-for="t in floatingTools" :key="t.id" class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all group relative" @click="handleTool(t)">
          <i :class="t.icon"></i>
          <span class="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{ t.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import type { Product, ProductImage } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

const searchInput = ref('')
const product = ref<Product | null>(null)
const currentIndex = ref(0)
const images = ref<ProductImage[]>([])
const recommendations = ref<Product[]>([])
const isLoading = ref(true)
const loadError = ref('')
const isFavorited = ref(false)

const toggleFavorite = () => {
  isFavorited.value = !isFavorited.value
}

const currentImage = computed(() => images.value[currentIndex.value] ?? { url: '', alt: '' })

const floatingTools = [
  { id: 1, icon: 'fa fa-plus text-gray-700', label: '发闲置', action: 'publish' },
  { id: 2, icon: 'fa fa-envelope text-gray-700', label: '消息', action: 'message' },
  { id: 3, icon: 'fa fa-qrcode text-gray-700', label: '二维码', action: 'qrcode' },
  { id: 4, icon: 'fa fa-mobile text-gray-700', label: 'APP', action: 'app' },
  { id: 5, icon: 'fa fa-commenting text-gray-700', label: '反馈', action: 'feedback' },
  { id: 6, icon: 'fa fa-headphones text-gray-700', label: '客服', action: 'service' }
]

const getPublishTime = (id: number) => {
  if (id >= 21 && id <= 24) return '今天发布'
  if (id >= 18 && id <= 20) return '3天内发布'
  if (id >= 12 && id <= 17) return '1周内发布'
  return '1周前发布'
}

const loadDetails = () => {
  const id = parseInt(route.query.id as string)
  if (isNaN(id)) { loadError.value = '无效的商品ID'; isLoading.value = false; return }
  const found = store.getProductById(id)
  if (found) {
    product.value = found
    // 优先使用商品自带图片，否则生成假图
    if (found.images && found.images.length > 0) {
      images.value = found.images
    } else {
      images.value = [
        { id: 1, url: found.image, alt: found.title },
        { id: 2, url: `https://picsum.photos/id/${id * 10}/800/800`, alt: found.title + ' 细节图' },
        { id: 3, url: `https://picsum.photos/id/${id * 20}/800/800`, alt: found.title + ' 包装图' }
      ]
    }
    currentIndex.value = 0
    isLoading.value = false
  } else {
    loadError.value = `未找到商品ID: ${id}`
    isLoading.value = false
  }
}

const loadRecs = () => {
  const id = parseInt(route.query.id as string)
  if (!isNaN(id)) recommendations.value = store.getRecommendations(id, 18)
}

const prevImage = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextImage = () => { if (currentIndex.value < images.value.length - 1) currentIndex.value++ }

const performSearch = () => { if (searchInput.value.trim()) router.push({ path: '/search', query: { q: searchInput.value.trim() } }) }

const handleTool = (t: { action: string }) => {
  const msgs: Record<string, string> = {
    publish: '正在跳转到发布页面...', message: '正在跳转到消息页面...', qrcode: `商品码功能：扫描二维码查看"${product.value?.title || '当前商品'}"的详细信息`,
    app: '打开应用商店下载闲鱼APP', feedback: '欢迎提出宝贵意见和建议！', service: `正在为您连接客服...`
  }
  alert(msgs[t.action])
}

const goToDetail = (id: number) => router.push({ path: '/detail', query: { id: id.toString() } })
const goToEdit = () => { if (product.value) router.push({ path: '/edit', query: { id: product.value!.id.toString() } }) }
const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

watch(() => route.query.id, (id) => { if (id) { isLoading.value = true; loadDetails(); loadRecs() } }, { immediate: true })
onMounted(() => { store.initialize(); loadRecs() })
</script>

<style scoped>
.thumbnail-btn { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.3s; }
.thumbnail-btn.active { border-color: #FF6E27 !important; box-shadow: 0 4px 12px rgba(255,110,39,0.15); transform: scale(1.03); }
.thumbnail-btn:hover { transform: scale(1.05); }
.tag { font-size: 0.75rem; background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; color: #6b7280; }
.btn-primary { background-color: #FF6E27; color: white; border-radius: 9999px; padding: 0.75rem 1.5rem; transition: all 200ms; }
.btn-primary:hover { background-color: #E55C15; }
</style>
