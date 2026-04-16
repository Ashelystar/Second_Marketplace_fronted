<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="title">购物车</span>
        </div>
        <div class="right" v-if="selectedCount > 0">
          <button class="deleteBtn" @click="deleteSelected">
            <i class="fa fa-trash-alt"></i>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 购物车为空 -->
    <div v-if="cartItems.length === 0" class="emptyState">
      <div class="emptyIcon">
        <i class="fa fa-shopping-cart"></i>
      </div>
      <p class="emptyText">购物车是空的</p>
      <p class="emptyHint">去逛逛有什么想买的</p>
      <button class="browseBtn" @click="router.push('/')">去逛逛</button>
    </div>

    <!-- 购物车列表 -->
    <div v-else class="cartList">
      <div 
        v-for="item in cartItems" 
        :key="item.id" 
        class="cartItem"
        :class="{ selected: item.selected }"
      >
        <!-- 选择框 -->
        <div class="selectWrap" @click="toggleSelect(item.id)">
          <div class="customCheckbox" :class="{ checked: item.selected }">
            <i class="fa fa-check" v-if="item.selected"></i>
          </div>
        </div>

        <!-- 商品图片 -->
        <img :src="item.image" :alt="item.title" class="itemImage" @click="goToDetail(item.id)" />

        <!-- 商品信息 -->
        <div class="itemInfo">
          <div class="itemTitle" @click="goToDetail(item.id)">{{ item.title }}</div>
          <div class="itemMeta">
            <span class="condition">{{ item.condition }}</span>
          </div>
          <div class="itemBottom">
            <span class="itemPrice">¥{{ item.price }}</span>
            <div class="quantityControl">
              <button class="qtyBtn" @click="decreaseQty(item)" :disabled="item.quantity <= 1">
                <i class="fa fa-minus"></i>
              </button>
              <span class="qtyNum">{{ item.quantity }}</span>
              <button class="qtyBtn" @click="increaseQty(item)">
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部结算栏 -->
    <div class="bottomBar" v-if="cartItems.length > 0">
      <div class="selectAllWrap" @click="toggleSelectAll">
        <div class="customCheckbox" :class="{ checked: isAllSelected }">
          <i class="fa fa-check" v-if="isAllSelected"></i>
        </div>
        <span class="selectAllText">全选</span>
      </div>
      
      <div class="totalInfo">
        <span class="totalLabel">合计：</span>
        <span class="totalPrice">¥{{ totalPrice }}</span>
      </div>
      
      <button class="settleBtn" @click="settle" :disabled="selectedCount === 0">
        结算 ({{ selectedCount }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { mockCartItems } from '@/mocks/cart'

defineOptions({ name: 'CartPage' })

const router = useRouter()
const userStore = useUserStore()

interface CartItem {
  id: number
  title: string
  price: string
  image: string
  condition: string
  quantity: number
  selected: boolean
}

const currentUserId = computed(() => Number(userStore.userInfo?.id ?? 0))
const cartItems = ref<CartItem[]>(
  mockCartItems
    .filter((item) => item.userId === currentUserId.value)
    .map((item) => ({ ...item, selected: false })),
)

const selectedCount = computed(() => cartItems.value.filter(item => item.selected).length)
const isAllSelected = computed(() => cartItems.value.length > 0 && selectedCount.value === cartItems.value.length)

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    .toFixed(2)
})

const toggleSelect = (id: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.selected = !item.selected
  }
}

const toggleSelectAll = () => {
  const newState = !isAllSelected.value
  cartItems.value.forEach(item => {
    item.selected = newState
  })
}

const increaseQty = (item: CartItem) => {
  item.quantity++
}

const decreaseQty = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
  }
}

const deleteSelected = () => {
  if (selectedCount.value === 0) {
    alert('请先选择要删除的商品')
    return
  }
  if (confirm('确定删除选中的商品吗？')) {
    cartItems.value = cartItems.value.filter(item => !item.selected)
  }
}

const goToDetail = (id: number) => {
  router.push(`/goods/${id}`)
}

const settle = () => {
  if (selectedCount.value === 0) {
    alert('请先选择要结算的商品')
    return
  }
  // 获取所有选中商品的ID
  const selectedIds = cartItems.value
    .filter(item => item.selected)
    .map(item => item.id)
  // 跳转到确认订单页面，传递商品ID列表和来源标识
  router.push({
    path: '/checkout',
    query: {
      productIds: selectedIds.join(','),
      fromCart: 'true'
    }
  })
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

/* 顶部导航 */
.top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.topInner {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 18px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

.right {
  display: flex;
  gap: 12px;
}

.deleteBtn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

/* 空状态 */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.emptyIcon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.emptyIcon i {
  font-size: 40px;
  color: #9ca3af;
}

.emptyText {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px;
}

.emptyHint {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 24px;
}

.browseBtn {
  padding: 10px 32px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

/* 购物车列表 */
.cartList {
  padding: 12px;
}

.cartItem {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}

.cartItem.selected {
  background: #fef7f0;
}

.selectWrap {
  padding-top: 24px;
  cursor: pointer;
}

.customCheckbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
}

.customCheckbox.checked {
  background: #f97316;
  border-color: #f97316;
}

.customCheckbox i {
  color: #fff;
  font-size: 12px;
}

.itemImage {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  cursor: pointer;
}

.itemInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.itemTitle {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
  cursor: pointer;
}

.itemTitle:hover {
  color: #f97316;
}

.itemMeta {
  margin-bottom: 8px;
}

.condition {
  font-size: 11px;
  color: #f97316;
  background: #fef3e6;
  padding: 2px 8px;
  border-radius: 4px;
}

.itemBottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.itemPrice {
  font-size: 16px;
  font-weight: 600;
  color: #f97316;
}

.quantityControl {
  display: flex;
  align-items: center;
  gap: 2px;
}

.qtyBtn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  font-size: 12px;
}

.qtyBtn:hover:not(:disabled) {
  border-color: #f97316;
  color: #f97316;
}

.qtyBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qtyNum {
  min-width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

/* 底部结算栏 */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 50;
}

.selectAllWrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.selectAllText {
  font-size: 14px;
  color: #374151;
}

.totalInfo {
  flex: 1;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 4px;
  margin-right: 12px;
}

.totalLabel {
  font-size: 14px;
  color: #6b7280;
}

.totalPrice {
  font-size: 20px;
  font-weight: 700;
  color: #f97316;
}

.settleBtn {
  height: 44px;
  padding: 0 24px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.settleBtn:hover:not(:disabled) {
  background: #ea580c;
}

.settleBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
