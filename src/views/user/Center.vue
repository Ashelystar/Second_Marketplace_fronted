<!-- src/views/user/MyGoods.vue -->
<template>
  <div>
    <!-- 我的商品区域 -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">我的商品</h2>
        <button 
          @click="$router.push('/publish')"
          class="bg-xianyuText text-white px-4 py-2 rounded-lg text-sm hover:bg-xianyuText/90 transition-colors flex items-center gap-2"
        >
          <i class="fa fa-plus"></i>
          <span>发布商品</span>
        </button>
      </div>
      
      <!-- 商品列表 -->
      <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          @click="$router.push({ name: 'goods-detail', params: { id: product.id } })"
        >
          <div class="aspect-square overflow-hidden">
            <img 
              :src="product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image'" 
              :alt="product.title"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            >
          </div>
          <div class="p-4">
            <h3 class="font-medium text-gray-800 mb-2 line-clamp-2">{{ product.title }}</h3>
            <div class="flex justify-between items-center">
              <span class="text-xl font-semibold text-xianyuText">¥{{ product.price }}</span>
              <span class="text-sm text-gray-500">{{ product.createdAt }}</span>
            </div>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <i class="fa fa-eye"></i>
                <span>{{ product.views }}</span>
              </div>
              <div class="flex gap-2">
                <button 
                  @click.stop="editProduct(product.id)"
                  class="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                >
                  编辑
                </button>
                <button 
                  @click.stop="deleteProduct(product.id)"
                  class="text-sm px-3 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无商品状态 -->
      <div v-else class="py-12 text-center">
        <div class="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
          <i class="fa fa-cube text-4xl text-gray-400"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">暂无商品</h3>
        <p class="text-gray-500 mb-6">您还没有发布任何商品，快去发布吧！</p>
        <button 
          @click="$router.push('/publish')"
          class="bg-xianyuText text-white px-6 py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors inline-flex items-center gap-2"
        >
          <i class="fa fa-plus"></i>
          <span>发布第一个商品</span>
        </button>
      </div>
    </div>
    
    <!-- 最近交易记录 -->
    <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
      <h2 class="text-xl font-semibold mb-4">最近交易</h2>
      <div v-if="recentOrders.length > 0">
        <div v-for="order in recentOrders" :key="order.id" class="border-b border-gray-100 py-4 last:border-0">
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium">{{ order.productTitle }}</h4>
              <p class="text-sm text-gray-500 mt-1">订单号: {{ order.orderNo }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-lg">¥{{ order.price }}</p>
              <span :class="['text-sm px-2 py-1 rounded', 
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              ]">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>
        </div>
        <router-link 
          to="/order" 
          class="block mt-4 text-center text-xianyuText hover:text-xianyuText/80 font-medium"
        >
          查看全部订单 >
        </router-link>
      </div>
      <div v-else class="py-8 text-center text-gray-500">
        暂无交易记录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const products = ref<any[]>([])
const recentOrders = ref<any[]>([
  {
    id: 1,
    orderNo: 'ORD20240001',
    productTitle: '苹果 iPhone 13 Pro',
    price: 4599,
    status: 'completed',
    date: '2024-01-15'
  },
  {
    id: 2,
    orderNo: 'ORD20240002',
    productTitle: '华为 MateBook 14',
    price: 3200,
    status: 'pending',
    date: '2024-01-10'
  }
])

const router = useRouter()

// 加载用户商品
const loadUserProducts = async () => {
  // 这里应该调用API获取用户商品
  // 模拟数据
  setTimeout(() => {
    products.value = [
      {
        id: 1,
        title: '九成新iPhone 13 Pro 256G',
        price: 4599,
        images: ['https://via.placeholder.com/300x300?text=iPhone+13+Pro'],
        views: 156,
        createdAt: '1天前'
      },
      {
        id: 2,
        title: '华为MateBook 14 2022款',
        price: 3200,
        images: ['https://via.placeholder.com/300x300?text=Huawei+MateBook'],
        views: 89,
        createdAt: '3天前'
      },
      {
        id: 3,
        title: '索尼PS5游戏机 光驱版',
        price: 2800,
        images: ['https://via.placeholder.com/300x300?text=PS5'],
        views: 234,
        createdAt: '5天前'
      }
    ]
  }, 500)
}

const editProduct = (id: number) => {
  router.push({ name: 'edit', query: { id: id.toString() } })
}

const deleteProduct = async (id: number) => {
  if (confirm('确定要删除这个商品吗？')) {
    // 这里调用删除API
    products.value = products.value.filter(p => p.id !== id)
  }
}

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: '待处理',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadUserProducts()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>