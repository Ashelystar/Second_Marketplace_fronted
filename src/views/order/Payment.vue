<template>
  <div class="payment-container">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>订单支付</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <i class="fa fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <i class="fa fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="loadOrderInfo">重试</button>
    </div>

    <!-- 支付内容 -->
    <div v-else-if="order" class="payment-content">
      <!-- 步骤1: 选择支付方式 -->
      <template v-if="step === 'select'">
        <!-- 订单信息卡片 -->
        <div class="order-card">
          <div class="order-header">
            <span class="label">订单号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="order-status">
            <span :class="['status-badge', getStatusClass(order.orderStatus)]">
              {{ getStatusText(order.orderStatus) }}
            </span>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="product-card">
          <h3>商品信息</h3>
          <div v-for="item in order.items" :key="item.id" class="product-item">
            <img :src="item.productImageUrl || '/placeholder.png'" :alt="item.productTitle" class="product-img" />
            <div class="product-info">
              <div class="product-title">{{ item.productTitle }}</div>
              <div class="product-meta">
                <span class="price">¥{{ item.unitPrice.toFixed(2) }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 金额明细 -->
        <div class="amount-card">
          <h3>支付金额</h3>
          <div class="amount-row">
            <span class="label">商品总额：</span>
            <span class="value">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-row">
            <span class="label">运费：</span>
            <span class="value">¥{{ order.freightAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-row total">
            <span class="label">实付金额：</span>
            <span class="total-value">¥{{ order.payAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-method-card">
          <h3>选择支付方式</h3>
          <div class="method-list">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              :class="['method-item', { selected: selectedMethod === method.value }]"
              @click="selectedMethod = method.value"
            >
              <div class="method-icon">
                <i :class="method.icon"></i>
              </div>
              <div class="method-info">
                <div class="method-name">{{ method.name }}</div>
                <div class="method-desc">{{ method.desc }}</div>
              </div>
              <div class="method-check">
                <i v-if="selectedMethod === method.value" class="fa fa-check-circle"></i>
                <i v-else class="fa fa-circle-o"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 创建支付单按钮 -->
        <div class="action-area">
          <button
            class="pay-btn"
            :disabled="!selectedMethod || paying"
            @click="handleCreatePayment"
          >
            <span v-if="paying">
              <i class="fa fa-spinner fa-spin"></i> 创建支付单...
            </span>
            <span v-else>立即支付 ¥{{ order.payAmount.toFixed(2) }}</span>
          </button>
        </div>
      </template>

      <!-- 步骤2: 确认支付 -->
      <template v-if="step === 'pay' && paymentDetail">
        <div class="pay-confirm-card">
          <div class="confirm-header">
            <button class="back-step-btn" @click="goBackStep">
              <i class="fa fa-arrow-left"></i>
            </button>
            <h2>确认支付</h2>
          </div>

          <div class="confirm-body">
            <div class="info-row">
              <span class="info-label">支付单号</span>
              <span class="info-value">{{ paymentDetail.paymentNo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">支付方式</span>
              <span class="info-value">{{ getPaymentMethodName(paymentDetail.paymentChannel) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">支付状态</span>
              <span class="info-value status-created">待支付</span>
            </div>
            <div class="info-row amount-highlight">
              <span class="info-label">应付金额</span>
              <span class="info-value pay-amount">¥{{ paymentDetail.payableAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="confirm-footer">
            <button
              class="pay-btn"
              :disabled="executingPay"
              @click="executePay"
            >
              <span v-if="executingPay">
                <i class="fa fa-spinner fa-spin"></i> 支付中...
              </span>
              <span v-else>确认支付 ¥{{ paymentDetail.payableAmount.toFixed(2) }}</span>
            </button>
            <button class="btn-secondary cancel-btn" @click="goBackStep">返回重选</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail, createPayment, getPaymentDetail, payOrder } from '@/api/order'

defineOptions({ name: 'PaymentPage' })

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

interface PaymentDetail {
  id: number
  orderId: number
  paymentNo: string
  paymentChannel: string
  paymentStatus: string
  payableAmount: number
  paidAmount?: number
  channelTradeNo?: string
  paidAt?: string
  failedReason?: string
  createdAt: string
}

const order = ref<Order | null>(null)
const loading = ref(false)
const paying = ref(false)
const executingPay = ref(false)
const error = ref('')
const selectedMethod = ref<'alipay' | 'wechat' | 'balance'>('alipay')
const currentPaymentId = ref<number | null>(null)
const paymentDetail = ref<PaymentDetail | null>(null)
const step = ref<'select' | 'pay'>('select')  // select=选择支付方式, pay=确认支付

// 支付方式列表
const paymentMethods: { value: 'alipay' | 'wechat' | 'balance'; name: string; desc: string; icon: string }[] = [
  { value: 'alipay', name: '支付宝', desc: '推荐使用', icon: 'fa fa-alipay' },
  { value: 'wechat', name: '微信支付', desc: '快捷方便', icon: 'fa fa-wechat' },
  { value: 'balance', name: '余额支付', desc: '账户余额', icon: 'fa fa-wallet' }
]

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

// 将蛇形命名转换为驼峰命名（适配后端返回格式）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertToCamelCase(item))
  } else if (obj !== null && typeof obj === 'object') {
    const converted: Record<string, unknown> = {}
    for (const key of Object.keys(obj)) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        converted[camelKey] = convertToCamelCase((obj as Record<string, unknown>)[key])
      }
    }
    return converted
  }
  return obj
}

// 获取状态样式类
const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending_payment: 'status-pending',
    paid: 'status-paid',
    shipped: 'status-shipped',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || ''
}

// 获取支付方式名称
const getPaymentMethodName = (method: string) => {
  const nameMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    balance: '余额'
  }
  return nameMap[method] || method
}

// 加载订单信息
const loadOrderInfo = async () => {
  const orderId = Number(route.params.id)
  if (!orderId) {
    error.value = '订单ID无效'
    return
  }

  loading.value = true
  error.value = ''

  try {
    console.log('[Payment] 步骤0: 加载订单信息, orderId:', orderId)
    const result = await getOrderDetail(orderId)
    console.log('[Payment] 订单API返回:', result)

    let orderData = (result as Record<string, unknown>)?.data || result
    orderData = convertToCamelCase(orderData)
    order.value = orderData as Order

    if (order.value.orderStatus !== 'pending_payment') {
      error.value = `订单状态为"${getStatusText(order.value.orderStatus)}"，无法支付`
      setTimeout(() => { router.back() }, 2000)
    }
  } catch (err: unknown) {
    console.error('加载订单失败:', err)
    error.value = (err as Error).message || '加载订单失败'
  } finally {
    loading.value = false
  }
}

// 步骤1: 创建支付单
const handleCreatePayment = async () => {
  if (!order.value || !selectedMethod.value) return

  paying.value = true
  try {
    console.log('[Payment] 步骤1: POST /api/orders/{orderId}/payments, channel:', selectedMethod.value)

    // request() 返回 json.data，即后端 data 字段的值
    // 后端返回 CommonResult<Long>，data 为数字 paymentId
    const rawData = await createPayment(order.value.id, {
      paymentChannel: selectedMethod.value
    })
    console.log('[Payment] createPayment 原始返回:', rawData, '类型:', typeof rawData)

    // 兼容处理：data 可能是数字，也可能是包含 id 字段的对象
    let paymentId: number
    if (typeof rawData === 'number') {
      paymentId = rawData
    } else if (rawData && typeof rawData === 'object' && 'id' in (rawData as Record<string, unknown>)) {
      paymentId = (rawData as Record<string, unknown>).id as number
      console.log('[Payment] 从对象中提取 paymentId:', paymentId)
    } else {
      throw new Error(`创建支付单返回数据格式异常: ${JSON.stringify(rawData)}`)
    }

    console.log('[Payment] 支付单创建成功, paymentId:', paymentId)
    currentPaymentId.value = paymentId

    // 步骤2: 获取支付单详情
    await loadPaymentDetail()
  } catch (err: unknown) {
    console.error('[Payment] 创建支付单失败:', err)
    alert(`创建支付单失败：${(err as Error).message || '未知错误'}`)
  } finally {
    paying.value = false
  }
}

// 步骤2: 获取支付单详情
const loadPaymentDetail = async () => {
  if (!order.value || !currentPaymentId.value) return

  try {
    console.log('[Payment] 步骤2: GET /api/orders/{orderId}/payments/{paymentId}')
    const result = await getPaymentDetail(order.value.id, currentPaymentId.value)
    console.log('[Payment] 支付单详情:', result)

    const detail = convertToCamelCase(result)
    paymentDetail.value = detail as PaymentDetail

    // 进入确认支付步骤
    step.value = 'pay'
  } catch (err: unknown) {
    console.error('[Payment] 获取支付单详情失败:', err)
    alert(`获取支付单详情失败：${(err as Error).message || '未知错误'}`)
  }
}

// 步骤3: 发起实际支付
const executePay = async () => {
  if (!currentPaymentId.value) return

  executingPay.value = true
  try {
    console.log('[Payment] 步骤3: POST /api/payments/{paymentId}/pay, paymentId:', currentPaymentId.value)
    await payOrder(currentPaymentId.value)
    console.log('[Payment] 支付成功')

    alert('支付成功！')

    // 跳转到订单详情页
    if (order.value) {
      router.push(`/order/detail/${order.value.id}`)
    }
  } catch (err: unknown) {
    console.error('[Payment] 支付失败:', err)
    alert(`支付失败：${(err as Error).message || '未知错误'}`)
  } finally {
    executingPay.value = false
  }
}

// 返回上一步
const goBackStep = () => {
  step.value = 'select'
  currentPaymentId.value = null
  paymentDetail.value = null
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 组件挂载时加载数据
onMounted(() => {
  loadOrderInfo()
})
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #eee;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  font-size: 18px;
  color: #333;
  cursor: pointer;
}

.page-header h1 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.loading-state, .error-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-state i, .error-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.loading-state p, .error-state p {
  color: #999;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 10px 24px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.payment-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

/* 订单卡片 */
.order-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-header .label {
  color: #666;
  font-size: 14px;
}

.order-header .value {
  color: #333;
  font-size: 14px;
  font-weight: bold;
}

.status-badge {
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

/* 商品卡片 */
.product-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.product-card h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}

.product-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  font-size: 14px;
  color: #333;
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

/* 金额卡片 */
.amount-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.amount-card h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.amount-row .label {
  color: #666;
}

.amount-row .value {
  color: #333;
}

.amount-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
  font-weight: bold;
}

.total-value {
  font-size: 20px;
  color: #ff6b00;
}

/* 支付方式卡片 */
.payment-method-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.payment-method-card h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #ff6b00;
  background: #fff7e6;
}

.method-item.selected {
  border-color: #ff6b00;
  background: #fff7e6;
}

.method-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20px;
  color: #666;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

.method-check {
  font-size: 20px;
  color: #ff6b00;
}

/* 操作区域 */
.action-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.pay-btn {
  width: 100%;
  padding: 14px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.pay-btn:hover:not(:disabled) {
  background: #e65a00;
}

.pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 确认支付卡片 */
.pay-confirm-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.confirm-header h2 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.back-step-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.back-step-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.confirm-body {
  padding: 20px 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.status-created {
  color: #f97316;
  font-weight: bold;
}

.amount-highlight {
  margin-top: 12px;
  padding-top: 16px;
  border-top: 2px dashed #e0e0e0;
}

.pay-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b00;
}

.confirm-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.confirm-footer .pay-btn {
  width: 100%;
  padding: 14px;
  background: #ff6b00;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-footer .pay-btn:hover:not(:disabled) {
  background: #e65a00;
}

.confirm-footer .pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  border-color: #ff6b00;
  color: #ff6b00;
}

.btn-secondary {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  border-color: #ff6b00;
  color: #ff6b00;
}

.btn-primary {
  background: #ff6b00;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #e65a00;
}

@media (max-width: 600px) {
  .payment-content {
    padding: 12px;
  }

  .product-img {
    width: 60px;
    height: 60px;
  }
}
</style>
