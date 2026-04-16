<template>
  <section class="page-panel auth-panel">
    <div class="auth-card">
      <header class="auth-header">
        <p class="auth-label">销售管理系统</p>
        <h2>登录你的账户</h2>
        <p>支持用户名 / 手机 / 邮箱登录，快速进入交易和用户中心。</p>
      </header>

      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="field-group">
          <label>用户名 / 手机 / 邮箱</label>
          <input v-model="account" type="text" placeholder="请输入登录账号" />
        </div>
        <div class="field-group">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="请输入登录密码" />
        </div>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>

      <footer class="auth-footer">
        <RouterLink to="/user/register">新用户注册</RouterLink>
        <RouterLink to="/">返回首页</RouterLink>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const account = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  try {
    loading.value = true
    if (!account.value.trim() || !password.value.trim()) {
      throw new Error('请输入账号和密码')
    }
    userStore.login({
      id: 1,
      username: account.value.trim(),
      avatar: 'https://i.pravatar.cc/120?img=12',
    })
    await router.push('/user/center')
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