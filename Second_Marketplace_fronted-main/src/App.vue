<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-logo"></div>
        <div>
          <p class="brand-title">销售管理系统</p>
          <p class="brand-subtitle">交易订单与用户模块前端界面</p>
        </div>
      </div>
      <nav class="top-nav">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/orders" class="nav-link">交易订单</RouterLink>
        <RouterLink to="/profile" class="nav-link">用户中心</RouterLink>
        <RouterLink to="/login" class="nav-link action">登录</RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="app-footer">
      <span>前端模块展示 • 交易订单 + 用户资料</span>
      <RouterLink to="/orders" class="footer-button">查看我的订单</RouterLink>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f5f5f7;
  color: #222;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #ffd400, #ff8a00);
  padding: 24px 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.45);
}

.brand-title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #222;
}

.brand-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #4a4a4a;
}

.top-nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-link {
  padding: 11px 16px;
  border-radius: 999px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.65);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.95);
}

.nav-link.action {
  background: #fff;
  color: #ff5a00;
  box-shadow: 0 10px 20px rgba(255, 90, 0, 0.18);
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 28px;
  background: #fff;
  border-top: 1px solid #ececec;
  flex-wrap: wrap;
}

.footer-button {
  padding: 12px 20px;
  background: #ff5a00;
  color: white;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 820px) {
  .app-header,
  .app-footer {
    padding: 18px 16px;
  }
}
</style>
