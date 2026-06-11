<template>
  <div class="order-item">
    <div class="order-header">
      <span class="order-id">订单号: {{ order.order_no }}</span>
      <span class="order-status" :style="{ color: getStatusColor(order.order_status) }">
        {{ getStatusText(order.order_status) }}
      </span>
    </div>

    <!-- 商品列表 -->
    <div v-if="order.items && order.items.length > 0">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="order-product"
        @click="$emit('view-detail', order)"
      >
        <img 
          :src="getImageUrl(item.product_image || item.product_image_url)" 
          :alt="item.product_title" 
          class="product-img" 
          @error="handleImageError"
        />
        <div class="product-info">
          <span class="product-title">{{ item.product_title }}</span>
          <div class="product-meta">
            <span class="product-price">¥{{ item.price }} x {{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 如果没有商品项，显示占位 -->
    <div v-else class="order-product" @click="$emit('view-detail', order)">
      <div class="product-info">
        <span class="product-title">订单详情</span>
      </div>
    </div>

    <div class="order-footer">
      <div class="total-price">
        合计: <strong>¥{{ order.pay_amount || order.total_amount }}</strong>
      </div>
      <div class="order-actions">
        <!-- 根据订单状态显示不同按钮 -->
        <template v-if="order.order_status === 'pending'">
          <button class="action-btn secondary" @click.stop="$emit('cancel', order)">取消订单</button>
          <button class="action-btn primary" @click.stop="$emit('pay', order)">立即支付</button>
        </template>

        <template v-else-if="order.order_status === 'paid'">
          <button class="action-btn secondary" @click.stop="$emit('remind-ship', order)">提醒发货</button>
          <button class="action-btn secondary" @click.stop="$emit('view-detail', order)">查看详情</button>
        </template>

        <template v-else-if="order.order_status === 'shipped'">
          <button class="action-btn secondary" @click.stop="$emit('check-logistics', order)">查看物流</button>
          <button class="action-btn primary" @click.stop="$emit('confirm-receipt', order)">确认收货</button>
        </template>

        <template v-else-if="order.order_status === 'refunding'">
          <button class="action-btn secondary" @click.stop="$emit('view-refund', order)">退款详情</button>
        </template>

        <template v-else-if="order.order_status === 'completed'">
          <button class="action-btn secondary" @click.stop="$emit('view-detail', order)">查看详情</button>
          <button class="action-btn primary" @click.stop="$emit('review', order)">去评价</button>
        </template>

        <template v-else>
          <button class="action-btn secondary" @click.stop="$emit('view-detail', order)">查看详情</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TradeOrder } from '@/types'

defineProps<{
  order: TradeOrder
}>()

defineEmits<{
  'view-detail': [order: TradeOrder]
  'cancel': [order: TradeOrder]
  'pay': [order: TradeOrder]
  'remind-ship': [order: TradeOrder]
  'check-logistics': [order: TradeOrder]
  'confirm-receipt': [order: TradeOrder]
  'review': [order: TradeOrder]
  'view-refund': [order: TradeOrder]
}>()

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#f97316',
    paid: '#8b5cf6',
    shipped: '#3b82f6',
    completed: '#22c55e',
    cancelled: '#9ca3af',
    refunding: '#ef4444'
  }
  return colorMap[status] || '#6b7280'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中'
  }
  return textMap[status] || status
}

// 获取完整的图片URL
const getImageUrl = (url: string | undefined): string => {
  if (!url) return '/placeholder.png'
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则添加API基础URL前缀
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://1.117.73.156:8083'
  return `${baseUrl}${url}`
}

// 图片加载失败处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaWsOi9t+WQp+S6jOWPqueUteingueggTwvdGV4dD48L3N2Zz4='
}
</script>

<style scoped>
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
  padding: 8px 0;
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
</style>
