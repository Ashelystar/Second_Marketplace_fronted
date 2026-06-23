<template>
  <div class="orders-container">
    <!-- 买家/卖家角色切换 -->
    <div class="role-switch-bar">
      <button
        :class="['role-tab', { active: currentRole === 'buyer' }]"
        @click="switchRole('buyer')"
      >
        <i class="fa fa-shopping-cart"></i> 我买到的
      </button>
      <button
        :class="['role-tab', { active: currentRole === 'seller' }]"
        @click="switchRole('seller')"
      >
        <i class="fa fa-store"></i> 我卖出的
      </button>
    </div>

    <!-- ========== 买家视图 ========== -->
    <template v-if="currentRole === 'buyer'">
      <div class="statsBar">
        <div class="statCard">
          <div class="statValue">¥{{ (orderStats.totalSpent || 0).toFixed(2) }}</div>
          <div class="statLabel">累计消费</div>
        </div>
        <div class="statCard">
          <div class="statValue">{{ orderStats.totalOrders || 0 }}</div>
          <div class="statLabel">交易笔数</div>
        </div>
        <div class="statCard">
          <div class="statValue">{{ (orderStats.averageRating || 0).toFixed(1) }}/5</div>
          <div class="statLabel">平均评分</div>
        </div>
      </div>

      <div class="filterBar">
        <div class="filterTabs">
          <button
            v-for="tab in orderTabs"
            :key="tab.id"
            class="filterTab"
            :class="{ active: orderTab === tab.id }"
            @click="orderTab = tab.id; currentPage = 1"
          >
            {{ tab.name }}
            <span class="count" v-if="getTabCount(tab.id) > 0">{{ getTabCount(tab.id) }}</span>
          </button>
        </div>
      </div>

      <div class="orderList">
        <div v-if="loading" class="loading-state">
          <i class="fa fa-spinner fa-spin"></i>
          <p>正在努力为您拉取订单记录...</p>
        </div>

        <template v-else>
          <div v-if="filteredOrders.length === 0" class="empty-state">
            <i class="fa" :class="getTabIcon(orderTab)"></i>
            <p>当前分类下暂无相关订单记录</p>
            <button class="btnPrimary" @click="router.push('/')">去商城逛逛</button>
          </div>

          <div
            v-else
            v-for="order in pagedOrders"
            :key="order.id"
            class="orderCard"
          >
            <div class="card-header">
              <span class="order-no-text">订单号: <strong>{{ order.orderNo }}</strong></span>
              <span class="status-tag" :style="{ color: getStatusColor(order.orderStatus) }">
                {{ getStatusText(order.orderStatus) }}
              </span>
            </div>

            <div class="products-wrapper">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="product-item-row"
                @click="viewOrderDetail(order)"
                title="点击查看订单详情"
              >
                <img
                  :src="getImageUrl(item.productImageUrl)"
                  :alt="item.productTitle"
                  class="product-img"
                  @error="handleImageError"
                />
                <div class="product-info-col">
                  <h4 class="product-title">{{ item.productTitle || '未命名商品' }}</h4>
                  <div class="product-badges" v-if="order.tradeMode">
                    <span class="badge">{{ order.tradeMode === 'pickup' ? '到店自提' : '寄送上门' }}</span>
                  </div>
                </div>
                <div class="product-price-col">
                  <span class="price-text">¥{{ (item.unitPrice || 0).toFixed(2) }}</span>
                  <span class="quantity-text">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="total-price-summary">
                共 <strong>{{ getOrderTotalQuantity(order) }}</strong> 件商品，实付款:
                <span class="money-accent">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span>
              </div>

              <div class="order-actions-group">
                <template v-if="order.orderStatus === 'pending'">
                  <button class="action-btn secondary" @click.stop="cancelOrder(order)">取消订单</button>
                  <button class="action-btn primary" @click.stop="payOrder(order)">立即支付</button>
                </template>

                <template v-else-if="order.orderStatus === 'paid'">
                  <button class="action-btn secondary" @click.stop="remindShip(order)">提醒发货</button>
                  <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
                </template>

                <template v-else-if="order.orderStatus === 'shipped' || order.orderStatus === 'delivered'">
                  <button class="action-btn secondary" @click.stop="checkLogistics(order)">查看物流</button>
                  <button class="action-btn primary" @click.stop="confirmReceipt(order)">确认收货</button>
                </template>

                <template v-else-if="order.orderStatus === 'refunding'">
                  <button class="action-btn secondary" @click.stop="viewRefundDetail(order)">退款详情</button>
                </template>

                <template v-else-if="order.orderStatus === 'completed'">
                  <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
                  <button class="action-btn primary" @click.stop="reviewOrder(order)">去评价</button>
                </template>

                <template v-else>
                  <button class="action-btn secondary" @click.stop="viewOrderDetail(order)">查看详情</button>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 买家分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <i class="fa fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页（共 {{ filteredOrders.length }} 条）</span>
        <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          下一页 <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    </template>

    <!-- ========== 卖家视图 ========== -->
    <template v-else>
      <!-- 卖家状态筛选标签 -->
      <div class="seller-status-tabs">
        <button
          v-for="tab in sellerStatusTabs"
          :key="tab.value"
          :class="['seller-tab-btn', { active: sellerStatus === tab.value }]"
          @click="sellerStatus = tab.value; sellerCurrentPage = 1; fetchSellerOrders()"
        >
          {{ tab.label }}
          <span v-if="tab.value" class="seller-tab-count">{{ getSellerStatusCount(tab.value) }}</span>
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="sellerLoading" class="loading-state">
        <i class="fa fa-spinner fa-spin"></i>
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="sellerOrders.length === 0" class="empty-state">
        <i class="fa fa-inbox"></i>
        <p>{{ sellerStatus ? '暂无该状态的订单' : '暂无卖家订单' }}</p>
      </div>

      <!-- 卖家订单列表 -->
      <div v-else class="seller-order-list">
        <div v-for="order in sellerPagedOrders" :key="order.id" class="seller-order-card">
          <!-- 订单头部 -->
          <div class="seller-card-header">
            <span class="seller-order-no">订单号：{{ order.orderNo }}</span>
            <span :class="['seller-status-tag', getSellerStatusClass(order.status)]">
              {{ getSellerStatusText(order.status) }}
            </span>
          </div>

          <!-- 买家信息 -->
          <div class="seller-buyer-row">
            <div class="seller-buyer-avatar">
              <img
                :src="getImageUrl(order.buyerAvatar)"
                alt="买家头像"
                @error="handleImageError"
              />
            </div>
            <div class="seller-buyer-info">
              <span class="seller-buyer-name">{{ order.buyerName || '匿名用户' }}</span>
              <span class="seller-order-time">{{ formatDate(order.createTime) }}</span>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="seller-items-wrap">
            <div v-for="item in order.items" :key="item.productId" class="seller-item-row">
              <img
                :src="getImageUrl(item.productImage)"
                :alt="item.productTitle"
                class="seller-product-img"
                @error="handleImageError"
              />
              <div class="seller-product-info">
                <h3 class="seller-product-title">{{ item.productTitle }}</h3>
                <div class="seller-product-meta">
                  <span class="seller-price">¥{{ formatPrice(item.price) }}</span>
                  <span class="seller-quantity">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 交易信息 -->
          <div class="seller-trade-info">
            <div class="seller-info-row">
              <span class="seller-label">交易方式：</span>
              <span>{{ order.tradeMode === 'shipping' ? '快递配送' : '自提' }}</span>
            </div>
            <div v-if="order.tradeMode === 'shipping' && order.receiverAddress" class="seller-info-row">
              <span class="seller-label">收货地址：</span>
              <span>{{ order.receiverAddress }}</span>
            </div>
            <div v-if="order.tradeMode === 'pickup' && order.pickupLocation" class="seller-info-row">
              <span class="seller-label">自提地点：</span>
              <span>{{ order.pickupLocation }}</span>
            </div>
            <div class="seller-info-row seller-total-row">
              <span class="seller-label">订单金额：</span>
              <span class="seller-amount">¥{{ formatPrice(order.totalAmount) }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="seller-card-footer">
            <span class="seller-footer-time">{{ formatDate(order.createTime) }}</span>
            <div class="seller-actions">
              <!-- 待发货 -->
              <button
                v-if="order.status === 'paid'"
                class="seller-btn-ship"
                @click="handleSellerShip(order)"
              >
                去发货
              </button>

              <!-- 已发货 -->
              <button
                v-if="order.status === 'shipped'"
                class="seller-btn-trace"
                @click="viewSellerTrace(order)"
              >
                查看物流
              </button>

              <!-- 已完成 -->
              <button
                v-if="order.status === 'completed'"
                class="seller-btn-detail"
                @click="viewSellerDetail(order)"
              >
                查看详情
              </button>

              <!-- 已取消 -->
              <button
                v-if="order.status === 'cancelled'"
                class="seller-btn-detail"
                @click="viewSellerDetail(order)"
              >
                查看详情
              </button>

              <!-- 通用：查看详情 -->
              <button
                class="seller-btn-detail-secondary"
                @click="viewSellerDetail(order)"
              >
                详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 卖家分页 -->
      <div v-if="sellerTotalPages > 1" class="pagination">
        <button class="page-btn" :disabled="sellerCurrentPage <= 1" @click="sellerCurrentPage--; fetchSellerOrders()">
          <i class="fa fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 {{ sellerCurrentPage }} / {{ sellerTotalPages }} 页</span>
        <button class="page-btn" :disabled="sellerCurrentPage >= sellerTotalPages" @click="sellerCurrentPage++; fetchSellerOrders()">
          下一页 <i class="fa fa-chevron-right"></i>
        </button>
      </div>

      <!-- 发货弹窗 -->
      <div v-if="showShipModal" class="modal-overlay" @click.self="showShipModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h2>发货信息</h2>
            <button class="close-btn" @click="showShipModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>物流公司 <span class="required">*</span></label>
              <select v-model="shipForm.logisticsCompany">
                <option value="">请选择物流公司</option>
                <option value="顺丰速运">顺丰速运</option>
                <option value="中通快递">中通快递</option>
                <option value="圆通速递">圆通速递</option>
                <option value="韵达快递">韵达快递</option>
                <option value="申通快递">申通快递</option>
                <option value="京东物流">京东物流</option>
                <option value="EMS">EMS</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>快递单号 <span class="required">*</span></label>
              <input
                v-model="shipForm.trackingNo"
                type="text"
                placeholder="请输入快递单号"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showShipModal = false">取消</button>
            <button
              class="btn-confirm"
              :disabled="!shipForm.logisticsCompany || !shipForm.trackingNo || sellerSubmitting"
              @click="confirmSellerShip"
            >
              <span v-if="sellerSubmitting">
                <i class="fa fa-spinner fa-spin"></i> 提交中...
              </span>
              <span v-else>确认发货</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { getImageUrl } from '@/utils/image'
import { createShipment } from '@/api/order'
import { listOrders } from '@/api/trade'

defineOptions({ name: 'UserOrders' })

const router = useRouter()
const orderStore = useOrderStore()

// ==================== 角色切换 ====================
const currentRole = ref<'buyer' | 'seller'>('buyer')

const switchRole = (role: 'buyer' | 'seller') => {
  currentRole.value = role
  if (role === 'buyer') {
    orderStore.loadOrders()
  } else {
    fetchSellerOrders()
  }
}

// ==================== 买家视图相关 ====================
const orderTab = ref('all')
const currentPage = ref(1)
const PAGE_SIZE = 5

const orderTabs = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待付款' },
  { id: 'paid', name: '待发货' },
  { id: 'shipped', name: '待收货' },
  { id: 'refunding', name: '退款中' },
  { id: 'completed', name: '待评价' }
]

const filteredOrders = computed(() => {
  const allList = orderStore.orders || []
  switch (orderTab.value) {
    case 'pending':
      return allList.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'pending_payment')
    case 'paid':
      return allList.filter(o => o.orderStatus === 'paid')
    case 'shipped':
      return allList.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'delivered')
    case 'refunding':
      return allList.filter(o => o.orderStatus === 'refunding')
    case 'completed':
      return allList.filter(o => o.orderStatus === 'completed')
    default:
      return allList
  }
})

const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredOrders.value.slice(start, start + PAGE_SIZE)
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredOrders.value.length / PAGE_SIZE))
})

const getTabCount = (tabId: string) => {
  const allList = orderStore.orders || []
  if (tabId === 'all') return allList.length
  if (tabId === 'pending') return allList.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'pending_payment').length
  if (tabId === 'shipped') return allList.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'delivered').length
  return allList.filter(o => o.orderStatus === tabId).length
}

const loading = computed(() => orderStore.loading)
const orderStats = computed(() => orderStore.stats)

const getTabIcon = (tabId: string) => {
  const iconMap: Record<string, string> = {
    all: 'fa-inbox',
    pending: 'fa-clock-o',
    paid: 'fa-box',
    shipped: 'fa-truck',
    refunding: 'fa-refresh',
    completed: 'fa-star-o'
  }
  return iconMap[tabId] || 'fa-inbox'
}

const getOrderTotalQuantity = (order: any) => {
  if (!order.items) return 0
  return order.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
}

/* --- 买家交互行为 --- */
const payOrder = async (order: any) => {
  router.push(`/order/payment/${order.id}`)
}

const cancelOrder = async (order: any) => {
  if (confirm('确定要取消该订单吗？')) {
    try {
      await orderStore.cancel(order.id, '买家临时不需要了')
      alert('订单已成功取消')
    } catch (error) {
      console.error('取消订单失败:', error)
      alert('取消订单失败，请重试')
    }
  }
}

const remindShip = async (order: any) => {
  try {
    await orderStore.remindShip(order.id)
    alert(`已为您加速催办！\n当前订单号: ${order.orderNo}`)
  } catch (error) {
    console.error('提醒发货失败:', error)
  }
}

const checkLogistics = (order: any) => {
  const deliveryMode = order.tradeMode === 'shipping' ? '快递配送' : '线下自提'
  alert(`【物流干线追踪】\n订单单号: ${order.orderNo}\n运单单号: ${order.shippingNo || '无需物流/暂未分配'}\n履约方式: ${deliveryMode}`)
}

const confirmReceipt = async (order: any) => {
  if (confirm('您是否确定已收到包裹？确认后钱款将解冻至卖家账户。')) {
    try {
      await orderStore.confirmReceipt(order.id)
      alert('签收成功，去给商品写个好评吧！')
    } catch (error) {
      console.error('确认收货失败:', error)
      alert('操作失败，请重试')
    }
  }
}

const reviewOrder = (order: any) => {
  router.push(`/order/review/${order.id}`)
}

const viewOrderDetail = (order: any) => {
  router.push({ path: `/order/detail/${order.id}` })
}

const viewRefundDetail = (order: any) => {
  alert(`【售后退款信息】\n订单单号: ${order.orderNo}\n原路退回金额: ¥${(order.payAmount || 0).toFixed(2)}\n退款进度: 商家处理中`)
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#f97316',
    paid: '#8b5cf6',
    shipped: '#2563eb',
    delivered: '#10b981',
    completed: '#10b981',
    cancelled: '#9ca3af',
    refunding: '#ef4444'
  }
  return colorMap[status] || '#6b7280'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '卖家已发货',
    delivered: '待收货 (已送达)',
    completed: '交易完成',
    cancelled: '已取消',
    refunding: '退款中'
  }
  return textMap[status] || status
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5b2i5YOP5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
}

// ==================== 卖家视图相关 ====================
interface SellerOrderItem {
  productId: number
  productTitle: string
  productDesc?: string
  productImage?: string
  price: number
  quantity: number
}

interface SellerOrder {
  id: number
  orderNo: string
  status: string
  tradeMode: 'shipping' | 'pickup'
  freightAmount: number
  totalAmount: number
  pickupLocation?: string
  receiverAddress?: string
  receiverName?: string
  receiverPhone?: string
  buyerName?: string
  buyerAvatar?: string
  createTime: string
  items: SellerOrderItem[]
}

const sellerOrders = ref<SellerOrder[]>([])
const sellerLoading = ref(false)
const sellerStatus = ref('')
const sellerCurrentPage = ref(1)
const sellerPageSize = 10
const sellerTotalPages = ref(1)

const sellerStatusTabs = [
  { label: '全部', value: '' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const sellerPagedOrders = computed(() => {
  return sellerOrders.value
})

// 发货弹窗
const showShipModal = ref(false)
const sellerSubmitting = ref(false)
const currentShipOrder = ref<SellerOrder | null>(null)
const shipForm = ref({ logisticsCompany: '', trackingNo: '' })

const getSellerStatusCount = (status: string): number => {
  return sellerOrders.value.filter(o => o.status === status).length
}

const fetchSellerOrders = async () => {
  try {
    sellerLoading.value = true
    console.log('[UserOrders-Seller] 请求卖家订单, status:', sellerStatus.value)

    // 使用与买家相同的 listOrders API（返回 PageResult<TradeOrder>）
    const result = await listOrders({
      role: 'seller',
      status: sellerStatus.value || undefined,
      page: sellerCurrentPage.value,
      pageSize: sellerPageSize
    })
    console.log('[UserOrders-Seller] API返回数据:', result)

    const orderList = result.list || []
    sellerTotalPages.value = Math.max(1, Math.ceil(result.total / sellerPageSize))

    if (orderList.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sellerOrders.value = orderList.map((order: any) => {
        // 后端 OrderItemVO 字段：unitPrice, productImageUrl, quantity, productTitle
        const rawItems = order.items || []
        const mappedItems: SellerOrderItem[] = rawItems.map((item: any) => ({
          productId: item.productId as number,
          productTitle: item.productTitle as string,
          productDesc: item.productDesc as string | undefined,
          productImage: (item.productImageUrl as string) || (item.productImage as string),
          price: Number(item.unitPrice) || Number(item.price) || 0,
          quantity: Number(item.quantity) || 0
        }))
        return {
          id: order.id as number,
          orderNo: (order.orderNo as string) || `ORD${order.id}`,
          status: (order.orderStatus as string) || (order.status as string),
          tradeMode: (order.tradeMode as 'shipping' | 'pickup') || 'shipping',
          freightAmount: Number(order.freightAmount) || 0,
          totalAmount: Number(order.totalAmount) || Number(order.payAmount) || 0,
          pickupLocation: order.pickupLocation as string | undefined,
          receiverAddress: order.receiverAddress as string | undefined,
          receiverName: order.receiverName as string | undefined,
          receiverPhone: order.receiverPhone as string | undefined,
          buyerName: order.buyerName as string | undefined,
          buyerAvatar: order.buyerAvatar as string | undefined,
          createTime: (order.createdAt as string) || (order.createTime as string) || '',
          items: mappedItems
        }
      })
    } else {
      sellerOrders.value = []
    }
  } catch (error) {
    console.error('[UserOrders-Seller] 获取卖家订单失败:', error)
    alert('加载订单失败，请重试')
  } finally {
    sellerLoading.value = false
  }
}

const formatPrice = (price: number): string => {
  return Number(price).toFixed(2)
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}



const getSellerStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending_payment: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getSellerStatusClass = (status: string): string => {
  const classMap: Record<string, string> = {
    pending_payment: 'seller-status-pending',
    paid: 'seller-status-paid',
    shipped: 'seller-status-shipped',
    completed: 'seller-status-completed',
    cancelled: 'seller-status-cancelled'
  }
  return classMap[status] || ''
}

const handleSellerShip = (order: SellerOrder) => {
  if (order.tradeMode === 'pickup') {
    if (!confirm('确认生成自提取货码？买家可凭取货码自提商品。')) return
    submitPickupShipment(order)
    return
  }
  currentShipOrder.value = order
  shipForm.value = { logisticsCompany: '', trackingNo: '' }
  showShipModal.value = true
}

const submitPickupShipment = async (order: SellerOrder) => {
  sellerSubmitting.value = true
  try {
    await createShipment(order.id, {})
    alert('自提取货码已生成，请告知买家！')
    showShipModal.value = false
    fetchSellerOrders()
  } catch (err: unknown) {
    alert(`发货失败：${(err as Error).message || '未知错误'}`)
  } finally {
    sellerSubmitting.value = false
  }
}

const confirmSellerShip = async () => {
  if (!currentShipOrder.value) return
  if (!shipForm.value.logisticsCompany || !shipForm.value.trackingNo) return

  sellerSubmitting.value = true
  try {
    await createShipment(currentShipOrder.value.id, {
      logisticsCompany: shipForm.value.logisticsCompany,
      trackingNo: shipForm.value.trackingNo
    })
    alert('发货成功！')
    showShipModal.value = false
    fetchSellerOrders()
  } catch (err: unknown) {
    alert(`发货失败：${(err as Error).message || '未知错误'}`)
  } finally {
    sellerSubmitting.value = false
  }
}

const viewSellerTrace = (order: SellerOrder) => {
  router.push(`/order/detail/${order.id}`)
}

const viewSellerDetail = (order: SellerOrder) => {
  router.push(`/order/detail/${order.id}`)
}

onMounted(async () => {
  await orderStore.loadOrders()
})
</script>

<style scoped>
.orders-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* ========== 角色切换栏 ========== */
.role-switch-bar {
  display: flex;
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.role-tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.role-tab:hover {
  color: #f97316;
  background-color: #fff7ed;
}

.role-tab.active {
  background: #f97316;
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}

/* ========== 买家视图样式 ========== */
.statsBar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.statCard {
  background: #fff;
  border-radius: 14px;
  padding: 20px 12px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s;
}

.statCard:hover {
  transform: translateY(-2px);
}

.statValue {
  font-size: 24px;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 4px;
}

.statLabel {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.filterBar {
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.filterTabs {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  overflow-x: auto;
}

.filterTab {
  flex: 1;
  white-space: nowrap;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.filterTab:hover {
  color: #f97316;
  background-color: #fff7ed;
}

.filterTab.active {
  background: #f97316;
  color: #fff;
  font-weight: 600;
}

.filterTab .count {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 20px;
}

.filterTab.active .count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.orderList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orderCard {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.orderCard:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f1f5f9;
}

.order-no-text {
  font-size: 13px;
  color: #64748b;
}
.order-no-text strong {
  color: #334155;
  font-weight: 600;
  margin-left: 4px;
}

.status-tag {
  font-size: 13px;
  font-weight: 600;
}

.products-wrapper {
  padding: 4px 0;
}

.product-item-row {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f8fafc;
}

.product-item-row:last-child {
  border-bottom: none;
}

.product-item-row:hover {
  background-color: #f8fafc;
}

.product-img {
  width: 76px;
  height: 76px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.product-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
}

.product-title {
  margin: 0;
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-badges .badge {
  font-size: 11px;
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.product-price-col {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 70px;
}

.price-text {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.quantity-text {
  font-size: 12px;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 12px;
}

.total-price-summary {
  font-size: 13px;
  color: #475569;
}
.total-price-summary strong {
  color: #1e293b;
}

.money-accent {
  color: #f97316;
  font-size: 18px;
  font-weight: 700;
  margin-left: 2px;
}

.order-actions-group {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
}

.action-btn.primary {
  background: #f97316;
  color: #fff;
  border: 1px solid #f97316;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
}

.action-btn.primary:hover {
  background: #ea580c;
  border-color: #ea580c;
  transform: translateY(-0.5px);
}

.action-btn.secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.action-btn.secondary:hover {
  border-color: #f97316;
  color: #f97316;
  background-color: #fff7ed;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 60px 16px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-state i, .loading-state i {
  font-size: 50px;
  color: #cbd5e1;
  margin-bottom: 16px;
}
.loading-state i {
  color: #f97316;
}

.empty-state p, .loading-state p {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 20px;
}

.btnPrimary {
  padding: 10px 24px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btnPrimary:hover {
  background: #ea580c;
}

/* ========== 卖家视图样式 ========== */
.seller-status-tabs {
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  display: flex;
  gap: 4px;
  overflow-x: auto;
}

.seller-tab-btn {
  flex: 1;
  white-space: nowrap;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.seller-tab-btn:hover:not(.active) {
  color: #f97316;
  background-color: #fff7ed;
}

.seller-tab-btn.active {
  background: #f97316;
  color: #fff;
  font-weight: 600;
}

.seller-tab-count {
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 20px;
}

.seller-tab-btn.active .seller-tab-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.seller-order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seller-order-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.seller-order-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}

.seller-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f1f5f9;
}

.seller-order-no {
  font-size: 13px;
  color: #64748b;
}

.seller-status-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 0;
  border-radius: 0;
  background: none;
}

/* 卖家状态标签 — 纯文字颜色，与买家一致 */
.seller-status-pending { color: #f97316; }
.seller-status-paid { color: #8b5cf6; }
.seller-status-shipped { color: #2563eb; }
.seller-status-completed { color: #10b981; }
.seller-status-cancelled { color: #9ca3af; }

.seller-buyer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f8fafc;
  background: #fafafa;
}

.seller-buyer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
}

.seller-buyer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seller-buyer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seller-buyer-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.seller-order-time {
  font-size: 12px;
  color: #94a3b8;
}

.seller-items-wrap {
  padding: 4px 0;
}

.seller-item-row {
  display: flex;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid #f8fafc;
}

.seller-item-row:last-child {
  border-bottom: none;
}

.seller-product-img {
  width: 76px;
  height: 76px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.seller-product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
}

.seller-product-title {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.seller-product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seller-price {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.seller-quantity {
  font-size: 12px;
  color: #94a3b8;
}

.seller-trade-info {
  padding: 0 16px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.seller-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.seller-label {
  flex-shrink: 0;
  color: #64748b;
}

.seller-info-row span:last-child {
  text-align: right;
  word-break: break-all;
}

.seller-total-row {
  font-weight: 600;
  color: #1e293b;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.seller-amount {
  font-size: 18px;
  color: #f97316;
  font-weight: 700;
}

.seller-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-top: 1px solid #f1f5f9;
  background-color: #fff;
  flex-wrap: wrap;
  gap: 12px;
}

.seller-footer-time {
  font-size: 13px;
  color: #475569;
}

.seller-actions {
  display: flex;
  gap: 8px;
}

.seller-actions button {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
}

.seller-btn-ship {
  background: #f97316;
  color: #fff;
  border: 1px solid #f97316;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
}

.seller-btn-ship:hover {
  background: #ea580c;
  border-color: #ea580c;
  transform: translateY(-0.5px);
}

.seller-btn-trace {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.seller-btn-trace:hover {
  border-color: #f97316;
  color: #f97316;
  background-color: #fff7ed;
}

.seller-btn-detail {
  background: #f97316;
  color: #fff;
  border: 1px solid #f97316;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.2);
}

.seller-btn-detail:hover {
  background: #ea580c;
  border-color: #ea580c;
  transform: translateY(-0.5px);
}

.seller-btn-detail-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.seller-btn-detail-secondary:hover {
  border-color: #f97316;
  color: #f97316;
  background-color: #fff7ed;
}

/* ========== 发货弹窗样式 ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.required {
  color: #ff4d4f;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: white;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #722ed1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-cancel:hover {
  border-color: #999;
  color: #333;
}

.btn-confirm {
  padding: 10px 24px;
  border: none;
  background: #722ed1;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-confirm:hover:not(:disabled) {
  background: #531dab;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ========== 分页（公用） ========== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  margin-top: 8px;
}

.page-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn:hover:not(:disabled) {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .statsBar {
    gap: 10px;
  }
  .statCard {
    padding: 12px 6px;
  }
  .statValue {
    font-size: 18px;
  }
  .card-footer {
    flex-direction: column;
    align-items: flex-end;
  }
  .seller-tab-btn {
    padding: 8px 6px;
    font-size: 12px;
  }
  .seller-product-img {
    width: 60px;
    height: 60px;
  }
  .seller-actions button {
    padding: 5px 12px;
    font-size: 12px;
  }
  .seller-card-footer {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
