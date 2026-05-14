<template>
  <div class="sidebar-header">
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '管理中心'
  }
})
</script>

<style scoped>
.sidebar-header {
  padding: 24px 16px;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #ff7f00;
  text-align: center;
}
</style>