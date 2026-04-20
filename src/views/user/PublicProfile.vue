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
              <span v-if="seller.goodRate">好评率 {{ seller.goodRate }}%</span>
            </p>
          </div>

          <button class="contact-btn" @click="goToChat">
            <i class="fa fa-commenting"></i>
            沟通一下
          </button>
        </div>

        <div class="stats">
          <span>在售 <strong>{{ seller.onSale }}</strong></span>
          <span>已售 <strong>{{ seller.sold }}</strong></span>
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
              <img :src="item.image" :alt="item.title" />
              <span class="condition">{{ item.condition }}</span>
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
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Topnav from '@/components/TopNav.vue'
import { useProductStore } from '@/stores/productStore'

defineOptions({ name: 'PublicProfile' })

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const sellerId = computed(() => Number(route.params.id))

const sellerProducts = computed(() => {
  if (!Number.isFinite(sellerId.value)) return []
  return productStore.products
    .filter((product) => product.sellerId === sellerId.value)
    .sort((a, b) => b.id - a.id)
})

const seller = computed(() => {
  const base = sellerProducts.value[0]
  if (!base) return null

  return {
    id: base.sellerId,
    name: base.sellerName,
    avatar: base.sellerAvatar || '',
    location: base.location,
    rating: base.sellerRating || 0,
    verified: Boolean(base.sellerVerified),
    goodRate: base.sellerGoodRate || 0,
    onSale: base.sellerOnSale || sellerProducts.value.length,
    sold: base.sellerSold || 0,
  }
})

const goToDetail = (id: number) => {
  router.push({ path: '/detail', query: { id: id.toString() } })
}

const goToChat = () => {
  if (!seller.value) return
  router.push({
    path: `/chat/room/${seller.value.id}`,
    query: { name: seller.value.name },
  })
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
})
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
