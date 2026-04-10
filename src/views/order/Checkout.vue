<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="title">确认订单</span>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="mainContent">
      <!-- 收货地址 -->
      <div class="section addressSection" @click="showAddressPicker = true">
        <div class="addressIcon">
          <i class="fa fa-map-marker-alt"></i>
        </div>
        <div class="addressInfo" v-if="selectedAddress">
          <div class="addressTop">
            <span class="receiver">{{ selectedAddress.receiver }}</span>
            <span class="phone">{{ selectedAddress.phone }}</span>
            <span class="defaultTag" v-if="selectedAddress.isDefault">默认</span>
          </div>
          <div class="addressDetail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</div>
        </div>
        <div class="addressEmpty" v-else>
          <span>请添加收货地址</span>
        </div>
        <i class="fa fa-chevron-right arrow"></i>
      </div>

      <!-- 商品信息 -->
      <div class="section productSection">
        <div class="productItem">
          <img :src="product?.image" :alt="product?.title" class="productImg" />
          <div class="productInfo">
            <div class="productTitle">{{ product?.title }}</div>
            <div class="productDesc" v-if="product?.description">{{ product?.description }}</div>
            <div class="productPrice">
              <span class="price">¥{{ product?.price }}</span>
            </div>
          </div>
          <div class="quantityControl">
            <button class="qtyBtn" @click="decreaseQty" :disabled="quantity <= 1">
              <i class="fa fa-minus"></i>
            </button>
            <span class="qtyNum">{{ quantity }}</span>
            <button class="qtyBtn" @click="increaseQty">
              <i class="fa fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 订单备注 -->
      <div class="section remarkSection">
        <div class="remarkLabel">订单备注</div>
        <input 
          type="text" 
          v-model="remark" 
          placeholder="选填，可备注特殊需求" 
          class="remarkInput"
          maxlength="100"
        />
      </div>

      <!-- 价格明细 -->
      <div class="section priceSection">
        <div class="priceRow">
          <span class="label">商品价格</span>
          <span class="value">¥{{ product?.price }}</span>
        </div>
        <div class="priceRow">
          <span class="label">数量</span>
          <span class="value">x{{ quantity }}</span>
        </div>
        <div class="priceRow">
          <span class="label">运费</span>
          <span class="value free">免运费</span>
        </div>
        <div class="priceRow total">
          <span class="label">合计</span>
          <span class="value">¥{{ totalPrice }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section paymentSection">
        <div class="sectionTitle">支付方式</div>
        <div class="paymentList">
          <div class="paymentItem" :class="{ selected: selectedPayment === 'alipay' }" @click="selectedPayment = 'alipay'">
            <i class="fa fa-mobile-alt"></i>
            <span>支付宝</span>
            <i class="fa fa-check-circle checkIcon" v-if="selectedPayment === 'alipay'"></i>
            <i class="fa fa-circle circleIcon" v-else></i>
          </div>
          <div class="paymentItem" :class="{ selected: selectedPayment === 'wechat' }" @click="selectedPayment = 'wechat'">
            <i class="fa fa-weixin"></i>
            <span>微信支付</span>
            <i class="fa fa-check-circle checkIcon" v-if="selectedPayment === 'wechat'"></i>
            <i class="fa fa-circle circleIcon" v-else></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提交栏 -->
    <div class="bottomBar">
      <div class="totalInfo">
        <span class="totalLabel">合计：</span>
        <span class="totalPrice">¥{{ totalPrice }}</span>
      </div>
      <button class="submitBtn" @click="submitOrder" :disabled="!selectedAddress">
        提交订单
      </button>
    </div>

    <!-- 地址选择弹窗 -->
    <div class="modal" v-if="showAddressPicker" @click.self="showAddressPicker = false">
      <div class="modalContent addressPicker">
        <div class="modalHeader">
          <span class="modalTitle">选择收货地址</span>
          <button class="closeBtn" @click="showAddressPicker = false">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modalBody">
          <div 
            class="addressItem" 
            v-for="addr in addressList" 
            :key="addr.id"
            :class="{ selected: selectedAddress?.id === addr.id }"
            @click="selectAddress(addr)"
          >
            <div class="addressContent">
              <div class="addressTop">
                <span class="receiver">{{ addr.receiver }}</span>
                <span class="phone">{{ addr.phone }}</span>
                <span class="defaultTag" v-if="addr.isDefault">默认</span>
              </div>
              <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
            </div>
            <i class="fa fa-check-circle checkIcon" v-if="selectedAddress?.id === addr.id"></i>
          </div>
          <button class="addAddressBtn">
            <i class="fa fa-plus"></i>
            添加新地址
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

defineOptions({ name: 'CheckoutPage' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

interface Address {
  id: number
  receiver: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

interface Product {
  id: number
  title: string
  description?: string
  price: number
  image: string
}

const product = ref<Product | null>(null)
const quantity = ref(1)
const remark = ref('')
const showAddressPicker = ref(false)

const selectedAddress = ref<Address | null>(null)
const selectedPayment = ref('alipay')

const addressList = ref<Address[]>([
  {
    id: 1,
    receiver: '张三',
    phone: '138****8888',
    province: '北京市',
    city: '朝阳区',
    district: '望京街道',
    detail: '望京SOHO大厦T3-1801',
    isDefault: true
  },
  {
    id: 2,
    receiver: '李四',
    phone: '139****6666',
    province: '上海市',
    city: '浦东新区',
    district: '陆家嘴街道',
    detail: '环球金融中心1001',
    isDefault: false
  }
])

const totalPrice = computed(() => {
  if (!product.value) return 0
  return (product.value.price * quantity.value).toFixed(2)
})

const increaseQty = () => {
  quantity.value++
}

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const selectAddress = (addr: Address) => {
  selectedAddress.value = addr
  showAddressPicker.value = false
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const submitOrder = () => {
  if (!selectedAddress.value) {
    alert('请选择收货地址')
    return
  }
  alert(`订单提交成功！\n商品：${product.value?.title}\n数量：${quantity.value}\n总价：¥${totalPrice.value}\n收货人：${selectedAddress.value.receiver}`)
  // 使用 replace 跳转，这样返回键不会回到下单页面
  router.replace('/orders')
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    alert('请先登录后再下单')
    router.push('/')
    return
  }
  // 模拟获取商品信息
  const productId = route.query.productId || 1
  product.value = {
    id: Number(productId),
    title: 'iPhone 14 Pro Max 256G 紫色 99新 无磕碰无划痕',
    description: '2024年3月购买，使用不到一年，功能完好',
    price: 6999,
    image: 'https://picsum.photos/id/1/200/200'
  }

  // 设置默认地址
  const defaultAddr = addressList.value.find(a => a.isDefault)
  selectedAddress.value = defaultAddr ?? addressList.value[0] ?? null
})
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

/* 主体内容 */
.mainContent {
  padding: 12px 16px;
}

/* 通用区块 */
.section {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
}

/* 收货地址 */
.addressSection {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.addressIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fef3e6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.addressIcon i {
  font-size: 20px;
  color: #f97316;
}

.addressInfo {
  flex: 1;
  min-width: 0;
}

.addressTop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.receiver {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.phone {
  font-size: 14px;
  color: #6b7280;
}

.defaultTag {
  font-size: 10px;
  color: #fff;
  background: #f97316;
  padding: 2px 6px;
  border-radius: 4px;
}

.addressDetail {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.addressEmpty {
  flex: 1;
  font-size: 14px;
  color: #9ca3af;
}

.arrow {
  color: #d1d5db;
  font-size: 14px;
  margin-left: 8px;
}

/* 商品信息 */
.productSection {
  padding: 16px;
}

.productItem {
  display: flex;
  gap: 12px;
}

.productImg {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.productInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.productTitle {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productDesc {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.productPrice {
  margin-top: 8px;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #f97316;
}

.quantityControl {
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: center;
}

.qtyBtn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 150ms;
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
  min-width: 32px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

/* 订单备注 */
.remarkSection {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.remarkLabel {
  font-size: 14px;
  color: #374151;
  flex-shrink: 0;
}

.remarkInput {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  background: transparent;
}

.remarkInput::placeholder {
  color: #9ca3af;
}

/* 价格明细 */
.priceSection {
  padding: 14px 16px;
}

.priceRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.priceRow .label {
  color: #6b7280;
}

.priceRow .value {
  color: #374151;
}

.priceRow .value.free {
  color: #22c55e;
}

.priceRow.total {
  border-top: 1px solid #f3f4f6;
  margin-top: 8px;
  padding-top: 14px;
}

.priceRow.total .label {
  font-weight: 600;
  color: #1f2937;
}

.priceRow.total .value {
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
}

/* 支付方式 */
.paymentSection {
  padding: 14px 16px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.paymentList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.paymentItem {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 150ms;
}

.paymentItem.selected {
  border-color: #f97316;
  background: #fef7f0;
}

.paymentItem i {
  font-size: 20px;
  margin-right: 10px;
}

.paymentItem:first-child i {
  color: #1677ff;
}

.paymentItem:last-child i {
  color: #07c160;
}

.paymentItem span {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.checkIcon {
  color: #f97316 !important;
  font-size: 18px !important;
  margin-right: 0 !important;
}

.circleIcon {
  color: #d1d5db !important;
  font-size: 18px !important;
  margin-right: 0 !important;
}

/* 底部提交栏 */
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
  justify-content: space-between;
  padding: 0 16px;
  z-index: 50;
}

.totalInfo {
  display: flex;
  align-items: baseline;
  gap: 4px;
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

.submitBtn {
  height: 44px;
  padding: 0 32px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 200ms;
}

.submitBtn:hover:not(:disabled) {
  background: #ea580c;
}

.submitBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modalContent {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 70vh;
  overflow: hidden;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.modalTitle {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.closeBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
}

.modalBody {
  padding: 16px;
  max-height: calc(70vh - 60px);
  overflow-y: auto;
}

.addressItem {
  display: flex;
  align-items: center;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.addressItem.selected {
  border-color: #f97316;
  background: #fef7f0;
}

.addressItem .addressContent {
  flex: 1;
}

.addressItem .checkIcon {
  margin-left: 10px;
}

.addAddressBtn {
  width: 100%;
  padding: 14px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  background: #fafafa;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 150ms;
}

.addAddressBtn:hover {
  border-color: #f97316;
  color: #f97316;
}
</style>
