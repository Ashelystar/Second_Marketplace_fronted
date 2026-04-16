<template>
  <section class="page-panel auth-panel">
    <div class="auth-card">
      <header class="auth-header">
        <p class="auth-label">注册新账户</p>
        <h2>加入销售管理系统</h2>
        <p>创建账号后即可管理订单、查看客户与交易信息。</p>
      </header>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div class="field-group">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="请输入用户名" />
        </div>
        <div class="field-group">
          <label>昵称</label>
          <input v-model="nickname" type="text" placeholder="请输入昵称" />
        </div>
        <div class="field-group">
          <label>手机号</label>
          <input v-model="phone" type="text" placeholder="请输入手机号（可选）" />
        </div>
        <div class="field-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="设置登录密码" />
        </div>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '立即注册' }}
        </button>
      </form>

      <footer class="auth-footer">
        <RouterLink to="/user/login">已有账户？去登录</RouterLink>
        <RouterLink to="/">返回首页</RouterLink>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const nickname = ref('')
const phone = ref('')
const password = ref('')
const loading = ref(false)

async function handleRegister() {
  try {
    loading.value = true
    await userStore.register({ username: username.value, nickname: nickname.value, phone: phone.value, password: password.value })
    await router.push('/profile')
  } catch (error) {
    alert((error as Error).message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-panel {
  min-height: 72vh;
  display: grid;
  place-items: center;
}

.auth-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px;
  box-shadow: 0 20px 55px rgba(106, 115, 141, 0.12);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-label {
  margin: 0;
  color: #ff7d00;
  font-weight: 800;
}

.auth-card h2 {
  margin: 12px 0 0;
  font-size: 2rem;
}

.auth-card p {
  color: #5f5f5f;
  line-height: 1.7;
}

.auth-form {
  display: grid;
  gap: 18px;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group label {
  font-size: 0.95rem;
  color: #4e4e4e;
}

.field-group input {
  width: 100%;
  border: 1px solid #e6e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  background: #fbfbfb;
  color: #333;
  outline: none;
}

.field-group input:focus {
  border-color: #ff8c00;
}

.primary-button {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 999px;
  background: #ff7f00;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 22px;
  font-size: 0.95rem;
}

.auth-footer a {
  color: #ff6d00;
  text-decoration: none;
}
</style>