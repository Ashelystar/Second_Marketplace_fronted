<template>
  <div class="admin-container">
    <!-- 侧边导航 -->
    <AdminSidebar 
      :active-tab="activeTab" 
      @tab-change="setActiveTab" 
      @logout="handleLogout" 
    />

    <!-- 主内容区域 -->
    <main class="admin-content">
      <!-- 顶部栏 -->
      <header class="content-header">
        <div class="header-left">
          <h1>{{ getTabTitle(activeTab) }}</h1>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ userInfo?.nickname || userInfo?.username }}</span>
            <span class="user-role">管理员</span>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="content-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getUserPermissionsApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

const router = useRouter()
const userStore = useUserStore()
const userInfo = userStore.userInfo
const isAdmin = ref(false)
const activeTab = ref('dashboard')

// 检查用户权限
async function checkPermissions() {
  try {
    const permissions = await getUserPermissionsApi()
    isAdmin.value = permissions.isAdmin
    if (!isAdmin.value) {
      ElMessage.error('您没有管理员权限')
      await router.push('/user/center')
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    ElMessage.error('权限检查失败')
    await router.push('/user/center')
  }
}

// 设置激活标签
function setActiveTab(tabId: string) {
  activeTab.value = tabId
  // 导航到对应的子路由
  router.push(`/admin/${tabId === 'dashboard' ? '' : tabId}`)
}

// 获取标签标题
function getTabTitle(tabId: string): string {
  const titles: Record<string, string> = {
    dashboard: '仪表盘',
    users: '用户管理',
    products: '商品审核',
    disputes: '纠纷仲裁',
    forum: '社区管理',
    notifications: '系统通知'
  }
  return titles[tabId] || '管理中心'
}

// 退出登录
async function handleLogout() {
  userStore.logout()
  await router.push('/user/login')
}

onMounted(() => {
  checkPermissions()
  // 初始化时根据当前路由设置激活标签
  const path = router.currentRoute.value.path
  if (path === '/admin') {
    activeTab.value = 'dashboard'
  } else if (path.startsWith('/admin/')) {
    activeTab.value = path.replace('/admin/', '')
  }
})
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px; /* 与侧边栏宽度一致 */
  min-height: 100vh;
}

.content-header {
  background-color: #fff;
  padding: 20px 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.user-role {
  padding: 4px 12px;
  background-color: #ff7f00;
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
}

.content-body {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>