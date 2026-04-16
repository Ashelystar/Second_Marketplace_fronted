<template>
  <div>
    <!-- 页面标题和筛选 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 class="text-2xl font-semibold mb-6 flex items-center gap-2">
        <i class="fa fa-exchange text-xianyuText"></i>
        我的交易
      </h1>
      
      <!-- 交易状态筛选 -->
      <div class="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <button 
          v-for="tab in orderTabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['px-4 py-2 rounded-lg whitespace-nowrap transition-colors', 
            activeTab === tab.id ? 'bg-xianyuText text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <!-- 交易列表 -->
      <div v-if="orders.length > 0" class="space-y-4">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start gap-4">
            <!-- 商品图片 -->
            <div class="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              <img 
                :src="order.productImage" 
                :alt="order.productName"
                class="w-full h-full object-cover"
              >
            </div>
            
            <!-- 订单信息 -->
            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-medium text-lg mb-1">{{ order.productName }}</h3>
                  <p class="text-gray-500 text-sm mb-2">订单号: {{ order.orderNo }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-semibold text-xianyuText">¥{{ order.price }}</p>
                  <span :class="['text-sm px-2 py-1 rounded mt-2 inline-block', 
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center gap-4">
                  <span>创建时间: {{ order.createTime }}</span>
                  <span v-if="order.completeTime">完成时间: {{ order.completeTime }}</span>
                </div>
                <div class="flex gap-2">
                  <button 
                    v-if="order.status === 'pending'"
                    class="px-3 py-1 bg-xianyuText text-white rounded hover:bg-xianyuText/90"
                    @click="payOrder(order.id)"
                  >
                    立即支付
                  </button>
                  <button 
                    v-if="order.status === 'shipped'"
                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    @click="confirmReceipt(order.id)"
                  >
                    确认收货
                  </button>
                  <button 
                    class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    @click="viewOrderDetail(order.id)"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="flex justify-center items-center gap-2 mt-8">
          <button 
            v-for="page in 5" 
            :key="page"
            @click="currentPage = page"
            :class="['w-10 h-10 rounded-lg transition-colors',
              currentPage === page ? 'bg-xianyuText text-white' : 'border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
      
      <!-- 无订单状态 -->
      <div v-else class="py-12 text-center">
        <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
          <i class="fa fa-exchange text-4xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">暂无交易记录</h3>
        <p class="text-gray-500 mb-6">您还没有进行任何交易，快去逛逛吧！</p>
        <button 
          @click="$router.push('/goods')"
          class="bg-xianyuText text-white px-6 py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors inline-flex items-center gap-2"
        >
          <i class="fa fa-shopping-bag"></i>
          <span>去逛逛</span>
        </button>
      </div>
    </div>
    
    <!-- 交易统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <i class="fa fa-money text-blue-600 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">累计消费</p>
            <p class="text-2xl font-semibold">¥{{ orderStats.totalSpent }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <i class="fa fa-shopping-cart text-green-600 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">交易笔数</p>
            <p class="text-2xl font-semibold">{{ orderStats.totalOrders }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
            <i class="fa fa-star text-orange-600 text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500">平均评分</p>
            <p class="text-2xl font-semibold">{{ orderStats.averageRating }}/5</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('all')
const currentPage = ref(1)

const orderTabs = [
  { id: 'all', label: '全部' },
  { id: 'pending', label: '待付款' },
  { id: 'paid', label: '待发货' },
  { id: 'shipped', label: '待收货' },
  { id: 'completed', label: '已完成' },
  { id: 'cancelled', label: '已取消' }
]

const orders = ref<any[]>([
  {
    id: 1,
    orderNo: 'ORD202401150001',
    productName: '苹果 iPhone 13 Pro 256GB 远峰蓝',
    productImage: 'https://via.placeholder.com/300x300?text=iPhone',
    price: 4599,
    status: 'completed',
    createTime: '2024-01-15 14:30',
    completeTime: '2024-01-20 10:15'
  },
  {
    id: 2,
    orderNo: 'ORD202401120002',
    productName: '华为 MateBook 14 2022款',
    productImage: 'https://via.placeholder.com/300x300?text=Laptop',
    price: 3200,
    status: 'shipped',
    createTime: '2024-01-12 09:20',
    completeTime: null
  },
  {
    id: 3,
    orderNo: 'ORD202401100003',
    productName: '索尼 PS5 游戏机 光驱版',
    productImage: 'https://via.placeholder.com/300x300?text=PS5',
    price: 2800,
    status: 'pending',
    createTime: '2024-01-10 16:45',
    completeTime: null
  }
])

const orderStats = ref({
  totalSpent: 10599,
  totalOrders: 8,
  averageRating: 4.8
})

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(order => order.status === activeTab.value)
})

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: '待付款',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const payOrder = (orderId: number) => {
  alert(`支付订单: ${orderId}`)
  // 这里实现支付逻辑
}

const confirmReceipt = (orderId: number) => {
  if (confirm('确认收到商品？')) {
    alert(`确认收货订单: ${orderId}`)
    // 这里实现确认收货逻辑
  }
}

const viewOrderDetail = (orderId: number) => {
  router.push({ name: 'order-detail', params: { id: orderId } })
}

onMounted(() => {
  // 这里可以加载用户订单数据
})
</script>