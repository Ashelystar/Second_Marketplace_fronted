import type { TradeOrder, OrderItem } from '@/types'

const orders: TradeOrder[] = [
  {
    id: 1001,
    order_no: 'SO-20260408-1001',
    buyer_name: '姚女士',
    seller_name: '华南商贸采购部',
    order_status: 'paid_pending_ship',
    trade_mode: 'shipping',
    total_amount: 16800,
    freight_amount: 0,
    pay_amount: 16800,
    remark: '请尽快发货，合同尽快签收。',
    receiver_name: '姚女士',
    receiver_phone: '150****2799',
    receiver_address: '辽宁省锦州市凌河区樱花街道延安路六段15号儒林宫馆',
    pickup_location: '',
    cancel_reason: '',
    paid_at: '2026-04-08 09:45',
    shipped_at: null,
    delivered_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: '2026-04-08 09:40',
  },
  {
    id: 1002,
    order_no: 'SO-20260408-1002',
    buyer_name: '张先生',
    seller_name: '深圳市南山区深南大道9988号大冲商务中心',
    order_status: 'shipped',
    trade_mode: 'shipping',
    total_amount: 2380,
    freight_amount: 20,
    pay_amount: 2400,
    remark: '请安排专车送货。',
    receiver_name: '张先生',
    receiver_phone: '138****0000',
    receiver_address: '广东省深圳市南山区深南大道9988号大冲商务中心',
    pickup_location: '',
    cancel_reason: '',
    paid_at: '2026-04-07 14:20',
    shipped_at: '2026-04-08 11:00',
    delivered_at: null,
    completed_at: null,
    cancelled_at: null,
    created_at: '2026-04-07 14:15',
  },
  {
    id: 1003,
    order_no: 'SO-20260407-1003',
    buyer_name: '李女士',
    seller_name: '某某大客户公司',
    order_status: 'completed',
    trade_mode: 'pickup',
    total_amount: 3200,
    freight_amount: 0,
    pay_amount: 3200,
    remark: '自提，联系前台即可。',
    receiver_name: '李女士',
    receiver_phone: '139****1234',
    receiver_address: '',
    pickup_location: '广州市天河区自提点A',
    cancel_reason: '',
    paid_at: '2026-04-06 18:00',
    shipped_at: null,
    delivered_at: '2026-04-07 09:30',
    completed_at: '2026-04-07 14:00',
    cancelled_at: null,
    created_at: '2026-04-06 17:50',
  },
]

const itemsByOrderId: Record<number, OrderItem[]> = {
  1001: [
    {
      id: 1,
      product_title: '办公设备采购合同案',
      product_image_url: 'https://via.placeholder.com/120x90?text=合同',
      quantity: 1,
      unit_price: 16800,
      subtotal_amount: 16800,
    },
  ],
  1002: [
    {
      id: 2,
      product_title: '高性能服务器机柜',
      product_image_url: 'https://via.placeholder.com/120x90?text=机柜',
      quantity: 1,
      unit_price: 2380,
      subtotal_amount: 2380,
    },
  ],
  1003: [
    {
      id: 3,
      product_title: '企业级交换机采购',
      product_image_url: 'https://via.placeholder.com/120x90?text=交换机',
      quantity: 2,
      unit_price: 1600,
      subtotal_amount: 3200,
    },
  ],
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listOrders(status?: string) {
  await delay(300)
  if (!status || status === 'all') {
    return orders
  }
  return orders.filter((item) => item.order_status === status)
}

export async function getOrderDetail(orderId: number) {
  await delay(260)
  const order = orders.find((item) => item.id === orderId)
  if (!order) {
    throw new Error('未找到订单')
  }
  return order
}

export async function getOrderItems(orderId: number) {
  await delay(200)
  return itemsByOrderId[orderId] ?? []
}

export async function cancelOrder(orderId: number) {
  await delay(260)
  const order = orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.order_status !== 'pending_payment' && order.order_status !== 'paid_pending_ship') {
    throw new Error('当前订单无法取消')
  }
  order.order_status = 'cancelled'
  order.cancelled_at = new Date().toISOString()
  return order
}

export async function confirmReceipt(orderId: number) {
  await delay(260)
  const order = orders.find((item) => item.id === orderId)
  if (!order) throw new Error('订单不存在')
  if (order.order_status !== 'shipped' && order.order_status !== 'delivered') {
    throw new Error('当前订单无法确认收货')
  }
  order.order_status = 'completed'
  order.completed_at = new Date().toISOString()
  return order
}
