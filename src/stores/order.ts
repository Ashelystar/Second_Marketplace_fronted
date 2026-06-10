import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TradeOrder } from '@/types'
import {
  listOrders,
  getOrderDetail,
  getOrderItems,
  cancelOrder as apiCancelOrder,
  confirmReceipt as apiConfirmReceipt,
  payOrder as apiPayOrder
} from '@/api/trade'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<TradeOrder[]>([])
  const currentOrder = ref<TradeOrder | null>(null)
  const items = ref<any[]>([])
  const loading = ref(false)
  const stats = ref({
    totalSpent: 0,
    totalOrders: 0,
    averageRating: 0
  })

  // 计算属性：按状态分类的订单
  const pendingOrders = computed(() => orders.value.filter(o => o.order_status === 'pending'))
  const paidOrders = computed(() => orders.value.filter(o => o.order_status === 'paid'))
  const shippedOrders = computed(() => orders.value.filter(o => o.order_status === 'shipped'))
  const refundingOrders = computed(() => orders.value.filter(o => o.order_status === 'refunding'))
  const completedOrders = computed(() => orders.value.filter(o => o.order_status === 'completed'))

  async function loadOrders(status?: string) {
    loading.value = true
    try {
      const result = await listOrders({ status, page: 1, pageSize: 100 })
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
      // 重新加载订单列表以更新状态
      await loadOrders()
      // 如果当前正在查看该订单详情，也需要更新
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

  async function confirmReceipt(orderId: number): Promise<void> {
    loading.value = true
    try {
      await apiConfirmReceipt(orderId)
      // 重新加载订单列表以更新状态
      await loadOrders()
      // 如果当前正在查看该订单详情，也需要更新
      if (currentOrder.value?.id === orderId) {
        await loadOrderDetail(orderId)
      }
    } catch (error) {
      console.error('确认收货失败:', error)
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
    // TODO: 根据实际API实现
    console.log('执行支付:', paymentId)
    return true
  }

  async function remindShip(orderId: number) {
    // TODO: 根据实际API实现提醒发货功能
    console.log('提醒发货:', orderId)
    return true
  }

  // 获取订单数量
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
