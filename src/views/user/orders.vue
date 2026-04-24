<template>
  <div>
    <!-- 交易统计 -->
    <div class="statsBar">
      <div class="statCard">
        <div class="statValue">¥{{ orderStats.totalSpent }}</div>
        <div class="statLabel">累计消费</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ orderStats.totalOrders }}</div>
        <div class="statLabel">交易笔数</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ orderStats.averageRating }}/5</div>
        <div class="statLabel">平均评分</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filterBar">
      <div class="filterTabs">
        <button
          v-for="tab in orderTabs"
          :key="tab.id"
          class="filterTab"
          :class="{ active: orderTab === tab.id }"
          @click="orderTab = tab.id"
        >
          {{ tab.name }}
          <span class="count" v-if="getCount(tab.id) > 0">{{ getCount(tab.id) }}</span>
        </button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="orderList">
      <!-- 全部 -->
      <template v-if="orderTab === 'all'">
        <div v-if="orders.length === 0" class="empty">
          <i class="fa fa-inbox"></i>
          <p>暂无订单</p>
          <button class="btnPrimary" @click="router.push('/')">去逛逛</button>
        </div>
        <div v-else v-for="order in orders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }} x {{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="viewOrderDetail(order)">查看详情</button>
                <button v-if="order.status === 'pending'" class="action-btn secondary" @click="cancelOrder(order)">取消订单</button>
                <button v-if="order.status === 'pending'" class="action-btn primary" @click="payOrder(order)">立即支付</button>
                <button v-if="order.status === 'paid'" class="action-btn secondary" @click="remindShip(order)">提醒发货</button>
                <button v-if="order.status === 'shipped'" class="action-btn secondary" @click="checkLogistics(order)">查看物流</button>
                <button v-if="order.status === 'shipped'" class="action-btn primary" @click="confirmReceipt(order)">确认收货</button>
                <button v-if="order.status === 'refunding'" class="action-btn secondary" @click="viewRefundDetail(order)">退款详情</button>
                <button v-if="order.status === 'completed'" class="action-btn primary" @click="reviewOrder(order)">去评价</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 待付款 -->
      <template v-if="orderTab === 'pending'">
        <div v-if="pendingOrders.length === 0" class="empty">
          <i class="fa fa-clock-o"></i>
          <p>暂无待付款订单</p>
          <button class="btnPrimary" @click="router.push('/')">去逛逛</button>
        </div>
        <div v-else v-for="order in pendingOrders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }}</span>
                  <span class="product-count">x{{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="cancelOrder(order)">取消订单</button>
                <button class="action-btn primary" @click="payOrder(order)">立即支付</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 待发货 -->
      <template v-if="orderTab === 'paid'">
        <div v-if="paidOrders.length === 0" class="empty">
          <i class="fa fa-box"></i>
          <p>暂无待发货订单</p>
        </div>
        <div v-else v-for="order in paidOrders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }}</span>
                  <span class="product-count">x{{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="remindShip(order)">提醒发货</button>
                <button class="action-btn secondary" @click="viewOrderDetail(order)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 待收货 -->
      <template v-if="orderTab === 'shipped'">
        <div v-if="shippedOrders.length === 0" class="empty">
          <i class="fa fa-truck"></i>
          <p>暂无待收货订单</p>
        </div>
        <div v-else v-for="order in shippedOrders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }}</span>
                  <span class="product-count">x{{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="checkLogistics(order)">查看物流</button>
                <button class="action-btn primary" @click="confirmReceipt(order)">确认收货</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 退款中 -->
      <template v-if="orderTab === 'refunding'">
        <div v-if="refundingOrders.length === 0" class="empty">
          <i class="fa fa-refresh"></i>
          <p>暂无退款中的订单</p>
        </div>
        <div v-else v-for="order in refundingOrders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }}</span>
                  <span class="product-count">x{{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="viewRefundDetail(order)">退款详情</button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 待评价 -->
      <template v-if="orderTab === 'completed'">
        <div v-if="completedOrders.length === 0" class="empty">
          <i class="fa fa-star-o"></i>
          <p>暂无待评价订单</p>
        </div>
        <div v-else v-for="order in completedOrders" :key="order.id" class="orderCard">
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">订单号: {{ order.orderNo }}</span>
              <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
            </div>
            <div class="order-product" @click="goToProductDetail(order)">
              <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
              <div class="product-info">
                <span class="product-title">{{ order.productTitle }}</span>
                <div class="product-meta">
                  <span class="product-price">¥{{ order.productPrice }}</span>
                  <span class="product-count">x{{ order.productCount }}</span>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="total-price">
                共 {{ order.productCount }} 件商品，合计: <strong>¥{{ order.totalPrice }}</strong>
              </div>
              <div class="order-actions">
                <button class="action-btn secondary" @click="viewOrderDetail(order)">查看详情</button>
                <button class="action-btn primary" @click="reviewOrder(order)">去评价</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'UserOrders' })

const router = useRouter()
const orderTab = ref('pending')

interface Order {
  id: number
  orderNo: string
  status: string
  statusText: string
  statusColor: string
  productImage: string
  productTitle: string
  productPrice: number
  productCount: number
  totalPrice: number
  createTime: string
}

const orderTabs = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '待发货' },
  { id: 'shipped', name: '待收货' },
  { id: 'refunding', name: '退款中' },
  { id: 'completed', name: '待评价' }
]

const orders = ref<Order[]>([
  {
    id: 1001,
    orderNo: 'ORD202404150001',
    status: 'pending',
    statusText: '待付款',
    statusColor: '#f97316',
    productImage: 'https://picsum.photos/id/1/200/200',
    productTitle: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    productPrice: 6999,
    productCount: 1,
    totalPrice: 6999,
    createTime: '2024-04-15 14:30'
  },
  {
    id: 1002,
    orderNo: 'ORD202404140002',
    status: 'shipped',
    statusText: '待收货',
    statusColor: '#3b82f6',
    productImage: 'https://picsum.photos/id/26/200/200',
    productTitle: 'AirPods Pro 2代 全新未拆封 国行正品',
    productPrice: 1599,
    productCount: 1,
    totalPrice: 1599,
    createTime: '2024-04-14 10:20'
  },
  {
    id: 1003,
    orderNo: 'ORD202404100003',
    status: 'completed',
    statusText: '待评价',
    statusColor: '#22c55e',
    productImage: 'https://picsum.photos/id/42/200/200',
    productTitle: 'Nintendo Switch OLED 日版 配原装底座',
    productPrice: 1899,
    productCount: 1,
    totalPrice: 1899,
    createTime: '2024-04-10 16:45'
  },
  {
    id: 1004,
    orderNo: 'ORD202404130004',
    status: 'paid',
    statusText: '待发货',
    statusColor: '#8b5cf6',
    productImage: 'https://picsum.photos/id/60/200/200',
    productTitle: 'MacBook Air M1 8+256 深空灰 99新',
    productPrice: 4999,
    productCount: 1,
    totalPrice: 4999,
    createTime: '2024-04-13 09:15'
  },
  {
    id: 1005,
    orderNo: 'ORD202404120005',
    status: 'refunding',
    statusText: '退款中',
    statusColor: '#ef4444',
    productImage: 'https://picsum.photos/id/96/200/200',
    productTitle: '小米手环7 NFC版 黑色 原装配件齐全',
    productPrice: 299,
    productCount: 1,
    totalPrice: 299,
    createTime: '2024-04-12 11:00'
  }
])

const orderStats = ref({
  totalSpent: 15699,
  totalOrders: 12,
  averageRating: 4.9
})

const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))
const paidOrders = computed(() => orders.value.filter(o => o.status === 'paid'))
const shippedOrders = computed(() => orders.value.filter(o => o.status === 'shipped'))
const refundingOrders = computed(() => orders.value.filter(o => o.status === 'refunding'))
const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'))

const getCount = (tabId: string) => {
  switch (tabId) {
    case 'all': return orders.value.length
    case 'pending': return pendingOrders.value.length
    case 'paid': return paidOrders.value.length
    case 'shipped': return shippedOrders.value.length
    case 'refunding': return refundingOrders.value.length
    case 'completed': return completedOrders.value.length
    default: return 0
  }
}

const goToProductDetail = (order: Order) => {
  const productId = order.id - 1000
  router.push({ path: '/detail', query: { id: productId.toString() } })
}

const payOrder = (order: Order) => {
  // 将订单信息存储到本地，用于付款页面展示
  const orderInfo = {
    orderId: order.orderNo,
    productNames: order.productTitle,
    address: '-',
    remark: '',
    totalAmount: order.totalPrice.toString()
  }
  localStorage.setItem('pendingPaymentOrder', JSON.stringify(orderInfo))
  router.push('/payment')
}

const cancelOrder = (order: Order) => {
  if (confirm('确定要取消该订单吗？')) {
    orders.value = orders.value.filter(o => o.id !== order.id)
  }
}

const remindShip = (order: Order) => {
  alert(`已提醒卖家尽快发货\n订单号: ${order.orderNo}`)
}

const checkLogistics = (order: Order) => {
  alert(`物流信息：快递公司：顺丰速运\n运单号：SF${order.orderNo.slice(-10)}\n预计送达：2024-04-18`)
}

const confirmReceipt = (order: Order) => {
  if (confirm('确认收到商品？')) {
    order.status = 'completed'
    order.statusText = '待评价'
    order.statusColor = '#22c55e'
  }
}

const reviewOrder = (order: Order) => {
  alert(`正在跳转到评价页面，订单号: ${order.orderNo}`)
}

const viewOrderDetail = (order: Order) => {
  alert(`订单详情：\n订单号: ${order.orderNo}\n商品: ${order.productTitle}\n金额: ¥${order.totalPrice}`)
}

const viewRefundDetail = (order: Order) => {
  alert(`退款详情：\n订单号: ${order.orderNo}\n退款金额: ¥${order.totalPrice}\n状态: 退款中`)
}
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
  display: flex;
  align-items: center;
  gap: 6px;
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

.filterTab .count {
  background: rgba(255, 255, 255, 0.2);
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
  border: 1px solid #e5e7eb;
}

.order-item {
  padding: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.order-id {
  font-size: 12px;
  color: #9ca3af;
}

.order-status {
  font-size: 13px;
  font-weight: 500;
}

.order-product {
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.product-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  font-size: 14px;
  color: #1f2937;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.product-price {
  font-size: 15px;
  color: #f97316;
  font-weight: bold;
}

.product-count {
  font-size: 12px;
  color: #9ca3af;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  margin: 10px -12px -12px;
  border-top: 1px solid #f3f4f6;
}

.total-price {
  font-size: 13px;
  color: #374151;
}

.total-price strong {
  color: #f97316;
  font-size: 16px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.action-btn.primary {
  background: #f97316;
  color: #fff;
  border: none;
}

.action-btn.primary:hover {
  background: #ea580c;
}

.action-btn.secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  border-color: #f97316;
  color: #f97316;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 40px 16px;
}

.empty i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
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

/* 订单列表 */
.orderList {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 响应式 */
@media (max-width: 768px) {
  .statsBar {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .order-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
