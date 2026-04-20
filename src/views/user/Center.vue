<template>
  <div>
    <!-- 我的交易 - 采用SellerProducts样式 -->
    <div class="mt-6">
      <!-- 统计卡片 -->
      <div class="statsBar">
        <div class="statCard">
          <div class="statValue">{{ totalProducts }}</div>
          <div class="statLabel">全部商品</div>
        </div>
        <div class="statCard">
          <div class="statValue">{{ onSaleCount }}</div>
          <div class="statLabel">在售中</div>
        </div>
        <div class="statCard">
          <div class="statValue">{{ offSaleCount }}</div>
          <div class="statLabel">已下架</div>
        </div>
        <div class="statCard">
          <div class="statValue">{{ totalViews }}</div>
          <div class="statLabel">总浏览</div>
        </div>
      </div>

      <!-- 筛选和操作栏 -->
      <div class="filterBar">
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
        </div>
        <div class="filterActions">
          <button class="publishBtn" @click="$router.push('/publish')">
            <i class="fa fa-plus"></i> 发布商品
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="productGrid">
        <div v-if="filteredProducts.length === 0" class="empty">
          <i class="fa fa-cube"></i>
          <p>{{ filterStatus === 'all' ? '暂无发布的商品' : filterStatus === 'onSale' ? '暂无在售商品' : '暂无下架商品' }}</p>
          <button class="btnPrimary" @click="$router.push('/publish')">
            <i class="fa fa-plus"></i> 发布商品
          </button>
        </div>
        <div
          v-else
          v-for="product in filteredProducts"
          :key="product.id"
          class="productCard"
          @click="goToSellerProductDetail(product.id)"
        >
          <div class="productImage">
            <img :src="product.image" :alt="product.title" />
            <span class="statusBadge" :class="product.status === '在售' ? 'onSale' : 'offSale'">
              {{ product.status }}
            </span>
          </div>
          <div class="productInfo">
            <h3 class="productTitle">{{ product.title }}</h3>
            <div class="productPrice">¥{{ product.price }}</div>
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
            <button class="actionBtn" @click="editProduct(product.id)">
              <i class="fa fa-edit"></i>
            </button>
            <button class="actionBtn delete" @click="deleteProduct(product)">
              <i class="fa fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const filterStatus = ref('all')

interface Product {
  id: number
  title: string
  price: number
  originalPrice: number
  image: string
  category: string
  status: '在售' | '已下架'
  viewCount: number
  favoriteCount: number
  consultCount: number
  publishTime: string
}

const products = ref<Product[]>([
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    price: 6999,
    originalPrice: 8999,
    image: 'https://picsum.photos/id/1/400/400',
    category: '手机数码',
    status: '在售',
    viewCount: 128,
    favoriteCount: 23,
    consultCount: 5,
    publishTime: '3天前'
  },
  {
    id: 2,
    title: 'AirPods Pro 2 全新未拆封 国行正品',
    price: 1599,
    originalPrice: 1999,
    image: 'https://picsum.photos/id/119/400/400',
    category: '数码配件',
    status: '在售',
    viewCount: 89,
    favoriteCount: 15,
    consultCount: 3,
    publishTime: '1周前'
  },
  {
    id: 3,
    title: 'MacBook Pro 14寸 M2 Pro 16+512G 银色',
    price: 12999,
    originalPrice: 15999,
    image: 'https://picsum.photos/id/45/400/400',
    category: '电脑办公',
    status: '已下架',
    viewCount: 256,
    favoriteCount: 42,
    consultCount: 8,
    publishTime: '2周前'
  },
  {
    id: 4,
    title: 'Nintendo Switch OLED 日版 配原装底座',
    price: 1899,
    originalPrice: 2499,
    image: 'https://picsum.photos/id/42/400/400',
    category: '游戏主机',
    status: '在售',
    viewCount: 67,
    favoriteCount: 12,
    consultCount: 2,
    publishTime: '今天'
  },
  {
    id: 5,
    title: 'Sony WH-1000XM4 头戴式降噪耳机 黑色',
    price: 1299,
    originalPrice: 2299,
    image: 'https://picsum.photos/id/38/400/400',
    category: '数码配件',
    status: '在售',
    viewCount: 45,
    favoriteCount: 8,
    consultCount: 1,
    publishTime: '2天前'
  },
  {
    id: 6,
    title: 'iPad Air 5 256G WiFi版 星光色',
    price: 4599,
    originalPrice: 5499,
    image: 'https://picsum.photos/id/57/400/400',
    category: '平板电脑',
    status: '已下架',
    viewCount: 112,
    favoriteCount: 18,
    consultCount: 4,
    publishTime: '1个月前'
  }
])

const filteredProducts = computed(() => {
  if (filterStatus.value === 'all') return products.value
  if (filterStatus.value === 'onSale') return products.value.filter(p => p.status === '在售')
  if (filterStatus.value === 'offSale') return products.value.filter(p => p.status === '已下架')
  return products.value
})

const totalProducts = computed(() => products.value.length)
const onSaleCount = computed(() => products.value.filter(p => p.status === '在售').length)
const offSaleCount = computed(() => products.value.filter(p => p.status === '已下架').length)
const totalViews = computed(() => products.value.reduce((sum, p) => sum + p.viewCount, 0))

// 跳转到卖家商品详情页
const goToSellerProductDetail = (id: number) => {
  router.push({ path: '/seller/product', query: { id: id.toString() } })
}

const editProduct = (id: number) => {
  router.push({ path: '/edit', query: { id: id.toString() } })
}

const toggleStatus = (product: Product) => {
  const newStatus = product.status === '在售' ? '已下架' : '在售'
  if (confirm(`确定要${newStatus === '在售' ? '上架' : '下架'}该商品吗？`)) {
    product.status = newStatus
  }
}

const deleteProduct = (product: Product) => {
  if (confirm(`确定要删除商品「${product.title}」吗？删除后不可恢复！`)) {
    products.value = products.value.filter(p => p.id !== product.id)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 统计卡片 */
.statsBar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  transition: background 200ms;
}

.publishBtn:hover {
  background: #ea580c;
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

.btnPrimary {
  padding: 10px 24px;
  background: #f97316;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btnPrimary:hover {
  background: #ea580c;
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
  
  .productGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
