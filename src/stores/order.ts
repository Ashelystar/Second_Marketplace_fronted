import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TradeOrder, Product } from '@/types'
import { listOrders, getOrderDetail, getOrderItems, cancelOrder, confirmReceipt as apiConfirmReceipt } from '@/api/order'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<TradeOrder[]>([])
  const currentOrder = ref<TradeOrder | null>(null)
  const items = ref<Product[]>([])
  const loading = ref(false)

  async function loadOrders(status?: string) {
    loading.value = true
    orders.value = await listOrders(status)
    loading.value = false
  }

  async function loadOrderDetail(orderId: number) {
    loading.value = true
    currentOrder.value = await getOrderDetail(orderId)
    items.value = await getOrderItems(orderId)
    loading.value = false
  }

  async function cancel(orderId: number) {
    loading.value = true
    const updated = await cancelOrder(orderId)
    currentOrder.value = updated
    loading.value = false
    return updated
  }

  async function confirmReceipt(orderId: number): Promise<TradeOrder | null> {
    loading.value = true
    const updated = await apiConfirmReceipt(orderId)
    currentOrder.value = updated
    loading.value = false
    return updated
  }

  return {
    orders,
    currentOrder,
    items,
    loading,
    loadOrders,
    loadOrderDetail,
    cancel,
    confirmReceipt,
  }
})