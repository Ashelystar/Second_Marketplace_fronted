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
            <span>荔园交易</span>
          </a>
          <span class="sellerBadge">
            <i class="fa fa-store"></i> 卖家中心
          </span>
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
          <template v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="router.push('/orders')"><i class="fa fa-shopping-bag"></i> 订单</a>
            <a href="#" @click.prevent="router.push('/user/center')"><i class="fa fa-user"></i> 我的</a>
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 面包屑 -->
    <div class="breadcrumb">
      <a href="#" @click.prevent="router.push('/')">首页</a>
      <i class="fa fa-angle-right"></i>
      <span class="muted">卖家中心</span>
      <i class="fa fa-angle-right"></i>
      <span>商品管理</span>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载商品详情中...</p>
    </div>

    <!-- 商品详情 -->
    <main v-else-if="product" class="detail">
      <!-- 商品状态卡片 -->
      <div class="sellerCard card">
        <div class="sellerMain">
          <div class="productStatus">
            <span class="statusTag" :class="product.status === '在售' ? 'onSale' : 'offSale'">
              <i :class="product.status === '在售' ? 'fa fa-check-circle' : 'fa fa-pause-circle'"></i>
              {{ product.status }}
            </span>
            <span class="productTitle">{{ product.title }}</span>
          </div>
          <div class="quickStats">
            <span><i class="fa fa-eye"></i> {{ product.viewCount }} 浏览</span>
            <span><i class="fa fa-heart"></i> {{ product.favoriteCount }} 收藏</span>
            <span><i class="fa fa-comment"></i> {{ product.consultCount }} 咨询</span>
          </div>
        </div>
      </div>

      <!-- 图片和商品信息：三列布局 -->
      <div class="detailGrid">
        <!-- 左侧：缩略图 -->
        <div class="thumbnails">
          <button
            v-for="(img, i) in images"
            :key="img.id"
            class="thumb"
            :class="{ active: i === currentIndex }"
            @click="currentIndex = i"
          >
            <img :src="img.url" :alt="img.alt" />
          </button>
        </div>

        <!-- 中间：主图 -->
        <div class="mainImage">
          <img :src="currentImage.url" :alt="currentImage.alt" />
          <button class="navBtn prev" @click="prevImage" :disabled="currentIndex === 0">
            <i class="fa fa-chevron-left"></i>
          </button>
          <button class="navBtn next" @click="nextImage" :disabled="currentIndex === images.length - 1">
            <i class="fa fa-chevron-right"></i>
          </button>
          <div class="imageCounter">{{ currentIndex + 1 }}/{{ images.length }}</div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="info">
          <!-- 价格 -->
          <div class="priceSection">
            <div class="priceRow">
              <span class="price">¥{{ product.price }}</span>
              <span class="originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="priceTags">
              <span v-if="product.canBargain" class="tag tagRed">可议价</span>
              <span v-if="product.freight === 0" class="tag tagGreen">包邮</span>
              <span class="muted">快递: ¥{{ product.freight || 0 }}</span>
            </div>
          </div>

          <!-- 标题 -->
          <h1 class="title">{{ product.title }}</h1>

          <!-- 数据统计 -->
          <div class="stats">
            <span><i class="fa fa-eye"></i> {{ product.viewCount }}人想要</span>
            <span><i class="fa fa-heart"></i> {{ product.favoriteCount }}人收藏</span>
            <span><i class="fa fa-clock-o"></i> {{ getPublishTime(product.id) }}</span>
          </div>

          <!-- 成色 -->
          <div class="conditionRow">
            <span class="label">成色</span>
            <span class="conditionTag">{{ product.condition }}</span>
            <span v-if="product.isNew" class="conditionTag new">全新</span>
          </div>

          <!-- 安全保障 -->
          <div class="securityBox">
            <span><i class="fa fa-shield"></i> 交易安全</span>
            <span><i class="fa fa-check-circle"></i> 正品保障</span>
            <span><i class="fa fa-undo"></i> 7天无理由</span>
          </div>

          <!-- 商品描述 -->
          <div class="descSection">
            <h3>商品描述</h3>
            <p class="desc">{{ product.description }}</p>
          </div>

          <!-- 标签 -->
          <div v-if="product.tags?.length" class="tagsSection">
            <span class="label">标签</span>
            <div class="tags">
              <span v-for="tag in product.tags" :key="tag" class="tagItem">{{ tag }}</span>
            </div>
          </div>

          <!-- 卖家操作按钮 -->
          <div class="actions">
            <div class="actionRow">
              <button class="actionBtn" @click="shareProduct">
                <i class="fa fa-share-alt"></i> 分享
              </button>
              <button class="actionBtn" @click="refreshStats">
                <i class="fa fa-refresh"></i> 刷新
              </button>
            </div>
            <div class="actionRow">
              <button class="actionBtn secondary" @click="toggleStatus">
                <i :class="product.status === '在售' ? 'fa fa-pause' : 'fa fa-play'"></i>
                {{ product.status === '在售' ? '下架商品' : '重新上架' }}
              </button>
              <button class="actionBtn primary" @click="editProduct">
                <i class="fa fa-edit"></i> 编辑商品
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 咨询与意向管理 -->
      <section class="manageSection">
        <div class="manageTabs">
          <button 
            class="tabBtn" 
            :class="{ active: activeTab === 'consult' }"
            @click="activeTab = 'consult'"
          >
            <i class="fa fa-comment"></i> 买家咨询 ({{ product.consults?.length || 0 }})
          </button>
          <button 
            class="tabBtn" 
            :class="{ active: activeTab === 'intention' }"
            @click="activeTab = 'intention'"
          >
            <i class="fa fa-hand-paper"></i> 意向购买 ({{ product.intentions?.length || 0 }})
          </button>
        </div>

        <!-- 咨询列表 -->
        <div v-if="activeTab === 'consult'" class="consultList">
          <div v-if="!product.consults?.length" class="emptyState">
            <i class="fa fa-comment-dots"></i>
            <p>暂无买家咨询</p>
          </div>
          <div v-else v-for="consult in product.consults" :key="consult.id" class="consultItem card">
            <div class="consultHeader">
              <img :src="consult.buyerAvatar" class="buyerAvatar" />
              <div class="buyerInfo">
                <span class="buyerName">{{ consult.buyerName }}</span>
                <span class="consultTime">{{ consult.time }}</span>
              </div>
              <button class="replyBtn" @click="replyConsult(consult)">
                <i class="fa fa-reply"></i> 回复
              </button>
            </div>
            <div class="consultContent">{{ consult.content }}</div>
            <div v-if="consult.reply" class="consultReply">
              <i class="fa fa-angle-double-right"></i> 您的回复：{{ consult.reply }}
            </div>
          </div>
        </div>

        <!-- 意向列表 -->
        <div v-if="activeTab === 'intention'" class="intentionList">
          <div v-if="!product.intentions?.length" class="emptyState">
            <i class="fa fa-hand-paper"></i>
            <p>暂无意向买家</p>
          </div>
          <div v-else v-for="item in product.intentions" :key="item.id" class="intentionItem card">
            <div class="intentionHeader">
              <img :src="item.buyerAvatar" class="buyerAvatar" />
              <div class="buyerInfo">
                <span class="buyerName">{{ item.buyerName }}</span>
                <span class="intentionPrice">出价 ¥{{ item.price }}</span>
              </div>
              <div class="intentionActions">
                <button class="contactBtn" @click="contactBuyer(item)">
                  <i class="fa fa-comment"></i> 联系
                </button>
                <button class="rejectBtn" @click="rejectIntention(item)">
                  <i class="fa fa-times"></i> 婉拒
                </button>
              </div>
            </div>
            <div class="intentionNote" v-if="item.note">
              备注：{{ item.note }}
            </div>
          </div>
        </div>
      </section>

      <!-- 底部操作栏 -->
      <div class="bottomBar">
        <button class="deleteBtn" @click="deleteProduct">
          <i class="fa fa-trash-alt"></i> 删除商品
        </button>
        <div class="bottomRight">
          <button class="shareBtn" @click="shareProduct">
            <i class="fa fa-share"></i> 分享
          </button>
          <button class="editBtn" @click="editProduct">
            <i class="fa fa-edit"></i> 编辑信息
          </button>
          <button class="toggleBtn" :class="product.status === '在售' ? 'off' : 'on'" @click="toggleStatus">
            <i :class="product.status === '在售' ? 'fa fa-pause' : 'fa fa-play'"></i>
            {{ product.status === '在售' ? '下架' : '上架' }}
          </button>
        </div>
      </div>
    </main>

    <!-- 商品不存在 -->
    <div v-else class="notFound">
      <div class="notFoundIcon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <h3>商品不存在或已删除</h3>
      <p>该商品可能已被删除</p>
      <RouterLink class="btn btn-primary" to="/">返回首页</RouterLink>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floatTools">
      <button v-for="t in floatingTools" :key="t.id" class="floatBtn" @click="handleTool(t)">
        <i :class="t.icon"></i>
        <span class="floatTip">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

defineOptions({ name: 'SellerProductDetail' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const searchInput = ref('')
const activeTab = ref('consult')

interface ProductImage {
  id: number
  url: string
  alt: string
}

interface Consult {
  id: number
  buyerName: string
  buyerAvatar: string
  time: string
  content: string
  reply?: string
}

interface Intention {
  id: number
  buyerName: string
  buyerAvatar: string
  price: number
  note?: string
}

interface ProductData {
  id: number
  title: string
  category: string
  price: number
  originalPrice: number
  image: string
  images?: ProductImage[]
  description: string
  condition: string
  isNew: boolean
  canBargain: boolean
  freight: number
  status: '在售' | '已下架'
  viewCount: number
  favoriteCount: number
  consultCount: number
  soldCount: number
  tags: string[]
  consults?: Consult[]
  intentions?: Intention[]
}

const product = ref<ProductData | null>(null)
const currentIndex = ref(0)
const images = ref<ProductImage[]>([])
const isLoading = ref(true)

const currentImage = computed(() => images.value[currentIndex.value] ?? { url: '', alt: '' })

const getPublishTime = (id: number) => {
  if (id >= 21 && id <= 24) return '今天发布'
  if (id >= 18 && id <= 20) return '3天内发布'
  if (id >= 12 && id <= 17) return '1周内发布'
  return '1周前发布'
}

const loadDetails = () => {
  const id = parseInt(route.query.id as string) || 1

  product.value = {
    id,
    title: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    category: '手机数码',
    price: 6999,
    originalPrice: 8999,
    image: 'https://picsum.photos/id/1/800/800',
    description: '2024年3月购买，使用不到一年，功能完好，配件齐全。因为换了新手机，所以出售。屏幕无划痕，电池健康度95%以上。',
    condition: '95新',
    isNew: false,
    canBargain: true,
    freight: 0,
    status: '在售',
    viewCount: 128,
    favoriteCount: 23,
    consultCount: 5,
    soldCount: 0,
    tags: ['手机', '苹果', '数码'],
    consults: [
      {
        id: 1,
        buyerName: '买家小李',
        buyerAvatar: 'https://picsum.photos/id/100/50/50',
        time: '10分钟前',
        content: '您好，请问可以便宜点吗？',
        reply: '您好，价格已经是最低了，诚心要的话可以包邮。'
      },
      {
        id: 2,
        buyerName: '买家小王',
        buyerAvatar: 'https://picsum.photos/id/101/50/50',
        time: '30分钟前',
        content: '电池健康度具体是多少？'
      },
      {
        id: 3,
        buyerName: '买家小张',
        buyerAvatar: 'https://picsum.photos/id/102/50/50',
        time: '1小时前',
        content: '请问支持当面交易吗？'
      }
    ],
    intentions: [
      {
        id: 1,
        buyerName: '买家小明',
        buyerAvatar: 'https://picsum.photos/id/200/50/50',
        price: 6500,
        note: '诚心购买，可以今天交易'
      },
      {
        id: 2,
        buyerName: '买家小红',
        buyerAvatar: 'https://picsum.photos/id/201/50/50',
        price: 6200,
        note: '学生党，预算有限'
      }
    ]
  }

  images.value = [
    { id: 1, url: 'https://picsum.photos/id/1/800/800', alt: '商品主图' },
    { id: 2, url: 'https://picsum.photos/id/10/800/800', alt: '细节图1' },
    { id: 3, url: 'https://picsum.photos/id/20/800/800', alt: '细节图2' },
    { id: 4, url: 'https://picsum.photos/id/30/800/800', alt: '细节图3' }
  ]

  isLoading.value = false
}

const prevImage = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextImage = () => { if (currentIndex.value < images.value.length - 1) currentIndex.value++ }

const performSearch = () => {
  if (searchInput.value.trim()) router.push({ path: '/search', query: { q: searchInput.value.trim() } })
}

const handleLogin = () => {
  router.push('/user/login')
}

const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

const toggleStatus = () => {
  if (!product.value) return
  if (confirm(product.value.status === '在售' ? '确定要下架该商品吗？' : '确定要重新上架该商品吗？')) {
    product.value.status = product.value.status === '在售' ? '已下架' : '在售'
    alert(product.value.status === '在售' ? '商品已上架' : '商品已下架')
  }
}

const editProduct = () => {
  if (!product.value) return
  router.push({ path: '/edit', query: { id: product.value.id.toString() } })
}

const deleteProduct = () => {
  if (!product.value) return
  if (confirm('确定要删除该商品吗？删除后不可恢复！')) {
    alert('商品已删除')
    router.push('/')
  }
}

const shareProduct = () => {
  alert('复制商品链接成功！')
}

const refreshStats = () => {
  alert('数据已刷新')
}

const replyConsult = (consult: Consult) => {
  const reply = prompt('请输入回复内容：')
  if (reply) {
    consult.reply = reply
    alert('回复成功')
  }
}

const contactBuyer = (item: Intention) => {
  alert(`正在与 ${item.buyerName} 联系...`)
}

const rejectIntention = (item: Intention) => {
  if (confirm(`确定要婉拒 ${item.buyerName} 的购买意向吗？`)) {
    if (product.value?.intentions) {
      product.value.intentions = product.value.intentions.filter(i => i.id !== item.id)
    }
    alert('已婉拒')
  }
}

const floatingTools = [
  { id: 1, icon: 'fa fa-plus', label: '发布商品' },
  { id: 2, icon: 'fa fa-list', label: '商品列表' },
  { id: 3, icon: 'fa fa-chart-bar', label: '数据统计' },
  { id: 4, icon: 'fa fa-headphones', label: '客服' }
]

const handleTool = (t: { id: number }) => {
  const actions: Record<number, string> = {
    1: '正在跳转到发布页面...',
    2: '正在跳转到商品列表...',
    3: '正在跳转到数据统计...',
    4: '正在为您连接客服...'
  }
  alert(actions[t.id])
}

onMounted(() => {
  loadDetails()
})
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
  gap: 8px;
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

.sellerBadge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.searchBox {
  flex: 1;
  max-width: 480px;
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
  transition: color 150ms;
}

.navLinks a:hover {
  color: #f97316;
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 80px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb .muted {
  color: #9ca3af;
}

.breadcrumb a {
  color: #374151;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #f97316;
}

/* 加载 */
.loading, .error, .notFound {
  padding: 80px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top-color: #f97316;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error i, .notFoundIcon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.error p, .notFound p {
  color: #9ca3af;
  margin-bottom: 20px;
}

.notFoundIcon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

/* 详情主体 */
.detail {
  padding: 0 80px 80px;
}

/* 卖家卡片 */
.sellerCard {
  padding: 14px;
  margin-bottom: 14px;
}

.sellerMain {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.productStatus {
  display: flex;
  align-items: center;
  gap: 12px;
}

.statusTag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.statusTag.onSale {
  background: #f0fdf4;
  color: #16a34a;
}

.statusTag.offSale {
  background: #fef2f2;
  color: #dc2626;
}

.productTitle {
  font-size: 14px;
  color: #374151;
}

.quickStats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.quickStats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 商品详情网格 - 三列布局 */
.detailGrid {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 60px 16px 32px;
  align-items: start;
  background: #fff;
  border-radius: 12px;
}

/* 左侧缩略图区域 */
.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 550px;
  padding: 2px 12px 2px 0;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.thumbnails::-webkit-scrollbar {
  width: 4px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.thumb {
  width: 96px;
  height: 96px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  background: none;
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
  margin: 2px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 150ms;
}

.thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #f97316;
}

.thumb:hover img {
  transform: scale(1);
}

.thumb.active {
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

/* 中间主图区域 */
.mainImage {
  position: relative;
  aspect-ratio: 1;
  background: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  max-height: 550px;
}

.mainImage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.navBtn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  color: #374151;
  transition: opacity 150ms;
}

.navBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.navBtn.prev { left: 12px; }
.navBtn.next { right: 12px; }

.imageCounter {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  border-radius: 999px;
}

/* 商品信息 */
.info {
  padding: 8px 0;
}

.priceSection {
  margin-bottom: 16px;
}

.priceRow {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price {
  font-size: 32px;
  font-weight: bold;
  color: #f97316;
}

.originalPrice {
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
}

.priceTags {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tagRed {
  background: #fef2f2;
  color: #dc2626;
}

.tagGreen {
  background: #f0fdf4;
  color: #16a34a;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px;
  color: #374151;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #9ca3af;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.conditionRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.label {
  font-size: 14px;
  color: #9ca3af;
}

.conditionTag {
  padding: 4px 10px;
  background: #f97316;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.conditionTag.new {
  background: #22c55e;
}

.securityBox {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #16a34a;
}

.securityBox span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.descSection {
  margin-bottom: 16px;
}

.descSection h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.desc {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-line;
  margin: 0;
}

.tagsSection {
  margin-bottom: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tagItem {
  padding: 4px 10px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  border-radius: 4px;
}

/* 操作按钮 */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actionRow {
  display: flex;
  gap: 10px;
}

.actionBtn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: all 150ms;
  color: #6b7280;
}

.actionBtn i {
  color: #6b7280;
}

.actionBtn:hover {
  background: #e5e7eb;
}

.actionBtn.secondary {
  background: #f5f5f5;
  color: #dc2626;
}

.actionBtn.secondary i {
  color: #dc2626;
}

.actionBtn.primary {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
  font-weight: 500;
}

.actionBtn.primary i {
  color: #fff;
}

.actionBtn.primary:hover {
  background: #ea580c;
}

/* 咨询与意向管理 */
.manageSection {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 80px;
}

.manageTabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tabBtn {
  flex: 1;
  padding: 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 150ms;
}

.tabBtn:hover {
  color: #f97316;
}

.tabBtn.active {
  color: #f97316;
  border-bottom-color: #f97316;
}

.consultList,
.intentionList {
  padding: 16px;
}

.emptyState {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.emptyState i {
  font-size: 48px;
  margin-bottom: 12px;
}

.consultItem,
.intentionItem {
  padding: 14px;
  margin-bottom: 12px;
}

.consultHeader,
.intentionHeader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buyerAvatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.buyerInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.buyerName {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.consultTime {
  font-size: 12px;
  color: #9ca3af;
}

.intentionPrice {
  font-size: 13px;
  color: #f97316;
}

.replyBtn,
.contactBtn {
  padding: 6px 12px;
  background: #f97316;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.replyBtn:hover,
.contactBtn:hover {
  background: #ea580c;
}

.rejectBtn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #dc2626;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rejectBtn:hover {
  background: #fef2f2;
}

.intentionActions {
  display: flex;
  gap: 8px;
}

.consultContent {
  margin-top: 10px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
}

.consultReply {
  margin-top: 8px;
  padding: 8px 10px;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 6px;
}

.intentionNote {
  margin-top: 10px;
  padding: 8px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
}

/* 底部操作栏 */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 80px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  z-index: 50;
}

.deleteBtn {
  padding: 10px 16px;
  background: none;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.deleteBtn:hover {
  background: #fef2f2;
}

.bottomRight {
  display: flex;
  gap: 10px;
}

.shareBtn {
  padding: 10px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.shareBtn:hover {
  background: #e5e7eb;
}

.editBtn {
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #f97316;
  border-radius: 8px;
  color: #f97316;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.editBtn:hover {
  background: #fff7ed;
}

.toggleBtn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggleBtn.off {
  background: #fef2f2;
  color: #dc2626;
}

.toggleBtn.off:hover {
  background: #fee2e2;
}

.toggleBtn.on {
  background: #f0fdf4;
  color: #16a34a;
}

.toggleBtn.on:hover {
  background: #dcfce7;
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
  background: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #374151;
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
  .detailGrid {
    grid-template-columns: 1fr;
  }
  .floatTools {
    display: none;
  }
}

@media (max-width: 600px) {
  .topInner {
    flex-wrap: wrap;
  }
  .searchBox {
    order: 3;
    flex: 1 1 100%;
    max-width: 100%;
    margin-top: 8px;
  }
}
</style>
