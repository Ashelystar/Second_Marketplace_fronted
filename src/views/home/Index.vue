<template>
  <div class="bg-pageBg min-h-screen flex flex-col">
    <div class="flex-grow">
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
        </section>

      </div>
    </div>
    <SiteFooter />
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'
import { getCategoryList } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import Topnav from '@/components/TopNav.vue'
import SiteFooter from '@/components/layout/SiteFooter.vue'
defineOptions({ name: 'HomePage' })

const route = useRoute()
const hideNavRoutes = ['/user/login', '/user/register']
const showNav = computed(() => !hideNavRoutes.includes(route.path))

const router = useRouter()
const store = useProductStore()

const activeMainCategory = ref<number | null>(null)
const activeSubCategory = ref<number | null>(null)
const hoveredCategory = ref<typeof mainCategories.value[0] | null>(null)
const subMenuTop = ref(0)
const subMenuLeft = ref(0)
const categoryRefs = ref<(HTMLElement | null)[]>([])
let hideTimeout: ReturnType<typeof setTimeout> | null = null

const setCategoryRef = (el: HTMLElement | null, index: number) => {
  categoryRefs.value[index] = el
}

// 分类图标映射
const iconClassMap: Record<number, { iconClass: string; iconBgClass: string }> = {
  1: { iconClass: 'fa fa-mobile', iconBgClass: 'bg-orange-100' },
  2: { iconClass: 'fa fa-camera', iconBgClass: 'bg-blue-100' },
  3: { iconClass: 'fa fa-laptop', iconBgClass: 'bg-gray-100' },
  4: { iconClass: 'fa fa-joomla', iconBgClass: 'bg-pink-100' },
  5: { iconClass: 'fa fa-briefcase', iconBgClass: 'bg-purple-100' },
  6: { iconClass: 'fa fa-bicycle', iconBgClass: 'bg-green-100' },
  7: { iconClass: 'fa fa-television', iconBgClass: 'bg-blue-100' },
  8: { iconClass: 'fa fa-bed', iconBgClass: 'bg-amber-100' },
  9: { iconClass: 'fa fa-paint-brush', iconBgClass: 'bg-red-100' },
  10: { iconClass: 'fa fa-child', iconBgClass: 'bg-rose-100' },
  11: { iconClass: 'fa fa-book', iconBgClass: 'bg-teal-100' },
  12: { iconClass: 'fa fa-ellipsis-h', iconBgClass: 'bg-gray-100' },
}

const getIconConfig = (id: number) => {
  const baseIndex = ((id - 1) % 12) + 1
  return iconClassMap[baseIndex] || { iconClass: 'fa fa-tag', iconBgClass: 'bg-gray-100' }
}

// 响应式分类数据
const mainCategories = ref<Array<{
  id: number
  name: string
  iconClass: string
  children: Array<{ id: number; name: string; iconClass: string; iconBgClass: string }>
}>>([])

// 加载分类列表
const loadCategories = async () => {
  try {
    const categories = await getCategoryList()
    const sortedCategories = categories
      .filter(c => c.isEnabled)
      .sort((a, b) => a.sortNo - b.sortNo)

    mainCategories.value = sortedCategories.map(cat => {
      const iconConfig = getIconConfig(cat.id)
      const subCategoryNames = ['综合', '热门推荐', '新品上架', '精选好物', '限时特惠', '更多']
      return {
        id: cat.id,
        name: cat.categoryName,
        iconClass: iconConfig.iconClass + ' text-orange-500',
        children: subCategoryNames.map((name, index) => ({
          id: cat.id * 100 + index,
          name,
          iconClass: iconConfig.iconClass,
          iconBgClass: iconConfig.iconBgClass,
        }))
      }
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}


const displayedProducts = computed(() => store.products.slice(0, 12))

onMounted(() => {
  store.initialize()
  loadCategories()
})

const goToDetail = (id: number) => {
  router.push({ path: '/detail', query: { id: id.toString() } })
}

const showSubMenu = (id: number, index: number) => {
  if (hideTimeout) clearTimeout(hideTimeout)
  hoveredCategory.value = mainCategories.value.find(c => c.id === id) || null
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

:deep(.site-footer) {
  margin-top: auto;
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

}
</style>
