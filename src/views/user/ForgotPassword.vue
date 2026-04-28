<template>
  <section class="page-panel auth-panel">
    <div class="auth-card">
      <header class="auth-header">
        <p class="auth-label">账户安全</p>
        <h2>忘记密码</h2>
        <p>请输入账号获取验证码，然后输入验证码完成验证。</p>
      </header>

      <form class="auth-form" @submit.prevent="handleVerifyToken">
        <div class="field-group">
          <label>账号</label>
          <input v-model="account" type="text" placeholder="请输入账号" />
        </div>
        <button
          class="secondary-button"
          type="button"
          :disabled="requestLoading"
          @click="handleRequestToken"
        >
          {{ requestLoading ? '获取中...' : '获取验证码' }}
        </button>
        <div class="field-group">
          <label>验证码</label>
          <input v-model="verifyCode" type="text" placeholder="请输入获取到的验证码" />
        </div>
        <button class="primary-button" type="submit" :disabled="verifyLoading">
          {{ verifyLoading ? '验证中...' : '验证' }}
        </button>
      </form>

      <footer class="auth-footer">
        <RouterLink to="/user/login">返回登录</RouterLink>
        <RouterLink to="/user/register">新用户注册</RouterLink>
        <RouterLink to="/">返回首页</RouterLink>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPasswordApi } from '@/api/user'

const router = useRouter()
const account = ref('')
const verifyCode = ref('')
const requestLoading = ref(false)
const verifyLoading = ref(false)
const tokenRequested = ref(false)

async function handleRequestToken() {
  const trimmedAccount = account.value.trim()
  if (!trimmedAccount) {
    alert('请输入账号')
    return
  }

  requestLoading.value = true
  try {
    await forgotPasswordApi({ account: trimmedAccount })
    tokenRequested.value = true
    alert('验证码已请求成功。请从后端控制台复制验证码后粘贴到输入框进行验证。')
  } catch (error) {
    if (error instanceof Error) {
      alert('获取验证码失败：' + error.message)
    } else {
      alert('获取验证码失败，未知错误')
    }
  } finally {
    requestLoading.value = false
  }
}

async function handleVerifyToken() {
  const trimmedAccount = account.value.trim()
  const trimmedCode = verifyCode.value.trim()

  if (!trimmedAccount) {
    alert('请输入账号')
    return
  }
  if (!tokenRequested.value) {
    alert('请先点击“获取验证码”')
    return
  }
  if (!trimmedCode) {
    alert('请输入验证码')
    return
  }

  verifyLoading.value = true
  try {
    await router.push({
      path: '/user/reset-password',
      query: {
        token: trimmedCode,
        account: trimmedAccount,
      },
    })
  } finally {
    verifyLoading.value = false
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

.secondary-button {
  width: 100%;
  padding: 12px 0;
  border: 1px solid #ffb266;
  border-radius: 999px;
  background: #fff7ec;
  color: #d66a00;
  font-weight: 700;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.secondary-button:hover:not(:disabled) {
  background: #ffefd8;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(214, 106, 0, 0.15);
}

.secondary-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.primary-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.tip-text {
  margin: 0;
  font-size: 0.9rem;
  color: #8a8a8a;
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
