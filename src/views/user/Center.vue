<template>
  <div class="center-page">
    <!-- 我的交易 - 采用SellerProducts样式 -->
    <div>
      <!-- 统计卡片 -->
      <div class="statsBar">
        <div class="statCard user-page-card">
          <div class="statValue">{{ totalProducts }}</div>
          <div class="statLabel">全部商品</div>
        </div>
        <div class="statCard user-page-card">
          <div class="statValue">{{ onSaleCount }}</div>
          <div class="statLabel">在售中</div>
        </div>
        <div class="statCard user-page-card">
          <div class="statValue">{{ offSaleCount }}</div>
          <div class="statLabel">已下架</div>
        </div>
        <div class="statCard user-page-card">
          <div class="statValue">{{ pendingReviewCount }}</div>
          <div class="statLabel">待审核</div>
        </div>
        <div class="statCard user-page-card">
          <div class="statValue">{{ totalViews }}</div>
          <div class="statLabel">总浏览</div>
        </div>
      </div>

      <!-- 筛选和操作栏 -->
      <div class="filterBar user-page-card">
        <div class="filterTabs">
          <button
            class="filterTab"
            :class="{ active: filterStatus === 'all' }"
            @click="filterStatus = 'all'"
          >
            全部
          </button>
          <button
            class="filterTab"
            :class="{ active: filterStatus === 'onSale' }"
            @click="filterStatus = 'onSale'"
          >
            在售
          </button>
          <button
            class="filterTab"
            :class="{ active: filterStatus === 'offSale' }"
            @click="filterStatus = 'offSale'"
          >
            已下架
          </button>
          <button
            class="filterTab"
            :class="{ active: filterStatus === 'pendingReview' }"
            @click="filterStatus = 'pendingReview'"
          >
            待审核
          </button>
          <button
            class="filterTab"
            :class="{ active: filterStatus === 'rejected' }"
            @click="filterStatus = 'rejected'"
          >
            已驳回
          </button>
        </div>
        <div class="filterActions">
          <button class="draftBtn" @click="$router.push('/drafts')">
            <i class="fa fa-file-text-o"></i> 草稿箱
          </button>
          <button class="publishBtn" @click="$router.push('/publish')">
            <i class="fa fa-plus"></i> 发布商品
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="productGrid">
        <div v-if="loading" class="empty user-page-card">
          <i class="fa fa-spinner fa-spin"></i>
          <p>加载中...</p>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="empty user-page-card">
          <i class="fa fa-cube"></i>
          <p>{{ filterStatus === 'all' ? '暂无发布的商品' : filterStatus === 'onSale' ? '暂无在售商品' : filterStatus === 'offSale' ? '暂无下架商品' : filterStatus === 'pendingReview' ? '暂无待审核商品' : '暂无已驳回商品' }}</p>
          <button
            v-if="filterStatus !== 'offSale' && filterStatus !== 'pendingReview'"
            :class="['emptyActionBtn', filterStatus === 'onSale' ? 'compact' : '']"
            @click="$router.push('/publish')"
          >
            <span>发布商品</span>
          </button>
        </div>
        <div
          v-else
          v-for="product in filteredProducts"
          :key="product.id"
          class="productCard user-page-card"
          @click="goToSellerProductDetail(product.id)"
        >
          <div class="productImage">
            <img :src="product.image" :alt="product.title" />
            <span
              class="statusBadge"
              :class="product.status === '在售' ? 'onSale' : product.status === '待审核' ? 'pending' : product.status === '已驳回' ? 'rejected' : 'offSale'"
            >
              {{ product.status }}
            </span>
          </div>
          <div class="productInfo">
            <h3 class="productTitle">{{ product.title }}</h3>
            <div class="price">
              <span class="currentPrice">¥{{ product.price }}</span>
              <span v-if="product.originalPrice" class="originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="productStats">
              <span><i class="fa fa-eye"></i> {{ product.viewCount }}</span>
              <span><i class="fa fa-heart"></i> {{ product.favoriteCount }}</span>
              <span><i class="fa fa-comment"></i> {{ product.consultCount }}</span>
            </div>
            <div class="productMeta">
              <span class="productTime">{{ product.publishTime }}</span>
              <span class="productCategory">{{ product.category }}</span>
            </div>
          </div>
          <div class="productActions" @click.stop>
            <button class="actionBtn" @click="toggleStatus(product)">
              <i :class="product.status === '在售' ? 'fa fa-pause' : 'fa fa-play'"></i>
            </button>
            <button class="actionBtn" @click="editProduct(product)">
              <i class="fa fa-edit"></i>
            </button>
            <button class="actionBtn delete" @click="deleteProduct(product)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { offShelfProduct, relistProduct, getMyProducts, type ProductVO } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

const router = useRouter()
const EDIT_PRODUCT_CACHE_KEY = 'edit_product_cache'

const filterStatus = ref('all')
const loading = ref(false)

// 后端状态 -> 前端显示状态
const statusMap: Record<string, string> = {
  on_sale: '在售',
  off_sale: '已下架',
  off_shelf: '已下架',
  offline: '已下架',
  pending_review: '待审核',
  draft: '草稿',
  rejected: '已驳回',
}

interface Product {
  id: number
  title: string
  price: number
  originalPrice: number
  image: string
  category: string
  status: '在售' | '已下架' | '待审核' | '已驳回'
  viewCount: number
  favoriteCount: number
  consultCount: number
  publishTime: string
  _raw: ProductVO
  _isDraft: boolean
}

const products = ref<Product[]>([])

// 格式化时间
const formatTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}个月前`
}

// 将 ProductVO 转换为 Product
const toProduct = (item: ProductVO): Product => {
  const coverImage = item.images?.find(img => img.isCover)?.imageUrl
    || item.images?.[0]?.imageUrl
    || ''
  return {
    id: item.id,
    title: item.title,
    price: item.sellingPrice || 0,
    originalPrice: item.originalPrice || 0,
    image: coverImage ? getImageUrl(coverImage) : PLACEHOLDER_IMG,
    category: '',
    status: (statusMap[item.publishStatus] || '在售') as Product['status'],
    viewCount: item.viewCount || 0,
    favoriteCount: item.favoriteCount || 0,
    consultCount: 0,
    publishTime: formatTime(item.publishedAt),
    _raw: item,
    _isDraft: item.publishStatus === 'draft',
  }
}

// 加载商品列表（排除草稿，草稿在草稿箱单独展示）
const loadProducts = async () => {
  loading.value = true
  try {
    const result = await getMyProducts({ current: 1, size: 100 })
    products.value = (result.records || [])
      .filter(item => item.publishStatus !== 'draft')
      .map(toProduct)
  } catch (err) {
    console.error('加载商品列表失败:', err)
  } finally {
    loading.value = false
  }
}

// 筛选
const filteredProducts = computed(() => {
  if (filterStatus.value === 'all') return products.value
  if (filterStatus.value === 'onSale') return products.value.filter(p => p.status === '在售')
  if (filterStatus.value === 'offSale') return products.value.filter(p => p.status === '已下架')
  if (filterStatus.value === 'pendingReview') return products.value.filter(p => p.status === '待审核')
  if (filterStatus.value === 'rejected') return products.value.filter(p => p.status === '已驳回')
  return products.value
})

const totalProducts = computed(() => products.value.length)
const onSaleCount = computed(() => products.value.filter(p => p.status === '在售').length)
const offSaleCount = computed(() => products.value.filter(p => p.status === '已下架').length)
const pendingReviewCount = computed(() => products.value.filter(p => p.status === '待审核').length)
const totalViews = computed(() => products.value.reduce((sum, p) => sum + p.viewCount, 0))

// 跳转到卖家商品详情页（可管理上下架/编辑）
const goToSellerProductDetail = (id: number) => {
  router.push({ path: '/seller/product', query: { id: id.toString() } })
}

const editProduct = (product: Product) => {
  const raw = product._raw
  sessionStorage.setItem(EDIT_PRODUCT_CACHE_KEY, JSON.stringify({
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle || '',
    description: raw.description || '',
    brand: raw.brand || '',
    model: raw.model || '',
    categoryId: raw.categoryId,
    conditionLevel: raw.conditionLevel || '',
    originalPrice: raw.originalPrice || 0,
    price: raw.sellingPrice || 0,
    canBargain: raw.canBargain || false,
    tradeMode: raw.tradeMode || 'both',
    pickupCity: raw.pickupCity || '',
    pickupAddress: raw.pickupAddress || '',
    images: raw.images?.map(img => img.imageUrl) || [],
  }))
  router.push({ path: '/edit', query: { id: product.id.toString() } })
}

const toggleStatus = async (product: Product) => {
  if (product.status === '在售') {
    try {
      await offShelfProduct(product.id)
      product.status = '已下架'
      alert('商品已下架')
    } catch (err) {
      console.error('下架接口调用失败:', err)
      alert(err instanceof Error ? err.message : '下架失败，请稍后重试')
    }
    return
  }

  try {
    await relistProduct(product.id)
    product.status = '在售'
    alert('商品已重新上架')
  } catch (err) {
    console.error('重新上架接口调用失败:', err)
    alert(err instanceof Error ? err.message : '重新上架失败，请稍后重试')
  }
}

const deleteProduct = async (product: Product) => {
  if (confirm(`确定要删除商品「${product.title}」吗？删除后不可恢复！`)) {
    try {
      await offShelfProduct(product.id)
      products.value = products.value.filter(p => p.id !== product.id)
      alert('商品已删除')
    } catch (err) {
      console.error('删除商品失败:', err)
      alert(err instanceof Error ? err.message : '删除失败，请稍后重试')
    }
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.center-page {
  animation: page-enter 320ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 统计卡片 */
.statsBar {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.statCard {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: card-pop 260ms ease both;
}

.statCard:nth-child(2) { animation-delay: 35ms; }
.statCard:nth-child(3) { animation-delay: 70ms; }
.statCard:nth-child(4) { animation-delay: 105ms; }

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  transition: box-shadow 220ms ease, transform 220ms ease;
}

.filterBar:hover {
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.08);
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

.filterActions {
  display: flex;
  gap: 10px;
}

.draftBtn {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms;
}

.draftBtn:hover {
  border-color: #f97316;
  color: #f97316;
}

.publishBtn {
  padding: 10px 20px;
  background: #f97316;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 200ms, transform 200ms ease, box-shadow 200ms ease;
}

.publishBtn:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(249, 115, 22, 0.28);
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
  margin-bottom: 20px;
}

.emptyActionBtn {
  padding: 10px 22px;
  background: #f97316;
  border: none;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  transition: all 150ms ease;
}

.emptyActionBtn i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.emptyActionBtn:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

.emptyActionBtn.compact {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 10px;
  box-shadow: none;
}

.emptyActionBtn.compact i {
  font-size: 12px;
}

.productCard {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms, box-shadow 200ms;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: card-in 260ms ease both;
}

.productCard:nth-child(2n) {
  animation-delay: 35ms;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  transition: transform 360ms ease;
}

.productCard:hover .productImage img {
  transform: scale(1.04);
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

.statusBadge.pending {
  background: #fff7ed;
  color: #f97316;
}

.statusBadge.rejected {
  background: #fef2f2;
  color: #dc2626;
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

.price {
  font-size: 16px;
  font-weight: bold;
  color: #f97316;
  margin-bottom: 6px;
}

.price .originalPrice {
  font-size: 12px;
  color: #9ca3af;
  text-decoration: line-through;
  font-weight: normal;
  margin-left: 6px;
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
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .filterBar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filterTabs,
  .filterActions {
    width: 100%;
  }
  
  .filterActions > button {
    flex: 1;
    justify-content: center;
  }
  
  .productGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .filterTabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .filterTab {
    padding: 9px 8px;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .center-page,
  .statCard,
  .productCard {
    animation: none;
  }

  .filterBar,
  .publishBtn,
  .productCard,
  .productImage img {
    transition: none;
  }
}
</style>
