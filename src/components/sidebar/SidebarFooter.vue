<template>
  <div class="sidebar-footer">
    <button class="logout-button" @click="handleLogout">
      <span class="nav-icon">
        <component :is="logoutIcon" />
      </span>
      <span class="nav-text">{{ logoutText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  logoutText: {
    type: String,
    default: '退出登录'
  },
  logoutIcon: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['logout'])

function handleLogout() {
  emit('logout')
}
</script>

<style scoped>
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #f5f5f5;
  color: #ff7f00;
  border-color: #ff7f00;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
}
</style>