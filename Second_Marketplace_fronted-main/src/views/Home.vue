<template>
  <section class="page-panel home-panel">
    <section class="hero-card">
      <div>
        <p class="hero-label">销售系统</p>
        <h1>交易订单与用户管理</h1>
        <p>专注订单流程、用户账户与权限、资料展示与交易体验。</p>
      </div>
      <div class="hero-actions">
        <RouterLink to="/orders" class="primary-button">查看订单</RouterLink>
        <RouterLink to="/profile" class="secondary-button">用户中心</RouterLink>
      </div>
    </section>

    <section class="cards-grid">
      <article class="feature-card">
        <p class="feature-title">订单概览</p>
        <p>展示当前订单状态、付款、发货、交易方式与收货信息。</p>
      </article>
      <article class="feature-card">
        <p class="feature-title">用户资料</p>
        <p>支持用户登录、注册、个人信息与权限状态展示。</p>
      </article>
      <article class="feature-card">
        <p class="feature-title">前端交互</p>
        <p>模拟 API 交互、订单详情和用户统计数据展示。</p>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.page-panel {
  display: grid;
  gap: 24px;
}

.hero-card {
  background: linear-gradient(180deg, #fff5d7 0%, #ffebc2 100%);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  gap: 32px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 18px 40px rgba(255, 166, 0, 0.15);
}

.hero-label {
  margin: 0;
  color: #ff7d00;
  font-weight: 800;
}

.hero-card h1 {
  margin: 0;
  font-size: clamp(2.1rem, 3vw, 3.2rem);
}

.hero-card p {
  margin: 12px 0 0;
  max-width: 680px;
  line-height: 1.7;
  color: #444;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 154px;
  padding: 14px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
}

.primary-button {
  background: #ff5a00;
  color: #fff;
}

.secondary-button {
  background: #fff;
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
}

.feature-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(22, 24, 30, 0.06);
}

.feature-title {
  margin: 0 0 12px;
  font-size: 1.15rem;
  font-weight: 700;
}

.feature-card p {
  margin: 0;
  color: #575757;
  line-height: 1.7;
}
</style>