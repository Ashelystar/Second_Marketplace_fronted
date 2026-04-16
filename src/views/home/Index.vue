<template>
  <div class="bg-pageBg min-h-screen">
    <!-- 顶部导航栏 -->
    <Topnav v-if="showNav" />
    <!-- 主体内容 -->
    <div class="main">
      <!-- 左侧分类 -->
      <aside class="sidebar">
        <div class="categoryCard">
          <ul class="categoryList">
            <li
              v-for="(cat, index) in mainCategories"
              :key="cat.id"
              class="categoryItem"
              :class="{ active: activeMainCategory === cat.id }"
              :ref="(el) => setCategoryRef(el as HTMLElement, index)"
              @mouseenter="showSubMenu(cat.id, index)"
              @mouseleave="hideSubMenu"
            >
              <a href="#" @click.prevent>
                <i :class="cat.iconClass" class="catIcon"></i>
                <span>{{ cat.name }}</span>
                <i class="fa fa-chevron-right arrow"></i>
              </a>
            </li>
          </ul>
        </div>

        <!-- 悬浮子分类 -->
        <div
          v-if="hoveredCategory"
          class="subMenu card"
          :style="{ top: subMenuTop + 'px', left: subMenuLeft + 'px' }"
          @mouseenter="keepSubMenu"
          @mouseleave="hideSubMenu"
        >
          <div class="subMenuHeader">
            <strong>{{ hoveredCategory.name }}</strong>
            <span class="subCount">共{{ hoveredCategory.children.length }}个分类</span>
          </div>
          <div class="subGrid">
            <div
              v-for="child in hoveredCategory.children"
              :key="child.id"
              class="subItem"
              :class="{ active: activeSubCategory === child.id }"
              @click="selectSubCategory(child.id)"
            >
              <div class="subIcon" :class="child.iconBgClass">
                <i :class="child.iconClass"></i>
              </div>
              <span>{{ child.name }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 商品列表 -->
      <section class="productSection">
        <div class="productGrid">
          <div
            v-for="p in displayedProducts"
            :key="p.id"
            class="productCard card"
            @click="goToDetail(p.id)"
          >
            <div class="productImg">
              <img :src="p.image" :alt="p.title" />
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
      </section>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floatTools">
      <button v-for="tool in floatingTools" :key="tool.id" class="floatBtn" @click="tool.action()">
        <i :class="tool.icon"></i>
        <span class="floatTip">{{ tool.label }}</span>
      </button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'
import Topnav from '@/components/TopNav.vue' 
defineOptions({ name: 'HomePage' })

const route = useRoute()
const hideNavRoutes = ['/user/login', '/user/register']
const showNav = computed(() => !hideNavRoutes.includes(route.path))

const router = useRouter()
const store = useProductStore()
const userStore = useUserStore()

const searchInput = ref('')
const activeMainCategory = ref<number | null>(null)
const activeSubCategory = ref<number | null>(null)
const hoveredCategory = ref<typeof mainCategories[0] | null>(null)
const subMenuTop = ref(0)
const subMenuLeft = ref(0)
const categoryRefs = ref<(HTMLElement | null)[]>([])
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const setCategoryRef = (el: HTMLElement | null, index: number) => {
  categoryRefs.value[index] = el
}

const hotTags = ['iPhone', '小米手机', '数码相机', '闲置衣服']

const mainCategories = [
  { id: 1, name: '手机', iconClass: 'fa fa-mobile text-orange-500',
    children: [
      { id: 11, name: 'iPhone', iconClass: 'fa fa-apple', iconBgClass: 'bg-gray-100' },
      { id: 12, name: '华为', iconClass: 'fa fa-android', iconBgClass: 'bg-green-100' },
      { id: 13, name: '小米', iconClass: 'fa fa-mobile', iconBgClass: 'bg-orange-100' },
      { id: 14, name: 'OPPO', iconClass: 'fa fa-mobile', iconBgClass: 'bg-pink-100' },
      { id: 15, name: 'vivo', iconClass: 'fa fa-mobile', iconBgClass: 'bg-blue-100' },
      { id: 16, name: '荣耀', iconClass: 'fa fa-mobile', iconBgClass: 'bg-indigo-100' }
    ]
  },
  { id: 2, name: '数码', iconClass: 'fa fa-camera text-blue-500',
    children: [
      { id: 21, name: '相机', iconClass: 'fa fa-camera', iconBgClass: 'bg-gray-100' },
      { id: 22, name: '无人机', iconClass: 'fa fa-paper-plane', iconBgClass: 'bg-teal-100' },
      { id: 23, name: '游戏机', iconClass: 'fa fa-gamepad', iconBgClass: 'bg-purple-100' },
      { id: 24, name: '耳机', iconClass: 'fa fa-headphones', iconBgClass: 'bg-pink-100' },
      { id: 25, name: '音箱', iconClass: 'fa fa-volume-up', iconBgClass: 'bg-orange-100' },
      { id: 26, name: '平板', iconClass: 'fa fa-tablet', iconBgClass: 'bg-blue-100' }
    ]
  },
  { id: 3, name: '电脑', iconClass: 'fa fa-laptop text-gray-600',
    children: [
      { id: 31, name: '笔记本', iconClass: 'fa fa-laptop', iconBgClass: 'bg-blue-100' },
      { id: 32, name: '台式机', iconClass: 'fa fa-desktop', iconBgClass: 'bg-gray-100' },
      { id: 33, name: '显示器', iconClass: 'fa fa-television', iconBgClass: 'bg-indigo-100' },
      { id: 34, name: '键鼠', iconClass: 'fa fa-keyboard-o', iconBgClass: 'bg-purple-100' }
    ]
  },
  { id: 4, name: '服饰', iconClass: 'fa fa-joomla text-pink-500',
    children: [
      { id: 41, name: '男装', iconClass: 'fa fa-male', iconBgClass: 'bg-blue-100' },
      { id: 42, name: '女装', iconClass: 'fa fa-female', iconBgClass: 'bg-pink-100' },
      { id: 43, name: '童装', iconClass: 'fa fa-child', iconBgClass: 'bg-orange-100' },
      { id: 44, name: '鞋', iconClass: 'fa fa-gittip', iconBgClass: 'bg-red-100' },
      { id: 45, name: '配饰', iconClass: 'fa fa-diamond', iconBgClass: 'bg-yellow-100' }
    ]
  },
  { id: 5, name: '箱包', iconClass: 'fa fa-briefcase text-purple-500',
    children: [
      { id: 51, name: '女包', iconClass: 'fa fa-handbag', iconBgClass: 'bg-pink-100' },
      { id: 52, name: '男包', iconClass: 'fa fa-briefcase', iconBgClass: 'bg-gray-100' },
      { id: 53, name: '旅行箱', iconClass: 'fa fa-suitcase-rolling', iconBgClass: 'bg-blue-100' },
      { id: 54, name: '双肩包', iconClass: 'fa fa-backpack', iconBgClass: 'bg-green-100' }
    ]
  },
  { id: 6, name: '运动', iconClass: 'fa fa-bicycle text-green-500',
    children: [
      { id: 61, name: '球类', iconClass: 'fa fa-circle-o', iconBgClass: 'bg-orange-100' },
      { id: 62, name: '健身', iconClass: 'fa fa-dumbbell', iconBgClass: 'bg-red-100' },
      { id: 63, name: '骑行', iconClass: 'fa fa-bicycle', iconBgClass: 'bg-green-100' },
      { id: 64, name: '游泳', iconClass: 'fa fa-tint', iconBgClass: 'bg-blue-100' }
    ]
  },
  { id: 7, name: '家电', iconClass: 'fa fa-television text-blue-500',
    children: [
      { id: 71, name: '电视', iconClass: 'fa fa-television', iconBgClass: 'bg-blue-100' },
      { id: 72, name: '空调', iconClass: 'fa fa-snowflake-o', iconBgClass: 'bg-cyan-100' },
      { id: 73, name: '冰箱', iconClass: 'fa fa-square', iconBgClass: 'bg-blue-100' },
      { id: 74, name: '洗衣机', iconClass: 'fa fa-circle-o-notch', iconBgClass: 'bg-indigo-100' },
      { id: 75, name: '小家电', iconClass: 'fa fa-coffee', iconBgClass: 'bg-amber-100' }
    ]
  },
  { id: 8, name: '家居', iconClass: 'fa fa-bed text-amber-600',
    children: [
      { id: 81, name: '家具', iconClass: 'fa fa-bed', iconBgClass: 'bg-amber-100' },
      { id: 82, name: '床垫', iconClass: 'fa fa-sticky-note', iconBgClass: 'bg-purple-100' },
      { id: 83, name: '灯饰', iconClass: 'fa fa-lightbulb-o', iconBgClass: 'bg-yellow-100' },
      { id: 84, name: '厨具', iconClass: 'fa fa-cutlery', iconBgClass: 'bg-orange-100' }
    ]
  },
  { id: 9, name: '美妆', iconClass: 'fa fa-paint-brush text-red-400',
    children: [
      { id: 91, name: '护肤', iconClass: 'fa fa-smile-o', iconBgClass: 'bg-pink-100' },
      { id: 92, name: '彩妆', iconClass: 'fa fa-paint-brush', iconBgClass: 'bg-red-100' },
      { id: 93, name: '香水', iconClass: 'fa fa-fire', iconBgClass: 'bg-amber-100' },
      { id: 94, name: '个护', iconClass: 'fa fa-heart', iconBgClass: 'bg-rose-100' }
    ]
  },
  { id: 10, name: '母婴', iconClass: 'fa fa-child text-rose-400',
    children: [
      { id: 101, name: '童装', iconClass: 'fa fa-child', iconBgClass: 'bg-pink-100' },
      { id: 102, name: '玩具', iconClass: 'fa fa-gamepad', iconBgClass: 'bg-yellow-100' },
      { id: 103, name: '婴儿车', iconClass: 'fa fa-stroller', iconBgClass: 'bg-blue-100' },
      { id: 104, name: '用品', iconClass: 'fa fa-baby', iconBgClass: 'bg-teal-100' }
    ]
  },
  { id: 11, name: '图书', iconClass: 'fa fa-book text-teal-500',
    children: [
      { id: 111, name: '小说', iconClass: 'fa fa-book', iconBgClass: 'bg-blue-100' },
      { id: 112, name: '教辅', iconClass: 'fa fa-graduation-cap', iconBgClass: 'bg-green-100' },
      { id: 113, name: '绘本', iconClass: 'fa fa-bookmark', iconBgClass: 'bg-pink-100' },
      { id: 114, name: '文具', iconClass: 'fa fa-pencil', iconBgClass: 'bg-yellow-100' }
    ]
  },
  { id: 12, name: '更多', iconClass: 'fa fa-ellipsis-h text-gray-500',
    children: [
      { id: 121, name: '乐器', iconClass: 'fa fa-music', iconBgClass: 'bg-violet-100' },
      { id: 122, name: '虚拟', iconClass: 'fa fa-gamepad', iconBgClass: 'bg-cyan-100' },
      { id: 123, name: '票券', iconClass: 'fa fa-ticket', iconBgClass: 'bg-yellow-100' },
      { id: 124, name: '租房', iconClass: 'fa fa-home', iconBgClass: 'bg-green-100' },
      { id: 125, name: '汽车', iconClass: 'fa fa-car', iconBgClass: 'bg-gray-100' }
    ]
  }
]

const floatingTools = [
  { id: 1, icon: 'fa fa-plus text-gray-700', label: '发闲置', action: () => router.push('/publish')},
  { id: 2, icon: 'fa fa-envelope text-gray-700', label: '消息', action: () => router.push('/chat') },
  { id: 3, icon: 'fa fa-mobile text-gray-700', label: 'APP', action: () => alert('打开应用商店下载荔园APP') },
  { id: 4, icon: 'fa fa-commenting text-gray-700', label: '反馈', action: () => alert('欢迎提出宝贵意见和建议！') },
  { id: 5, icon: 'fa fa-headphones text-gray-700', label: '客服', action: () => alert('正在为您连接客服...') }
]

const displayedProducts = computed(() => store.products.slice(0, 12))

onMounted(() => {
  store.initialize()
})

const handleLogin = () => {
  router.push('/user/login')
}

const handleSearch = () => {
  if (searchInput.value.trim()) {
    router.push({ path: '/search', query: { q: searchInput.value.trim() } })
  }
}

const searchTag = (tag: string) => {
  searchInput.value = tag
  handleSearch()
}

const goToDetail = (id: number) => {
  router.push({ path: '/detail', query: { id: id.toString() } })
}

const showSubMenu = (id: number, index: number) => {
  if (hideTimeout) clearTimeout(hideTimeout)
  hoveredCategory.value = mainCategories.find(c => c.id === id) || null
  const el = document.querySelectorAll('.categoryItem')[index] as HTMLElement
  if (el) {
    const rect = el.getBoundingClientRect()
    subMenuLeft.value = rect.right + 8
    subMenuTop.value = rect.top
  }
}

const hideSubMenu = () => {
  hideTimeout = setTimeout(() => {
    hoveredCategory.value = null
  }, 150)
}

const keepSubMenu = () => {
  if (hideTimeout) clearTimeout(hideTimeout)
}

const selectSubCategory = (id: number) => {
  activeSubCategory.value = id
  hoveredCategory.value = null
}
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo i {
  font-size: 28px;
  color: #f97316;
}

.logo span {
  font-size: 22px;
  font-weight: bold;
  color: #f97316;
}

.searchBox {
  flex: 1;
  max-width: 560px;
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

.hotTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.hotTags a {
  color: #6b7280;
  text-decoration: none;
  transition: color 200ms;
}

.hotTags a:hover {
  color: #f97316;
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

/* 主体布局 */
.main {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  gap: 20px;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  position: relative;
}

.categoryCard {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 80px;
}

.categoryList {
  list-style: none;
  padding: 0;
  margin: 0;
}

.categoryItem {
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease;
}

.categoryItem:hover {
  background: rgba(249, 115, 22, 0.08);
}

.categoryItem.active {
  background: #fff7ed;
}

.categoryItem a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}

.catIcon {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.categoryItem.active a {
  color: #f97316;
  font-weight: 500;
}

.arrow {
  margin-left: auto;
  font-size: 10px;
  color: var(--muted);
  opacity: 0;
  transition: opacity 150ms;
}

.categoryItem:hover .arrow {
  opacity: 1;
}

/* 子分类菜单 */
.subMenu {
  position: fixed;
  width: 300px;
  padding: 16px;
  z-index: 100;
}

.subMenuHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.subCount {
  font-size: 12px;
  color: var(--muted);
}

.subGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.subItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms;
}

.subItem:hover {
  background: rgba(249, 115, 22, 0.06);
}

.subItem.active {
  background: rgba(249, 115, 22, 0.08);
  outline: 1px solid rgba(249, 115, 22, 0.2);
}

.subIcon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.subItem span {
  font-size: 12px;
  color: var(--text);
}

/* 商品区域 */
.productSection {
  flex: 1;
}

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
}

.condition {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  color: var(--text);
}

.productInfo {
  padding: 12px;
}

.productTitle {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productDesc {
  font-size: 12px;
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
  font-size: 18px;
  font-weight: bold;
  color: #f97316;
}

.originalPrice {
  font-size: 12px;
  color: var(--muted);
  text-decoration: line-through;
}

.location {
  font-size: 12px;
  color: var(--muted);
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
@media (max-width: 900px) {
  .top {
    flex-wrap: wrap;
  }
  .sidebar {
    display: none;
  }
  .productGrid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 600px) {
  .right {
    display: none;
  }
  .productGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .floatTools {
    display: none;
  }
}
</style>
