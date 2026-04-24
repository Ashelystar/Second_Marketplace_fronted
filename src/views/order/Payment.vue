<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <button class="backBtn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <span class="title">订单支付</span>
    </div>

    <!-- 主体内容 -->
    <div class="mainContent">
      <!-- 订单信息卡片 -->
      <div class="section">
        <div class="sectionTitle">订单信息</div>
        <div class="infoList">
          <div class="infoItem">
            <span class="infoLabel">订单编号</span>
            <span class="infoValue">{{ orderInfo.orderId || '-' }}</span>
          </div>
          <div class="infoItem" v-if="orderInfo.productNames">
            <span class="infoLabel">商品</span>
            <span class="infoValue">{{ orderInfo.productNames }}</span>
          </div>
          <div class="infoItem" v-if="orderInfo.address">
            <span class="infoLabel">收货地址</span>
            <span class="infoValue">{{ orderInfo.address }}</span>
          </div>
          <div class="infoItem" v-if="orderInfo.remark">
            <span class="infoLabel">备注</span>
            <span class="infoValue">{{ orderInfo.remark }}</span>
          </div>
        </div>
      </div>

      <!-- 支付金额 -->
      <div class="section amountSection">
        <div class="amountRow">
          <span class="amountLabel">支付金额</span>
          <span class="amountValue">¥{{ orderInfo.totalAmount || '0.00' }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section">
        <div class="sectionTitle">选择支付方式</div>
        <div class="paymentList">
          <div 
            class="paymentItem" 
            :class="{ selected: selectedPayment === 'alipay' }" 
            @click="selectedPayment = 'alipay'"
          >
            <div class="paymentIcon alipayIcon">
              <i class="fa fa-alipay"></i>
            </div>
            <div class="paymentName">支付宝</div>
            <div class="checkIcon" v-if="selectedPayment === 'alipay'">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="checkIcon uncheck" v-else>
              <i class="fa fa-circle"></i>
            </div>
          </div>

          <div 
            class="paymentItem" 
            :class="{ selected: selectedPayment === 'wechat' }" 
            @click="selectedPayment = 'wechat'"
          >
            <div class="paymentIcon wechatIcon">
              <i class="fa fa-weixin"></i>
            </div>
            <div class="paymentName">微信支付</div>
            <div class="checkIcon" v-if="selectedPayment === 'wechat'">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="checkIcon uncheck" v-else>
              <i class="fa fa-circle"></i>
            </div>
          </div>

          <div 
            class="paymentItem" 
            :class="{ selected: selectedPayment === 'wallet' }" 
            @click="selectedPayment = 'wallet'"
          >
            <div class="paymentIcon walletIcon">
              <i class="fa fa-wallet"></i>
            </div>
            <div class="paymentName">
              余额支付
              <span class="balance">(¥{{ walletBalance }})</span>
            </div>
            <div class="checkIcon" v-if="selectedPayment === 'wallet'">
              <i class="fa fa-check-circle"></i>
            </div>
            <div class="checkIcon uncheck" v-else>
              <i class="fa fa-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="securityTip">
        <i class="fa fa-shield-alt"></i>
        <span>支付安全由平台保障，请放心支付</span>
      </div>
    </div>

    <!-- 底部提交栏 -->
    <div class="bottomBar">
      <div class="totalInfo">
        <span class="totalLabel">应付金额：</span>
        <span class="totalPrice">¥{{ orderInfo.totalAmount || '0.00' }}</span>
      </div>
      <button class="payBtn" @click="handlePay" :disabled="isPaying">
        <span v-if="!isPaying">确认支付</span>
        <span v-else>支付中...</span>
      </button>
    </div>

    <!-- 支付成功弹窗 -->
    <div class="modal" v-if="showSuccessModal" @click.self="closeSuccessModal">
      <div class="modalContent">
        <div class="successIcon">
          <i class="fa fa-check-circle"></i>
        </div>
        <div class="modalTitle">支付成功</div>
        <div class="modalDesc">您的订单已支付成功</div>
        <div class="modalOrderId">订单号：{{ paidOrderId }}</div>
        <div class="modalActions">
          <button class="viewOrderBtn" @click="goToOrderDetail">查看订单</button>
          <button class="backHomeBtn" @click="goHome">返回首页</button>
        </div>
      </div>
    </div>

    <!-- 支付失败弹窗 -->
    <div class="modal" v-if="showFailModal" @click.self="closeFailModal">
      <div class="modalContent">
        <div class="failIcon">
          <i class="fa fa-times-circle"></i>
        </div>
        <div class="modalTitle">支付失败</div>
        <div class="modalDesc">{{ failMessage }}</div>
        <div class="modalActions row">
          <button class="cancelBtn" @click="goToOrders">取消</button>
          <button class="retryBtn" @click="closeFailModal">重新支付</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { payOrder } from '@/api/trade'

defineOptions({ name: 'PaymentPage' })

const router = useRouter()
const route = useRoute()

interface OrderInfo {
  orderId?: string
  productNames?: string
  address?: string
  remark?: string
  totalAmount?: string
}

const orderInfo = ref<OrderInfo>({})
const selectedPayment = ref('alipay')
const walletBalance = ref('1000.00')
const isPaying = ref(false)
const showSuccessModal = ref(false)
const showFailModal = ref(false)
const paidOrderId = ref('')
const failMessage = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const handlePay = async () => {
  if (isPaying.value) return
  
  const orderId = orderInfo.value.orderId
  if (!orderId) {
    alert('订单信息不完整')
    return
  }

  isPaying.value = true
  
  try {
    await payOrder(Number(orderId), { paymentChannel: selectedPayment.value })
    paidOrderId.value = orderId
    showSuccessModal.value = true
  } catch (error: unknown) {
    const err = error as Error
    failMessage.value = err.message || '支付失败，请稍后重试'
    showFailModal.value = true
  } finally {
    isPaying.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const closeFailModal = () => {
  showFailModal.value = false
}

const goToOrderDetail = () => {
  showSuccessModal.value = false
  router.push(`/order/order-detail/${paidOrderId.value}`)
}

const goHome = () => {
  showSuccessModal.value = false
  router.push('/')
}

const goToOrders = () => {
  showFailModal.value = false
  router.push('/user/orders')
}

onMounted(() => {
  const savedOrder = localStorage.getItem('pendingPaymentOrder')
  if (savedOrder) {
    orderInfo.value = JSON.parse(savedOrder)
    localStorage.removeItem('pendingPaymentOrder')
  }
  
  const orderId = route.params.orderId as string
  if (orderId) {
    orderInfo.value.orderId = orderId
  }
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
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 12px;
}

/* 通用区块 */
.section {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 12px;
}

.sectionTitle {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
}

/* 订单信息 */
.infoList {
  padding: 12px 16px;
}

.infoItem {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.infoLabel {
  color: #6b7280;
}

.infoValue {
  color: #374151;
  text-align: right;
  max-width: 65%;
  word-break: break-all;
}

/* 支付金额 */
.amountSection {
  padding: 16px;
}

.amountRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amountLabel {
  font-size: 14px;
  color: #6b7280;
}

.amountValue {
  font-size: 22px;
  font-weight: 700;
  color: #f97316;
}

/* 支付方式 */
.paymentList {
  padding: 12px 16px;
}

.paymentItem {
  display: flex;
  align-items: center;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 150ms;
}

.paymentItem:last-child {
  margin-bottom: 0;
}

.paymentItem.selected {
  border-color: #f97316;
  background: #fef7f0;
}

.paymentIcon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
  color: #fff;
}

.alipayIcon {
  background: #1677ff;
}

.wechatIcon {
  background: #07c160;
}

.walletIcon {
  background: #f97316;
}

.paymentName {
  flex: 1;
  font-size: 15px;
  color: #374151;
}

.balance {
  font-size: 13px;
  color: #9ca3af;
  margin-left: 4px;
}

.checkIcon {
  font-size: 20px;
  color: #f97316;
}

.checkIcon.uncheck {
  color: #d1d5db;
}

/* 安全提示 */
.securityTip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.securityTip i {
  color: #22c55e;
}

/* 底部提交栏 */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
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
  font-size: 22px;
  font-weight: 700;
  color: #f97316;
}

.payBtn {
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

.payBtn:hover:not(:disabled) {
  background: #ea580c;
}

.payBtn:disabled {
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
  align-items: center;
  justify-content: center;
}

.modalContent {
  background: #fff;
  border-radius: 16px;
  width: calc(100% - 60px);
  max-width: 320px;
  padding: 30px 24px;
  text-align: center;
}

.successIcon {
  font-size: 60px;
  color: #22c55e;
  margin-bottom: 16px;
}

.failIcon {
  font-size: 60px;
  color: #ef4444;
  margin-bottom: 16px;
}

.modalTitle {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.modalDesc {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.modalOrderId {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 24px;
}

.modalActions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modalActions.row {
  flex-direction: row;
  gap: 12px;
}

.viewOrderBtn,
.retryBtn {
  width: 100%;
  padding: 14px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.backHomeBtn,
.cancelBtn {
  width: 100%;
  padding: 14px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}
</style>
