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
        <RouterLink to="/user/forgot-password">忘记密码</RouterLink>
        <RouterLink to="/">返回首页</RouterLink>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { loginApi, getUserPermissionsApi } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const account = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    if (!account.value.trim() || !password.value.trim()) {
      ElMessage.info('请输入账号和密码')
      return
    }
    const data = await loginApi({
      account: account.value.trim(),
      password: password.value.trim(),
    })
    userStore.login(
      {
        ...data.userInfo,
        avatar: data.userInfo.avatarUrl || data.userInfo.avatar || null,
      },
      data.token
    )
    
    // 检查用户权限
    const permissions = await getUserPermissionsApi()
    if (permissions.isAdmin) {
        ElMessage.success('登录成功！您是管理员')
        await router.push('/admin')
      } else {
        ElMessage.success('登录成功！')
        await router.push('/user/center')
      }
  } catch (error) {
    // 详细错误提示
    if (error instanceof Error) {
      ElMessage.error('登录失败：' + error.message)
    } else {
      ElMessage.error('登录失败，未知错误')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-panel {
  min-height: calc(100vh - 88px);
  display: grid;
  place-items: center;
  padding: 32px 16px;
}

.auth-panel {
  background: linear-gradient(180deg, #fffaf5 0%, #fff 45%);
}

.auth-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 36px 32px;
  border: 1px solid #f2f2f2;
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
  font-weight: 600;
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
  box-shadow: 0 0 0 3px rgba(255, 140, 0, 0.14);
  background: #fff;
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
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.primary-button:hover:not(:disabled) {
  background: #f27300;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(255, 127, 0, 0.3);
}

.primary-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.auth-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
  font-size: 0.95rem;
}

.auth-footer a {
  color: #ff6d00;
  text-decoration: none;
  padding: 2px 0;
}

.auth-footer a:hover {
  color: #f27300;
}

@media (max-width: 640px) {
  .auth-card {
    border-radius: 18px;
    padding: 28px 20px;
  }

  .auth-card h2 {
    font-size: 1.6rem;
  }
}
</style>
