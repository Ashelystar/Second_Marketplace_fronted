<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 - 与主页保持一致 -->
    <nav class="sticky top-0 z-50 bg-xianyuBg border-b border-gray-200 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-8">
          <router-link to="/" class="text-2xl font-bold text-xianyuText hover:opacity-80">
            首页
          </router-link>
          
          <!-- 搜索框 -->
          <div class="hidden md:block">
            <div class="relative">
              <input
                type="text"
                placeholder="搜索商品"
                class="w-64 px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              />
              <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>

        <!-- 右侧导航 -->
        <div class="flex items-center gap-6">
          <router-link to="/forum" class="hover:text-xianyuText flex items-center gap-1">
            <i class="fa fa-comments"></i>
            <span class="hidden sm:inline">社区</span>
          </router-link>
          
          <router-link to="/cart" class="hover:text-xianyuText flex items-center gap-1">
            <i class="fa fa-shopping-cart"></i>
            <span class="hidden sm:inline">购物车</span>
          </router-link>
          
          <router-link to="/chat" class="hover:text-xianyuText flex items-center gap-1">
            <i class="fa fa-comment"></i>
            <span class="hidden sm:inline">消息</span>
          </router-link>
          
          <router-link to="/order" class="hover:text-xianyuText flex items-center gap-1">
            <i class="fa fa-file-text-o"></i>
            <span class="hidden sm:inline">我的订单</span>
          </router-link>
          
          <!-- 用户头像/登录入口 -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-400 text-white">
                <i class="fa fa-user"></i>
              </div>
            </div>
            <span v-if="userStore.user" class="text-sm">{{ userStore.user.nickname }}</span>
            <button v-else class="hover:text-xianyuText flex items-center gap-1" @click="$router.push('/user/login')">
              <i class="fa fa-user"></i> 登录/注册
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左侧菜单栏 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <!-- 用户信息卡片 -->
            <div class="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
              <div class="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" alt="头像" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center bg-gray-300 text-white text-2xl">
                  <i class="fa fa-user"></i>
                </div>
              </div>
              <div>
                <h2 class="font-semibold text-lg">{{ userStore.user?.nickname || '未登录用户' }}</h2>
                <p class="text-sm text-gray-500 mt-1">{{ userStore.user?.location || '未设置所在地' }}</p>
                <div class="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>{{ userStore.user?.followers || 0 }} 粉丝</span>
                  <span>{{ userStore.user?.following || 0 }} 关注</span>
                </div>
              </div>
            </div>

            <!-- 菜单项 -->
            <nav class="space-y-2">
              <router-link 
                to="/user/center" 
                :class="['flex items-center gap-3 p-3 rounded-lg transition-colors', 
                  $route.path === '/user/center' ? 'bg-xianyuBg text-xianyuText' : 'hover:bg-gray-50']"
              >
                <i class="fa fa-cube w-5"></i>
                <span>我的商品</span>
              </router-link>
              
              <router-link 
                to="/order" 
                :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
              >
                <i class="fa fa-exchange w-5"></i>
                <span>我的交易</span>
              </router-link>
              
              <router-link 
                to="/user/center?tab=favorites" 
                :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
              >
                <i class="fa fa-heart w-5"></i>
                <span>我的收藏</span>
              </router-link>
              
              <router-link 
                to="/user/profile" 
                :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
              >
                <i class="fa fa-user-circle w-5"></i>
                <span>个人资料</span>
              </router-link>
              
              <router-link 
                to="/user/setting" 
                :class="['flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50']"
              >
                <i class="fa fa-cog w-5"></i>
                <span>账号与安全</span>
              </router-link>
            </nav>
            
            <!-- 卖闲置按钮 -->
            <button 
              @click="$router.push('/publish')"
              class="mt-6 w-full bg-xianyuText text-white py-3 rounded-lg font-medium hover:bg-xianyuText/90 transition-colors flex items-center justify-center gap-2"
            >
              <i class="fa fa-plus"></i>
              <span>卖闲置</span>
            </button>
          </div>
          
          <!-- 信用评价卡片 -->
          <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 class="font-semibold text-lg mb-4">信用及评价</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-600">信用分</span>
                  <span class="font-semibold text-xianyuText">{{ userStore.user?.creditScore || 0 }}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-xianyuText rounded-full" :style="{ width: Math.min((userStore.user?.creditScore || 0) / 10, 100) + '%' }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-gray-600">好评率</span>
                  <span class="font-semibold text-xianyuText">{{ userStore.user?.positiveRate || 0 }}%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: (userStore.user?.positiveRate || 0) + '%' }"></div>
                </div>
              </div>
            </div>
            <button class="mt-4 w-full text-sm text-xianyuText hover:text-xianyuText/80">
              查看详情 >
            </button>
          </div>
        </div>

        <!-- 右侧主内容区 -->
        <div class="lg:col-span-3">
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
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">关于我们</h3>
            <p class="text-gray-300 text-sm">专注于二手商品交易的平台，让闲置物品流通起来。</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">资质证明</h3>
            <p class="text-gray-300 text-sm">营业执照编号: 91330110MA2H1CFF2D</p>
            <p class="text-gray-300 text-sm">备案号: B2-20241485</p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">联系我们</h3>
            <p class="text-gray-300 text-sm">客服邮箱: support@example.com</p>
            <p class="text-gray-300 text-sm">客服电话: 400-xxx-xxxx</p>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2024 我的商品平台 版权所有</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 模拟用户数据和商品数据
const userStore = ref({
  user: {
    avatar: '',
    nickname: '用户昵称',
    location: '广东省 广州市',
    followers: 120,
    following: 45,
    creditScore: 750,
    positiveRate: 98.5
  }
})

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