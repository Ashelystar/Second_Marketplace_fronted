<template>
  <div class="bg-pageBg min-h-screen">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" class="flex items-center gap-2" @click.prevent>
          <i class="fa fa-fish text-2xl text-xianyuText"></i>
          <h1 class="text-xl font-bold text-xianyuText">闲鱼</h1>
        </a>

        <div class="flex-1 max-w-xl mx-4">
          <div class="relative">
            <input type="text" placeholder="搜索闲置物品" v-model="searchInput" @keypress.enter="handleSearch"
              class="w-full h-10 px-4 pr-10 rounded-full bg-gray-100 border border-gray-300 placeholder-gray-500 focus:bg-white focus:border-accentBlue focus:outline-none transition-all">
            <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-xianyuText" @click="handleSearch">
              <i class="fa fa-search"></i>
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
            <span>热门：</span>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('iPhone')">iPhone</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('小米手机')">小米手机</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('数码相机')">数码相机</a>
            <a href="#" class="hover:text-xianyuText" @click.prevent="searchTag('闲置衣服')">闲置衣服</a>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-5 text-sm text-gray-700">
          <button class="hover:text-xianyuText flex items-center gap-1"><i class="fa fa-comments"></i> 社区</button>
          <template v-if="userStore.isLoggedIn">
            <button class="hover:text-xianyuText flex items-center gap-1"><i class="fa fa-shopping-bag"></i> 订单</button>
            <button class="hover:text-xianyuText flex items-center gap-1"><i class="fa fa-user"></i> 我的</button>
          </template>
          <template v-else>
            <button class="hover:text-xianyuText flex items-center gap-1" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</button>
          </template>
        </div>
      </div>
    </header>

    <main class="max-w-[1600px] mx-auto px-4 py-4 flex gap-4">
      <!-- 左侧大分类 + 悬浮子分类 -->
      <section class="w-[200px] hidden md:block shrink-0 relative">
        <div class="bg-white rounded-lg shadow-sm p-2 sticky top-20">
          <ul class="space-y-0.5 text-sm">
            <li v-for="(cat, index) in mainCategories" :key="cat.id" 
                :ref="(el: any) => setCategoryRef(el as HTMLElement | null, index)"
                class="px-3 py-2.5 rounded-lg cursor-pointer transition-all relative group"
                :class="{ 'active': activeMainCategory === cat.id }" 
                @mouseenter="showSubMenu(cat.id, index)"
                @mouseleave="hideSubMenu">
              <a href="#" class="flex items-center gap-3" @click.prevent>
                <i :class="cat.iconClass" class="text-lg"></i>
                <span class="text-gray-700 text-sm">{{ cat.name }}</span>
                <i class="fa fa-chevron-right text-xs text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
            </li>
          </ul>
        </div>

        <!-- 悬浮子分类面板 -->
        <div v-if="hoveredCategory" 
             class="fixed w-[300px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50"
             :style="{ top: subMenuTop + 'px', left: subMenuLeft + 'px' }"
             @mouseenter="keepSubMenu"
             @mouseleave="hideSubMenu">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">{{ hoveredCategory.name }}</h3>
            <span class="text-xs text-gray-400">共{{ hoveredCategory.children.length }}个分类</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="child in hoveredCategory.children" :key="child.id"
                 class="flex flex-col items-center gap-1.5 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-orange-50"
                 :class="{ 'bg-orange-50 ring-1 ring-orange-200': activeSubCategory === child.id }"
                 @click="selectSubCategory(child.id)">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl" :class="child.iconBgClass">
                <i :class="child.iconClass"></i>
              </div>
              <span class="text-xs text-gray-600 text-center">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 商品展示 -->
      <section class="flex-1">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          <div v-for="p in displayedProducts" :key="p.id" class="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer card-hover group">
            <div class="aspect-square overflow-hidden relative cursor-pointer" @click="goToDetail(p.id)">
              <img :src="p.image" :alt="p.title" class="w-full h-full object-cover pointer-events-none">
              <div class="absolute top-2 left-2 pointer-events-none">
                <span class="text-xs bg-white/90 text-gray-700 px-2 py-1 rounded-full">{{ p.condition }}</span>
              </div>
            </div>
            <div class="p-3">
              <h3 class="text-sm font-medium mb-1 line-clamp-2">{{ p.title }}</h3>
              <p class="text-xs text-gray-500 mb-2 line-clamp-1">{{ p.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-baseline">
                  <span class="text-lg font-bold text-xianyuText">¥{{ p.price }}</span>
                  <span class="text-xs text-gray-400 line-through ml-1">¥{{ p.originalPrice }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ p.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 悬浮工具栏 -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
      <div class="flex flex-col gap-2">
        <button v-for="tool in floatingTools" :key="tool.id" class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all group relative" @click="tool.action()">
          <i :class="tool.icon"></i>
          <span class="absolute right-full mr-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{ tool.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const store = useProductStore()
const userStore = useUserStore()
const searchInput = ref('')
const activeMainCategory = ref<number | null>(null)
const activeSubCategory = ref<number | null>(null)
const hoveredCategory = ref<typeof mainCategories[0] | null>(null)
const hoveredIndex = ref<number>(0)
const subMenuTop = ref(0)
const subMenuLeft = ref(0)
const categoryRefs = ref<(HTMLElement | null)[]>([])
const favorites = ref<Set<number>>(new Set())
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const setCategoryRef = (el: HTMLElement | null, index: number) => {
  categoryRefs.value[index] = el
}

const isFavorited = (id: number) => favorites.value.has(id)

const toggleFavorite = (id: number) => {
  if (favorites.value.has(id)) {
    favorites.value.delete(id)
  } else {
    favorites.value.add(id)
  }
}

const handleLogin = () => {
  userStore.login({ id: 1, username: '用户' })
  alert('登录成功！')
}

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
  { id: 4, name: '服饰', iconClass: 'fa fa-shirtsinbulk text-pink-500',
    children: [
      { id: 41, name: '男装', iconClass: 'fa fa-male', iconBgClass: 'bg-blue-100' },
      { id: 42, name: '女装', iconClass: 'fa fa-female', iconBgClass: 'bg-pink-100' },
      { id: 43, name: '童装', iconClass: 'fa fa-child', iconBgClass: 'bg-orange-100' },
      { id: 44, name: '鞋', iconClass: 'fa fa-shirtsinbulk', iconBgClass: 'bg-red-100' },
      { id: 45, name: '配饰', iconClass: 'fa fa-diamond', iconBgClass: 'bg-yellow-100' }
    ]
  },
  { id: 5, name: '箱包', iconClass: 'fa fa-shopping-bag text-purple-500',
    children: [
      { id: 51, name: '女包', iconClass: 'fa fa-handbag', iconBgClass: 'bg-pink-100' },
      { id: 52, name: '男包', iconClass: 'fa fa-briefcase', iconBgClass: 'bg-gray-100' },
      { id: 53, name: '旅行箱', iconClass: 'fa fa-suitcase', iconBgClass: 'bg-blue-100' },
      { id: 54, name: '双肩包', iconClass: 'fa fa-briefcase', iconBgClass: 'bg-green-100' }
    ]
  },
  { id: 6, name: '运动', iconClass: 'fa fa-futbol-o text-green-500',
    children: [
      { id: 61, name: '球类', iconClass: 'fa fa-futbol-o', iconBgClass: 'bg-orange-100' },
      { id: 62, name: '健身', iconClass: 'fa fa-dumbbell', iconBgClass: 'bg-red-100' },
      { id: 63, name: '骑行', iconClass: 'fa fa-bicycle', iconBgClass: 'bg-green-100' },
      { id: 64, name: '游泳', iconClass: 'fa fa-support', iconBgClass: 'bg-blue-100' }
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
      { id: 103, name: '婴儿车', iconClass: 'fa fa-wheelchair', iconBgClass: 'bg-blue-100' },
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
  { id: 1, icon: 'fa fa-plus text-gray-700', label: '发闲置', action: () => alert('正在跳转到发布页面...') },
  { id: 2, icon: 'fa fa-envelope text-gray-700', label: '消息', action: () => alert('正在跳转到消息页面...') },
  { id: 3, icon: 'fa fa-mobile text-gray-700', label: 'APP', action: () => alert('打开应用商店下载闲鱼APP') },
  { id: 4, icon: 'fa fa-commenting text-gray-700', label: '反馈', action: () => alert('欢迎提出宝贵意见和建议！') },
  { id: 5, icon: 'fa fa-headphones text-gray-700', label: '客服', action: () => alert('正在为您连接客服...') }
]

const displayedProducts = computed(() => store.products.slice(0, 6))

onMounted(() => {
  store.initialize()
})

const handleSearch = () => {
  if (searchInput.value.trim()) router.push({ path: '/search', query: { q: searchInput.value.trim() } })
}

const searchTag = (tag: string) => { searchInput.value = tag; handleSearch() }

const goToDetail = (id: number) => router.push({ path: '/detail', query: { id: id.toString() } })

// 鼠标进入大分类，显示子分类面板
const showSubMenu = (id: number, index: number) => {
  if (hideTimeout) clearTimeout(hideTimeout)
  hoveredCategory.value = mainCategories.find(c => c.id === id) || null
  hoveredIndex.value = index
  const categoryEl = categoryRefs.value[index]
  if (categoryEl) {
    const rect = categoryEl.getBoundingClientRect()
    subMenuLeft.value = rect.right + 8
    subMenuTop.value = rect.top
  }
}

// 鼠标离开，延迟隐藏
const hideSubMenu = () => {
  hideTimeout = setTimeout(() => {
    hoveredCategory.value = null
  }, 150)
}

// 保持在子分类面板上
const keepSubMenu = () => {
  if (hideTimeout) clearTimeout(hideTimeout)
}

// 选择子分类
const selectSubCategory = (id: number) => {
  activeSubCategory.value = id
  hoveredCategory.value = null
}
</script>

<style scoped>
.card-hover { transition: all 300ms; }
.card-hover:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transform: translateY(-0.25rem); }

li.active { background-color: #fff7ed; }
li.active a { color: #f97316; font-weight: 500; }
li.active i { transform: scale(1.1); }
</style>
