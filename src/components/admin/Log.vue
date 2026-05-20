<template>
  <div class="log-content">
    <div class="section-header">
      <h2>操作日志</h2>
      <p class="section-description">查看所有管理员的操作记录和审计日志</p>
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
    
    <!-- 日志管理界面 -->
    <div v-else-if="isDev || !apiError">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <ElSelect v-model="filterTargetType" placeholder="操作对象" clearable style="width: 140px">
          <ElOption label="全部" :value="null" />
          <ElOption label="用户" value="user" />
          <ElOption label="帖子" value="post" />
          <ElOption label="商品" value="product" />
          <ElOption label="纠纷" value="dispute" />
          <ElOption label="订单" value="order" />
          <ElOption label="评论" value="comment" />
          <ElOption label="标签" value="tag" />
          <ElOption label="其他" value="other" />
        </ElSelect>

        <ElSelect v-model="filterAction" placeholder="操作类型" clearable style="width: 160px">
          <ElOption label="全部" :value="null" />
          <ElOption label="审核商品" value="approve_product" />
          <ElOption label="拒绝商品" value="reject_product" />
          <ElOption label="封禁用户" value="ban_user" />
          <ElOption label="解封用户" value="unban_user" />
          <ElOption label="审核帖子" value="approve_post" />
          <ElOption label="拒绝帖子" value="reject_post" />
          <ElOption label="置顶帖子" value="top_post" />
          <ElOption label="取消置顶" value="untop_post" />
          <ElOption label="设置精华" value="feature_post" />
          <ElOption label="取消精华" value="unfeature_post" />
          <ElOption label="删除帖子" value="delete_post" />
          <ElOption label="裁决纠纷" value="resolve_dispute" />
        </ElSelect>

        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
          style="width: 320px"
          value-format="YYYY-MM-DD"
        />

        <ElInput
          v-model="searchKeyword"
          placeholder="搜索操作原因"
          style="width: 280px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>
      
      <!-- 日志表格 -->
      <div class="table-container">
        <ElTable :data="filteredLogs" style="width: 100%" stripe v-loading="tableLoading">
          <ElTableColumn prop="id" label="日志ID" width="100" />
          <ElTableColumn label="操作人" width="140">
            <template #default="{ row }">
              <div class="admin-info">
                <span>{{ row.adminName || '管理员' }}</span>
                <span class="admin-id">(ID: {{ row.adminId }})</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作对象" width="120">
            <template #default="{ row }">
              <ElTag :type="getTargetTypeTagType(row.targetType)" size="small">
                {{ getTargetTypeText(row.targetType) }}
              </ElTag>
              <span v-if="row.targetId" class="target-id">ID: {{ row.targetId }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="action" label="操作类型" width="160">
            <template #default="{ row }">
              <span class="action-text">{{ getActionText(row.action) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="reason" label="操作原因" min-width="200" show-overflow-tooltip />
          <ElTableColumn prop="ipAddress" label="IP地址" width="140" />
          <ElTableColumn prop="createdAt" label="操作时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" size="small" @click="showLogDetail(row)">查看详情</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="adminStore.totalLogs"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 日志详情对话框 -->
      <ElDialog
        v-model="detailDialogVisible"
        title="操作日志详情"
        width="700px"
      >
        <!-- 加载状态 -->
        <div v-if="logDetailLoading" class="loading-container">
          <ElLoading />
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="logDetailError" class="error-container">
          <ElResult
            icon="error"
            title="加载失败"
            :sub-title="logDetailError"
          >
            <template #extra>
              <ElButton type="primary" @click="retryLoadLogDetail">重试</ElButton>
            </template>
          </ElResult>
        </div>

        <!-- 日志详情 -->
        <div v-else-if="currentLog" class="log-detail">
          <div class="detail-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">日志ID:</span>
                <span class="info-value">{{ currentLog.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作人:</span>
                <span class="info-value">{{ currentLog.adminName || '管理员' }} (ID: {{ currentLog.adminId }})</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作对象:</span>
                <span class="info-value">
                  <ElTag :type="getTargetTypeTagType(currentLog.targetType)" size="small">
                    {{ getTargetTypeText(currentLog.targetType) }}
                  </ElTag>
                  <span v-if="currentLog.targetId" style="margin-left: 8px">ID: {{ currentLog.targetId }}</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">操作类型:</span>
                <span class="info-value">{{ getActionText(currentLog.action) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作时间:</span>
                <span class="info-value">{{ formatTime(currentLog.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">IP地址:</span>
                <span class="info-value">{{ currentLog.ipAddress || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="currentLog.reason">
            <h3 class="section-title">操作原因</h3>
            <div class="reason-box">
              {{ currentLog.reason }}
            </div>
          </div>

          <div class="detail-section" v-if="currentLog.beforeData">
            <h3 class="section-title">操作前数据</h3>
            <div class="data-box">
              <pre>{{ JSON.stringify(currentLog.beforeData, null, 2) }}</pre>
            </div>
          </div>

          <div class="detail-section" v-if="currentLog.afterData">
            <h3 class="section-title">操作后数据</h3>
            <div class="data-box">
              <pre>{{ JSON.stringify(currentLog.afterData, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="detail-dialog-footer">
            <ElButton @click="detailDialogVisible = false">关闭</ElButton>
          </div>
        </template>
      </ElDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElMessage, ElMessageBox, ElLoading, ElResult } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'

const adminStore = useAdminStore()

// 筛选和搜索
const filterTargetType = ref<string | null>(null)
const filterAction = ref<string | null>(null)
const dateRange = ref<string[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 开发模式开关 - 默认false
const isDev = ref(false)

// API错误状态
const apiError = ref(false)
const tableLoading = ref(false)

// 对话框相关
const detailDialogVisible = ref(false)
const currentLog = ref<any>(null)
const logDetailLoading = ref(false)
const logDetailError = ref('')

// 筛选后的日志
const filteredLogs = computed(() => {
  // 非开发模式且有错误时，不返回任何数据
  if (!isDev.value && apiError.value) {
    return []
  }

  let logs = adminStore.adminLogs
  
  if (filterTargetType.value) {
    logs = logs.filter(log => log.targetType === filterTargetType.value)
  }
  
  if (filterAction.value) {
    logs = logs.filter(log => log.action === filterAction.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    logs = logs.filter(log => 
      (log.reason?.toLowerCase().includes(keyword)) ||
      (log.adminName?.toLowerCase().includes(keyword))
    )
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      endDate.setHours(23, 59, 59, 999)
      
      logs = logs.filter(log => {
        const logDate = new Date(log.createdAt)
        return logDate >= startDate && logDate <= endDate
      })
    }
  }
  
  return logs
})

// 获取操作对象类型文本
const getTargetTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'user': '用户',
    'post': '帖子',
    'comment': '评论',
    'tag': '标签',
    'product': '商品',
    'dispute': '纠纷',
    'order': '订单',
    'other': '其他'
  }
  return typeMap[type] || type
}

// 获取操作对象标签类型
const getTargetTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'user': 'primary',
    'post': 'success',
    'product': 'warning',
    'dispute': 'danger',
    'order': 'info',
    'other': ''
  }
  return typeMap[type] || ''
}

// 获取操作类型文本
const getActionText = (action: string): string => {
  const actionMap: Record<string, string> = {
    'approve_product': '审核通过商品',
    'reject_product': '拒绝审核商品',
    'ban_user': '封禁用户',
    'unban_user': '解封用户',
    'approve_post': '审核通过帖子',
    'reject_post': '拒绝审核帖子',
    'top_post': '置顶帖子',
    'untop_post': '取消置顶',
    'feature_post': '设置精华',
    'unfeature_post': '取消精华',
    'delete_post': '删除帖子',
    'resolve_dispute': '裁决纠纷',
    'close_dispute': '关闭纠纷'
  }
  return actionMap[action] || action
}

// 时间格式化
const formatTime = (time: string): string => {
  if (!time) return '-'
  
  const date = new Date(time)
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  return time
}

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    tableLoading.value = true
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
      console.log('操作日志-开发模式')
    } else {
      // 生产模式下请求真实API
      const success = await adminStore.loadAdminLogs({
        page: currentPage.value,
        size: pageSize.value
      })
      
      if (!success) {
        apiError.value = true
        ElMessage.error('数据加载失败')
      }
      
      console.log('操作日志-生产环境')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    apiError.value = true
    ElMessage.error('数据加载失败，请检查网络连接')
    // 清空相关数据
    adminStore.adminLogs = []
    adminStore.totalLogs = 0
  } finally {
    tableLoading.value = false
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

const handleReset = () => {
  filterTargetType.value = null
  filterAction.value = null
  dateRange.value = []
  searchKeyword.value = ''
  currentPage.value = 1
  pageSize.value = 10
  loadData()
}

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadData()
}

// 显示日志详情
const showLogDetail = async (log: any) => {
  currentLog.value = log
  detailDialogVisible.value = true
  logDetailError.value = ''
  
  if (isDev.value) {
    // 开发模式下直接使用列表数据
    return
  }
  
  // 生产模式下尝试加载详情
  try {
    logDetailLoading.value = true
    await adminStore.loadLogDetail(log.id)
    if (adminStore.selectedLog) {
      currentLog.value = adminStore.selectedLog
    }
  } catch (error) {
    console.error('加载日志详情失败:', error)
    logDetailError.value = error instanceof Error ? error.message : '加载失败，请稍后重试'
    ElMessage.error('加载日志详情失败')
  } finally {
    logDetailLoading.value = false
  }
}

// 重试加载日志详情
const retryLoadLogDetail = () => {
  if (currentLog.value?.id) {
    showLogDetail(currentLog.value)
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-text,
.error-text {
  margin: 0;
  color: #666;
}

.table-container {
  margin-bottom: 20px;
}

.admin-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-id {
  color: #999;
  font-size: 12px;
}

.target-id {
  color: #666;
  font-size: 12px;
}

.action-text {
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.log-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-value {
  color: #333;
}

.reason-box {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  line-height: 1.6;
  color: #333;
}

.data-box {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.data-box pre {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.detail-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar .el-select,
  .filter-bar .el-input,
  .filter-bar .el-date-picker {
    width: 100% !important;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
