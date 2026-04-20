<template>
  <div class="bg-xianyuBg min-h-screen">
    <header class="bg-white sticky top-0 z-50 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 py-3 flex items-center">
        <button class="mr-4 text-gray-600 hover:text-xianyuText" @click="goBack"><i class="fa fa-arrow-left text-lg"></i></button>
        <router-link to="/" class="flex items-center gap-2 mr-4">
          <i class="fa fa-fish text-2xl text-xianyuText"></i>
          <h1 class="text-xl font-bold text-xianyuText hidden md:block">闲鱼</h1>
        </router-link>
        <div class="flex-1 relative max-w-2xl">
          <input type="text" placeholder="搜索闲置物品" v-model="searchInput" @keypress.enter="performSearch"
            class="w-full h-10 px-4 pr-12 rounded-full bg-searchBg/20 border border-searchBg/50 placeholder-gray-500 focus:ring-2 focus:ring-xianyuText/30 transition-all text-gray-800 focus:bg-white">
          <button class="absolute right-3 top-1/2 -translate-y-1/2 text-xianyuText hover:text-xianyuHover" @click="performSearch">
            <i class="fa fa-search text-lg"></i>
          </button>
        </div>
      </div>
      <div class="max-w-[1600px] mx-auto px-4 pb-3">
        <div class="flex items-center overflow-x-auto">
          <button v-for="tag in topFilterTags" :key="tag.id" class="filter-tag shrink-0" :class="{ 'active': activeTopTag === tag.id }" @click="handleTopTagClick(tag)">{{ tag.text }}</button>
        </div>
      </div>
    </header>

    <main class="max-w-[1600px] mx-auto px-4 py-4">
      <div class="flex items-center justify-between mb-4">
        <div class="text-gray-600 text-sm">
          <span>找到</span><span class="font-bold text-xianyuText ml-1">{{ resultCount }}</span><span class="ml-1">件商品</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="filter-btn" :class="{ 'active': filterModalOpen }" @click="openFilterModal"><i class="fa fa-sliders"></i> 筛选</button>
          <div class="relative">
            <button class="filter-btn" @click.stop="sortDropdownOpen = !sortDropdownOpen">
              <i class="fa fa-sort-amount-desc"></i> {{ getSortLabel(store.currentSort) }} <i class="fa fa-caret-down ml-1"></i>
            </button>
            <div class="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-50" :class="{ 'hidden': !sortDropdownOpen }">
              <button v-for="opt in sortOptions" :key="opt.value" class="sort-option w-full text-left px-4 py-2 text-sm hover:bg-gray-50" :class="{ 'active': opt.value === store.currentSort }" @click="handleSort(opt.value)">
                <i :class="opt.icon"></i> {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-xianyuText mb-4"></div>
        <p class="text-gray-600">搜索商品中...</p>
      </div>

      <div v-else-if="store.filteredProducts.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        <div v-for="p in displayedProducts" :key="p.id" class="product-card" @click="goToDetail(p.id)">
          <div class="aspect-square overflow-hidden relative">
            <img :src="p.image" :alt="p.title" class="w-full h-full object-cover hover:scale-105 transition-transform">
            <div class="absolute top-1.5 right-1.5"><span class="text-[10px] bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full">{{ p.condition }}</span></div>
          </div>
          <div class="p-2">
            <h3 class="text-xs font-medium line-clamp-2 mb-1">{{ p.title }}</h3>
            <p class="text-[10px] text-gray-500 line-clamp-1 mb-1.5">{{ p.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline"><span class="price-tag text-sm font-bold">¥{{ p.price }}</span><span class="text-[10px] text-gray-400 line-through ml-0.5">¥{{ p.originalPrice }}</span></div>
              <span class="text-[10px] text-gray-500">{{ p.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-gray-50 rounded-xl p-12 text-center">
        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><i class="fa fa-search text-2xl text-gray-400"></i></div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">没有找到相关商品</h3>
        <p class="text-gray-500 mb-4">换个关键词试试，或者浏览其他分类</p>
        <button class="btn-primary px-6 py-2" @click="router.push('/')">返回首页</button>
      </div>

      <div v-if="store.filteredProducts.length > itemsPerPage && !allLoaded" class="text-center mt-6">
        <button class="load-more-btn px-6 py-3" @click="loadMore"><i class="fa fa-refresh mr-2"></i>加载更多</button>
      </div>
    </main>

    <!-- 筛选弹窗 -->
    <div class="fixed inset-0 bg-black/50 z-50" :class="{ 'hidden': !filterModalOpen }" @click="filterModalOpen = false">
      <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-4" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold">筛选</h3>
          <button @click="filterModalOpen = false"><i class="fa fa-times text-xl"></i></button>
        </div>
        <div class="space-y-6">
          <div><h4 class="font-medium mb-3">价格区间</h4>
            <div class="flex items-center gap-2">
              <input type="number" placeholder="最低价" v-model="filterState.minPrice" class="flex-1 border rounded-lg px-3 py-2 text-sm">
              <span class="text-gray-400">-</span>
              <input type="number" placeholder="最高价" v-model="filterState.maxPrice" class="flex-1 border rounded-lg px-3 py-2 text-sm">
            </div>
          </div>
          <div><h4 class="font-medium mb-3">商品成色</h4>
            <div class="flex flex-wrap gap-2">
              <button v-for="c in conditions" :key="c" class="filter-tag" :class="{ 'active': filterState.conditions.includes(c) }" @click="toggleCondition(c)">{{ c }}</button>
            </div>
          </div>
          <div><h4 class="font-medium mb-3">发货地</h4>
            <div class="flex flex-wrap gap-2">
              <button v-for="loc in locations" :key="loc" class="filter-tag" :class="{ 'active': filterState.locations.includes(loc) }" @click="toggleLocation(loc)">{{ loc }}</button>
            </div>
          </div>
        </div>
        <div class="flex gap-3 mt-8 pt-6 border-t">
          <button class="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50" @click="resetFilter">重置</button>
          <button class="flex-1 py-3 bg-xianyuText text-white rounded-lg hover:bg-xianyuHover" @click="applyFilter">确认</button>
        </div>
      </div>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
      <div class="flex flex-col gap-2">
        <button v-for="t in floatingTools" :key="t.id" class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50" @click="t.action()">
          <i :class="t.icon"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import type { SortOption } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

const searchInput = ref('')
const activeTopTag = ref(1)
const sortDropdownOpen = ref(false)
const filterModalOpen = ref(false)
const currentPage = ref(1)
const itemsPerPage = 18
const isLoading = ref(true)
const filterState = ref({ minPrice: '', maxPrice: '', conditions: [] as string[], locations: [] as string[] })

const topFilterTags = [{ id: 1, text: '全部' }, { id: 2, text: '手机' }, { id: 3, text: '数码' }, { id: 4, text: '电脑' }, { id: 5, text: '服饰' }, { id: 6, text: '家居' }, { id: 7, text: '美妆' }]
const sortOptions = [
  { value: 'default' as SortOption, label: '综合排序', icon: 'fa fa-sort mr-2 text-gray-400' },
  { value: 'price-low' as SortOption, label: '价格从低到高', icon: 'fa fa-long-arrow-up mr-2 text-gray-400' },
  { value: 'price-high' as SortOption, label: '价格从高到低', icon: 'fa fa-long-arrow-down mr-2 text-gray-400' },
  { value: 'distance-near' as SortOption, label: '离我最近', icon: 'fa fa-location-arrow mr-2 text-gray-400' }
]
const conditions = ['全新', '9成新', '8成新']
const locations = ['北京', '上海', '深圳', '广州', '杭州', '南京', '成都', '武汉', '西安', '重庆']
const floatingTools = [
  { id: 1, icon: 'fa fa-plus text-gray-700', action: () => alert('正在跳转到发布页面...') },
  { id: 2, icon: 'fa fa-envelope text-gray-700', action: () => alert('正在跳转到消息页面...') },
  { id: 3, icon: 'fa fa-mobile text-gray-700', action: () => alert('打开应用商店下载闲鱼APP') },
  { id: 4, icon: 'fa fa-commenting text-gray-700', action: () => alert('欢迎提出宝贵意见和建议！') },
  { id: 5, icon: 'fa fa-headphones text-gray-700', action: () => alert('正在为您连接客服...') }
]

const resultCount = computed(() => store.filteredProducts.length)
const displayedProducts = computed(() => store.filteredProducts.slice(0, currentPage.value * itemsPerPage))
const allLoaded = computed(() => displayedProducts.value.length >= store.filteredProducts.length)

const getSortLabel = (v: SortOption) => sortOptions.find(o => o.value === v)?.label || '综合排序'
const handleTopTagClick = (tag: { id: number; text: string }) => {
  activeTopTag.value = tag.id
  tag.id === 1 ? store.resetFilter() : store.performSearch(tag.text)
}
const performSearch = () => { if (searchInput.value.trim()) store.performSearch(searchInput.value.trim()) }
const handleSort = (v: SortOption) => { store.sortProducts(v); sortDropdownOpen.value = false }
const toggleCondition = (c: string) => { const i = filterState.value.conditions.indexOf(c); i === -1 ? filterState.value.conditions.push(c) : filterState.value.conditions.splice(i, 1) }
const toggleLocation = (l: string) => { const i = filterState.value.locations.indexOf(l); i === -1 ? filterState.value.locations.push(l) : filterState.value.locations.splice(i, 1) }
const openFilterModal = () => { filterModalOpen.value = true; filterState.value = { ...store.filterState } }
const applyFilter = () => { store.applyFilter(filterState.value); filterModalOpen.value = false }
const resetFilter = () => { filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [] } }
const loadMore = () => currentPage.value++
const goToDetail = (id: number) => router.push({ path: '/detail', query: { id: id.toString() } })
const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

const handleClickOutside = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.sort-dropdown-container')) sortDropdownOpen.value = false }

onMounted(() => {
  if (store.products.length > 0) {
    if (route.query.q) { searchInput.value = route.query.q as string; store.performSearch(route.query.q as string) }
    isLoading.value = false
  }
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.filter-tag { background: white; border: 1px solid #E5E7EB; border-radius: 9999px; padding: 0.375rem 0.875rem; font-size: 0.875rem; color: #4B5563; transition: all 0.2s; cursor: pointer; }
.filter-tag:hover { border-color: #FF6E27; color: #FF6E27; }
.filter-tag.active { background-color: #FF6E27; color: white; border-color: #FF6E27; }
.price-tag { color: #FF6E27; font-weight: 700; }
.filter-btn { border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; background: white; color: #4B5563; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; cursor: pointer; }
.filter-btn:hover { border-color: #9CA3AF; background: #F9FAFB; }
.filter-btn.active { border-color: #FF6E27; color: #FF6E27; background: #FFF7ED; }
.sort-option:hover { background: #F9FAFB; color: #FF6E27; }
.sort-option.active { color: #FF6E27; background: #FFF7ED; }
.product-card { transition: all 0.3s; border-radius: 0.5rem; overflow: hidden; background: white; cursor: pointer; }
.product-card:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
.btn-primary { background-color: #FF6E27; color: white; border-radius: 9999px; padding: 0.75rem 1.5rem; transition: all 200ms; }
.btn-primary:hover { background-color: #E55C15; }
.load-more-btn { border: 1px solid #E5E7EB; background: white; color: #6B7280; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-size: 0.875rem; transition: all 0.2s; }
.load-more-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }
</style>
