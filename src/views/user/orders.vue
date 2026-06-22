<template>
  <div class="orders-container">
    <div class="statsBar">
      <div class="statCard">
        <div class="statValue">¥{{ (orderStats.totalSpent || 0).toFixed(2) }}</div>
        <div class="statLabel">累计消费</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ orderStats.totalOrders || 0 }}</div>
        <div class="statLabel">交易笔数</div>
      </div>
      <div class="statCard">
        <div class="statValue">{{ (orderStats.averageRating || 0).toFixed(1) }}/5</div>
        <div class="statLabel">平均评分</div>
      </div>
    </div>

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
          <span class="count" v-if="getTabCount(tab.id) > 0">{{ getTabCount(tab.id) }}</span>
        </button>
      </div>
    </div>

    <div class="orderList">
      <div v-if="loading" class="loading-state">
        <i class="fa fa-spinner fa-spin"></i>
        <p>正在努力为您拉取订单记录...</p>
      </div>

      <template v-else>
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <i class="fa" :class="getTabIcon(orderTab)"></i>
          <p>当前分类下暂无相关订单记录</p>
          <button class="btnPrimary" @click="router.push('/')">去商城逛逛</button>
        </div>

        <div 
          v-else 
          v-for="order in filteredOrders" 
          :key="order.id" 
          class="orderCard"
        >
          <div class="card-header">
            <span class="order-no-text">订单号: <strong>{{ order.orderNo }}</strong></span>
            <span class="status-tag" :style="{ color: getStatusColor(order.orderStatus) }">
              {{ getStatusText(order.orderStatus) }}
            </span>
          </div>

          <div class="products-wrapper">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="product-item-row"
              @click="viewOrderDetail(order)"
              title="点击查看订单详情"
            >
              <img 
                :src="getImageUrl(item.productImageUrl)" 
                :alt="item.productTitle" 
                class="product-img" 
                @error="handleImageError"
              />
              <div class="product-info-col">
                <h4 class="product-title">{{ item.productTitle || '未命名商品' }}</h4>
                <div class="product-badges" v-if="order.tradeMode">
                  <span class="badge">{{ order.tradeMode === 'pickup' ? '到店自提' : '寄送上门' }}</span>
                </div>
              </div>
              <div class="product-price-col">
                <span class="price-text">¥{{ (item.unitPrice || 0).toFixed(2) }}</span>
                <span class="quantity-text">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="total-price-summary">
              共 <strong>{{ getOrderTotalQuantity(order) }}</strong> 件商品，实付款: 
              <span class="money-accent">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span>
            </div>
            
            <div class="order-actions-group">
              <template v-if="order.orderStatus === 'pending'">
                <button class="action-btn secondary" @click.stop="cancelOrder(order)">取消订单</button>
                <button class="action-btn primary" @click.stop="payOrder(order)">立即支付</button>
              </template>

              <template v-else-if="order.orderStatus === 'paid'">
                <button class="action-btn secondary" @click.stop="remindShip(order)">提醒发货</button>
                <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
              </template>

              <template v-else-if="order.orderStatus === 'shipped' || order.orderStatus === 'delivered'">
                <button class="action-btn secondary" @click.stop="checkLogistics(order)">查看物流</button>
                <button class="action-btn primary" @click.stop="confirmReceipt(order)">确认收货</button>
              </template>

              <template v-else-if="order.orderStatus === 'refunding'">
                <button class="action-btn secondary" @click.stop="viewRefundDetail(order)">退款详情</button>
              </template>

              <template v-else-if="order.orderStatus === 'completed'">
                <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
                <button class="action-btn primary" @click.stop="reviewOrder(order)">去评价</button>
              </template>

              <template v-else>
                <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
              </template>
            </div>
          </div>
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
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

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

// 核心修复：1. 统一改为前端安全计算，2. 并在“待收货”中兼容处理后端的 "delivered" 状态
const filteredOrders = computed(() => {
  const allList = orderStore.orders || []
  switch (orderTab.value) {
    case 'pending':
      return allList.filter(o => o.orderStatus === 'pending')
    case 'paid':
      return allList.filter(o => o.orderStatus === 'paid')
    case 'shipped':
      // 兼容后端接口返回的 'shipped' 和 'delivered' 两个状态
      return allList.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'delivered')
    case 'refunding':
      return allList.filter(o => o.orderStatus === 'refunding')
    case 'completed':
      return allList.filter(o => o.orderStatus === 'completed')
    default:
      return allList
  }
})

// 动态获取各Tab徽章数量
const getTabCount = (tabId: string) => {
  const allList = orderStore.orders || []
  if (tabId === 'all') return allList.length
  if (tabId === 'shipped') return allList.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'delivered').length
  return allList.filter(o => o.orderStatus === tabId).length
}

const loading = computed(() => orderStore.loading)
const orderStats = computed(() => orderStore.stats)

// 动态设定空状态下的优雅图标
const getTabIcon = (tabId: string) => {
  const iconMap: Record<string, string> = {
    all: 'fa-inbox',
    pending: 'fa-clock-o',
    paid: 'fa-box',
    shipped: 'fa-truck',
    refunding: 'fa-refresh',
    completed: 'fa-star-o'
  }
  return iconMap[tabId] || 'fa-inbox'
}

// 获取单笔订单的商品总件数
const getOrderTotalQuantity = (order: any) => {
  if (!order.items) return 0
  return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
}

/* --- 交互行为层（已彻底对齐驼峰字段命名） --- */

const payOrder = async (order: any) => {
  router.push({ path: '/payment', query: { orderId: order.id.toString() } })
}

const cancelOrder = async (order: any) => {
  if (confirm('确定要取消该订单吗？')) {
    try {
      await orderStore.cancel(order.id, '买家临时不需要了')
      alert('订单已成功取消')
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败，请重试')
    }
  }
}

const remindShip = async (order: any) => {
  try {
    await orderStore.remindShip(order.id)
    // 修复：使用驼峰 orderNo
    alert(`已为您加速催办！\n当前订单号: ${order.orderNo}`)
  } catch (error) {
    console.error('提醒发货失败:', error)
  }
}

const checkLogistics = (order: any) => {
  // 修复：使用驼峰 orderNo、shippingNo、tradeMode
  const deliveryMode = order.tradeMode === 'shipping' ? '快递配送' : '线下自提'
  alert(`【物流干线追踪】\n订单单号: ${order.orderNo}\n运单单号: ${order.shippingNo || '无需物流/暂未分配'}\n履约方式: ${deliveryMode}`)
}

const confirmReceipt = async (order: any) => {
  if (confirm('您是否确定已收到包裹？确认后钱款将解冻至卖家账户。')) {
    try {
      await orderStore.confirmReceipt(order.id)
      alert('签收成功，去给商品写个好评吧！')
    } catch (error) {
      console.error('确认收货失败:', error)
      alert('操作失败，请重试')
    }
  }
}

const reviewOrder = (order: any) => {
  alert(`正在前往评价系统，订单号: ${order.orderNo}`)
}

const viewOrderDetail = (order: any) => {
  router.push({ path: `/order/detail/${order.id}` })
}

const viewRefundDetail = (order: any) => {
  alert(`【售后退款信息】\n订单单号: ${order.orderNo}\n原路退回金额: ¥${(order.payAmount || 0).toFixed(2)}\n退款进度: 商家处理中`)
}

/* --- 状态样式辅助层 --- */

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#f97316',   // 温暖橘
    paid: '#8b5cf6',      // 浪漫紫
    shipped: '#2563eb',   // 科技蓝
    delivered: '#10b981', // 森林绿
    completed: '#10b981', // 森林绿
    cancelled: '#9ca3af', // 沉稳灰
    refunding: '#ef4444'  // 警示红
  }
  return colorMap[status] || '#6b7280'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '卖家已发货',
    delivered: '待收货 (已送达)', // 完美应对后端 delivered 字段
    completed: '交易完成',
    cancelled: '已取消',
    refunding: '退款中'
  }
  return textMap[status] || status
}

// 拼接并输出完整的 CDN 图片 URL

// 图片损坏时的优雅容错兜底
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5b2i5YOP5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
}

onMounted(async () => {
  await orderStore.loadOrders()
})
</script>

<style scoped>
.orders-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* 顶部数据统计面板 */
.statsBar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.statCard {
  background: #fff;
  border-radius: 14px;
  padding: 20px 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s;
}

.statCard:hover {
  transform: translateY(-2px);
}

.statValue {
  font-size: 24px;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 4px;
}

.statLabel {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 现代风格单选项卡筛选栏 */
.filterBar {
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.filterTabs {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  overflow-x: auto;
}

.filterTab {
  flex: 1;
  white-space: nowrap;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.filterTab:hover {
  color: #f97316;
  background-color: #fff7ed;
}

.filterTab.active {
  background: #f97316;
  color: #fff;
  font-weight: 600;
}

.filterTab .count {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 20px;
}

.filterTab.active .count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* 订单卡片结构设计 */
.orderList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orderCard {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.orderCard:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

/* 卡片头 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f1f5f9;
}

.order-no-text {
  font-size: 13px;
  color: #64748b;
}
.order-no-text strong {
  color: #334155;
  font-weight: 600;
  margin-left: 4px;
}

.status-tag {
  font-size: 13px;
  font-weight: 600;
}

/* 商品项级联视图 */
.products-wrapper {
  padding: 4px 0;
}

.product-item-row {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f8fafc;
}

.product-item-row:last-child {
  border-bottom: none;
}

.product-item-row:hover {
  background-color: #f8fafc;
}

.product-img {
  width: 76px;
  height: 76px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.product-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
}

.product-title {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-badges .badge {
  font-size: 11px;
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.product-price-col {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 70px;
}

.price-text {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.quantity-text {
  font-size: 12px;
  color: #94a3b8;
}

/* 卡片尾部总结与按钮排版 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 12px;
}

.total-price-summary {
  font-size: 13px;
  color: #475569;
}
.total-price-summary strong {
  color: #1e293b;
}

.money-accent {
  color: #f97316;
  font-size: 18px;
  font-weight: 700;
  margin-left: 2px;
}

.order-actions-group {
  display: flex;
  gap: 8px;
}

/* 高级美观按钮标准 */
.action-btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
}

.action-btn.primary {
  background: #f97316;
  color: #fff;
  border: 1px solid #f97316;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
}

.action-btn.primary:hover {
  background: #ea580c;
  border-color: #ea580c;
  transform: translateY(-0.5px);
}

.action-btn.secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.action-btn.secondary:hover {
  border-color: #f97316;
  color: #f97316;
  background-color: #fff7ed;
}

/* 缺省与加载骨架 */
.empty-state, .loading-state {
  text-align: center;
  padding: 60px 16px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-state i, .loading-state i {
  font-size: 50px;
  color: #cbd5e1;
  margin-bottom: 16px;
}
.loading-state i {
  color: #f97316;
}

.empty-state p, .loading-state p {
  color: #64748b;
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
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btnPrimary:hover {
  background: #ea580c;
}

/* 极小屏幕自适应调优 */
@media (max-width: 640px) {
  .statsBar {
    gap: 10px;
  }
  .statCard {
    padding: 12px 6px;
  }
  .statValue {
    font-size: 18px;
  }
  .card-footer {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>