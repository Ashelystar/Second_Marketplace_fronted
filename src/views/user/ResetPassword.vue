<template>
  <section class="page-panel auth-panel">
    <div class="auth-card">
      <header class="auth-header">
        <p class="auth-label">账户安全</p>
        <h2>重置密码</h2>
        <p>请输入新密码并确认，提交后将完成密码重置。</p>
      </header>

      <form class="auth-form" @submit.prevent="handleResetPassword">
        <div class="field-group">
          <label>新密码</label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码" />
        </div>
        <div class="field-group">
          <label>确认新密码</label>
          <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码" />
        </div>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '确认重置' }}
        </button>
      </form>

      <footer class="auth-footer">
        <RouterLink to="/user/forgot-password">返回忘记密码</RouterLink>
        <RouterLink to="/user/login">返回登录</RouterLink>
        <RouterLink to="/">返回首页</RouterLink>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPasswordApi } from '@/api/user'

const route = useRoute()
const router = useRouter()
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleResetPassword() {
  const rawToken = typeof route.query.token === 'string' ? route.query.token : ''
  const trimmedToken = rawToken.trim()
  const trimmedPassword = newPassword.value.trim()
  const trimmedConfirmPassword = confirmPassword.value.trim()

  if (!trimmedToken) {
    alert('缺少验证码，请先在“忘记密码”页面完成验证码验证')
    await router.push('/user/forgot-password')
    return
  }
  if (!trimmedPassword) {
    alert('请输入新密码')
    return
  }
  if (trimmedPassword.length < 6) {
    alert('新密码长度不能少于 6 位')
    return
  }
  if (trimmedPassword !== trimmedConfirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }

  loading.value = true
  try {
    await resetPasswordApi({
      token: trimmedToken,
      newPassword: trimmedPassword,
    })
    alert('密码重置成功，请重新登录。')
    await router.push('/user/login')
  } catch (error) {
    if (error instanceof Error) {
      alert('重置失败：' + error.message)
    } else {
      alert('重置失败，未知错误')
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
