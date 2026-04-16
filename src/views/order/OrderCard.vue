<template>
  <div class="order-item">
    <div class="order-header">
      <span class="order-id">订单号: {{ order.id }}</span>
      <span class="order-status" :style="{ color: order.statusColor }">{{ order.statusText }}</span>
    </div>
    
    <div class="order-product" @click="$emit('click-product', order)">
      <img :src="order.productImage" :alt="order.productTitle" class="product-img" />
      <div class="product-info">
        <div class="product-title">{{ order.productTitle }}</div>
        <div class="product-meta">
          <span class="product-price">¥{{ order.productPrice }}</span>
          <span class="product-count">x{{ order.productCount }}</span>
        </div>
      </div>
    </div>
    
    <div class="order-footer">
      <div class="total-price">
        共{{ order.productCount }}件商品，实付款: <strong>¥{{ order.totalPrice }}</strong>
      </div>
      <div class="order-actions">
        <button 
          v-for="action in order.actions" 
          :key="action"
          class="action-btn"
          :class="getActionClass(action)"
          @click.stop="$emit('action', action, order)"
        >
          {{ getActionText(action) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Order {
  id: number
  status: string
  statusText: string
  statusColor: string
  productImage: string
  productTitle: string
  productPrice: number
  productCount: number
  totalPrice: number
  createTime: string
  actions: string[]
}

defineProps<{ order: Order }>()
defineEmits<{ 
  action: [action: string, order: Order]
  'click-product': [order: Order]
}>()

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    pay: '去付款',
    cancel: '取消订单',
    receive: '确认收货',
    review: '去评价',
    remind: '提醒发货',
    checkLogistics: '查看物流'
  }
  return map[action] || action
}

const getActionClass = (action: string) => {
  const map: Record<string, string> = {
    pay: 'primary',
    receive: 'primary',
    review: 'primary',
    cancel: 'secondary',
    remind: 'secondary',
    checkLogistics: 'secondary'
  }
  return map[action] || 'secondary'
}
</script>

<style scoped>
.order-item {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.order-id {
  font-size: 13px;
  color: #9ca3af;
}

.order-status {
  font-size: 14px;
  font-weight: 500;
}

.order-product {
  display: flex;
  gap: 14px;
  cursor: pointer;
  transition: opacity 150ms;
}

.order-product:hover {
  opacity: 0.8;
}

.product-img {
  width: 90px;
  height: 90px;
  border-radius: 10px;
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
  line-height: 1.5;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.product-price {
  font-size: 16px;
  color: #f97316;
  font-weight: bold;
}

.product-count {
  font-size: 13px;
  color: #9ca3af;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #fafafa;
  margin: 12px -16px -16px;
}

.total-price {
  font-size: 14px;
  color: #374151;
}

.total-price strong {
  color: #f97316;
  font-size: 17px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
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
