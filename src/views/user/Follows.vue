<template>
  <div class="follows-page">
    <div class="user-page-card p-6 mb-6">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-users text-xianyuText"></i>
        我的关注与粉丝
      </h1>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'following' }"
          @click="activeTab = 'following'"
        >
          关注列表 ({{ followingUsers.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'followers' }"
          @click="activeTab = 'followers'"
        >
          粉丝列表 ({{ followerUsers.length }})
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <i class="fa fa-spinner fa-spin"></i>
        <span>加载中...</span>
      </div>

      <div v-else-if="activeList.length === 0" class="empty-state">
        <i class="fa fa-user-o"></i>
        <p>{{ activeTab === 'following' ? '暂无关注用户' : '暂无粉丝' }}</p>
      </div>

      <div v-else class="user-grid">
        <article
          v-for="item in activeList"
          :key="item.id"
          class="user-card"
          @click="goToUserHome(item.id)"
        >
          <img
            v-if="item.avatar"
            :src="item.avatar"
            :alt="item.name"
            class="avatar"
          />
          <div v-else class="avatar avatar-fallback">{{ item.name.slice(0, 1) }}</div>
          <div class="user-meta">
            <h3 class="name">{{ item.name }}</h3>
            <p class="location">
              <i class="fa fa-map-marker"></i>
              {{ item.location }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useProductStore } from '@/stores/productStore'

defineOptions({ name: 'UserFollows' })

interface UserCard {
  id: number
  name: string
  avatar: string
  location: string
}

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()

const activeTab = ref<'following' | 'followers'>('following')
const isLoading = ref(false)

const sellerMetaMap = computed(() => {
  const map = new Map<number, UserCard>()
  for (const p of productStore.products) {
    if (!p.sellerId || map.has(p.sellerId)) continue
    map.set(p.sellerId, {
      id: p.sellerId,
      name: p.sellerName || `用户${p.sellerId}`,
      avatar: p.sellerAvatar || '',
      location: p.location || '未知',
    })
  }
  return map
})

const toUserCard = (id: number): UserCard => {
  return sellerMetaMap.value.get(id) || {
    id,
    name: `用户${id}`,
    avatar: '',
    location: '未知',
  }
}

const followingUsers = computed(() => userStore.followIds.map(toUserCard))
const followerUsers = computed(() => userStore.followerIds.map(toUserCard))
const activeList = computed(() => (activeTab.value === 'following' ? followingUsers.value : followerUsers.value))

const goToUserHome = (userId: number) => {
  router.push({ path: `/user/home/${userId}` })
}

const loadData = async () => {
  if (!userStore.isLoggedIn) return
  isLoading.value = true
  try {
    await Promise.all([
      userStore.loadFollowIds(),
      userStore.loadFollowerIds(),
      productStore.initialize(),
    ])
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tab-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.tab-btn.active {
  border-color: #f97316;
  background: #fff7ed;
  color: #ea580c;
}

.loading-state,
.empty-state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 10px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.user-card {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.user-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-fallback {
  background: #fb923c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.name {
  margin: 0;
  font-size: 15px;
  color: #111827;
}

.location {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 12px;
}
</style>
