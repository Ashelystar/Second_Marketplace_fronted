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
      <div v-if="loading" class="loading">
        <i class="fa fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>

      <!-- 全部 -->
      <template v-else-if="orderTab === 'all'">
        <div v-if="orders.length === 0" class="empty">
          <i class="fa fa-inbox"></i>
          <p>暂无订单</p>
          <button class="btnPrimary" @click="router.push('/')">去逛逛</button>
        </div>
        <div v-else v-for="order in orders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-detail="viewOrderDetail"
            @cancel="cancelOrder"
            @pay="payOrder"
            @remind-ship="remindShip"
            @check-logistics="checkLogistics"
            @confirm-receipt="confirmReceipt"
            @review="reviewOrder"
            @view-refund="viewRefundDetail"
          />
        </div>
      </template>

      <!-- 待付款 -->
      <template v-else-if="orderTab === 'pending'">
        <div v-if="pendingOrders.length === 0" class="empty">
          <i class="fa fa-clock-o"></i>
          <p>暂无待付款订单</p>
          <button class="btnPrimary" @click="router.push('/')">去逛逛</button>
        </div>
        <div v-else v-for="order in pendingOrders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-detail="viewOrderDetail"
            @cancel="cancelOrder"
            @pay="payOrder"
          />
        </div>
      </template>

      <!-- 待发货 -->
      <template v-else-if="orderTab === 'paid'">
        <div v-if="paidOrders.length === 0" class="empty">
          <i class="fa fa-box"></i>
          <p>暂无待发货订单</p>
        </div>
        <div v-else v-for="order in paidOrders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-detail="viewOrderDetail"
            @remind-ship="remindShip"
          />
        </div>
      </template>

      <!-- 待收货 -->
      <template v-else-if="orderTab === 'shipped'">
        <div v-if="shippedOrders.length === 0" class="empty">
          <i class="fa fa-truck"></i>
          <p>暂无待收货订单</p>
        </div>
        <div v-else v-for="order in shippedOrders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-detail="viewOrderDetail"
            @check-logistics="checkLogistics"
            @confirm-receipt="confirmReceipt"
          />
        </div>
      </template>

      <!-- 退款中 -->
      <template v-else-if="orderTab === 'refunding'">
        <div v-if="refundingOrders.length === 0" class="empty">
          <i class="fa fa-refresh"></i>
          <p>暂无退款中的订单</p>
        </div>
        <div v-else v-for="order in refundingOrders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-refund="viewRefundDetail"
          />
        </div>
      </template>

      <!-- 待评价 -->
      <template v-else-if="orderTab === 'completed'">
        <div v-if="completedOrders.length === 0" class="empty">
          <i class="fa fa-star-o"></i>
          <p>暂无待评价订单</p>
        </div>
        <div v-else v-for="order in completedOrders" :key="order.id" class="orderCard">
          <OrderCardItem
            :order="order"
            @view-detail="viewOrderDetail"
            @review="reviewOrder"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import type { TradeOrder } from '@/types'
import OrderCardItem from '@/components/OrderCardItem.vue'

defineOptions({ name: 'UserOrders' })

const router = useRouter()
const orderStore = useOrderStore()
const orderTab = ref('all')

const orderTabs = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '待发货' },
  { id: 'shipped', name: '待收货' },
  { id: 'refunding', name: '退款中' },
  { id: 'completed', name: '待评价' }
]

// 从 store 获取订单数据
const orders = computed(() => orderStore.orders)
const pendingOrders = computed(() => orderStore.pendingOrders)
const paidOrders = computed(() => orderStore.paidOrders)
const shippedOrders = computed(() => orderStore.shippedOrders)
const refundingOrders = computed(() => orderStore.refundingOrders)
const completedOrders = computed(() => orderStore.completedOrders)
const loading = computed(() => orderStore.loading)

// 订单统计
const orderStats = computed(() => orderStore.stats)

const getCount = (tabId: string) => {
  return orderStore.getCount(tabId)
}

const goToProductDetail = (order: TradeOrder) => {
  // TODO: 根据实际路由调整
  router.push({ path: '/goods/detail', query: { id: order.id.toString() } })
}

const payOrder = async (order: TradeOrder) => {
  try {
    // 跳转到支付页面
    router.push({ path: '/payment', query: { orderId: order.id.toString() } })
  } catch (error) {
    console.error('跳转支付失败:', error)
  }
}

const cancelOrder = async (order: TradeOrder) => {
  if (confirm('确定要取消该订单吗？')) {
    try {
      await orderStore.cancel(order.id, '买家临时不需要了')
      alert('订单已取消')
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败，请重试')
    }
  }
}

const remindShip = async (order: TradeOrder) => {
  try {
    await orderStore.remindShip(order.id)
    alert(`已提醒卖家尽快发货\n订单号: ${order.order_no}`)
  } catch (error) {
    console.error('提醒发货失败:', error)
    alert('提醒发货失败，请重试')
  }
}

const checkLogistics = (order: TradeOrder) => {
  // TODO: 跳转到物流详情页面或显示物流信息
  alert(`物流信息：\n订单号: ${order.order_no}\n运单号：${order.shipping_no || '暂无'}\n交易方式：${order.trade_mode === 'shipping' ? '快递配送' : '自提'}`)
}

const confirmReceipt = async (order: TradeOrder) => {
  if (confirm('确认收到商品？')) {
    try {
      await orderStore.confirmReceipt(order.id)
      alert('确认收货成功')
    } catch (error) {
      console.error('确认收货失败:', error)
      alert('确认收货失败，请重试')
    }
  }
}

const reviewOrder = (order: TradeOrder) => {
  // TODO: 跳转到评价页面
  alert(`正在跳转到评价页面，订单号: ${order.order_no}`)
}

const viewOrderDetail = (order: TradeOrder) => {
  router.push({ path: `/order/detail/${order.id}` })
}

const viewRefundDetail = (order: TradeOrder) => {
  // TODO: 跳转到退款详情页面
  alert(`退款详情：\n订单号: ${order.order_no}\n退款金额: ¥${order.pay_amount}\n状态: 退款中`)
}

// 组件挂载时加载订单数据
onMounted(async () => {
  await orderStore.loadOrders()
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

/* 空状态和加载状态 */
.empty, .loading {
  text-align: center;
  padding: 40px 16px;
}

.empty i, .loading i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty p, .loading p {
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

/* 响应式 */
@media (max-width: 768px) {
  .statsBar {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
