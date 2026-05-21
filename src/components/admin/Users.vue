<template>
  <div class="users-content">
    <div class="section-header">
      <h2>用户管理</h2>
      <p class="section-description">管理平台用户，包括权限限制和封禁操作</p>
    </div>
    
    <!-- 错误状态显示 -->
    <div v-if="apiError && !isDev" class="error-container">
      <ElResult
        icon="warning"
        title="数据加载失败"
        sub-title="无法连接到服务器，请稍后重试"
      >
        <template #extra>
          <ElButton type="primary" @click="reloadData">重新加载</ElButton>
        </template>
      </ElResult>
    </div>
    
    <!-- 用户管理界面 -->
    <div v-else>
      <div class="search-bar">
        <div class="filter-options">
          <ElSelect v-model="statusFilter" placeholder="按状态筛选" style="width: 140px; margin-right: 10px;">
            <ElOption label="全部" value="" />
            <ElOption label="活跃" value="active" />
            <ElOption label="封禁" value="banned" />
            <ElOption label="权限限制" value="restricted" />
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
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="getTagType(scope.row)">
                {{ getStatusText(scope.row) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="权限" width="150">
            <template #default="scope">
              <div class="permission-tags">
                <ElTag v-if="scope.row.canBuy" type="success" size="small">可买</ElTag>
                <ElTag v-else type="danger" size="small">禁买</ElTag>
                <ElTag v-if="scope.row.canSell" type="success" size="small">可卖</ElTag>
                <ElTag v-else type="danger" size="small">禁卖</ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="角色" width="80">
            <template #default="scope">
              <ElTag :type="scope.row.isAdmin ? 'danger' : 'info'">
                {{ scope.row.isAdmin ? '管理员' : '用户' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="最后登录" width="150">
            <template #default="scope">
              {{ formatTime(scope.row.lastLoginAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="注册时间" width="150">
            <template #default="scope">
              {{ formatTime(scope.row.registeredAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElButton 
                type="primary" 
                size="small" 
                @click="showPermissionDialog(scope.row)"
              >
                权限设置
              </ElButton>
              <ElButton 
                :type="isBanned(scope.row) ? 'success' : 'danger'" 
                size="small" 
                @click="showBanDialog(scope.row)"
                style="margin-left: 5px;"
              >
                {{ isBanned(scope.row) ? '解封' : '封禁' }}
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
          :total="adminStore.totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 权限设置对话框 -->
      <ElDialog
        v-model="permissionDialogVisible"
        :title="`设置用户权限 - ${currentUser?.nickname || ''}`"
        width="450px"
      >
        <ElForm :model="permissionForm" label-width="100px">
          <ElFormItem label="购买权限">
            <ElSwitch 
              v-model="permissionForm.canBuy" 
              active-text="允许" 
              inactive-text="禁止" 
            />
          </ElFormItem>
          <ElFormItem label="销售权限">
            <ElSwitch 
              v-model="permissionForm.canSell" 
              active-text="允许" 
              inactive-text="禁止" 
            />
          </ElFormItem>
          <ElFormItem label="操作理由">
            <ElInput
              v-model="permissionForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入操作理由（选填）"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="permissionDialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="confirmPermission">确定</ElButton>
          </span>
        </template>
      </ElDialog>
      
      <!-- 封禁/解封对话框 -->
      <ElDialog
        v-model="banDialogVisible"
        :title="banDialogTitle"
        width="450px"
      >
        <div class="ban-warning" v-if="isBanned(currentUser)">
          <ElAlert
            title="解封说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>解封将恢复用户的购买和销售权限，并将用户状态设为活跃。</p>
            </template>
          </ElAlert>
        </div>
        <div class="ban-warning" v-else>
          <ElAlert
            title="封禁说明"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>封禁将同时禁用用户的购买和销售权限，并标记用户状态为封禁。</p>
            </template>
          </ElAlert>
        </div>
        <ElForm :model="banForm" label-width="100px" style="margin-top: 20px;">
          <ElFormItem :label="isBanned(currentUser) ? '解封理由' : '封禁理由'">
            <ElInput
              v-model="banForm.reason"
              type="textarea"
              :rows="4"
              :placeholder="isBanned(currentUser) ? '请输入解封理由' : '请输入封禁理由'"
              required
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="banDialogVisible = false">取消</ElButton>
            <ElButton :type="isBanned(currentUser) ? 'success' : 'danger'" @click="confirmBan">
              {{ isBanned(currentUser) ? '确认解封' : '确认封禁' }}
            </ElButton>
          </span>
        </template>
      </ElDialog>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage, ElDialog, ElForm, ElFormItem, ElSwitch, ElResult, ElAlert, ElSelect, ElOption, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCheckboxGroup, ElCheckbox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 开发模式开关 - 默认false
const isDev = ref(false)

// API错误状态
const apiError = ref(false)

// 权限设置对话框
const permissionDialogVisible = ref(false)
const permissionForm = ref({
  canBuy: true,
  canSell: true,
  reason: ''
})

// 封禁/解封对话框
const banDialogVisible = ref(false)
const banDialogTitle = ref('')
const banForm = ref({
  reason: ''
})
const currentUser = ref<any>(null)

// 过滤选项
const statusFilter = ref('')
const roleFilter = ref('')
const searchFields = ref(['id', 'username', 'nickname', 'email', 'phone'])

/**
 * 判断用户是否为封禁状态
 * 封禁状态定义：userStatus !== 'active' AND canBuy === false AND canSell === false
 */
function isBanned(user: any) {
  return user.userStatus !== 'active' && !user.canBuy && !user.canSell
}

/**
 * 判断用户是否为权限限制状态
 * 权限限制状态定义：userStatus === 'active' 但 canBuy 或 canSell 为 false
 */
function isRestricted(user: any) {
  return user.userStatus === 'active' && (!user.canBuy || !user.canSell)
}

/**
 * 判断用户是否为活跃状态
 * 活跃状态定义：userStatus === 'active' AND canBuy === true AND canSell === true
 */
function isActive(user: any) {
  return user.userStatus === 'active' && user.canBuy && user.canSell
}

// 获取标签类型
function getTagType(user: any) {
  if (isBanned(user)) return 'danger'
  if (isRestricted(user)) return 'warning'
  if (isActive(user)) return 'success'
  return 'info'
}

// 获取状态文本
function getStatusText(user: any) {
  if (isBanned(user)) return '封禁'
  if (isRestricted(user)) return '权限限制'
  if (isActive(user)) return '活跃'
  return '未知'
}

// 过滤用户
const filteredUsers = computed(() => {
  if (!statusFilter.value) {
    return adminStore.users
  }
  
  return adminStore.users.filter(user => {
    if (statusFilter.value === 'banned') return isBanned(user)
    if (statusFilter.value === 'restricted') return isRestricted(user)
    if (statusFilter.value === 'active') return isActive(user)
    return true
  })
})

// 显示权限设置对话框
function showPermissionDialog(user: any) {
  currentUser.value = user
  permissionForm.value = {
    canBuy: user.canBuy,
    canSell: user.canSell,
    reason: ''
  }
  permissionDialogVisible.value = true
}

// 确认权限设置
async function confirmPermission() {
  try {
    const token = localStorage.getItem('token')
    
    // 更新购买权限
    if (permissionForm.value.canBuy !== currentUser.value.canBuy) {
      const queryParams = new URLSearchParams()
      queryParams.append('userId', currentUser.value.id.toString())
      queryParams.append('canBuy', permissionForm.value.canBuy.toString())
      
      const response = await fetch(`/api/admin/user/toggle-can-buy?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`更新购买权限失败: HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.code !== 200) {
        throw new Error(`更新购买权限失败: ${data.message || data.code}`)
      }
    }

    // 更新销售权限
    if (permissionForm.value.canSell !== currentUser.value.canSell) {
      const queryParams = new URLSearchParams()
      queryParams.append('userId', currentUser.value.id.toString())
      queryParams.append('canSell', permissionForm.value.canSell.toString())
      
      const response = await fetch(`/api/admin/user/toggle-can-sell?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`更新销售权限失败: HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.code !== 200) {
        throw new Error(`更新销售权限失败: ${data.message || data.code}`)
      }
    }
    
    // 更新本地数据
    const user = adminStore.users.find(u => u.id === currentUser.value.id)
    if (user) {
      user.canBuy = permissionForm.value.canBuy
      user.canSell = permissionForm.value.canSell
    }
    
    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('权限设置失败:', error)
    ElMessage.error('权限设置失败')
  }
}

// 显示封禁/解封对话框
function showBanDialog(user: any) {
  currentUser.value = user
  
  if (isBanned(user)) {
    banDialogTitle.value = `解封用户 ${user.nickname}`
  } else {
    banDialogTitle.value = `封禁用户 ${user.nickname}`
  }
  
  banForm.value.reason = ''
  banDialogVisible.value = true
}

// 确认封禁/解封
async function confirmBan() {
  // 验证理由
  if (!banForm.value.reason.trim()) {
    ElMessage.error('请输入操作理由')
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    
    if (isBanned(currentUser.value)) {
      // 解封操作
      // 1. 解封用户状态
      const unbanResponse = await fetch(`/api/admin/user/unban/${currentUser.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: banForm.value.reason
        })
      })
      
      if (!unbanResponse.ok) {
        throw new Error(`解封用户失败: HTTP ${unbanResponse.status}`)
      }
      
      const unbanData = await unbanResponse.json()
      if (unbanData.code !== 200) {
        throw new Error(`解封用户失败: ${unbanData.message || unbanData.code}`)
      }
      
      // 2. 恢复购买权限
      const buyQueryParams = new URLSearchParams()
      buyQueryParams.append('userId', currentUser.value.id.toString())
      buyQueryParams.append('canBuy', 'true')
      
      const buyResponse = await fetch(`/api/admin/user/toggle-can-buy?${buyQueryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!buyResponse.ok) {
        throw new Error(`恢复购买权限失败: HTTP ${buyResponse.status}`)
      }

      const buyData = await buyResponse.json()
      if (buyData.code !== 200) {
        throw new Error(`恢复购买权限失败: ${buyData.message || buyData.code}`)
      }

      // 3. 恢复销售权限
      const sellQueryParams = new URLSearchParams()
      sellQueryParams.append('userId', currentUser.value.id.toString())
      sellQueryParams.append('canSell', 'true')
      
      const sellResponse = await fetch(`/api/admin/user/toggle-can-sell?${sellQueryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!sellResponse.ok) {
        throw new Error(`恢复销售权限失败: HTTP ${sellResponse.status}`)
      }
      
      const sellData = await sellResponse.json()
      if (sellData.code !== 200) {
        throw new Error(`恢复销售权限失败: ${sellData.message || sellData.code}`)
      }
      
      // 更新本地数据
      const user = adminStore.users.find(u => u.id === currentUser.value.id)
      if (user) {
        user.userStatus = 'active'
        user.canBuy = true
        user.canSell = true
      }
      
      ElMessage.success('解封成功')
    } else {
      // 封禁操作
      // 1. 封禁用户状态
      const banResponse = await fetch(`/api/admin/user/ban/${currentUser.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: banForm.value.reason
        })
      })
      
      if (!banResponse.ok) {
        throw new Error(`封禁用户失败: HTTP ${banResponse.status}`)
      }
      
      const banData = await banResponse.json()
      if (banData.code !== 200) {
        throw new Error(`封禁用户失败: ${banData.message || banData.code}`)
      }
      
      // 2. 禁用购买权限
      const buyQueryParams = new URLSearchParams()
      buyQueryParams.append('userId', currentUser.value.id.toString())
      buyQueryParams.append('canBuy', 'false')
      
      const buyResponse = await fetch(`/api/admin/user/toggle-can-buy?${buyQueryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!buyResponse.ok) {
        throw new Error(`禁用购买权限失败: HTTP ${buyResponse.status}`)
      }

      const buyData = await buyResponse.json()
      if (buyData.code !== 200) {
        throw new Error(`禁用购买权限失败: ${buyData.message || buyData.code}`)
      }

      // 3. 禁用销售权限
      const sellQueryParams = new URLSearchParams()
      sellQueryParams.append('userId', currentUser.value.id.toString())
      sellQueryParams.append('canSell', 'false')
      
      const sellResponse = await fetch(`/api/admin/user/toggle-can-sell?${sellQueryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!sellResponse.ok) {
        throw new Error(`禁用销售权限失败: HTTP ${sellResponse.status}`)
      }
      
      const sellData = await sellResponse.json()
      if (sellData.code !== 200) {
        throw new Error(`禁用销售权限失败: ${sellData.message || sellData.code}`)
      }
      
      // 更新本地数据
      const user = adminStore.users.find(u => u.id === currentUser.value.id)
      if (user) {
        user.userStatus = 'banned'
        user.canBuy = false
        user.canSell = false
      }
      
      ElMessage.success('封禁成功')
    }
    
    banDialogVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
    } else {
      // 生产模式下请求真实API
      await adminStore.loadUsers({
        page: currentPage.value,
        pageSize: pageSize.value
      })
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('数据加载失败，请检查网络连接')
    } else {
      // 开发模式下即使API失败也确保显示模拟数据
      adminStore.loadMockData()
    }
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 搜索用户
async function handleSearch() {
  try {
    apiError.value = false
    currentPage.value = 1
    if (isDev.value) {
      adminStore.loadMockData()
    } else {
      await adminStore.loadUsers({
        isAdmin: roleFilter.value === 'admin' ? true : roleFilter.value === 'user' ? false : undefined,
        keyword: searchKeyword.value,
        searchFields: searchFields.value,
        page: currentPage.value,
        pageSize: pageSize.value
      })
    }
  } catch (error) {
    console.error('搜索失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('搜索失败，请检查网络连接')
    }
  }
}

// 页面大小变化
async function handleSizeChange(size: number) {
  try {
    apiError.value = false
    pageSize.value = size
    currentPage.value = 1
    if (isDev.value) {
      adminStore.loadMockData()
    } else {
      await adminStore.loadUsers({
        isAdmin: roleFilter.value === 'admin' ? true : roleFilter.value === 'user' ? false : undefined,
        keyword: searchKeyword.value,
        searchFields: searchFields.value,
        page: currentPage.value,
        pageSize: pageSize.value
      })
    }
  } catch (error) {
    console.error('加载失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('加载失败，请检查网络连接')
    }
  }
}

// 当前页面变化
async function handleCurrentChange(current: number) {
  try {
    apiError.value = false
    currentPage.value = current
    if (isDev.value) {
      adminStore.loadMockData()
    } else {
      await adminStore.loadUsers({
        isAdmin: roleFilter.value === 'admin' ? true : roleFilter.value === 'user' ? false : undefined,
        keyword: searchKeyword.value,
        searchFields: searchFields.value,
        page: currentPage.value,
        pageSize: pageSize.value
      })
    }
  } catch (error) {
    console.error('加载失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('加载失败，请检查网络连接')
    }
  }
}

// 格式化时间
function formatTime(time: string | number[]): string {
  if (!time || (Array.isArray(time) && time.length === 0)) return '无'
  
  try {
    let date: Date
    
    // 处理数组类型的时间数据
    if (Array.isArray(time)) {
      if (time.length >= 6) {
        const [year, month, day, hour, minute, second] = time
        date = new Date(year, month - 1, day, hour, minute, second)
      } else if (time.length === 5) {
        // 处理只有5个元素的情况，默认秒为0
        const [year, month, day, hour, minute] = time
        date = new Date(year, month - 1, day, hour, minute, 0)
      } else {
        return Array.isArray(time) ? time.toString() : time
      }
    } else if (typeof time === 'string') {
      // 处理包含方括号的数组格式，如"[2026,4,15,14,43,3]"
      if (time.startsWith('[') && time.endsWith(']')) {
        const timeStr = time.substring(1, time.length - 1)
        const parts = timeStr.split(',').map(part => parseInt(part.trim()))
        if (parts.length >= 6) {
          const [year, month, day, hour, minute, second] = parts
          date = new Date(year, month - 1, day, hour, minute, second)
        } else if (parts.length === 5) {
          // 处理只有5个元素的情况，默认秒为0
          const [year, month, day, hour, minute] = parts
          date = new Date(year, month - 1, day, hour, minute, 0)
        } else {
          return time
        }
      } else if (time.includes(',')) {
        // 处理"2026,4,24,15,51,38"格式的时间数组
        const parts = time.split(',').map(part => parseInt(part.trim()))
        if (parts.length >= 6) {
          const [year, month, day, hour, minute, second] = parts
          date = new Date(year, month - 1, day, hour, minute, second)
        } else if (parts.length === 5) {
          // 处理只有5个元素的情况，默认秒为0
          const [year, month, day, hour, minute] = parts
          date = new Date(year, month - 1, day, hour, minute, 0)
        } else {
          return time
        }
      } else {
        // 处理其他格式的时间，包括ISO格式
        date = new Date(time)
      }
    } else {
      return '无'
    }
    
    if (!isNaN(date.getTime())) {
      // 统一格式化为"年月日时分"格式
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hour}:${minute}`
    }
  } catch (error) {
    console.error('时间格式化失败:', error)
  }
  
  return Array.isArray(time) ? time.toString() : time
}

// 监听角色过滤变化
watch([roleFilter], async () => {
  try {
    apiError.value = false
    if (isDev.value) {
      adminStore.loadMockData()
    } else {
      await adminStore.loadUsers({
        isAdmin: roleFilter.value === 'admin' ? true : roleFilter.value === 'user' ? false : undefined,
        keyword: searchKeyword.value,
        searchFields: searchFields.value,
        page: currentPage.value,
        pageSize: pageSize.value
      })
    }
  } catch (error) {
    console.error('加载失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('加载失败，请检查网络连接')
    }
  }
})

onMounted(async () => {
  await loadData()
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

.permission-tags {
  display: flex;
  gap: 4px;
}

.ban-warning {
  margin-bottom: 10px;
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
