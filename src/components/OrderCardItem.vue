<template>
  <div class="order-item">
    <div class="order-header">
      <span class="order-id">订单号: {{ order.orderNo }}</span>
      <span class="order-status" :style="{ color: getStatusColor(order.orderStatus) }">
        {{ getStatusText(order.orderStatus) }}
      </span>
    </div>

    <div v-if="order.items && order.items.length > 0">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="order-product"
        @click="$emit('view-detail', order)"
      >
        <img
          :src="getImageUrl(item.productImageUrl)"
          :alt="item.productTitle"
          class="product-img"
          @error="handleImageError"
        />
        <div class="product-info">
          <span class="product-title">{{ item.productTitle }}</span>
          <div class="product-meta">
            <span class="product-price">¥{{ (item.unitPrice || 0).toFixed(2) }} x {{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="order-product" @click="$emit('view-detail', order)">
      <div class="product-info">
        <span class="product-title">暂无商品明细（点击查看详情）</span>
      </div>
    </div>

    <div class="order-footer">
      <div class="total-price">
        合计: <strong>¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</strong>
      </div>
      <div class="order-actions">
        <template v-if="order.orderStatus === 'pending' || order.orderStatus === 'pending_payment'">
          <button class="action-btn secondary" @click.stop="$emit('cancel', order)">取消订单</button>
          <button class="action-btn primary" @click.stop="$emit('pay', order)">立即支付</button>
        </template>

        <template v-else-if="order.orderStatus === 'paid'">
          <button class="action-btn secondary" @click.stop="$emit('remind-ship', order)">提醒发货</button>
          <button class="action-btn secondary" @click.stop="$emit('view-detail', order)">查看详情</button>
        </template>

        <template v-else-if="order.orderStatus === 'shipped' || order.orderStatus === 'delivered'">
          <button class="action-btn secondary" @click.stop="$emit('check-logistics', order)">查看物流</button>
          <button class="action-btn primary" @click.stop="$emit('confirm-receipt', order)">确认收货</button>
        </template>

        <template v-else-if="order.orderStatus === 'refunding'">
          <button class="action-btn secondary" @click.stop="$emit('view-refund', order)">退款详情</button>
        </template>

        <template v-else-if="order.orderStatus === 'completed'">
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
import { ref } from 'vue'

defineProps<{
  order: any
}>()

defineEmits<{
  'view-detail': [order: any]
  'cancel': [order: any]
  'pay': [order: any]
  'remind-ship': [order: any]
  'check-logistics': [order: any]
  'confirm-receipt': [order: any] // 向上层透传包含主 ID 的订单实体
  'review': [order: any]
  'view-refund': [order: any]
}>()

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#f97316',   // 温暖橘
    paid: '#8b5cf6',      // 浪漫紫
    shipped: '#3b82f6',   // 科技蓝
    delivered: '#10b981', // 森林绿
    completed: '#22c55e', // 活力绿
    cancelled: '#9ca3af', // 灰色
    refunding: '#ef4444'  // 警示红
  }
  return colorMap[status] || '#6b7280'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '卖家已发货',
    delivered: '待收货(已送达)', // 完美应对后端 delivered 字符串
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中'
  }
  return textMap[status] || status
}

const getImageUrl = (url: string | undefined): string => {
  if (!url) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://1.117.73.156:8083'
  // 规避首尾斜杠导致的双斜杠拼接问题
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iJZljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuW9i5YOP5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
}
</script>

<style scoped>
.order-item { padding: 12px; }
.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f3f4f6; }
.order-id { font-size: 12px; color: #9ca3af; }
.order-status { font-size: 13px; font-weight: 500; }
.order-product { display: flex; gap: 12px; cursor: pointer; padding: 8px 0; }
.product-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.product-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
.product-title { font-size: 14px; color: #1f2937; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
.product-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.product-price { font-size: 15px; color: #f97316; font-weight: bold; }
.order-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #fafafa; margin: 10px -12px -12px; border-top: 1px solid #f3f4f6; }
.total-price { font-size: 13px; color: #374151; }
.total-price strong { color: #f97316; font-size: 16px; }
.order-actions { display: flex; gap: 8px; }
.action-btn { padding: 6px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 150ms; }
.action-btn.primary { background: #f97316; color: #fff; border: none; }
.action-btn.primary:hover { background: #ea580c; }
.action-btn.secondary { background: #fff; color: #374151; border: 1px solid #d1d5db; }
.action-btn.secondary:hover { border-color: #f97316; color: #f97316; }
</style>
