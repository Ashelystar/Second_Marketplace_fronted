<template>
  <div>
    <!-- 收藏统计 -->
    <div class="statsBar">
      <div class="statCard">
        <div class="statValue">{{ favoriteStats.total }}</div>
        <div class="statLabel">收藏总数</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ favoriteStats.active }}</div>
        <div class="statLabel">在售商品</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ favoriteStats.offSale }}</div>
        <div class="statLabel">已下架</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filterBar">
      <div class="filterTabs">
        <button
          class="filterTab"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          全部
        </button>
        <button
          class="filterTab"
          :class="{ active: activeCategory === 'digital' }"
          @click="activeCategory = 'digital'"
        >
          数码电子
        </button>
        <button
          class="filterTab"
          :class="{ active: activeCategory === 'clothing' }"
          @click="activeCategory = 'clothing'"
        >
          服装服饰
        </button>
        <button
          class="filterTab"
          :class="{ active: activeCategory === 'book' }"
          @click="activeCategory = 'book'"
        >
          图书教材
        </button>
        <button
          class="filterTab"
          :class="{ active: activeCategory === 'daily' }"
          @click="activeCategory = 'daily'"
        >
          日用百货
        </button>
      </div>
    </div>

    <!-- 收藏商品列表 -->
    <div class="productGrid">
      <div v-if="filteredFavorites.length === 0" class="empty">
        <i class="fa fa-heart"></i>
        <p>暂无收藏</p>
      </div>
      <div
        v-else
        v-for="item in filteredFavorites"
        :key="item.id"
        class="productCard"
        @click="viewDetail(item.id)"
      >
        <div class="productImage">
          <img :src="item.image" :alt="item.title" />
          <span class="statusBadge onSale">
            已收藏
          </span>
        </div>
        <div class="productInfo">
          <h3 class="productTitle">{{ item.title }}</h3>
          <div class="productPrice">{{ formatPrice(item.price) }}</div>
          <div class="productStats">
            <span><i class="fa fa-tag"></i> {{ detectCategoryLabel(item.title) }}</span>
            <span><i class="fa fa-map-marker"></i> {{ item.location || '未知地点' }}</span>
          </div>
          <div class="productMeta">
            <span class="productSeller">{{ item.condition || '成色未知' }}</span>
            <span class="productCategory">{{ item.addTime || '' }}</span>
          </div>
        </div>
        <div class="productActions" @click.stop>
          <button class="actionBtn" @click="contactSeller()" title="联系卖家">
            <i class="fa fa-comment"></i>
          </button>
          <button class="actionBtn delete" @click="toggleFavorite(item)" title="取消收藏">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, type FavoriteItem } from '@/stores/userStore'

defineOptions({ name: 'UserFavorites' })

const router = useRouter()
const userStore = useUserStore()
const activeCategory = ref('all')
const favorites = computed<FavoriteItem[]>(() => userStore.favorites)

const favoriteStats = computed(() => ({
  total: favorites.value.length,
  active: favorites.value.length,
  offSale: 0,
}))

const filteredFavorites = computed(() => {
  if (activeCategory.value === 'all') return favorites.value
  const categoryMap: Record<string, string> = {
    digital: 'digital',
    clothing: 'clothing',
    book: 'book',
    daily: 'daily',
  }
  const selected = categoryMap[activeCategory.value]
  return favorites.value.filter((item) => detectCategory(item.title) === selected)
})

const viewDetail = (id: number) => {
  router.push({ path: '/goods/' + id })
}

const contactSeller = () => {
  router.push('/chat')
}

const detectCategory = (title: string) => {
  const normalized = title.toLowerCase()
  if (/(iphone|macbook|ipad|耳机|ps5|switch|电脑|手机|数码|相机)/.test(normalized)) {
    return 'digital'
  }
  if (/(衣|裤|鞋|外套|服|裙|帽|nike|adidas)/.test(normalized)) {
    return 'clothing'
  }
  if (/(书|教材|考研|题|笔记)/.test(normalized)) {
    return 'book'
  }
  return 'daily'
}

const detectCategoryLabel = (title: string) => {
  const category = detectCategory(title)
  if (category === 'digital') return '数码电子'
  if (category === 'clothing') return '服装服饰'
  if (category === 'book') return '图书教材'
  return '日用百货'
}

const formatPrice = (price: string) => {
  const value = Number(price)
  if (Number.isFinite(value)) {
    return `¥${value}`
  }
  return `¥${price}`
}

const toggleFavorite = async (item: FavoriteItem) => {
  if (!confirm(`确定要取消收藏「${item.title}」吗？`)) return
  try {
    await userStore.toggleFavorite(item)
  } catch (error) {
    alert(error instanceof Error ? error.message : '取消收藏失败')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    void userStore.syncFavoritesFromServer()
    return
  }
  void userStore.loadFavoriteIds()
})
</script>

<style scoped>
/* 统计卡片 */
.statsBar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.statCard {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.statValue {
  font-size: 28px;
  font-weight: bold;
  color: #f97316;
  margin-bottom: 4px;
}

.statLabel {
  font-size: 13px;
  color: #6b7280;
}

/* 筛选栏 */
.filterBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filterTabs {
  display: flex;
  gap: 8px;
}

.filterTab {
  padding: 8px 16px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 150ms;
}

.filterTab:hover {
  border-color: #f97316;
  color: #f97316;
}

.filterTab.active {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}

/* 商品列表 */
.productGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  background: #fff;
  border-radius: 12px;
}

.empty i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty p {
  font-size: 14px;
  color: #9ca3af;
}

.productCard {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms, box-shadow 200ms;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.productCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.productImage {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.productImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.statusBadge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.statusBadge.onSale {
  background: #f0fdf4;
  color: #16a34a;
}

.statusBadge.offSale {
  background: #f3f4f6;
  color: #9ca3af;
}

.productInfo {
  padding: 10px;
}

.productTitle {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.productPrice {
  font-size: 16px;
  font-weight: bold;
  color: #f97316;
  margin-bottom: 6px;
}

.productStats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 6px;
}

.productStats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.productMeta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #d1d5db;
}

.productSeller {
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.productActions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 3px;
  opacity: 0;
  transition: opacity 200ms;
}

.productCard:hover .productActions {
  opacity: 1;
}

.actionBtn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #6b7280;
  transition: all 150ms;
}

.actionBtn:hover {
  background: #f97316;
  color: #fff;
}

.actionBtn.delete:hover {
  background: #dc2626;
}

/* 响应式 */
@media (max-width: 768px) {
  .statsBar {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .productGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
