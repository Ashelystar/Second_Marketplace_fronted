<template>
  <section class="page-panel order-panel">
    <div class="orders-header">
      <div>
        <p class="section-label">交易订单</p>
        <h2>我的订单列表</h2>
      </div>
      <div class="status-filters">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-button', { active: selectedStatus === tab.value } ]"
          @click="selectStatus(tab.value)">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-panel">加载中...</div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <p>当前没有符合条件的订单。</p>
      <RouterLink to="/profile" class="secondary-button">去用户中心查看</RouterLink>
    </div>

    <div v-else class="order-list">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-card-main">
          <div>
            <p class="order-status">{{ statusLabel(order.order_status) }}</p>
            <h3>{{ order.order_no }}</h3>
            <p class="order-meta">卖家：{{ order.seller_name }}</p>
          </div>
          <div class="order-summary">
            <p>实付：<strong>¥{{ order.pay_amount.toFixed(2) }}</strong></p>
            <p>{{ order.trade_mode === 'shipping' ? '配送' : '自提' }}</p>
          </div>
        </div>
        <div class="order-card-footer">
          <p class="order-info">下单时间：{{ order.created_at }}</p>
          <RouterLink :to="`/orders/${order.id}`" class="detail-link">查看详情</RouterLink>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const orderStore = useOrderStore()
const route = useRoute()
const router = useRouter()
const selectedStatus = ref(route.query.status?.toString() ?? 'all')
const tabs = [
  { value: 'all', label: '全部' },
  { value: 'pending_payment', label: '待付款' },
  { value: 'paid_pending_ship', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const orders = ref(orderStore.orders)
const loading = ref(orderStore.loading)

async function loadOrders(status = 'all') {
  await orderStore.loadOrders(status)
  orders.value = orderStore.orders
  loading.value = orderStore.loading
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending_payment: '待付款',
    paid_pending_ship: '待发货',
    shipped: '已发货',
    delivered: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refund_in_progress: '退款中',
    closed: '已关闭',
  }
  return map[status] || status
}

function selectStatus(status: string) {
  selectedStatus.value = status
  router.replace({ query: { status } })
  loadOrders(status)
}

onMounted(() => {
  loadOrders(selectedStatus.value)
})
</script>

<style scoped>
.page-panel {
  display: grid;
  gap: 24px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.section-label {
  margin: 0;
  color: #ff7d00;
  font-weight: 800;
}

.order-panel h2 {
  margin: 4px 0 0;
  font-size: 2rem;
}

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-button {
  border: none;
  background: #f4f4f5;
  color: #333;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
}

.tab-button.active {
  background: #ff8a00;
  color: #fff;
}

.loading-panel,
.empty-state {
  padding: 32px;
  border-radius: 24px;
  background: #fff;
  text-align: center;
  color: #666;
}

.order-list {
  display: grid;
  gap: 18px;
}

.order-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 15px 35px rgba(53, 59, 80, 0.06);
}

.order-card-main {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

.order-status {
  margin: 0 0 10px;
  display: inline-flex;
  color: #ff6b00;
  font-weight: 700;
}

.order-card h3 {
  margin: 0;
}

.order-meta {
  color: #666;
  margin: 8px 0 0;
}

.order-summary {
  text-align: right;
}

.order-summary p {
  margin: 0;
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.order-info {
  color: #7e7e7e;
  margin: 0;
}

.detail-link {
  text-decoration: none;
  color: #ff7c00;
  font-weight: 700;
}
</style>
