<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <button class="backBtn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <span class="title">确认订单</span>
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
            <span class="phone">{{ formatPhone(selectedAddress.phone) }}</span>
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
        <div
          class="productItem"
          v-for="(item, index) in products"
          :key="item.id"
        >
          <img :src="item.image" :alt="item.title" class="productImg" />
          <div class="productInfo">
            <div class="productTitle">{{ item.title }}</div>
            <div class="productDesc" v-if="item.description">{{ item.description }}</div>
            <div class="productPrice">
              <span class="price">¥{{ formatPrice(item.price) }}</span>
            </div>
          </div>
          <div class="quantityControl">
            <button class="qtyBtn" @click="decreaseQty(index)" :disabled="item.quantity <= 1">
              <i class="fa fa-minus"></i>
            </button>
            <span class="qtyNum">{{ item.quantity }}</span>
            <button class="qtyBtn" @click="increaseQty(index)">
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
          <span class="value">¥{{ goodsPrice }}</span>
        </div>
        <div class="priceRow">
          <span class="label">数量</span>
          <span class="value">x{{ totalQuantity }}</span>
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
      <div class="buttonGroup">
        <button class="cartBtn" @click="addToCart" v-if="!fromCart">
          <i class="fa fa-cart-plus"></i>
          加入购物车
        </button>
        <button class="submitBtn" @click="submitOrder" :disabled="!selectedAddress">
          提交订单
        </button>
      </div>
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
                <span class="phone">{{ formatPhone(addr.phone) }}</span>
                <span class="defaultTag" v-if="addr.isDefault">默认</span>
              </div>
              <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
            </div>
            <i class="fa fa-check-circle checkIcon" v-if="selectedAddress?.id === addr.id"></i>
          </div>
          <button class="addAddressBtn" @click="goToAddAddress">
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
import { getProductDetail } from '@/api/goods'
import { createOrder, type CreateOrderRequest } from '@/api/order'
import { PLACEHOLDER_IMG } from '@/utils/image'

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

interface CartProduct {
  id: number
  title: string
  description?: string
  price: number
  image: string
  quantity: number
  sellerId?: number
  tradeMode?: string
  freightAmount?: number
  pickupLocation?: string
}

const products = ref<CartProduct[]>([])
const remark = ref('')
const showAddressPicker = ref(false)
const fromCart = ref(false)
const loading = ref(false) // 添加loading状态

const selectedAddress = ref<Address | null>(null)
const selectedPayment = ref('alipay')

// 手机号脱敏处理
const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 价格格式化（保留两位小数）
const formatPrice = (price: number | undefined): string => {
  const value = Number(price) || 0
  return value.toFixed(2)
}

const addressList = ref<Address[]>([
  {
    id: 1,
    receiver: '张三',
    phone: '13800138888', // 使用真实格式的手机号
    province: '北京市',
    city: '朝阳区',
    district: '望京街道',
    detail: '望京SOHO大厦T3-1801',
    isDefault: true
  },
  {
    id: 2,
    receiver: '李四',
    phone: '13900136666', // 使用真实格式的手机号
    province: '上海市',
    city: '浦东新区',
    district: '陆家嘴街道',
    detail: '环球金融中心1001',
    isDefault: false
  }
])

// 商品总数量
const totalQuantity = computed(() => {
  return products.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// 总价（确保价格有效）
const totalPrice = computed(() => {
  const total = products.value
    .reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = item.quantity || 1
      return sum + price * quantity
    }, 0)
  console.log('[Checkout] 计算总价 - products:', products.value, 'total:', total.toFixed(2))
  return total.toFixed(2)
})

// 商品总价（不含运费）
const goodsPrice = computed(() => {
  const total = products.value
    .reduce((sum, item) => {
      const price = Number(item.price) || 0
      const quantity = item.quantity || 1
      return sum + price * quantity
    }, 0)
  return total.toFixed(2)
})

const increaseQty = (index: number) => {
  const item = products.value[index]
  if (item) {
    item.quantity++
  }
}

const decreaseQty = (index: number) => {
  const item = products.value[index]
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

const selectAddress = (addr: Address) => {
  selectedAddress.value = addr
  showAddressPicker.value = false
}

import { useSmartBack } from '@/composables/useSmartBack'
const { goBack } = useSmartBack('/')

// 提交订单 - 调用真实API
const submitOrder = async () => {
  // 验证必填项
  if (!selectedAddress.value) {
    alert('请选择收货地址')
    return
  }

  if (products.value.length === 0) {
    alert('商品信息异常')
    return
  }

  const product = products.value[0]

  // 确定交易方式：如果有自提地点则是pickup，否则是shipping
  const tradeMode: 'pickup' | 'shipping' = product.pickupLocation ? 'pickup' : 'shipping'

  // 构建符合API要求的订单数据
  const orderData: CreateOrderRequest = {
    sellerId: product.sellerId || 1,
    tradeMode: tradeMode,
    freightAmount: product.freightAmount || 0,
    remark: remark.value || '',
    pickupLocation: tradeMode === 'pickup' ? (product.pickupLocation || '') : undefined,
    receiverName: tradeMode === 'shipping' ? selectedAddress.value.receiver : undefined,
    receiverPhone: tradeMode === 'shipping' ? selectedAddress.value.phone : undefined,
    receiverAddress: tradeMode === 'shipping'
      ? `${selectedAddress.value.province}${selectedAddress.value.city}${selectedAddress.value.district}${selectedAddress.value.detail}`
      : undefined,
    items: [
      {
        productId: product.id,
        quantity: product.quantity
      }
    ]
  }

  console.log('[Checkout] 创建订单数据:', JSON.stringify(orderData, null, 2))

  try {
    loading.value = true

    // 调用API创建订单
    console.log('[Checkout] 开始调用createOrder API...')
    const result = await createOrder(orderData)
    console.log('[Checkout] 订单创建成功，响应:', result)
    console.log('[Checkout] 响应类型:', typeof result, '是否为数组:', Array.isArray(result))

    // API返回格式可能是：
    // 1. 直接返回订单ID数字: 941228
    // 2. 返回对象: { id: xxx } 或 { orderId: xxx }
    let orderId = null

    if (typeof result === 'number') {
      // 直接是订单ID数字
      orderId = result
    } else if (typeof result === 'object' && result !== null) {
      // 尝试多种可能的字段名
      orderId = (result as Record<string, unknown>).id ||
                (result as Record<string, unknown>).orderId ||
                (result as Record<string, unknown>).data?.id ||
                (result as Record<string, unknown>).data?.orderId
    }

    if (!orderId) {
      console.error('无法获取订单ID，完整响应:', JSON.stringify(result, null, 2))
      throw new Error(`未获取到订单ID，响应数据: ${JSON.stringify(result)}`)
    }

    alert('订单创建成功！')

    // 跳转到订单详情页（包含物流信息）
    router.push(`/order/detail/${orderId}`)
  } catch (error: unknown) {
    console.error('创建订单失败:', error)

    // 提取错误信息
    let errorMsg = '未知错误'
    if (error instanceof Error) {
      errorMsg = error.message
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        orderData: orderData
      })
    }

    // 显示更详细的错误信息
    alert(`创建订单失败：${errorMsg}\n\n请检查：\n1. 是否已登录\n2. 商品信息是否正确\n3. 收货地址是否完整`)

    // 返回上一页（商品详情页）
    router.back()
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (products.value.length === 0) {
    alert('商品信息异常')
    return
  }

  const product = products.value[0]

  // 导入购物车工具函数
  import('@/utils/cart').then(({ addToCart: addItemToCart }) => {
    addItemToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      condition: '未知'
    })

    alert('已加入购物车')
    // 返回上一页（商品详情页）
    router.back()
  }).catch(err => {
    console.error('加入购物车失败:', err)
    alert('操作失败，请重试')
  })
}

const goToAddAddress = () => {
  // 跳转到新建地址页面，带上返回参数
  router.push('/address/edit?from=checkout')
}

// 加载商品详情 - 从路由参数获取商品ID并调用真实API
const loadProduct = async (productId: number) => {
  try {
    console.log('[Checkout] 开始加载商品详情, productId:', productId)
    const productData = await getProductDetail(productId)
    console.log('[Checkout] API返回的商品数据:', productData)

    // 处理图片：优先使用 image 字段，否则从 images 数组中提取第一张
    let imageUrl = productData.image || ''
    if (!imageUrl && Array.isArray(productData.images) && productData.images.length > 0) {
      const firstImage = productData.images[0]
      // 兼容多种图片格式：{ imageUrl }, { url }, string
      if (typeof firstImage === 'string') {
        imageUrl = firstImage
      } else if (firstImage && typeof firstImage === 'object') {
        const imgObj = firstImage as Record<string, unknown>
        imageUrl = (imgObj.imageUrl as string) || (imgObj.url as string) || ''
      }
    }
    console.log('[Checkout] 最终使用的图片URL:', imageUrl)

    // 处理价格：API 返回 sellingPrice(number) 或 price(string)
    const priceValue = productData.sellingPrice ?? Number(productData.price) ?? 0
    console.log('[Checkout] 最终使用的价格:', priceValue)

    // API字段映射为前端格式
    products.value = [{
      id: productData.id,
      title: productData.title,
      description: productData.description || '',
      price: priceValue,
      image: imageUrl || PLACEHOLDER_IMG,
      quantity: 1,
      sellerId: productData.sellerId,
      tradeMode: productData.tradeMode || 'shipping',
      freightAmount: productData.freight || 0,
      pickupLocation: productData.pickupAddress || ''
    }]
    console.log('[Checkout] 商品信息加载成功:', products.value[0])
  } catch (error) {
    console.error('加载商品详情失败:', error)
    alert('商品信息加载失败，请返回重试')
    router.back()
  }
}

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    alert('请先登录后再下单')
    router.push('/user/login')
    return
  }

  // 处理从地址页面返回的选中地址
  const savedAddress = localStorage.getItem('selectedAddress')
  if (savedAddress) {
    const addr = JSON.parse(savedAddress)
    selectedAddress.value = addr
    // 更新地址列表中的选中状态
    const existAddr = addressList.value.find(a => a.id === addr.id)
    if (!existAddr) {
      // 如果是新添加的地址，添加到列表中
      addressList.value.push(addr)
    }
    localStorage.removeItem('selectedAddress')
  }

  // 检查是否来自购物车
  const productIdsStr = route.query.productIds as string
  fromCart.value = route.query.fromCart === 'true'

  if (productIdsStr) {
    // 从购物车来的情况，传递了多个商品
    // TODO: 待实现购物车结算功能，目前暂不支持多商品结算
    alert('暂不支持多商品结算，请单独购买')
    router.back()
    return
  } else {
    // 单独购买的情况 - 从商品详情页跳转过来
    const productId = route.query.productId ? Number(route.query.productId) : null
    if (!productId) {
      alert('商品信息异常，请返回后重试')
      router.back()
      return
    }
    // 加载真实商品信息
    loadProduct(productId)
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
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.productItem:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
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

.buttonGroup {
  display: flex;
  gap: 10px;
}

.cartBtn {
  height: 44px;
  padding: 0 18px;
  background: #fff;
  color: #f97316;
  border: 1px solid #f97316;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms;
}

.cartBtn:hover {
  background: #fef3e6;
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
