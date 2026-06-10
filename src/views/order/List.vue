<template>
  <div class="order-list-container">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1>我的订单</h1>
    </div>

    <!-- 状态筛选标签 -->
    <div class="status-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        :class="['tab-btn', { active: currentStatus === tab.value }]"
        @click="switchStatus(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <i class="fa fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <i class="fa fa-shopping-bag"></i>
      <p>暂无订单</p>
      <router-link to="/home" class="btn-primary">去逛逛</router-link>
    </div>

    <!-- 订单列表 -->
    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <!-- 订单头部 -->
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span :class="['order-status', getStatusClass(order.status)]">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <!-- 商品信息 -->
        <div class="order-items">
          <div v-for="item in order.items" :key="item.productId" class="item-row">
            <img :src="getImageUrl(item.productImage)" :alt="item.productTitle" class="product-img" />
            <div class="product-info">
              <h3 class="product-title">{{ item.productTitle }}</h3>
              <p class="product-desc" v-if="item.productDesc">{{ item.productDesc }}</p>
              <div class="product-meta">
                <span class="price">¥{{ formatPrice(item.price) }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="order-info">
          <div class="info-row">
            <span class="label">交易方式：</span>
            <span>{{ order.tradeMode === 'shipping' ? '快递配送' : '自提' }}</span>
          </div>
          <div v-if="order.tradeMode === 'pickup' && order.pickupLocation" class="info-row">
            <span class="label">自提地点：</span>
            <span>{{ order.pickupLocation }}</span>
          </div>
          <div v-if="order.freightAmount > 0" class="info-row">
            <span class="label">运费：</span>
            <span>¥{{ formatPrice(order.freightAmount) }}</span>
          </div>
          <div class="info-row total">
            <span class="label">实付金额：</span>
            <span class="amount">¥{{ formatPrice(order.totalAmount) }}</span>
          </div>
        </div>

        <!-- 订单底部操作按钮 -->
        <div class="order-footer">
          <span class="create-time">创建时间：{{ formatDate(order.createTime) }}</span>
          <div class="actions">
            <!-- 待付款 -->
            <button v-if="order.status === 'pending_payment'" class="btn-pay" @click="handlePay(order)">
              立即支付
            </button>
            <!-- 待发货 -->
            <button v-if="order.status === 'paid'" class="btn-cancel" @click="handleCancel(order)">
              取消订单
            </button>
            <!-- 待收货 -->
            <button v-if="order.status === 'shipped'" class="btn-confirm" @click="handleConfirmReceipt(order)">
              确认收货
            </button>
            <!-- 已完成/已取消 -->
            <button v-if="['completed', 'cancelled'].includes(order.status)" class="btn-detail" @click="viewDetail(order)">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList, cancelOrder, confirmReceipt } from '@/api/order'
import { useUserStore } from '@/stores/userStore'
import { PLACEHOLDER_IMG } from '@/utils/image'

defineOptions({ name: 'OrderList' })

const router = useRouter()
const userStore = useUserStore()

// 状态标签
const statusTabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'pending_payment' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

// 当前选中的状态
const currentStatus = ref('')

// 订单列表
interface OrderItem {
  productId: number
  productTitle: string
  productDesc?: string
  productImage?: string
  price: number
  quantity: number
}

interface Order {
  id: number
  orderNo: string
  status: string
  tradeMode: 'shipping' | 'pickup'
  freightAmount: number
  totalAmount: number
  pickupLocation?: string
  createTime: string
  items: OrderItem[]
}

const orders = ref<Order[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const params = {
      role: 'buyer', // 买家视角
      status: currentStatus.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const data = await getOrderList(params as unknown as { role?: string; status?: string; page: number; pageSize: number })
    console.log('[OrderList] API返回数据:', data)

    // API返回格式可能是: { code: 200, message: "success", data: [...] } 或直接是数组
    let orderList: Array<Record<string, unknown>> = []
    if (Array.isArray(data)) {
      orderList = data
    } else if ((data as Record<string, unknown>)?.data && Array.isArray((data as Record<string, unknown>).data)) {
      orderList = (data as Record<string, unknown>).data as Array<Record<string, unknown>>
    }

    // 根据实际API返回结构调整
    if (orderList.length > 0) {
      orders.value = orderList.map((order: Record<string, unknown>) => ({
        id: order.id as number,
        orderNo: (order.orderNo as string) || `ORD${order.id}`,
        status: (order.orderStatus as string) || (order.status as string), // API返回orderStatus字段
        tradeMode: (order.tradeMode as 'shipping' | 'pickup') || 'shipping',
        freightAmount: Number(order.freightAmount) || 0,
        totalAmount: Number(order.totalAmount) || 0,
        pickupLocation: order.pickupLocation as string | undefined,
        createTime: (order.createdAt as string) || (order.createTime as string) || new Date().toISOString(), // API返回createdAt字段
        items: (order.items as OrderItem[]) || []
      }))
      totalPages.value = Math.ceil(orderList.length / pageSize.value)
    } else {
      orders.value = []
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    alert('加载订单失败，请重试')
  } finally {
    loading.value = false
  }
}

// 切换状态
const switchStatus = (status: string) => {
  currentStatus.value = status
  currentPage.value = 1
  fetchOrders()
}

// 翻页
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchOrders()
}

// 格式化价格
const formatPrice = (price: number): string => {
  return Number(price).toFixed(2)
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取图片URL
const getImageUrl = (image: string | undefined): string => {
  if (!image) return PLACEHOLDER_IMG
  if (image.startsWith('http')) return image
  return `${import.meta.env.VITE_API_BASE_URL || ''}${image}`
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending_payment: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 获取状态样式类
const getStatusClass = (status: string): string => {
  const classMap: Record<string, string> = {
    pending_payment: 'status-pending',
    paid: 'status-paid',
    shipped: 'status-shipped',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || ''
}

// 处理支付
const handlePay = (order: Order) => {
  router.push(`/order/payment/${order.id}`)
}

// 处理取消订单
const handleCancel = async (order: Order) => {
  if (!confirm('确定要取消这个订单吗？')) return

  try {
    await cancelOrder(order.id, '买家主动取消')
    alert('订单已取消')
    fetchOrders() // 刷新列表
  } catch (error) {
    console.error('取消订单失败:', error)
    alert('取消订单失败，请重试')
  }
}

// 处理确认收货
const handleConfirmReceipt = async (order: Order) => {
  if (!confirm('确认已收到商品？')) return

  try {
    await confirmReceipt(order.id)
    alert('确认收货成功')
    fetchOrders() // 刷新列表
  } catch (error) {
    console.error('确认收货失败:', error)
    alert('确认收货失败，请重试')
  }
}

// 查看订单详情
const viewDetail = (order: Order) => {
  router.push(`/order/detail/${order.id}`)
}

// 组件挂载时加载数据
onMounted(() => {
  if (!userStore.isLoggedIn) {
    alert('请先登录')
    router.push('/user/login')
    return
  }
  fetchOrders()
})
</script>

<style scoped>
.order-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 状态标签 */
.status-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn.active {
  background: #ff6b00;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #fff0e6;
}

/* 加载和空状态 */
.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
}

.loading-state i, .empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 10px 24px;
  background: #ff6b00;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}

/* 订单卡片 */
.order-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  font-size: 14px;
  color: #666;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-pending {
  background: #fff7e6;
  color: #ff6b00;
}

.status-paid {
  background: #e6f7ff;
  color: #1890ff;
}

.status-shipped {
  background: #f6ffed;
  color: #52c41a;
}

.status-completed {
  background: #f0f0f0;
  color: #666;
}

.status-cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

/* 商品信息 */
.order-items {
  padding: 16px;
}

.item-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.item-row:last-child {
  margin-bottom: 0;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b00;
}

.quantity {
  font-size: 12px;
  color: #999;
}

/* 订单信息 */
.order-info {
  padding: 0 16px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.info-row.total {
  font-weight: bold;
  color: #333;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.amount {
  font-size: 18px;
  color: #ff6b00;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
}

.create-time {
  font-size: 12px;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pay {
  background: #ff6b00;
  color: white;
}

.btn-pay:hover {
  background: #e65a00;
}

.btn-cancel {
  background: #fff;
  color: #ff4d4f;
  border: 1px solid #ff4d4f !important;
}

.btn-cancel:hover {
  background: #fff1f0;
}

.btn-confirm {
  background: #52c41a;
  color: white;
}

.btn-confirm:hover {
  background: #389e0d;
}

.btn-detail {
  background: #fff;
  color: #1890ff;
  border: 1px solid #1890ff !important;
}

.btn-detail:hover {
  background: #e6f7ff;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: #666;
}
</style>
