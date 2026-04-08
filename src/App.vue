<template>
  <div class="app">
    <TopNav />
    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TopNav from './components/TopNav.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.main {
  padding: 18px 0 40px;
}
</style>

