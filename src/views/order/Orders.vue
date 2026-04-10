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
            <span>闲鱼</span>
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
          <template v-if="userStore.isLoggedIn">
            <a href="#"><i class="fa fa-user"></i> 我的</a>
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="mainLayout">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <div class="menuSection">
          <div class="menuTitle">
            <i class="fa fa-user-circle"></i> 我的闲鱼
          </div>
        </div>
        
        <div class="menuSection">
          <div class="menuTitle">
            <i class="fa fa-shopping-bag"></i> 我的交易
            <i class="fa fa-chevron-down arrow"></i>
          </div>
          <div class="subMenu">
            <a href="#" class="subItem">我发布的</a>
            <a href="#" class="subItem">我卖出的</a>
            <a href="#" class="subItem active">我买到的</a>
          </div>
        </div>

        <div class="menuSection">
          <div class="menuTitle">
            <i class="fa fa-star"></i> 我的收藏
          </div>
        </div>

        <div class="menuSection">
          <div class="menuTitle">
            <i class="fa fa-cog"></i> 账户设置
            <i class="fa fa-chevron-down arrow"></i>
          </div>
          <div class="subMenu">
            <a href="#" class="subItem">个人资料</a>
            <a href="#" class="subItem">账号与安全</a>
          </div>
        </div>
      </aside>

      <!-- 右侧内容 -->
      <main class="content">
        <!-- 订单标签页 -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
            <span class="count" v-if="getCount(tab.id) > 0">{{ getCount(tab.id) }}</span>
          </button>
        </div>

        <!-- 订单列表 -->
        <div class="orderList">
          <!-- 待付款 -->
          <template v-if="activeTab === 'pending'">
            <div v-if="pendingOrders.length === 0" class="empty">
              <i class="fa fa-clock-o"></i>
              <p>暂无待付款订单</p>
              <button class="btnPrimary" @click="router.push('/')">去逛逛</button>
            </div>
            <div v-else v-for="order in pendingOrders" :key="order.id" class="orderCard">
              <OrderCard :order="order" @action="handleOrderAction" @click-product="goToProductDetail" />
            </div>
          </template>

          <!-- 待发货 -->
          <template v-if="activeTab === 'paid'">
            <div v-if="paidOrders.length === 0" class="empty">
              <i class="fa fa-box"></i>
              <p>暂无待发货订单</p>
            </div>
            <div v-else v-for="order in paidOrders" :key="order.id" class="orderCard">
              <OrderCard :order="order" @action="handleOrderAction" @click-product="goToProductDetail" />
            </div>
          </template>

          <!-- 待收货 -->
          <template v-if="activeTab === 'shipped'">
            <div v-if="shippedOrders.length === 0" class="empty">
              <i class="fa fa-truck"></i>
              <p>暂无待收货订单</p>
            </div>
            <div v-else v-for="order in shippedOrders" :key="order.id" class="orderCard">
              <OrderCard :order="order" @action="handleOrderAction" @click-product="goToProductDetail" />
            </div>
          </template>

          <!-- 退款中 -->
          <template v-if="activeTab === 'refunding'">
            <div v-if="refundingOrders.length === 0" class="empty">
              <i class="fa fa-refresh"></i>
              <p>暂无退款中的订单</p>
            </div>
            <div v-else v-for="order in refundingOrders" :key="order.id" class="orderCard">
              <OrderCard :order="order" @action="handleOrderAction" @click-product="goToProductDetail" />
            </div>
          </template>

          <!-- 待评价 -->
          <template v-if="activeTab === 'completed'">
            <div v-if="completedOrders.length === 0" class="empty">
              <i class="fa fa-star-o"></i>
              <p>暂无待评价订单</p>
            </div>
            <div v-else v-for="order in completedOrders" :key="order.id" class="orderCard">
              <OrderCard :order="order" @action="handleOrderAction" @click-product="goToProductDetail" />
            </div>
          </template>
        </div>
      </main>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floatTools">
      <button class="floatBtn" @click="router.push('/publish')">
        <i class="fa fa-plus"></i>
        <span class="floatTip">发闲置</span>
      </button>
      <button class="floatBtn">
        <i class="fa fa-commenting"></i>
        <span class="floatTip">反馈</span>
      </button>
      <button class="floatBtn">
        <i class="fa fa-headphones"></i>
        <span class="floatTip">客服</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import OrderCard from './OrderCard.vue'

defineOptions({ name: 'OrdersPage' })

const router = useRouter()
const userStore = useUserStore()
const searchInput = ref('')
const activeTab = ref('pending')

interface Order {
  id: number
  status: string
  statusText: string
  statusColor: string
  productImage: string
  productTitle: string
  productPrice: number
  productCount: number
  totalPrice: number
  createTime: string
  actions: string[]
}

const tabs = [
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '待发货' },
  { id: 'shipped', name: '待收货' },
  { id: 'refunding', name: '退款中' },
  { id: 'completed', name: '待评价' }
]

const orders = ref<Order[]>([
  {
    id: 1001,
    status: 'pending',
    statusText: '待付款',
    statusColor: '#f97316',
    productImage: 'https://picsum.photos/id/1/200/200',
    productTitle: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    productPrice: 6999,
    productCount: 1,
    totalPrice: 6999,
    createTime: '2024-03-15 14:30',
    actions: ['cancel', 'pay']
  },
  {
    id: 1002,
    status: 'shipped',
    statusText: '待收货',
    statusColor: '#3b82f6',
    productImage: 'https://picsum.photos/id/26/200/200',
    productTitle: 'AirPods Pro 2代 全新未拆封 国行正品',
    productPrice: 1599,
    productCount: 1,
    totalPrice: 1599,
    createTime: '2024-03-14 10:20',
    actions: ['receive', 'checkLogistics']
  },
  {
    id: 1003,
    status: 'completed',
    statusText: '待评价',
    statusColor: '#22c55e',
    productImage: 'https://picsum.photos/id/42/200/200',
    productTitle: 'Nintendo Switch OLED 日版 配原装底座',
    productPrice: 1899,
    productCount: 1,
    totalPrice: 1899,
    createTime: '2024-03-10 16:45',
    actions: ['review']
  },
  {
    id: 1004,
    status: 'paid',
    statusText: '待发货',
    statusColor: '#8b5cf6',
    productImage: 'https://picsum.photos/id/60/200/200',
    productTitle: 'MacBook Air M1 8+256 深空灰 99新',
    productPrice: 4999,
    productCount: 1,
    totalPrice: 4999,
    createTime: '2024-03-13 09:15',
    actions: ['remind']
  }
])

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const paidOrders = computed(() => orders.value.filter(o => o.status === 'paid'))
const shippedOrders = computed(() => orders.value.filter(o => o.status === 'shipped'))
const refundingOrders = computed(() => orders.value.filter(o => o.status === 'refunding'))
const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'))

const getCount = (tabId: string) => {
  switch (tabId) {
    case 'pending': return pendingOrders.value.length
    case 'paid': return paidOrders.value.length
    case 'shipped': return shippedOrders.value.length
    case 'refunding': return refundingOrders.value.length
    case 'completed': return completedOrders.value.length
    default: return 0
  }
}

const performSearch = () => {
  if (searchInput.value.trim()) {
    router.push({ path: '/search', query: { q: searchInput.value.trim() } })
  }
}

const handleLogin = () => {
  userStore.login({ id: 1, username: '用户' })
  alert('登录成功！')
}

const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

const handleOrderAction = (action: string, order: Order) => {
  switch (action) {
    case 'pay':
      alert(`正在跳转到支付页面，订单号: ${order.id}`)
      break
    case 'cancel':
      if (confirm('确定要取消该订单吗？')) {
        orders.value = orders.value.filter(o => o.id !== order.id)
      }
      break
    case 'receive':
      alert(`确认收货成功！订单号: ${order.id}`)
      order.status = 'completed'
      order.statusText = '待评价'
      order.statusColor = '#22c55e'
      order.actions = ['review']
      break
    case 'review':
      alert(`正在跳转到评价页面，订单号: ${order.id}`)
      break
    case 'remind':
      alert('已提醒卖家尽快发货')
      break
    case 'checkLogistics':
      alert(`物流信息：快递公司：顺丰速运\n运单号：SF1234567890\n预计送达：2024-03-17`)
      break
  }
}

const goToProductDetail = (order: Order) => {
  const productId = order.id - 1000
  router.push({ path: '/detail', query: { id: productId.toString() } })
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
  padding: 12px 16px;
  padding-left: 60px;
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

/* 主体布局 */
.mainLayout {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-left: 60px;
}

/* 左侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 12px 0;
}

.menuSection {
  padding: 0 12px;
  margin-bottom: 4px;
}

.menuTitle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: background 150ms;
}

.menuTitle:hover {
  background: #f3f4f6;
}

.menuTitle .arrow {
  margin-left: auto;
  font-size: 10px;
  color: #9ca3af;
}

.subMenu {
  padding-left: 28px;
}

.subItem {
  display: block;
  padding: 6px 10px;
  font-size: 12px;
  color: #6b7280;
  text-decoration: none;
  border-radius: 4px;
  transition: all 150ms;
}

.subItem:hover {
  color: #f97316;
  background: #fef7f0;
}

.subItem.active {
  color: #f97316;
  background: #fef7f0;
  font-weight: 500;
}

/* 右侧内容 */
.content {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  margin-right: 80px;
}

/* 标签页 */
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 12px;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  padding: 14px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 200ms;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #f97316;
  border-bottom-color: #f97316;
}

.tab .count {
  background: #fef2f2;
  color: #f97316;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
}

/* 订单列表 */
.orderList {
  padding: 12px 16px;
}

.orderCard {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 订单卡片 */
:deep(.order-item) {
  padding: 10px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.order-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

:deep(.order-id) {
  font-size: 12px;
  color: #9ca3af;
}

:deep(.order-status) {
  font-size: 13px;
  font-weight: 500;
}

:deep(.order-product) {
  display: flex;
  gap: 10px;
}

:deep(.product-img) {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

:deep(.product-info) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

:deep(.product-title) {
  font-size: 13px;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

:deep(.product-meta) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

:deep(.product-price) {
  font-size: 14px;
  color: #f97316;
  font-weight: bold;
}

:deep(.product-count) {
  font-size: 12px;
  color: #9ca3af;
}

:deep(.order-footer) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fafafa;
}

:deep(.total-price) {
  font-size: 13px;
  color: #374151;
}

:deep(.total-price strong) {
  color: #f97316;
  font-size: 15px;
}

:deep(.order-actions) {
  display: flex;
  gap: 8px;
}

:deep(.action-btn) {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms;
}

:deep(.action-btn.primary) {
  background: #f97316;
  color: #fff;
  border: none;
}

:deep(.action-btn.primary:hover) {
  background: #ea580c;
}

:deep(.action-btn.secondary) {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

:deep(.action-btn.secondary:hover) {
  border-color: #f97316;
  color: #f97316;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 30px 16px;
  background: #fff;
  border-radius: 8px;
}

.empty i {
  font-size: 36px;
  color: #d1d5db;
  margin-bottom: 10px;
}

.empty p {
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 20px;
}

.btnPrimary {
  padding: 10px 24px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.btnPrimary:hover {
  background: #ea580c;
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
  margin-right: 12px;
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
  .floatTools {
    display: none;
  }
  .mainLayout {
    flex-direction: column;
    padding: 16px;
  }
  .sidebar {
    width: 100%;
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
