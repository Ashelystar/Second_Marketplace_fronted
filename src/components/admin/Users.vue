<template>
  <div class="users-content">
    <div class="section-header">
      <h2>用户管理</h2>
      <p class="section-description">管理平台用户，包括警告和封禁操作</p>
    </div>
    
    <div class="search-bar">
      <ElInput 
        v-model="searchKeyword" 
        placeholder="搜索用户ID、昵称或账号" 
        style="width: 300px;" 
        prefix-icon="Search"
      />
      <ElButton type="primary" @click="handleSearch">搜索</ElButton>
    </div>
    
    <ElTable :data="filteredUsers" style="width: 100%" stripe>
      <ElTableColumn prop="id" label="用户ID" width="100" />
      <ElTableColumn prop="username" label="账号" width="180" />
      <ElTableColumn prop="nickname" label="昵称" width="180" />
      <ElTableColumn prop="email" label="邮箱" width="220" />
      <ElTableColumn prop="phone" label="手机号" width="150" />
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '活跃' : '封禁' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="role" label="角色" width="100">
        <template #default="scope">
          <ElTag type="info">{{ scope.row.role }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="lastLoginTime" label="最后登录" width="180" />
      <ElTableColumn label="操作" width="200">
        <template #default="scope">
          <ElButton type="warning" size="small" @click="warnUser(scope.row.id)">
            警告
          </ElButton>
          <ElButton 
            :type="scope.row.status === 'active' ? 'danger' : 'success'" 
            size="small" 
            @click="banUser(scope.row.id)"
            style="margin-left: 8px;"
          >
            {{ scope.row.status === 'active' ? '封禁' : '解封' }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    
    <div class="pagination">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="adminStore.users.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage } from 'element-plus'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤用户
const filteredUsers = computed(() => {
  let users = adminStore.users
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    users = users.filter(user => 
      user.id.toString().includes(keyword) ||
      user.username.toLowerCase().includes(keyword) ||
      user.nickname.toLowerCase().includes(keyword) ||
      (user.email && user.email.toLowerCase().includes(keyword)) ||
      (user.phone && user.phone.includes(keyword))
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.slice(start, end)
})

// 搜索用户
function handleSearch() {
  currentPage.value = 1
}

// 页面大小变化
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

// 当前页面变化
function handleCurrentChange(current: number) {
  currentPage.value = current
}

// 警告用户
function warnUser(userId: number) {
  ElMessage.info(`警告用户 ${userId}`)
  // 实际项目中这里应该调用API
}

// 封禁用户
function banUser(userId: number) {
  ElMessage.info(`封禁用户 ${userId}`)
  // 实际项目中这里应该调用API
}

onMounted(() => {
  adminStore.loadUsers()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.section-header {
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.section-description {
  margin: 0;
  color: #666;
  font-size: 1rem;
}
</style>