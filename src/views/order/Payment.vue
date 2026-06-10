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

      <!-- 支付按钮 -->
      <div class="action-area">
        <button
          class="pay-btn"
          :disabled="!selectedMethod || paying"
          @click="handlePay"
        >
          <span v-if="paying">
            <i class="fa fa-spinner fa-spin"></i> 生成支付二维码...
          </span>
          <span v-else>立即支付 ¥{{ order.payAmount.toFixed(2) }}</span>
        </button>
      </div>

      <!-- 支付二维码弹窗 -->
      <div v-if="showQRCode" class="qrcode-modal" @click.self="closeQRCode">
        <div class="qrcode-content">
          <div class="qrcode-header">
            <h3>{{ getPaymentMethodName(selectedMethod) }}扫码支付</h3>
            <button class="close-btn" @click="closeQRCode">
              <i class="fa fa-times"></i>
            </button>
          </div>

          <div class="qrcode-body">
            <div class="amount-display">
              <span class="label">支付金额：</span>
              <span class="value">¥{{ order.payAmount.toFixed(2) }}</span>
            </div>

            <!-- 二维码区域 -->
            <div class="qrcode-container">
              <canvas ref="qrCodeCanvas" class="qr-code"></canvas>
            </div>

            <div class="qrcode-tips">
              <p><i class="fa fa-info-circle"></i> 请在5分钟内完成支付</p>
              <p><i class="fa fa-shield"></i> 安全支付，资金有保障</p>
            </div>
          </div>

          <div class="qrcode-footer">
            <button class="btn-secondary" @click="closeQRCode">取消支付</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail, createPayment } from '@/api/order'
import QRCode from 'qrcode'

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

const order = ref<Order | null>(null)
const loading = ref(false)
const paying = ref(false)
const error = ref('')
const selectedMethod = ref<'alipay' | 'wechat' | 'balance'>('alipay')
const showQRCode = ref(false)
const qrCodeCanvas = ref<HTMLCanvasElement | null>(null)

// 支付方式列表
const paymentMethods = [
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
    console.log('[Payment] 开始加载订单信息, orderId:', orderId)
    const result = await getOrderDetail(orderId)
    console.log('[Payment] API返回数据:', result)

    // API返回格式: { code: 200, message: "success", data: {...} }
    const orderData = (result as Record<string, unknown>)?.data || result
    order.value = orderData as Order

    // 检查订单状态
    if (order.value.orderStatus !== 'pending_payment') {
      error.value = `订单状态为"${getStatusText(order.value.orderStatus)}"，无法支付`
      setTimeout(() => {
        router.back()
      }, 2000)
    }
  } catch (err: unknown) {
    console.error('加载订单失败:', err)
    error.value = (err as Error).message || '加载订单失败'
  } finally {
    loading.value = false
  }
}

// 处理支付
const handlePay = async () => {
  if (!order.value || !selectedMethod.value) return

  paying.value = true

  try {
    console.log('[Payment] 开始创建支付单, orderId:', order.value.id, 'method:', selectedMethod.value)

    // 1. 创建支付单
    const paymentResult = await createPayment(order.value.id, {
      paymentChannel: selectedMethod.value
    })
    console.log('[Payment] 支付单创建成功:', paymentResult)

    // 获取支付单ID
    const paymentData = (paymentResult as Record<string, unknown>)?.data || paymentResult

    // API可能直接返回数字类型的支付单ID，也可能返回对象
    let paymentId = null
    if (typeof paymentResult === 'number') {
      // 直接是支付单ID数字
      paymentId = paymentResult
    } else if (typeof paymentData === 'number') {
      // data字段是数字
      paymentId = paymentData
    } else if (typeof paymentData === 'object' && paymentData !== null) {
      // data是对象，尝试获取id字段
      paymentId = (paymentData as Record<string, unknown>)?.id
    }

    if (!paymentId) {
      console.error('无法获取支付单ID，完整响应:', JSON.stringify(paymentResult, null, 2))
      throw new Error(`未获取到支付单ID，响应数据: ${JSON.stringify(paymentResult)}`)
    }

    console.log('[Payment] 支付单ID:', paymentId)

    // 2. 显示支付二维码
    showQRCode.value = true
    paying.value = false

    // 3. 生成二维码
    await nextTick()
    if (qrCodeCanvas.value) {
      try {
        const qrData = JSON.stringify({
          paymentId: paymentId,
          orderId: order.value.id,
          amount: order.value.payAmount,
          method: selectedMethod.value
        })

        await QRCode.toCanvas(qrCodeCanvas.value, qrData, {
          width: 200,
          height: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        })
        console.log('[Payment] 二维码生成成功')
      } catch (err) {
        console.error('生成二维码失败:', err)
      }
    }

  } catch (err: unknown) {
    console.error('支付失败:', err)
    alert(`支付失败：${(err as Error).message || '未知错误'}`)
    paying.value = false
  }
}

// 关闭二维码弹窗
const closeQRCode = () => {
  showQRCode.value = false
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

/* 二维码弹窗 */
.qrcode-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qrcode-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.qrcode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.qrcode-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.qrcode-body {
  padding: 24px;
}

.amount-display {
  text-align: center;
  margin-bottom: 24px;
}

.amount-display .label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.amount-display .value {
  font-size: 28px;
  font-weight: bold;
  color: #ff6b00;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-code {
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
}

.qrcode-tips {
  background: #f7f7f7;
  border-radius: 8px;
  padding: 12px;
}

.qrcode-tips p {
  font-size: 12px;
  color: #666;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.qrcode-tips p:first-child {
  margin-top: 0;
}

.qrcode-tips p:last-child {
  margin-bottom: 0;
}

.qrcode-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.qrcode-footer button {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
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
