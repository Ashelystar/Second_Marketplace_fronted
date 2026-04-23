<template>
  <div class="users-content">
    <div class="section-header">
      <h2>用户管理</h2>
      <p class="section-description">管理平台用户，包括警告和封禁操作</p>
    </div>
    
    <div class="search-bar">
      <div class="filter-options">
        <ElSelect v-model="statusFilter" placeholder="按状态筛选" style="width: 120px; margin-right: 10px;">
          <ElOption label="全部" value="" />
          <ElOption label="活跃" value="active" />
          <ElOption label="封禁中" value="banned" />
          <ElOption label="禁止购买" value="no-buy" />
          <ElOption label="禁止销售" value="no-sell" />
        </ElSelect>
        <ElSelect v-model="roleFilter" placeholder="按角色筛选" style="width: 120px; margin-right: 10px;">
          <ElOption label="全部" value="" />
          <ElOption label="管理员" value="admin" />
          <ElOption label="普通用户" value="user" />
        </ElSelect>
      </div>
      <div class="search-input">
        <ElInput 
          v-model="searchKeyword" 
          placeholder="搜索用户" 
          style="width: 300px;" 
          prefix-icon="Search"
        />
        <ElDropdown style="margin-left: 10px;">
          <ElButton>
            搜索字段 <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem>
                <ElCheckboxGroup v-model="searchFields">
                  <ElCheckbox label="id">ID</ElCheckbox>
                  <ElCheckbox label="username">账号</ElCheckbox>
                  <ElCheckbox label="nickname">昵称</ElCheckbox>
                  <ElCheckbox label="email">邮箱</ElCheckbox>
                  <ElCheckbox label="phone">手机号</ElCheckbox>
                </ElCheckboxGroup>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
        <ElButton type="primary" @click="handleSearch" style="margin-left: 10px;">
          搜索
        </ElButton>
      </div>
    </div>
    
    <div class="table-container">
      <ElTable :data="filteredUsers" style="width: 100%" stripe>
        <ElTableColumn prop="id" label="用户ID" width="80" />
        <ElTableColumn prop="username" label="账号" width="150" />
        <ElTableColumn prop="nickname" label="昵称" width="120" />
        <ElTableColumn prop="email" label="邮箱" width="180" />
        <ElTableColumn prop="phone" label="手机号" width="120" />
        <ElTableColumn prop="userStatus" label="状态" width="100">
          <template #default="scope">
            <ElTag :type="getTagType(scope.row)">
              {{ getStatusText(scope.row) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="角色" width="80">
          <template #default="scope">
            <ElTag :type="scope.row.isAdmin ? 'danger' : 'info'">
              {{ scope.row.isAdmin ? '管理员' : '用户' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="lastLoginAt" label="最后登录" width="150" />
        <ElTableColumn label="操作" width="200">
          <template #default="scope">
            <ElButton type="info" size="small" @click="notifyUser(scope.row.id)">
              通知
            </ElButton>
            <ElButton 
              :type="isFullyActive(scope.row) ? 'danger' : 'success'" 
              size="small" 
              @click="showBanDialog(scope.row)"
              style="margin-left: 8px;"
            >
              {{ isFullyActive(scope.row) ? '封禁' : '解封' }}
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    
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
    
    <!-- 封禁/解封理由输入模态框 -->
    <ElDialog
      v-model="banDialogVisible"
      :title="banDialogTitle"
      width="500px"
    >
      <ElForm :model="banForm" label-width="100px">
        <ElFormItem :label="isFullyActive(currentUser) ? '封禁理由' : '解封理由'">
          <ElInput
            v-model="banForm.reason"
            type="textarea"
            :rows="4"
            :placeholder="isFullyActive(currentUser) ? '请输入封禁理由' : '请输入解封理由'"
            required
          />
        </ElFormItem>
        <ElFormItem label="权限控制">
          <ElCheckboxGroup v-model="banForm.permissions">
            <ElCheckbox label="canBuy">{{ isFullyActive(currentUser) ? '禁止购买' : '允许购买' }}</ElCheckbox>
            <ElCheckbox label="canSell">{{ isFullyActive(currentUser) ? '禁止销售' : '允许销售' }}</ElCheckbox>
            <ElCheckbox label="userStatus">{{ isFullyActive(currentUser) ? '禁止其他操作（评论等）' : '允许其他操作（评论等）' }}</ElCheckbox>
          </ElCheckboxGroup>
        </ElFormItem>
        <ElFormItem label="消息推送">
          <ElSwitch v-model="banForm.notify" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="banDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="confirmBan">确定</ElButton>
        </span>
      </template>
    </ElDialog>
    
    <!-- 通知模态框 -->
    <ElDialog
      v-model="notifyDialogVisible"
      title="发送通知"
      width="500px"
    >
      <ElForm :model="notifyForm" label-width="100px">
        <ElFormItem label="通知等级">
          <ElRadioGroup v-model="notifyForm.level">
            <ElRadio label="info">信息</ElRadio>
            <ElRadio label="warning">警告</ElRadio>
            <ElRadio label="error">错误</ElRadio>
            <ElRadio label="success">成功</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="通知内容">
          <ElInput
            v-model="notifyForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
            required
          />
        </ElFormItem>
        <ElFormItem label="消息推送">
          <ElSwitch v-model="notifyForm.notify" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="notifyDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="confirmNotify">确定</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage, ElDialog, ElForm, ElFormItem, ElSwitch, ElCheckboxGroup, ElCheckbox } from 'element-plus'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 封禁对话框
const banDialogVisible = ref(false)
const banDialogTitle = ref('')
const banForm = ref({
  reason: '',
  notify: true,
  permissions: [] as string[]
})
const currentUser = ref<any>(null)

// 通知对话框
const notifyDialogVisible = ref(false)
const notifyForm = ref({
  level: 'info',
  content: '',
  notify: true
})
const currentNotifyUserId = ref(0)

// 过滤选项
const statusFilter = ref('')
const roleFilter = ref('')
const searchFields = ref(['id', 'username', 'nickname', 'email', 'phone'])

// 过滤用户
const filteredUsers = computed(() => {
  let users = adminStore.users
  
  // 按状态过滤
  if (statusFilter.value) {
    users = users.filter(user => {
      switch (statusFilter.value) {
        case 'active':
          return user.userStatus === 'active' && user.canBuy && user.canSell
        case 'banned':
          return user.userStatus !== 'active'
        case 'no-buy':
          return user.userStatus === 'active' && !user.canBuy && user.canSell
        case 'no-sell':
          return user.userStatus === 'active' && user.canBuy && !user.canSell
        default:
          return true
      }
    })
  }
  
  // 按角色过滤
  if (roleFilter.value) {
    users = users.filter(user => {
      if (roleFilter.value === 'admin') {
        return user.isAdmin
      } else if (roleFilter.value === 'user') {
        return !user.isAdmin
      }
      return true
    })
  }
  
  // 按搜索字段过滤
  if (searchKeyword.value && searchFields.value.length > 0) {
    const keyword = searchKeyword.value.toLowerCase()
    users = users.filter(user => {
      return searchFields.value.some(field => {
        switch (field) {
          case 'id':
            return user.id.toString().includes(keyword)
          case 'username':
            return user.username.toLowerCase().includes(keyword)
          case 'nickname':
            return user.nickname.toLowerCase().includes(keyword)
          case 'email':
            return user.email && user.email.toLowerCase().includes(keyword)
          case 'phone':
            return user.phone && user.phone.includes(keyword)
          default:
            return false
        }
      })
    })
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

// 获取标签类型
function getTagType(user: any) {
  if (!user.userStatus) return 'info'
  
  if (user.userStatus !== 'active') return 'danger'
  if (!user.canBuy) return 'warning'
  if (!user.canSell) return 'warning'
  return 'success'
}

// 判断用户是否完全活跃
function isFullyActive(user: any) {
  return user.userStatus === 'active' && user.canBuy && user.canSell
}

// 获取状态文本
function getStatusText(user: any) {
  if (!user.userStatus) return '未知'
  
  if (user.userStatus !== 'active') return '封禁中'
  if (!user.canBuy && !user.canSell) return '完全禁用'
  if (!user.canBuy) return '禁止购买'
  if (!user.canSell) return '禁止销售'
  return '活跃'
}

// 显示封禁/解封对话框
function showBanDialog(user: any) {
  currentUser.value = user
  const isFullyActive = user.userStatus === 'active' && user.canBuy && user.canSell
  
  if (isFullyActive) {
    // 封禁逻辑
    banDialogTitle.value = `封禁用户 ${user.nickname}`
    banForm.value.reason = ''
    banForm.value.notify = true
    banForm.value.permissions = []
  } else {
    // 解封逻辑
    banDialogTitle.value = `解封用户 ${user.nickname}`
    banForm.value.reason = ''
    banForm.value.notify = true
    banForm.value.permissions = []
    
    // 默认选中已禁用的权限（需要解封的权限）
    if (!user.canBuy) banForm.value.permissions.push('canBuy')
    if (!user.canSell) banForm.value.permissions.push('canSell')
    if (user.userStatus !== 'active') banForm.value.permissions.push('userStatus')
  }
  
  banDialogVisible.value = true
}

// 计算权限计数
function calculatePermissionCount(user: any, permissions: string[]) {
  let count = 0
  
  // 计算当前封禁的权限数
  let currentBannedCount = 0
  if (user.userStatus !== 'active') currentBannedCount++
  if (!user.canBuy) currentBannedCount++
  if (!user.canSell) currentBannedCount++
  
  // 计算操作后的权限数
  let newBannedCount = currentBannedCount
  
  if (user.userStatus === 'active' && user.canBuy && user.canSell) {
    // 封禁操作
    if (permissions.includes('userStatus')) newBannedCount++
    if (permissions.includes('canBuy')) newBannedCount++
    if (permissions.includes('canSell')) newBannedCount++
  } else {
    // 解封操作
    if (permissions.includes('userStatus') && user.userStatus !== 'active') newBannedCount--
    if (permissions.includes('canBuy') && !user.canBuy) newBannedCount--
    if (permissions.includes('canSell') && !user.canSell) newBannedCount--
  }
  
  return newBannedCount - currentBannedCount
}

// 确认封禁/解封
async function confirmBan() {
  // 验证理由
  if (!banForm.value.reason.trim()) {
    ElMessage.error('请输入操作理由')
    return
  }
  
  // 验证是否选择了权限
  if (banForm.value.permissions.length === 0) {
    ElMessage.error('请至少选择一项权限进行操作')
    return
  }
  
  // 验证权限计数
  const permissionCount = calculatePermissionCount(currentUser.value, banForm.value.permissions)
  const isFullyActive = currentUser.value.userStatus === 'active' && currentUser.value.canBuy && currentUser.value.canSell
  
  if (isFullyActive) {
    // 封禁操作，权限计数应为+1,+2,+3
    if (permissionCount < 1 || permissionCount > 3) {
      ElMessage.error('封禁操作必须选择至少一项权限')
      return
    }
  } else {
    // 解封操作，权限计数应为-1,-2,-3
    if (permissionCount > -1 || permissionCount < -3) {
      ElMessage.error('解封操作必须选择至少一项已封禁的权限')
      return
    }
  }
  
  try {
    const token = localStorage.getItem('token')
    
    if (isFullyActive) {
      // 封禁操作
      // 处理用户状态
      if (banForm.value.permissions.includes('userStatus')) {
        const response = await fetch(`/api/admin/user/ban/${currentUser.value.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            reason: banForm.value.reason, 
            notify: banForm.value.notify 
          })
        })
        
        if (!response.ok) {
          throw new Error(`封禁用户失败: ${response.status}`)
        }
      }
      
      // 处理购买权限
      if (banForm.value.permissions.includes('canBuy')) {
        const response = await fetch('/api/admin/user/toggle-can-buy', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId: currentUser.value.id, 
            canBuy: false 
          })
        })
        
        if (!response.ok) {
          throw new Error(`禁用购买权限失败: ${response.status}`)
        }
      }
      
      // 处理销售权限
      if (banForm.value.permissions.includes('canSell')) {
        const response = await fetch('/api/admin/user/toggle-can-sell', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId: currentUser.value.id, 
            canSell: false 
          })
        })
        
        if (!response.ok) {
          throw new Error(`禁用销售权限失败: ${response.status}`)
        }
      }
    } else {
      // 解封操作
      // 处理用户状态
      if (banForm.value.permissions.includes('userStatus')) {
        const response = await fetch(`/api/admin/user/unban/${currentUser.value.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            reason: banForm.value.reason, 
            notify: banForm.value.notify 
          })
        })
        
        if (!response.ok) {
          throw new Error(`解封用户失败: ${response.status}`)
        }
      }
      
      // 处理购买权限
      if (banForm.value.permissions.includes('canBuy')) {
        const response = await fetch('/api/admin/user/toggle-can-buy', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId: currentUser.value.id, 
            canBuy: true 
          })
        })
        
        if (!response.ok) {
          throw new Error(`启用购买权限失败: ${response.status}`)
        }
      }
      
      // 处理销售权限
      if (banForm.value.permissions.includes('canSell')) {
        const response = await fetch('/api/admin/user/toggle-can-sell', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            userId: currentUser.value.id, 
            canSell: true 
          })
        })
        
        if (!response.ok) {
          throw new Error(`启用销售权限失败: ${response.status}`)
        }
      }
    }
    
    // 更新本地数据
    const user = adminStore.users.find(u => u.id === currentUser.value.id)
    if (user) {
      if (isFullyActive) {
        // 封禁操作
        if (banForm.value.permissions.includes('userStatus')) {
          user.userStatus = 'banned'
        }
        if (banForm.value.permissions.includes('canBuy')) {
          user.canBuy = false
        }
        if (banForm.value.permissions.includes('canSell')) {
          user.canSell = false
        }
      } else {
        // 解封操作
        if (banForm.value.permissions.includes('userStatus')) {
          user.userStatus = 'active'
        }
        if (banForm.value.permissions.includes('canBuy')) {
          user.canBuy = true
        }
        if (banForm.value.permissions.includes('canSell')) {
          user.canSell = true
        }
      }
    }
    
    ElMessage.success('操作成功')
    banDialogVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 显示通知模态框
function notifyUser(userId: number) {
  currentNotifyUserId.value = userId
  notifyForm.value.level = 'info'
  notifyForm.value.content = ''
  notifyForm.value.notify = true
  notifyDialogVisible.value = true
}

// 确认发送通知
async function confirmNotify() {
  if (!notifyForm.value.content.trim()) {
    ElMessage.error('请输入通知内容')
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    // 实际项目中这里应该调用API发送通知
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success('通知发送成功')
      notifyDialogVisible.value = false
    }, 500)
  } catch (error) {
    console.error('发送通知失败:', error)
    ElMessage.error('发送通知失败')
  }
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

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.search-bar {
  margin-bottom: 20px;
}

.filter-options {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.search-input {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .search-input {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  .search-input .el-checkbox-group {
    margin-bottom: 10px;
  }
  
  .search-input .el-button {
    margin-left: 0 !important;
  }
}
</style>