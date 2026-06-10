<template>
  <div class="review-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>订单评价</h1>
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

    <!-- 评价表单 -->
    <div v-else-if="order" class="review-content">
      <!-- 订单信息 -->
      <div class="order-card">
        <div class="order-header">
          <span class="label">订单号：</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-for="item in order.items" :key="item.id" class="product-review-card">
        <div class="product-info">
          <img :src="item.productImageUrl || '/placeholder.png'" :alt="item.productTitle" class="product-img" />
          <div class="product-detail">
            <div class="product-title">{{ item.productTitle }}</div>
            <div class="product-meta">
              <span class="price">¥{{ item.unitPrice.toFixed(2) }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>

        <!-- 评分 -->
        <div class="rating-section">
          <div class="rating-label">整体评分</div>
          <div class="stars">
            <i
              v-for="star in 5"
              :key="star"
              :class="['fa', star <= (reviewForms[item.id]?.rating || 0) ? 'fa-star' : 'fa-star-o']"
              @click="setRating(item.id, star)"
            ></i>
          </div>
        </div>

        <!-- 评价内容 -->
        <div class="review-textarea">
          <textarea
            v-model="reviewForms[item.id].content"
            placeholder="分享您的使用体验，帮助更多人做出选择..."
            rows="4"
          ></textarea>
        </div>

        <!-- 匿名选项 -->
        <div class="anonymous-option">
          <label>
            <input type="checkbox" v-model="reviewForms[item.id].isAnonymous" />
            <span>匿名评价</span>
          </label>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-area">
        <button
          class="submit-btn"
          :disabled="submitting || !canSubmit"
          @click="submitReview"
        >
          <span v-if="submitting">
            <i class="fa fa-spinner fa-spin"></i> 提交中...
          </span>
          <span v-else>提交评价</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getOrderDetail } from '@/api/order'
import { createReview } from '@/api/review'

defineOptions({ name: 'ReviewPage' })

const router = useRouter()
const route = useRoute()

interface OrderItem {
  id: number
  productId: number
  productTitle: string
  productImageUrl?: string
  unitPrice: number
  quantity: number
}

interface Order {
  id: number
  orderNo: string
  orderStatus: string
  items: OrderItem[]
}

interface ReviewForm {
  rating: number
  content: string
  isAnonymous: boolean
}

const order = ref<Order | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const reviewForms = ref<Record<number, ReviewForm>>({})

// 是否可以提交
const canSubmit = computed(() => {
  if (!order.value) return false
  return order.value.items.every(item => {
    const form = reviewForms.value[item.id]
    return form && form.rating > 0
  })
})

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
    console.log('[Review] 开始加载订单信息, orderId:', orderId)
    const result = await getOrderDetail(orderId)
    console.log('[Review] API返回数据:', result)

    // API返回格式: { code: 200, message: "success", data: {...} }
    const orderData = (result as Record<string, unknown>)?.data || result
    order.value = orderData as Order

    // 检查订单状态
    if (!['delivered', 'completed'].includes(order.value.orderStatus)) {
      error.value = '当前订单状态不允许评价'
      setTimeout(() => {
        router.back()
      }, 2000)
      return
    }

    // 初始化评价表单
    order.value.items.forEach(item => {
      reviewForms.value[item.id] = {
        rating: 0,
        content: '',
        isAnonymous: false
      }
    })
  } catch (err: unknown) {
    console.error('加载订单失败:', err)
    error.value = (err as Error).message || '加载订单失败'
  } finally {
    loading.value = false
  }
}

// 设置评分
const setRating = (itemId: number, rating: number) => {
  if (reviewForms.value[itemId]) {
    reviewForms.value[itemId].rating = rating
  }
}

// 提交评价
const submitReview = async () => {
  if (!order.value || !canSubmit.value) return

  submitting.value = true

  try {
    // 遍历所有商品项，逐个提交评价
    for (const item of order.value.items) {
      const form = reviewForms.value[item.id]
      if (!form || form.rating === 0) continue

      console.log('[Review] 提交评价, itemId:', item.id, 'rating:', form.rating)

      await createReview({
        orderId: order.value.id,
        orderItemId: item.id,
        rating: form.rating,
        content: form.content || undefined,
        isAnonymous: form.isAnonymous
      })
    }

    alert('评价提交成功！')
    router.push(`/order/detail/${order.value.id}`)
  } catch (err: unknown) {
    console.error('提交评价失败:', err)
    alert(`提交评价失败：${(err as Error).message || '未知错误'}`)
  } finally {
    submitting.value = false
  }
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
.review-page {
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

.review-content {
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

/* 商品评价卡片 */
.product-review-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.product-info {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}

.product-detail {
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

/* 评分区域 */
.rating-section {
  padding: 16px 0;
}

.rating-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  gap: 8px;
}

.stars i {
  font-size: 28px;
  color: #ff6b00;
  cursor: pointer;
  transition: all 0.2s;
}

.stars i.fa-star-o {
  color: #ddd;
}

.stars i:hover {
  transform: scale(1.1);
}

/* 评价文本框 */
.review-textarea {
  margin-top: 12px;
}

.review-textarea textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.review-textarea textarea:focus {
  outline: none;
  border-color: #ff6b00;
}

/* 匿名选项 */
.anonymous-option {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.anonymous-option label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.anonymous-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 提交区域 */
.submit-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  background: #e65a00;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .review-content {
    padding: 12px;
  }

  .product-img {
    width: 60px;
    height: 60px;
  }
}
</style>
