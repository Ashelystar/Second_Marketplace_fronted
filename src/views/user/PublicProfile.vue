<template>
  <div class="public-profile-page">
    <Topnav />

    <main class="container">
      <button class="back-btn" @click="goBackToProduct">
        <i class="fa fa-arrow-left"></i>
        返回商品详情
      </button>

      <section v-if="seller" class="profile-card">
        <div class="profile-main">
          <div class="avatar-wrap">
            <img
              v-if="seller.avatar"
              :src="seller.avatar"
              :alt="seller.name"
              class="avatar"
            />
            <div v-else class="avatar avatar-default">{{ seller.name.charAt(0) }}</div>
          </div>

          <div class="profile-info">
            <h1 class="nickname">
              {{ seller.name }}
              <span v-if="seller.verified" class="verified">
                <i class="fa fa-check-circle"></i> 已实名
              </span>
            </h1>
            <p class="meta">
              <span><i class="fa fa-map-marker"></i> {{ seller.location }}</span>
              <span v-if="seller.rating"><i class="fa fa-star"></i> {{ seller.rating }}</span>
              <span v-if="seller.creditScore > 0">信用分 {{ seller.creditScore }}</span>
              <span v-if="seller.goodRate">好评率 {{ seller.goodRate }}%</span>
              <span v-if="seller.totalReviewCount > 0">评价 {{ seller.totalReviewCount }}</span>
            </p>
          </div>

          <div class="action-buttons">
            <button
              v-if="canFollowSeller"
              class="follow-btn"
              :class="{ following: isFollowingSeller }"
              :disabled="followPending"
              @click="handleToggleFollow"
            >
              <i class="fa" :class="isFollowingSeller ? 'fa-user-times' : 'fa-user-plus'"></i>
              {{ isFollowingSeller ? '取消关注' : '关注TA' }}
            </button>
            <button class="contact-btn" @click="goToChat">
              <i class="fa fa-commenting"></i>
              沟通一下
            </button>
          </div>
        </div>

        <div class="stats">
          <span>在售 <strong>{{ seller.onSale }}</strong></span>
          <span>已完成 <strong>{{ seller.sold }}</strong></span>
          <span v-if="seller.totalOrders > 0">总订单 <strong>{{ seller.totalOrders }}</strong></span>
        </div>
      </section>

      <section v-if="reputationHistory.length" class="trend-card">
        <div class="trend-header">
          <h2>近7天信誉趋势</h2>
        </div>
        <div class="trend-grid">
          <article
            v-for="item in reputationHistory"
            :key="item.snapshotDate"
            class="trend-item"
          >
            <p class="trend-date">{{ formatDate(item.snapshotDate) }}</p>
            <p class="trend-metric">信用分 <strong>{{ item.creditScore }}</strong></p>
            <p class="trend-metric">好评率 <strong>{{ item.positiveRate }}%</strong></p>
            <p class="trend-metric">完成/总单 <strong>{{ item.completedOrders }}/{{ item.totalOrders }}</strong></p>
          </article>
        </div>
      </section>

      <section class="goods-section">
        <div class="section-header">
          <h2>TA发布的商品</h2>
          <span class="count">共 {{ sellerProducts.length }} 件</span>
        </div>

        <div v-if="sellerProducts.length" class="goods-grid">
          <article
            v-for="item in sellerProducts"
            :key="item.id"
            class="goods-card"
            @click="goToDetail(item.id)"
          >
            <div class="goods-image">
              <img :src="getImageUrl(item.image) || PLACEHOLDER_IMG" :alt="item.title" @error="(e: Event) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG" />
              <span class="condition">{{ formatCondition(item.condition) }}</span>
            </div>
            <div class="goods-info">
              <h3>{{ item.title }}</h3>
              <p class="desc">{{ item.description }}</p>
              <div class="footer">
                <span class="price">¥{{ item.price }}</span>
                <span class="location">{{ item.location }}</span>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty">
          <i class="fa fa-cube"></i>
          <p>该用户暂未发布商品</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Topnav from '@/components/TopNav.vue'
import { useProductStore } from '@/stores/productStore'
import { useUserStore } from '@/stores/userStore'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import {
  getSellerReputationSnapshotApi,
  getSellerReputationHistoryApi,
  type SellerReputationSnapshot,
  type SellerReputationHistoryItem,
} from '@/api/user'

// 成色映射（与首页、详情页保持一致）
const conditionMap: Record<string, string> = {
  new: '全新',
  almost_new: '99新',
  good: '9成新',
  fair: '8成新',
  poor: '7成新及以下',
}
const formatCondition = (level?: string) => conditionMap[level || ''] || level || '成色未知'

defineOptions({ name: 'PublicProfile' })

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

const sellerId = computed(() => Number(route.params.id))
const CHAT_FRIENDS_STORAGE_KEY = 'chat_friends'
const followPending = ref(false)
const sellerReputation = ref<SellerReputationSnapshot | null>(null)
const sellerReputationHistory = ref<SellerReputationHistoryItem[]>([])

const sellerProducts = computed(() => {
  if (!Number.isFinite(sellerId.value)) return []
  return productStore.products
    .filter((product) => product.sellerId === sellerId.value)
    .sort((a, b) => b.id - a.id)
})

const reputationHistory = computed(() =>
  sellerReputationHistory.value
    .slice()
    .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))
    .slice(0, 7)
)

const sellerFromQuery = computed(() => {
  const name = String(route.query.name || '').trim()
  if (!name) return null
  const avatar = String(route.query.avatar || '')
  const location = String(route.query.location || '未知')
  return {
    id: sellerId.value,
    name,
    avatar,
    location,
    rating: 0,
    verified: false,
    goodRate: 0,
    onSale: 0,
    sold: 0,
    creditScore: 0,
    totalOrders: 0,
    totalReviewCount: 0,
  }
})

const seller = computed(() => {
  const querySeller = sellerFromQuery.value
  const base = sellerProducts.value[0]
  if (!base) return querySeller

  return {
    id: base.sellerId,
    name: querySeller?.name || base.sellerName || `用户${sellerId.value}`,
    avatar: querySeller?.avatar || base.sellerAvatar || '',
    location: querySeller?.location || base.location || '未知',
    rating: base.sellerRating || 0,
    verified: Boolean(base.sellerVerified),
    goodRate: sellerReputation.value?.positiveRate ?? base.sellerGoodRate ?? 0,
    onSale: base.sellerOnSale || sellerProducts.value.length,
    sold: sellerReputation.value?.completedOrders ?? base.sellerSold ?? 0,
    creditScore: sellerReputation.value?.creditScore ?? 0,
    totalOrders: sellerReputation.value?.totalOrders ?? 0,
    totalReviewCount: sellerReputation.value?.totalReviewCount ?? 0,
  }
})

const fetchSellerReputation = async () => {
  if (!Number.isFinite(sellerId.value) || sellerId.value <= 0) {
    sellerReputation.value = null
    return
  }
  try {
    const result = await getSellerReputationSnapshotApi(sellerId.value)
    sellerReputation.value = {
      creditScore: Math.max(0, Number(result.creditScore ?? 0)),
      positiveRate: Math.max(0, Math.min(100, Number(result.positiveRate ?? 0))),
      totalOrders: Math.max(0, Number(result.totalOrders ?? 0)),
      completedOrders: Math.max(0, Number(result.completedOrders ?? 0)),
      totalReviewCount: Math.max(0, Number(result.totalReviewCount ?? 0)),
    }
  } catch (error) {
    console.error('获取卖家信誉快照失败:', error)
    sellerReputation.value = null
  }
}

const fetchSellerReputationHistory = async () => {
  if (!Number.isFinite(sellerId.value) || sellerId.value <= 0) {
    sellerReputationHistory.value = []
    return
  }
  try {
    const result = await getSellerReputationHistoryApi(sellerId.value, 7)
    sellerReputationHistory.value = result.map((item) => ({
      snapshotDate: item.snapshotDate || '',
      creditScore: Math.max(0, Number(item.creditScore ?? 0)),
      positiveRate: Math.max(0, Math.min(100, Number(item.positiveRate ?? 0))),
      totalOrders: Math.max(0, Number(item.totalOrders ?? 0)),
      completedOrders: Math.max(0, Number(item.completedOrders ?? 0)),
    }))
  } catch (error) {
    console.error('获取信誉历史趋势失败:', error)
    sellerReputationHistory.value = []
  }
}

const formatDate = (dateValue: string) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return dateValue
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${month}-${day}`
}

const canFollowSeller = computed(() => {
  if (!Number.isFinite(sellerId.value) || sellerId.value <= 0) return false
  const currentUserId = Number(userStore.userInfo?.id)
  return !Number.isFinite(currentUserId) || currentUserId !== sellerId.value
})

const isFollowingSeller = computed(() => {
  if (!canFollowSeller.value) return false
  return userStore.isFollowing(sellerId.value)
})

const goToDetail = (id: number) => {
  router.push({ path: '/detail', query: { id: id.toString() } })
}

const goToChat = () => {
  if (!seller.value) return
  const currentFriends = JSON.parse(localStorage.getItem(CHAT_FRIENDS_STORAGE_KEY) || '[]') as Array<{
    id: number
    name: string
    avatar: string
    lastMessage: string
    lastTime: string
    unread?: number
    rating: number
    location: string
  }>

  const exists = currentFriends.some(friend => friend.id === seller.value?.id)
  if (!exists) {
    currentFriends.unshift({
      id: seller.value.id,
      name: seller.value.name,
      avatar: seller.value.avatar,
      lastMessage: '你好，我对你的商品感兴趣',
      lastTime: '刚刚',
      unread: 1,
      rating: seller.value.rating,
      location: seller.value.location,
    })
    localStorage.setItem(CHAT_FRIENDS_STORAGE_KEY, JSON.stringify(currentFriends))
  }

  router.push({
    path: '/chat',
    query: { friendId: String(seller.value.id) },
  })
}

const handleToggleFollow = async () => {
  if (!canFollowSeller.value) return
  if (followPending.value) return
  if (!userStore.isLoggedIn) {
    alert('请先登录后再关注')
    await router.push('/user/login')
    return
  }
  try {
    followPending.value = true
    await userStore.toggleFollow(sellerId.value)
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message || '操作失败，请稍后重试')
      return
    }
    alert('操作失败，请稍后重试')
  } finally {
    followPending.value = false
  }
}

const goBackToProduct = () => {
  const fromProductId = Number(route.query.fromProductId)
  if (Number.isFinite(fromProductId) && fromProductId > 0) {
    router.push({ path: '/detail', query: { id: String(fromProductId) } })
    return
  }
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/')
}

onMounted(() => {
  productStore.initialize()
  void fetchSellerReputation()
  void fetchSellerReputationHistory()
  if (userStore.isLoggedIn) {
    void userStore.loadFollowIds()
  }
})

watch(
  () => sellerId.value,
  () => {
    void fetchSellerReputation()
    void fetchSellerReputationHistory()
  }
)
</script>

<style scoped>
.public-profile-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 32px;
}

.back-btn {
  margin-bottom: 12px;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.back-btn:hover {
  color: #f97316;
}

.profile-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  margin-bottom: 20px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrap {
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-default {
  background: #f97316;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
}

.profile-info {
  flex: 1;
}

.nickname {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

.verified {
  font-size: 12px;
  color: #16a34a;
}

.meta {
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 13px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.follow-btn {
  border: 1px solid #f97316;
  background: #fff;
  color: #f97316;
  border-radius: 999px;
  height: 40px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.follow-btn.following {
  border-color: #9ca3af;
  color: #4b5563;
}

.follow-btn:hover {
  background: #fff7ed;
}

.follow-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contact-btn {
  border: none;
  background: #f97316;
  color: #fff;
  border-radius: 999px;
  height: 40px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.contact-btn:hover {
  background: #ea580c;
}

.stats {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 24px;
  color: #6b7280;
  font-size: 14px;
}

.stats strong {
  color: #111827;
}

.trend-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  margin-bottom: 20px;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trend-header h2 {
  margin: 0;
  font-size: 18px;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

.trend-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fafafa;
}

.trend-date {
  margin: 0 0 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
}

.trend-metric {
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 12px;
}

.trend-metric strong {
  color: #111827;
}

.goods-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
}

.count {
  color: #6b7280;
  font-size: 13px;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.goods-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.goods-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
}

.goods-image {
  position: relative;
  aspect-ratio: 1;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.condition {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.goods-info {
  padding: 10px;
}

.goods-info h3 {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f97316;
  font-weight: 700;
  font-size: 18px;
}

.location {
  color: #6b7280;
  font-size: 12px;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 26px 0 20px;
}

.empty i {
  font-size: 36px;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .profile-main {
    flex-wrap: wrap;
  }
}
</style>
