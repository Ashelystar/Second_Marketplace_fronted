<template>
  <section class="page-panel profile-panel">
    <div class="profile-top-card">
      <div class="profile-avatar">
        <span>{{ shortName }}</span>
      </div>
      <div class="profile-info">
        <strong>{{ profile?.nickname || '销售人员' }}</strong>
        <p>{{ profile?.username || 'sales_user' }}</p>
        <div class="status-badges">
          <span class="badge">{{ profile?.user_status || 'active' }}</span>
          <span class="badge">权限: {{ profile?.can_buy ? '买家' : '' }} {{ profile?.can_sell ? '卖家' : '' }}</span>
        </div>
      </div>
      <div class="profile-actions">
        <button class="small-button" @click="refreshProfile">刷新</button>
        <button class="small-button secondary" @click="handleLogout">退出登录</button>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <p>我的订单</p>
        <strong>{{ stats.total_orders }}</strong>
      </article>
      <article class="stat-card">
        <p>我的客户</p>
        <strong>{{ stats.total_customers }}</strong>
      </article>
      <article class="stat-card">
        <p>收藏商品</p>
        <strong>{{ stats.total_favorites }}</strong>
      </article>
      <article class="stat-card">
        <p>好评率</p>
        <strong>{{ stats.positive_rate }}%</strong>
      </article>
    </div>

    <div class="profile-panel-card">
      <h3>个人资料</h3>
      <div class="profile-detail-grid">
        <div>
          <label>用户名</label>
          <p>{{ profile?.username || '-' }}</p>
        </div>
        <div>
          <label>手机号</label>
          <p>{{ profile?.phone || '未绑定' }}</p>
        </div>
        <div>
          <label>注册时间</label>
          <p>{{ profile?.registered_at?.slice(0, 10) }}</p>
        </div>
        <div>
          <label>最后登录</label>
          <p>{{ profile?.last_login_at?.slice(0, 16) || '-' }}</p>
        </div>
      </div>
    </div>

    <div class="profile-panel-card">
      <h3>快速入口</h3>
      <div class="profile-actions-grid">
        <RouterLink to="/orders" class="action-card">交易订单</RouterLink>
        <RouterLink to="/orders?status=pending_payment" class="action-card">待付款</RouterLink>
        <RouterLink to="/orders?status=shipped" class="action-card">待收货</RouterLink>
        <RouterLink to="/orders?status=completed" class="action-card">已完成</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

const profile = computed(() => userStore.profile)
const stats = computed(() => userStore.stats)
const shortName = computed(() => profile.value?.nickname?.slice(0, 2) || '销')

async function refreshProfile() {
  try {
    await userStore.fetchProfile()
    await userStore.fetchStats()
  } catch (error) {
    alert('请先登录')
    router.push('/login')
  }
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    await refreshProfile()
  } catch {
    router.push('/login')
  }
})
</script>

<style scoped>
.page-panel {
  display: grid;
  gap: 24px;
}

.profile-top-card,
.profile-panel-card {
  background: #fff;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 32px rgba(19, 23, 33, 0.08);
}

.profile-top-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
}

.profile-avatar {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: #ffdfb3;
  display: grid;
  place-items: center;
  color: #ba5600;
  font-size: 2rem;
  font-weight: 800;
}

.profile-info strong {
  display: block;
  font-size: 1.7rem;
  margin-bottom: 8px;
}

.profile-info p {
  margin: 0;
  color: #6a6a6a;
}

.status-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.badge {
  padding: 8px 14px;
  border-radius: 999px;
  background: #fff3db;
  color: #b25600;
  font-size: 0.88rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.small-button {
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  background: #ff7e00;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.small-button.secondary {
  background: #f2f2f4;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 18px;
}

.stat-card {
  background: #fff7e5;
  padding: 22px;
  border-radius: 20px;
}

.stat-card p {
  margin: 0 0 10px;
  color: #6a6a6a;
}

.stat-card strong {
  font-size: 2rem;
}

.profile-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.profile-detail-grid label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.profile-detail-grid p {
  margin: 0;
  color: #222;
  font-weight: 600;
}

.profile-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.action-card {
  display: block;
  padding: 18px 20px;
  border-radius: 20px;
  background: #fff8ee;
  color: #343434;
  text-decoration: none;
  font-weight: 700;
}
</style>