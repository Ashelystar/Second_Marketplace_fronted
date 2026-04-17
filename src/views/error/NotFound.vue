<template>
  <div class="not-found-page">
    <div class="error-container">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被移除</div>
      <div class="error-actions">
        <RouterLink to="/" class="btn btn-primary">返回 首页</RouterLink>


        <button @click="goBack" class="btn btn-outline">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}

.error-container {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #ddd;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.error-desc {
  color: #666;
  margin-bottom: 32px;
  font-size: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #00a4bb;
  color: white;
}

.btn-primary:hover {
  background-color: #008c9e;
}

.btn-outline {
  background-color: white;
  border: 1px solid #ddd;
  color: #333;
}

.btn-outline:hover {
  background-color: #f5f5f5;
}
</style>
