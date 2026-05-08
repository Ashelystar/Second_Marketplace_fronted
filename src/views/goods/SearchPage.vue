<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <a href="#" class="logo" @click.prevent="router.push('/')">
            <i class="fa fa-fish"></i>
            <span>荔园交易</span>
          </a>
        </div>

        <div class="searchBox">
          <div class="searchRow">
            <input
              type="text"
              v-model="searchInput"
              placeholder="搜索闲置物品"
              @keypress.enter="performSearch"
            />
            <button @click="performSearch"><i class="fa fa-search"></i></button>
          </div>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/forum')"><i class="fa fa-comments"></i> 社区</a>
          <a href="#" @click.prevent="router.push('/cart')"><i class="fa fa-shopping-cart"></i> 购物车</a>
          <a href="#" @click.prevent="router.push('/chat')"><i class="fa fa-bell"></i> 消息</a>
          <template v-if="userStore.isLoggedIn">
            <UserDropdown />
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="filters">
      <button
        v-for="tag in topFilterTags"
        :key="tag.id"
        class="chip"
        :class="{ active: activeTopTag === tag.id }"
        @click="handleTopTagClick(tag)"
      >
        {{ tag.text }}
      </button>
    </div>

    <!-- 主体内容 -->
    <div class="main">
      <!-- 结果统计 -->
      <div class="resultBar">
        <span class="resultCount">找到 <strong>{{ resultCount }}</strong> 件商品</span>
        <div class="toolBar">
          <button class="filterBtn" :class="{ active: filterModalOpen }" @click="openFilterModal">
            <i class="fa fa-sliders"></i> 筛选
          </button>
          <div class="sortWrap">
            <button class="filterBtn" @click.stop="sortDropdownOpen = !sortDropdownOpen">
              <i class="fa fa-sort-amount-desc"></i>
              {{ getSortLabel(store.currentSort) }}
              <i class="fa fa-caret-down"></i>
            </button>
            <div v-if="sortDropdownOpen" class="sortDropdown">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                class="sortOption"
                :class="{ active: opt.value === store.currentSort }"
                @click="handleSort(opt.value)"
              >
                <i :class="opt.icon"></i> {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="store.isLoading" class="loading">
        <div class="spinner"></div>
        <p>搜索商品中...</p>
      </div>

      <!-- 商品列表 -->
      <div v-else-if="store.filteredProducts.length > 0" class="productGrid">
        <div
          v-for="p in displayedProducts"
          :key="p.id"
          class="productCard card"
          @click="goToDetail(p.id)"
        >
          <div class="productImg">
            <img :src="getImageUrl(p.image) || PLACEHOLDER_IMG" :alt="p.title" @error="(e: Event) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG" />
            <span class="condition">{{ p.condition }}</span>
          </div>
          <div class="productInfo">
            <h3 class="productTitle">{{ p.title }}</h3>
            <p class="productDesc">{{ p.description }}</p>
            <div class="productFooter">
              <div class="price">
                <span class="currentPrice">¥{{ p.price }}</span>
                <span class="originalPrice">¥{{ p.originalPrice }}</span>
              </div>
              <span class="location">{{ p.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 无结果 -->
      <div v-else class="empty">
        <div class="emptyIcon">
          <i class="fa fa-search"></i>
        </div>
        <h3>没有找到相关商品</h3>
        <p>换个关键词试试，或者浏览其他分类</p>
        <RouterLink class="btn btn-primary" to="/">返回首页</RouterLink>
      </div>

      <!-- 加载更多 -->
      <div v-if="!allLoaded && store.totalProducts > 0" class="loadMore">
        <button class="loadMoreBtn" @click="loadMore">
          <i class="fa fa-refresh"></i> 加载更多
        </button>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <div v-if="filterModalOpen" class="modalOverlay" @click="filterModalOpen = false">
      <div class="modal" @click.stop>
        <div class="modalHeader">
          <h3>筛选</h3>
          <button @click="filterModalOpen = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modalBody">
          <div class="filterSection">
            <h4>价格区间</h4>
            <div class="priceRange">
              <input v-model="filterState.minPrice" type="number" placeholder="最低价" />
              <span>-</span>
              <input v-model="filterState.maxPrice" type="number" placeholder="最高价" />
            </div>
          </div>
          <div class="filterSection">
            <h4>发布时间</h4>
            <div class="chipGroup">
              <button
                v-for="t in timeRanges"
                :key="t.value"
                class="chip"
                :class="{ active: filterState.timeRange === t.value }"
                @click="filterState.timeRange = filterState.timeRange === t.value ? '' : t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <div class="filterSection">
            <h4>商品成色</h4>
            <div class="chipGroup">
              <button
                v-for="c in conditions"
                :key="c"
                class="chip"
                :class="{ active: filterState.conditions.includes(c) }"
                @click="toggleCondition(c)"
              >
                {{ c }}
              </button>
            </div>
          </div>
          <div class="filterSection">
            <h4>发货地</h4>
            <div class="chipGroup">
              <button
                v-for="loc in locations"
                :key="loc"
                class="chip"
                :class="{ active: filterState.locations.includes(loc) }"
                @click="toggleLocation(loc)"
              >
                {{ loc }}
              </button>
            </div>
          </div>
        </div>
        <div class="modalFooter">
          <button class="btn" @click="resetFilter">重置</button>
          <button class="btn btn-primary" @click="applyFilter">确认</button>
        </div>
      </div>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floatTools">
      <button v-for="t in floatingTools" :key="t.id" class="floatBtn" @click="t.action()">
        <i :class="t.icon"></i>
        <span class="floatTip">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'
import type { SortOption } from '@/types'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import UserDropdown from '@/components/UserDropdown.vue'

defineOptions({ name: 'SearchPage' })

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const userStore = useUserStore()

const searchInput = ref('')
const activeTopTag = ref(1)
const sortDropdownOpen = ref(false)
const filterModalOpen = ref(false)
const filterState = ref({
  minPrice: '',
  maxPrice: '',
  conditions: [] as string[],
  locations: [] as string[],
  timeRange: ''
})

const topFilterTags = [
  { id: 1, text: '全部' },
  { id: 2, text: '手机' },
  { id: 3, text: '数码' },
  { id: 4, text: '电脑' },
  { id: 5, text: '服饰' },
  { id: 6, text: '家居' },
  { id: 7, text: '美妆' }
]

const sortOptions = [
  { value: 'default' as SortOption, label: '综合排序', icon: 'fa fa-sort' },
  { value: 'credit-high' as SortOption, label: '信用排序', icon: 'fa fa-credit-card' },
  { value: 'price-low' as SortOption, label: '价格从低到高', icon: 'fa fa-long-arrow-up' },
  { value: 'price-high' as SortOption, label: '价格从高到低', icon: 'fa fa-long-arrow-down' },
  { value: 'distance-near' as SortOption, label: '离我最近', icon: 'fa fa-location-arrow' }
]

const timeRanges = [
  { value: 'latest', label: '最新' },
  { value: 'today', label: '一天内' },
  { value: 'three-days', label: '三天内' },
  { value: 'week', label: '一周内' },
  { value: 'month', label: '一个月内' }
]

const conditions = ['全新', '99新', '95新', '9成新', '8成新及以下']
const locations = ['北京', '上海', '深圳', '广州', '杭州', '南京', '成都', '武汉', '西安', '重庆']

const floatingTools = [
  { id: 1, icon: 'fa fa-plus', label: '发闲置', action: () => alert('正在跳转到发布页面...') },
  { id: 2, icon: 'fa fa-envelope', label: '消息', action: () => alert('正在跳转到消息页面...') },
  { id: 3, icon: 'fa fa-mobile', label: 'APP', action: () => alert('打开应用商店下载荔园APP') },
  { id: 4, icon: 'fa fa-commenting', label: '反馈', action: () => alert('欢迎提出宝贵意见和建议！') },
  { id: 5, icon: 'fa fa-headphones', label: '客服', action: () => alert('正在为您连接客服...') }
]

// 服务端分页后，filteredProducts 就是当前页的数据
const resultCount = computed(() => store.totalProducts)
const displayedProducts = computed(() => store.filteredProducts)
const allLoaded = computed(() => store.currentPage * store.pageSize >= store.totalProducts)

const getSortLabel = (v: SortOption) => sortOptions.find(o => o.value === v)?.label || '综合排序'

const handleTopTagClick = (tag: { id: number; text: string }) => {
  activeTopTag.value = tag.id
  if (tag.id === 1) {
    store.resetFilter()
  } else {
    store.performSearch(tag.text)
  }
}

const performSearch = () => {
  if (searchInput.value.trim()) store.performSearch(searchInput.value.trim())
}

const handleSort = (v: SortOption) => {
  store.sortProducts(v)
  sortDropdownOpen.value = false
}

const toggleCondition = (c: string) => {
  const i = filterState.value.conditions.indexOf(c)
  if (i === -1) filterState.value.conditions.push(c)
  else filterState.value.conditions.splice(i, 1)
}

const toggleLocation = (l: string) => {
  const i = filterState.value.locations.indexOf(l)
  if (i === -1) filterState.value.locations.push(l)
  else filterState.value.locations.splice(i, 1)
}

const openFilterModal = () => {
  filterModalOpen.value = true
  filterState.value = { ...store.filterState }
}

const applyFilter = () => {
  store.applyFilter(filterState.value)
  filterModalOpen.value = false
}

const resetFilter = () => {
  filterState.value = { minPrice: '', maxPrice: '', conditions: [], locations: [], timeRange: '' }
  store.resetFilter()
}

const loadMore = () => store.changePage(store.currentPage + 1)

const goToDetail = (id: number) => router.push({ path: '/detail', query: { id: id.toString() } })

const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

const handleClickOutside = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.sortWrap')) sortDropdownOpen.value = false
}

const handleLogin = () => {
  router.push('/user/login')
}

onMounted(() => {
  store.initialize().then(() => {
    if (route.query.q) {
      searchInput.value = route.query.q as string
      store.performSearch(route.query.q as string)
    }
  })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部导航 */
.top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topInner {
  padding: 12px 80px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.backBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 18px;
  transition: color 200ms;
}

.backBtn:hover {
  color: #f97316;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.logo i {
  font-size: 24px;
  color: #f97316;
}

.logo span {
  font-size: 20px;
  font-weight: bold;
  color: #f97316;
}

.searchBox {
  flex: 1;
  max-width: 500px;
  margin: 0 auto;
}

.searchRow {
  display: flex;
}

.searchRow input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-right: none;
  border-radius: 20px 0 0 20px;
  background: #f3f4f6;
  outline: none;
  font-size: 14px;
}

.searchRow input:focus {
  background: #fff;
  border-color: #3b82f6;
}

.searchRow button {
  width: 56px;
  height: 40px;
  border: none;
  border-radius: 0 20px 20px 0;
  background: #f97316;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.searchRow button:hover {
  background: #ea580c;
}

.navLinks {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}

.navLinks a {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition: color 200ms;
}

.navLinks a:hover {
  color: #f97316;
}

/* 分类标签 */
.filters {
  display: flex;
  gap: 8px;
  padding: 12px 80px;
  overflow-x: auto;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.chip {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--muted);
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 14px;
}

.chip:hover {
  border-color: #f97316;
  color: #f97316;
}

.chip.active {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}

/* 主体 */
.main {
  padding: 0 80px;
}

/* 结果栏 */
.resultBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.resultCount {
  font-size: 14px;
  color: var(--muted);
}

.resultCount strong {
  color: #f97316;
}

.toolBar {
  display: flex;
  gap: 8px;
}

.filterBtn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms;
}

.filterBtn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.filterBtn.active {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.sortWrap {
  position: relative;
}

.sortDropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 180px;
  background: var(--panel);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 100;
}

.sortOption {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  transition: background 120ms;
}

.sortOption:hover {
  background: #f5f5f5;
  color: #f97316;
}

.sortOption.active {
  color: #f97316;
  background: #fff7ed;
}

/* 加载 */
.loading {
  padding: 60px;
  text-align: center;
  color: var(--muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: #f97316;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 商品网格 */
.productGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.productCard {
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.productCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.productImg {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.productImg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms;
}

.productCard:hover .productImg img {
  transform: scale(1.05);
}

.condition {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  border-radius: 999px;
  color: var(--text);
}

.productInfo {
  padding: 10px;
}

.productTitle {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productDesc {
  font-size: 11px;
  color: var(--muted);
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currentPrice {
  font-size: 16px;
  font-weight: bold;
  color: #f97316;
}

.originalPrice {
  font-size: 11px;
  color: var(--muted);
  text-decoration: line-through;
}

.location {
  font-size: 11px;
  color: var(--muted);
}

/* 空状态 */
.empty {
  padding: 60px;
  text-align: center;
}

.emptyIcon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
  color: var(--muted);
}

.empty h3 {
  font-size: 18px;
  margin: 0 0 8px;
  color: var(--text);
}

.empty p {
  color: var(--muted);
  margin: 0 0 20px;
}

/* 加载更多 */
.loadMore {
  text-align: center;
  margin-top: 24px;
}

.loadMoreBtn {
  padding: 10px 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms;
}

.loadMoreBtn:hover {
  background: #f5f5f5;
  border-color: #d1d5db;
}

/* 弹窗 */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  background: var(--panel);
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.modalHeader h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modalHeader button {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--muted);
}

.modalBody {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.filterSection {
  margin-bottom: 24px;
}

.filterSection h4 {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 12px;
  color: var(--text);
}

.priceRange {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priceRange input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

.priceRange input:focus {
  border-color: rgba(6, 182, 212, 0.55);
}

.priceRange span {
  color: var(--muted);
}

.chipGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modalFooter {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border);
}

.modalFooter .btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
}

/* 悬浮工具栏 */
.floatTools {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 30;
}

.floatBtn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--panel);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text);
  position: relative;
  transition: transform 120ms ease, background 120ms ease;
}

.floatBtn:hover {
  transform: translateY(-2px);
  background: #f5f5f5;
}

.floatTip {
  position: absolute;
  right: calc(100% + 8px);
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms;
}

.floatBtn:hover .floatTip {
  opacity: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .productGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .floatTools {
    display: none;
  }
}
</style>
