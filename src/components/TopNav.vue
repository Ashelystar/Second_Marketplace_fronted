<template>
  <header class="header">
    <div class="container row">
      <RouterLink class="brand" to="/">
        <span class="logo">闲置</span>
      </RouterLink>

      <nav class="nav" aria-label="主导航">
        <RouterLink class="link" to="/">首页</RouterLink>
        <RouterLink class="link" to="/forum">社区</RouterLink>
      </nav>

      <div class="user">
        <img class="uavatar" :src="store.currentUserAvatarUrl" alt="avatar" />
        <span class="uname">{{ store.currentUserName }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useForumStore } from '../stores/forum'

const store = useForumStore()
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
  border-bottom: 1px solid var(--border);
}

.row {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 38px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #0b1220;
  background: rgba(0, 188, 212, 0.16);
  border: 1px solid rgba(0, 188, 212, 0.36);
}

.nav {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  justify-content: center;
}

.link {
  padding: 8px 10px;
  border-radius: 10px;
  color: rgba(17, 24, 39, 0.75);
  transition: background-color 120ms ease, color 120ms ease;
}

.link:hover {
  background: rgba(17, 24, 39, 0.04);
  color: rgba(17, 24, 39, 0.92);
}

.link.router-link-active {
  background: rgba(0, 188, 212, 0.10);
  border: 1px solid rgba(0, 188, 212, 0.22);
  color: rgba(17, 24, 39, 0.92);
}

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  flex: none;
}

.uavatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.9);
}

.uname {
  color: rgba(17, 24, 39, 0.75);
  font-weight: 800;
  font-size: 14px;
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (max-width: 720px) {
  .nav {
    display: none;
  }

  .uname {
    display: none;
  }
}
</style>

