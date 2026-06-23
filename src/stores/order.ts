import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TradeOrder } from '@/types'
import {
  listOrders,
  getOrderDetail,
  getOrderItems,
  cancelOrder as apiCancelOrder,
  confirmReceipt as apiConfirmReceipt, // 对应上一步中定义的确认收货方法
  payOrder as apiPayOrder
} from '@/api/trade'

export const useOrderStore = defineStore('order', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = ref<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentOrder = ref<any | null>(null)
  const items = ref<any[]>([])
  const loading = ref(false)
  const stats = ref({
    totalSpent: 0,
    totalOrders: 0,
    averageRating: 0
  })

  // 计算属性：按状态分类的订单（全面改为小驼峰匹配后端返回数据字段）
  const pendingOrders = computed(() => orders.value.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'pending_payment'))
  const paidOrders = computed(() => orders.value.filter(o => o.orderStatus === 'paid'))
  // 待收货栏：完美兼容后端返回的 'shipped' 和 'delivered' 两种状态
  const shippedOrders = computed(() => orders.value.filter(o => o.orderStatus === 'shipped' || o.orderStatus === 'delivered'))
  const refundingOrders = computed(() => orders.value.filter(o => o.orderStatus === 'refunding'))
  const completedOrders = computed(() => orders.value.filter(o => o.orderStatus === 'completed'))

  async function loadOrders(status?: string) {
    loading.value = true
    try {
      const result = await listOrders({ role: 'buyer', status, page: 1, pageSize: 5 })
      console.log('订单列表加载结果:', result)
      orders.value = result.list || []
    } catch (error) {
      console.error('加载订单列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function loadOrderDetail(orderId: number) {
    loading.value = true
    try {
      currentOrder.value = await getOrderDetail(orderId)
      items.value = await getOrderItems(orderId)
    } catch (error) {
      console.error('加载订单详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function cancel(orderId: number, reason?: string) {
    loading.value = true
    try {
      await apiCancelOrder(orderId, { cancelReason: reason || '买家取消订单' })
      await loadOrders()
      if (currentOrder.value?.id === orderId) {
        await loadOrderDetail(orderId)
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 确认收货核心函数
   * @param orderId 订单列表单项中的核心主键ID
   */
  async function confirmReceipt(orderId: number): Promise<void> {
    loading.value = true
    try {
      // 1. 调用带 Auth 头的后端 API 发送 POST 请求
      await apiConfirmReceipt(orderId)

      // 2. 交互成功后，自动重新拉取订单列表，利用数据响应式机制无缝刷新界面状态
      await loadOrders()

      // 3. 如果此时用户正在详情页中，同步更新详情视图
      if (currentOrder.value?.id === orderId) {
        await loadOrderDetail(orderId)
      }
    } catch (error) {
      console.error('业务层处理确认收货失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function initiatePayment(orderId: number, paymentChannel: 'alipay' | 'wechat' | 'balance') {
    loading.value = true
    try {
      const result = await apiPayOrder(orderId, { paymentChannel })
      return result
    } catch (error) {
      console.error('创建支付单失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function executePayment(paymentId: number) {
    console.log('执行支付:', paymentId)
    return true
  }

  async function remindShip(orderId: number) {
    console.log('提醒发货:', orderId)
    return true
  }

  // 获取订单分类标签数量
  function getCount(status: string) {
    switch (status) {
      case 'all': return orders.value.length
      case 'pending': return pendingOrders.value.length
      case 'paid': return paidOrders.value.length
      case 'shipped': return shippedOrders.value.length
      case 'refunding': return refundingOrders.value.length
      case 'completed': return completedOrders.value.length
      default: return 0
    }
  }

  return {
    orders,
    currentOrder,
    items,
    loading,
    stats,
    pendingOrders,
    paidOrders,
    shippedOrders,
    refundingOrders,
    completedOrders,
    loadOrders,
    loadOrderDetail,
    cancel,
    confirmReceipt,
    initiatePayment,
    executePayment,
    remindShip,
    getCount,
  }
})
