<template>
  <section class="page-panel detail-panel">
    <div class="detail-header">
      <div>
        <p class="section-label">订单详情</p>
        <h2>{{ order?.order_no || '订单信息' }}</h2>
      </div>
      <div class="detail-actions">
        <button v-if="canCancel" class="button-outline" @click="cancelCurrent">取消订单</button>
        <button v-if="canConfirm" class="primary-button" @click="confirmCurrent">确认收货</button>
      </div>
    </div>

    <div class="detail-grid">
      <section class="info-card">
        <h3>基础信息</h3>
        <div class="info-row"><span>状态</span><span>{{ statusLabel(order?.order_status) }}</span></div>
        <div class="info-row"><span>交易方式</span><span>{{ order?.trade_mode === 'shipping' ? '配送' : '自提' }}</span></div>
        <div class="info-row"><span>下单时间</span><span>{{ order?.created_at }}</span></div>
        <div v-if="order?.paid_at" class="info-row"><span>付款时间</span><span>{{ order?.paid_at }}</span></div>
      </section>

      <section class="info-card">
        <h3>收货信息</h3>
        <div class="info-row"><span>收货人</span><span>{{ order?.receiver_name }}</span></div>
        <div class="info-row"><span>联系电话</span><span>{{ order?.receiver_phone }}</span></div>
        <div class="info-row"><span>地址 / 自提</span><span>{{ order?.receiver_address || order?.pickup_location }}</span></div>
      </section>
    </div>

    <section class="items-card">
      <h3>商品明细</h3>
      <article v-for="item in items" :key="item.id" class="item-row">
        <img :src="item.product_image_url" alt="商品" />
        <div class="item-body">
          <h4>{{ item.product_title }}</h4>
          <p>数量：{{ item.quantity }}</p>
        </div>
        <div class="item-price">¥{{ formatPrice(item.subtotal_amount) }}</div>
      </article>
    </section>

    <section class="summary-card">
      <div class="summary-row"><span>商品总额</span><span>¥{{ formatPrice(order?.total_amount) }}</span></div>
      <div class="summary-row"><span>运费</span><span>¥{{ formatPrice(order?.freight_amount) }}</span></div>
      <div class="summary-row total"><span>实际支付</span><span>¥{{ formatPrice(order?.pay_amount) }}</span></div>
      <p class="order-remark">买家备注：{{ order?.remark || '无备注' }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const orderId = Number(route.params.id)

const order = computed(() => orderStore.currentOrder)
const items = computed(() => orderStore.items)
const canCancel = computed(() => order.value?.order_status === 'pending_payment' || order.value?.order_status === 'paid_pending_ship')
const canConfirm = computed(() => order.value?.order_status === 'shipped' || order.value?.order_status === 'delivered')

function statusLabel(status?: string) {
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
  return status ? map[status] || status : '-'
}

function formatPrice(amount?: string) {
  return amount ? Number(amount).toFixed(2) : '0.00'
}

async function loadOrder() {
  if (!orderId) {
    router.push('/orders')
    return
  }
  try {
    await orderStore.loadOrderDetail(orderId)
  } catch (error) {
    alert((error as Error).message)
    router.push('/orders')
  }
}

async function cancelCurrent() {
  try {
    await orderStore.cancel(orderId)
    alert('订单已取消')
  } catch (error) {
    alert((error as Error).message)
  }
}

async function confirmCurrent() {
  try {
    await orderStore.confirmReceipt(orderId)
    alert('确认收货成功')
  } catch (error) {
    alert((error as Error).message)
  }
}

onMounted(loadOrder)
</script>

<style scoped>
.page-panel {
  display: grid;
  gap: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.section-label {
  margin: 0;
  color: #ff7d00;
  font-weight: 800;
}

.detail-header h2 {
  margin: 4px 0 0;
  font-size: 2rem;
}

.detail-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-button,
.button-outline {
  padding: 12px 20px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.primary-button {
  background: #ff6d00;
  color: #fff;
}

.button-outline {
  background: #fff;
  border: 1px solid #ff7d00;
  color: #ff7d00;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.info-card,
.items-card,
.summary-card {
  background: #fff;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 16px 36px rgba(65, 72, 91, 0.08);
}

.info-card h3,
.items-card h3,
.summary-card h3 {
  margin: 0 0 18px;
  font-size: 1.15rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  color: #555;
}

.items-card .item-row {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #f2f2f2;
}

.items-card .item-row:first-child {
  border-top: none;
}

.items-card img {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: 16px;
}

.item-body h4 {
  margin: 0 0 8px;
}

.item-body p {
  margin: 0;
  color: #777;
}

.item-price {
  color: #ff5a00;
  font-size: 1rem;
  font-weight: 700;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  color: #555;
}

.summary-row.total {
  font-size: 1.1rem;
  font-weight: 700;
}

.order-remark {
  margin: 0;
  color: #6b6b6b;
  font-size: 0.95rem;
}
</style>