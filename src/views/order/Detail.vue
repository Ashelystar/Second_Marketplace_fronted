<template>
  <div class="order-detail-container">
    <div v-if="loading" class="loading">
      <i class="fa fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <div v-else-if="order" class="order-detail">
      <!-- 订单状态 -->
      <div class="status-card">
        <div class="status-header">
          <h2>{{ getStatusText(order.orderStatus) }}</h2>
          <span class="status-badge" :style="{ backgroundColor: getStatusColor(order.orderStatus) }">
            {{ getStatusText(order.orderStatus) }}
          </span>
        </div>
        <div class="status-info">
          <p>订单号：{{ order.orderNo }}</p>
          <p>下单时间：{{ formatTime(order.createdAt) }}</p>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="section">
        <h3>商品信息</h3>
        <div v-if="order.items && order.items.length > 0" class="product-list">
          <div v-for="item in order.items" :key="item.id" class="product-item">
            <img
              :src="getImageUrl(item.productImageUrl)"
              :alt="item.productTitle"
              class="product-img"
              @error="handleImageError"
            />
            <div class="product-info">
              <div class="product-title">{{ item.productTitle }}</div>
              <div class="product-meta">
                <span class="price">¥{{ item.unitPrice.toFixed(2) }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div v-if="order.tradeMode === 'shipping'" class="section">
        <h3>收货信息</h3>
        <div class="address-info">
          <p><strong>收货人：</strong>{{ order.receiverName || '暂无' }}</p>
          <p><strong>联系电话：</strong>{{ order.receiverPhone || '暂无' }}</p>
          <p><strong>收货地址：</strong>{{ order.receiverAddress || '暂无' }}</p>
        </div>
      </div>

      <!-- 自提信息 -->
      <div v-else-if="order.tradeMode === 'pickup'" class="section">
        <h3>收货信息</h3>
        <div class="pickup-info">
          <div v-if="!isEditingPickup">
            <p><strong>收货地址：</strong>{{ order.pickupLocation || '暂无' }}</p>
            <button v-if="order.orderStatus === 'pending_payment'" class="btn-edit" @click="startEditPickup">
              <i class="fa fa-edit"></i> 修改收货地址
            </button>
          </div>
          <div v-else class="edit-pickup-form">
            <div class="form-group">
              <label>收货地址：</label>
              <input
                v-model="editingPickupLocation"
                type="text"
                class="form-input"
                placeholder="请输入新的收货地址"
              />
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="cancelEditPickup">取消</button>
              <button class="btn-primary" @click="savePickupLocation">保存</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 物流信息 -->
      <div v-if="order.orderStatus === 'shipped'" class="section">
        <h3>物流信息</h3>
        <div class="logistics-info">
          <p><strong>订单状态：</strong>已发货</p>
          <button class="btn-secondary" @click="viewLogistics">查看物流轨迹</button>
        </div>
      </div>

      <!-- 订单备注 -->
      <div v-if="order.remark" class="section">
        <h3>订单备注</h3>
        <p class="remark">{{ order.remark }}</p>
      </div>

      <!-- 金额信息 -->
      <div class="section amount-section">
        <h3>金额信息</h3>
        <div class="amount-row">
          <span>商品总额：</span>
          <span>¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-row">
          <span>运费：</span>
          <span>¥{{ order.freightAmount.toFixed(2) }}</span>
        </div>
        <div class="amount-row total">
          <span>实付金额：</span>
          <span class="total-amount">¥{{ order.payAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button v-if="order.orderStatus === 'pending_payment'" class="btn-secondary" @click="handleCancel">
          取消订单
        </button>
        <button v-if="order.orderStatus === 'pending_payment'" class="btn-primary" @click="handlePay">
          立即支付
        </button>
        <button v-if="order.orderStatus === 'paid'" class="btn-secondary" @click="handleRemindShip">
          提醒发货
        </button>
        <button v-if="order.orderStatus === 'shipped'" class="btn-secondary" @click="handleCheckLogistics">
          查看物流
        </button>
        <button v-if="order.orderStatus === 'shipped'" class="btn-primary" @click="handleConfirmReceipt">
          确认收货
        </button>
        <button v-if="order.orderStatus === 'completed'" class="btn-primary" @click="handleReview">
          去评价
        </button>
        <button class="btn-secondary" @click="goBack">
          返回列表
        </button>
      </div>
    </div>

    <div v-else class="empty">
      <i class="fa fa-exclamation-circle"></i>
      <p>订单不存在</p>
      <button class="btn-primary" @click="goBack">返回订单列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail, cancelOrder, confirmReceipt, remindShip } from '@/api/order'

defineOptions({ name: 'OrderDetail' })

const router = useRouter()
const route = useRoute()

interface OrderItem {
  id: number
  productId: number
  productTitle: string
  productImageUrl?: string
  unitPrice: number
  quantity: number
  subtotalAmount: number
}

interface Order {
  id: number
  orderNo: string
  buyerId: number
  sellerId: number
  orderStatus: string
  tradeMode: 'shipping' | 'pickup'
  totalAmount: number
  freightAmount: number
  payAmount: number
  remark?: string
  receiverName?: string
  receiverPhone?: string
  receiverAddress?: string
  pickupLocation?: string
  createdAt: string
  items: OrderItem[]
}

const order = ref<Order | null>(null)
const loading = ref(false)

// 编辑自提地点相关
const isEditingPickup = ref(false)
const editingPickupLocation = ref('')

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending_payment: '#f97316',
    paid: '#8b5cf6',
    shipped: '#3b82f6',
    completed: '#22c55e',
    cancelled: '#9ca3af'
  }
  return colorMap[status] || '#6b7280'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending_payment: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

// 加载订单详情
const loadOrderDetail = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    console.error('订单ID无效')
    return
  }

  loading.value = true
  try {
    console.log('[OrderDetail] 开始加载订单详情, orderId:', orderId)
    const result = await getOrderDetail(orderId)
    console.log('[OrderDetail] API返回数据:', result)

    // API返回格式: { code: 200, message: "success", data: {...} }
    let orderData = (result as Record<string, unknown>)?.data || result
    
    // 将后端返回的下划线命名转换为前端使用的驼峰命名
    orderData = convertToCamelCase(orderData)
    
    console.log('[OrderDetail] 解析后的订单数据:', orderData)

    // 处理商品图片URL - 如果缺少协议头，添加完整URL
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item: Record<string, unknown>) => {
        const imageUrl = item.productImageUrl as string | undefined
        if (imageUrl && !imageUrl.startsWith('http')) {
          // 假设后端返回的是相对路径，需要添加基础URL
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://1.117.73.156:8083'
          item.productImageUrl = `${baseUrl}${imageUrl}`
          console.log('[OrderDetail] 修正图片URL:', item.productImageUrl)
        }
      })
    }

    order.value = orderData as Order
    console.log('[OrderDetail] 设置order.value后:', order.value)
    console.log('[OrderDetail] 商品信息:', order.value?.items)
  } catch (error) {
    console.error('加载订单详情失败:', error)
    alert('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

// 将对象的下划线命名转换为驼峰命名
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertToCamelCase = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertToCamelCase(item))
  } else if (obj !== null && typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const converted: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 将下划线命名转换为驼峰命名
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        converted[camelKey] = convertToCamelCase((obj as Record<string, any>)[key])
      }
    }
    return converted
  }
  return obj
}

// 取消订单
const handleCancel = async () => {
  if (!order.value) return
  if (confirm('确定要取消该订单吗？')) {
    try {
      await cancelOrder(order.value.id, '买家临时不需要了')
      alert('订单已取消')
      await loadOrderDetail() // 重新加载
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败，请重试')
    }
  }
}

// 支付订单
const handlePay = () => {
  if (!order.value) return
  // 跳转到支付页面
  router.push(`/order/payment/${order.value.id}`)
}

// 提醒发货
const handleRemindShip = async () => {
  if (!order.value) return
  try {
    await remindShip(order.value.id)
    alert('已提醒卖家尽快发货')
  } catch (error) {
    console.error('提醒发货失败:', error)
    alert('提醒发货失败，请重试')
  }
}

// 查看物流
const handleCheckLogistics = () => {
  if (!order.value) return
  // TODO: 实现物流查询功能
  alert(`物流信息：\n订单号: ${order.value.orderNo}\n运单号：暂无`)
}

// 开始编辑自提地点
const startEditPickup = () => {
  if (!order.value) return
  editingPickupLocation.value = order.value.pickupLocation || ''
  isEditingPickup.value = true
}

// 取消编辑自提地点
const cancelEditPickup = () => {
  isEditingPickup.value = false
  editingPickupLocation.value = ''
}

// 保存自提地点
const savePickupLocation = async () => {
  if (!order.value) return

  const newLocation = editingPickupLocation.value.trim()
  if (!newLocation) {
    alert('请输入自提地点')
    return
  }

  try {
    // TODO: 调用后端API更新自提地点
    // await updateOrderPickupLocation(order.value.id, newLocation)

    // 暂时直接更新本地数据
    order.value.pickupLocation = newLocation
    isEditingPickup.value = false
    editingPickupLocation.value = ''

    alert('收货地址修改成功！')
    console.log('[OrderDetail] 收货地址已更新为:', newLocation)
  } catch (error) {
    console.error('更新收货地址失败:', error)
    alert('更新收货地址失败，请重试')
  }
}

// 获取完整的图片URL
const getImageUrl = (url: string | undefined) => {
  if (!url) return '/placeholder.png'

  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 如果是相对路径，添加基础URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://1.117.73.156:8083'
  return `${baseUrl}${url}`
}

// 处理图片加载失败
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 设置默认占位图
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7mlrDovbflkKfkuozlj4rnlLXop4bnoIE8L3RleHQ+PC9zdmc+'
}

// 查看物流轨迹
const viewLogistics = () => {
  // TODO: 跳转到物流轨迹页面
  alert('查看物流轨迹功能开发中...')
}

// 确认收货
const handleConfirmReceipt = async () => {
  if (!order.value) return
  if (confirm('确认收到商品？')) {
    try {
      await confirmReceipt(order.value.id)
      alert('确认收货成功')
      await loadOrderDetail() // 重新加载
    } catch (error) {
      console.error('确认收货失败:', error)
      alert('确认收货失败，请重试')
    }
  }
}

// 评价订单
const handleReview = () => {
  if (!order.value) return
  // 跳转到评价页面
  router.push(`/order/review/${order.value.id}`)
}

// 返回列表
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  padding: 16px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 16px;
}

.loading i, .empty i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.loading p, .empty p {
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 20px;
}

.order-detail {
  max-width: 800px;
  margin: 0 auto;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-header h2 {
  font-size: 20px;
  color: #1f2937;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.status-info p {
  margin: 6px 0;
  color: #6b7280;
  font-size: 14px;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section h3 {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
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
}

.price {
  font-size: 16px;
  color: #f97316;
  font-weight: bold;
}

.quantity {
  font-size: 13px;
  color: #9ca3af;
}

.address-info p,
.pickup-info p,
.logistics-info p {
  margin: 8px 0;
  color: #374151;
  font-size: 14px;
}

.btn-edit {
  margin-top: 12px;
  padding: 6px 12px;
  background-color: #f97316;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #ea580c;
}

.edit-pickup-form {
  margin-top: 12px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.remark {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.amount-section .amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #374151;
  font-size: 14px;
}

.amount-row.total {
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: bold;
}

.total-amount {
  color: #f97316;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 150ms;
  border: none;
}

.btn-primary {
  background: #f97316;
  color: #fff;
}

.btn-primary:hover {
  background: #ea580c;
}

.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  border-color: #f97316;
  color: #f97316;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
