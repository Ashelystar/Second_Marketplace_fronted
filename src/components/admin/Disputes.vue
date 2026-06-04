<template>
  <div class="disputes-content">
    <div class="section-header">
      <h2>纠纷仲裁</h2>
      <p class="section-description">处理买卖双方的纠纷，维护平台交易公平</p>
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
    
    <!-- 纠纷仲裁界面 - 只在开发模式或无错误时显示 -->
    <div v-else-if="isDev || !apiError">
      <div class="search-bar">
        <ElSelect v-model="statusFilter" placeholder="按状态筛选" style="width: 150px; margin-right: 10px;">
          <ElOption label="全部" value="" />
          <ElOption label="待处理" value="pending" />
          <ElOption label="处理中" value="processing" />
          <ElOption label="已解决" value="resolved" />
          <ElOption label="已关闭" value="closed" />
        </ElSelect>
        <ElInput 
          v-model="searchKeyword" 
          placeholder="搜索纠纷ID、订单号或用户" 
          style="width: 300px;" 
          prefix-icon="Search"
        />
        <ElButton type="primary" @click="handleSearch">搜索</ElButton>
      </div>
      
      <ElTable :data="filteredDisputes" style="width: 100%" stripe>
        <ElTableColumn prop="id" label="纠纷ID" width="100" />
        <ElTableColumn prop="disputeNo" label="纠纷编号" width="180" />
        <ElTableColumn prop="orderId" label="订单号" width="120" />
        <ElTableColumn prop="buyerId" label="买家ID" width="100" />
        <ElTableColumn prop="sellerId" label="卖家ID" width="100" />
        <ElTableColumn label="最新描述" min-width="200">
          <template #default="scope">
            {{ getLatestActionDesc(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="currentStatus" label="状态" width="100">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.currentStatus)">
              {{ getStatusText(scope.row.currentStatus) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTime(scope.row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="280">
          <template #default="scope">
            <ElButton type="info" size="small" @click="showDisputeDetail(scope.row.id)">查看详情</ElButton>
            <ElButton type="primary" size="small" @click="handleDispute(scope.row.id)" v-if="['pending', 'processing'].includes(scope.row.currentStatus)" style="margin-left: 8px;">
              处理
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
          :total="adminStore.totalDisputes"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 纠纷详情对话框 -->
      <ElDialog
        v-model="detailDialogVisible"
        title="纠纷详情"
        width="900px"
        :close-on-click-modal="false"
      >
        <!-- 加载状态 -->
        <div v-if="disputeDetailLoading" class="loading-container">
          <ElLoading />
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="disputeDetailError" class="error-container">
          <ElResult
            icon="error"
            title="加载失败"
            :sub-title="disputeDetailError"
          >
            <template #extra>
              <ElButton type="primary" @click="retryLoadDisputeDetail">重试</ElButton>
            </template>
          </ElResult>
        </div>

        <!-- 纠纷详情 -->
        <div v-else-if="adminStore.selectedDispute" class="dispute-detail">
          <div class="detail-section">
            <h3 class="section-title">纠纷基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">纠纷ID:</span>
                <span class="info-value">{{ adminStore.selectedDispute.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">纠纷编号:</span>
                <span class="info-value">{{ adminStore.selectedDispute.disputeNo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">订单号:</span>
                <span class="info-value">{{ adminStore.selectedDispute.orderId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">买家ID:</span>
                <span class="info-value">{{ adminStore.selectedDispute.buyerId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">卖家ID:</span>
                <span class="info-value">{{ adminStore.selectedDispute.sellerId }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">当前状态:</span>
                <span class="info-value">
                  <ElTag :type="getStatusType(adminStore.selectedDispute.currentStatus)">
                    {{ getStatusText(adminStore.selectedDispute.currentStatus) }}
                  </ElTag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">责任认定:</span>
                <span class="info-value">{{ adminStore.selectedDispute.responsibility || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">处理结果:</span>
                <span class="info-value">{{ adminStore.selectedDispute.resolutionResult || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">处理金额:</span>
                <span class="info-value">
                  {{ adminStore.selectedDispute.resolutionAmount ? '¥' + adminStore.selectedDispute.resolutionAmount.toFixed(2) : '-' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">处理人:</span>
                <span class="info-value">{{ adminStore.selectedDispute.resolvedBy || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ formatTime(adminStore.selectedDispute.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间:</span>
                <span class="info-value">{{ formatTime(adminStore.selectedDispute.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 纠纷处理记录 -->
          <div v-if="adminStore.selectedDispute.actions && adminStore.selectedDispute.actions.length > 0" class="detail-section">
            <h3 class="section-title">处理记录</h3>
            <div class="action-list">
              <div v-for="action in adminStore.selectedDispute.actions" :key="action.id" class="action-item">
                <div class="action-header">
                  <span class="action-by">操作人: {{ action.actionBy }}</span>
                  <span class="action-type">{{ getActionTypeText(action.actionType) }}</span>
                  <span class="action-time">{{ formatTime(action.createdAt) }}</span>
                </div>
                <div class="action-desc">{{ action.actionDesc }}</div>
              </div>
            </div>
          </div>

          <!-- 操作区域 -->
          <div v-if="['pending', 'processing'].includes(adminStore.selectedDispute.currentStatus)" class="detail-section">
            <h3 class="section-title">添加处理记录</h3>
            <ElForm :model="actionForm" label-width="100px">
              <ElFormItem label="操作类型">
                <ElSelect v-model="actionForm.actionType" placeholder="请选择操作类型">
                  <ElOption label="状态变更" value="status_change" />
                  <ElOption label="补充说明" value="comment" />
                  <ElOption label="要求补充证据" value="waiting_evidence" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="下一个状态">
                <ElSelect v-model="actionForm.nextStatus" placeholder="请选择下一个状态">
                  <ElOption label="处理中" value="processing" />
                  <ElOption label="等待补充证据" value="waiting_evidence" />
                  <ElOption label="已解决" value="resolved" />
                  <ElOption label="已关闭" value="closed" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="描述">
                <ElInput
                  v-model="actionForm.actionDesc"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入操作描述"
                  required
                />
              </ElFormItem>
            </ElForm>
            <div class="action-buttons">
              <ElButton @click="submitAction">提交处理</ElButton>
              <ElButton type="primary" @click="showResolveDialog">立即裁决</ElButton>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="detail-dialog-footer">
            <ElButton @click="detailDialogVisible = false">关闭</ElButton>
          </div>
        </template>
      </ElDialog>

      <!-- 裁决对话框 -->
      <ElDialog
        v-model="resolveDialogVisible"
        title="纠纷裁决"
        width="600px"
      >
        <ElForm :model="resolveForm" label-width="120px">
          <ElFormItem label="责任认定">
            <ElSelect v-model="resolveForm.responsibility" placeholder="请选择责任方">
              <ElOption label="买家责任" value="buyer" />
              <ElOption label="卖家责任" value="seller" />
              <ElOption label="双方责任" value="both" />
              <ElOption label="无责任" value="none" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="处理结果">
            <ElSelect v-model="resolveForm.resolutionResult" placeholder="请选择处理结果">
              <ElOption label="全额退款" value="full_refund" />
              <ElOption label="部分退款" value="partial_refund" />
              <ElOption label="退货退款" value="return_refund" />
              <ElOption label="驳回申请" value="reject" />
              <ElOption label="协商解决" value="negotiation" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="处理金额">
            <ElInput v-model="resolveForm.resolutionAmount" type="number" placeholder="请输入处理金额">
              <template #prepend>¥</template>
            </ElInput>
          </ElFormItem>
        </ElForm>
        <template #footer>
          <div class="resolve-dialog-footer">
            <ElButton @click="resolveDialogVisible = false">取消</ElButton>
            <ElButton type="primary" @click="confirmResolve">确认裁决</ElButton>
          </div>
        </template>
      </ElDialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElResult, ElLoading } from 'element-plus'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 开发模式开关 - 默认false
const isDev = ref(false)

// API错误状态
const apiError = ref(false)

// 详情对话框相关
const detailDialogVisible = ref(false)
const disputeDetailLoading = ref(false)
const disputeDetailError = ref('')

// 处理记录表单
const actionForm = ref({
  actionType: '',
  actionDesc: '',
  nextStatus: ''
})

// 裁决表单
const resolveDialogVisible = ref(false)
const resolveForm = ref({
  responsibility: '',
  resolutionResult: '',
  resolutionAmount: 0
})

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
      console.log('纠纷仲裁-开发模式')
    } else {
      // 生产模式下请求真实API
      await adminStore.loadDisputes({
        status: statusFilter.value || undefined,
        page: currentPage.value,
        pageSize: pageSize.value
      })
      console.log('纠纷仲裁-生产环境')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    apiError.value = true
    ElMessage.error('数据加载失败，请检查网络连接')
    // 清空相关数据
    adminStore.disputes = []
    adminStore.totalDisputes = 0
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 过滤纠纷
const filteredDisputes = computed(() => {
  // 非开发模式且有错误时，不返回任何数据
  if (!isDev.value && apiError.value) {
    return []
  }
  
  let disputes = adminStore.disputes
  
  if (statusFilter.value) {
    disputes = disputes.filter(dispute => dispute.currentStatus === statusFilter.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    disputes = disputes.filter(dispute => 
      dispute.id.toString().includes(keyword) ||
      dispute.disputeNo.toLowerCase().includes(keyword) ||
      dispute.orderId.toString().includes(keyword) ||
      dispute.buyerId.toString().includes(keyword) ||
      dispute.sellerId.toString().includes(keyword)
    )
  }
  
  return disputes
})

// 获取最新操作描述
const getLatestActionDesc = (dispute: any) => {
  if (dispute.actions && dispute.actions.length > 0) {
    const latestAction = dispute.actions[dispute.actions.length - 1]
    return latestAction.actionDesc
  }
  return '-'
}

// 获取状态类型
const getStatusType = (status: string): string => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'resolved': return 'success'
    case 'closed': return 'info'
    default: return ''
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'resolved': return '已解决'
    case 'closed': return '已关闭'
    default: return status
  }
}

// 获取操作类型文本
const getActionTypeText = (actionType: string): string => {
  switch (actionType) {
    case 'submit': return '提交申请'
    case 'status_change': return '状态变更'
    case 'comment': return '补充说明'
    case 'waiting_evidence': return '等待证据'
    case 'admin_decision': return '管理员裁决'
    default: return actionType
  }
}

// 搜索纠纷
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 页面大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// 当前页面变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
  loadData()
}

// 处理纠纷
const handleDispute = (disputeId: number) => {
  showDisputeDetail(disputeId)
}

// 显示纠纷详情
const showDisputeDetail = async (disputeId: number) => {
  detailDialogVisible.value = true
  disputeDetailError.value = ''
  actionForm.value = {
    actionType: '',
    actionDesc: '',
    nextStatus: ''
  }
  
  try {
    if (isDev.value) {
      // 开发模式下直接从列表获取
      const dispute = adminStore.disputes.find(d => d.id === disputeId)
      if (dispute) {
        adminStore.selectedDispute = dispute
      }
    } else {
      // 生产模式下请求API
      await adminStore.loadDisputeDetail(disputeId)
    }
  } catch (error) {
    console.error('加载纠纷详情失败:', error)
    disputeDetailError.value = error instanceof Error ? error.message : '加载失败，请稍后重试'
    if (!isDev.value) {
      ElMessage.error('加载纠纷详情失败')
    }
  }
}

// 重试加载纠纷详情
const retryLoadDisputeDetail = () => {
  if (adminStore.selectedDispute?.id) {
    showDisputeDetail(adminStore.selectedDispute.id)
  }
}

// 提交处理
const submitAction = async () => {
  if (!actionForm.value.actionDesc.trim()) {
    ElMessage.error('请输入操作描述')
    return
  }
  
  if (!adminStore.selectedDispute?.id) {
    ElMessage.error('请选择要处理的纠纷')
    return
  }
  
  try {
    if (isDev.value) {
      // 开发模式下直接更新本地数据
      const dispute = adminStore.disputes.find(d => d.id === adminStore.selectedDispute!.id)
      if (dispute) {
        // 新增操作记录
        const newAction = {
          id: Date.now(),
          disputeId: dispute.id,
          actionBy: 1,
          actionType: actionForm.value.actionType || 'comment',
          actionDesc: actionForm.value.actionDesc,
          createdAt: new Date().toISOString()
        }
        if (!dispute.actions) {
          dispute.actions = []
        }
        dispute.actions.push(newAction)
        
        // 更新状态
        if (actionForm.value.nextStatus) {
          dispute.currentStatus = actionForm.value.nextStatus
          dispute.updatedAt = new Date().toISOString()
        }
        
        // 更新选中的纠纷
        adminStore.selectedDispute = { ...dispute }
        
        ElMessage.success('处理记录已添加')
        actionForm.value = {
          actionType: '',
          actionDesc: '',
          nextStatus: ''
        }
      }
    } else {
      // 生产模式下请求API
      const success = await adminStore.addDisputeAction(adminStore.selectedDispute!.id, {
        actionType: actionForm.value.actionType || 'comment',
        actionDesc: actionForm.value.actionDesc,
        nextStatus: actionForm.value.nextStatus || undefined
      })
      
      if (success) {
        ElMessage.success('处理记录已添加')
        // 重新加载详情
        await showDisputeDetail(adminStore.selectedDispute!.id)
        actionForm.value = {
          actionType: '',
          actionDesc: '',
          nextStatus: ''
        }
      } else {
        ElMessage.error('添加处理记录失败')
      }
    }
  } catch (error) {
    console.error('添加处理记录失败:', error)
    ElMessage.error('添加处理记录失败')
  }
}

// 显示裁决对话框
const showResolveDialog = () => {
  resolveForm.value = {
    responsibility: '',
    resolutionResult: '',
    resolutionAmount: 0
  }
  resolveDialogVisible.value = true
}

// 确认裁决
const confirmResolve = async () => {
  if (!adminStore.selectedDispute?.id) {
    ElMessage.error('请选择要裁决的纠纷')
    return
  }
  
  try {
    if (isDev.value) {
      // 开发模式下直接更新本地数据
      const dispute = adminStore.disputes.find(d => d.id === adminStore.selectedDispute!.id)
      if (dispute) {
        dispute.responsibility = resolveForm.value.responsibility
        dispute.resolutionResult = resolveForm.value.resolutionResult
        dispute.resolutionAmount = resolveForm.value.resolutionAmount
        dispute.currentStatus = 'resolved'
        dispute.resolvedBy = 1
        dispute.resolvedAt = new Date().toISOString()
        dispute.updatedAt = new Date().toISOString()
        
        // 新增裁决记录
        const newAction = {
          id: Date.now(),
          disputeId: dispute.id,
          actionBy: 1,
          actionType: 'admin_decision',
          actionDesc: `管理员裁决: 责任认定-${resolveForm.value.responsibility}, 处理结果-${resolveForm.value.resolutionResult}, 处理金额-${resolveForm.value.resolutionAmount}`,
          createdAt: new Date().toISOString()
        }
        if (!dispute.actions) {
          dispute.actions = []
        }
        dispute.actions.push(newAction)
        
        // 更新选中的纠纷
        adminStore.selectedDispute = { ...dispute }
        
        ElMessage.success('纠纷已裁决')
        resolveDialogVisible.value = false
      }
    } else {
      // 生产模式下请求API
      const success = await adminStore.resolveDispute(adminStore.selectedDispute!.id, {
        responsibility: resolveForm.value.responsibility,
        resolutionResult: resolveForm.value.resolutionResult,
        resolutionAmount: resolveForm.value.resolutionAmount
      })
      
      if (success) {
        ElMessage.success('纠纷已裁决')
        resolveDialogVisible.value = false
        // 重新加载详情
        await showDisputeDetail(adminStore.selectedDispute!.id)
      } else {
        ElMessage.error('纠纷裁决失败')
      }
    }
  } catch (error) {
    console.error('纠纷裁决失败:', error)
    ElMessage.error('纠纷裁决失败')
  }
}

// 格式化时间
const formatTime = (time: string | number[]): string => {
  if (!time || (Array.isArray(time) && time.length === 0)) return '无'
  
  try {
    let date: Date
    
    if (Array.isArray(time)) {
      if (time.length >= 6) {
        const [year, month, day, hour, minute, second] = time
        date = new Date(year, month - 1, day, hour, minute, second)
      } else if (time.length === 5) {
        const [year, month, day, hour, minute] = time
        date = new Date(year, month - 1, day, hour, minute, 0)
      } else {
        return Array.isArray(time) ? time.toString() : time
      }
    } else if (typeof time === 'string') {
      if (time.startsWith('[') && time.endsWith(']')) {
        const timeStr = time.substring(1, time.length - 1)
        const parts = timeStr.split(',').map(part => parseInt(part.trim()))
        if (parts.length >= 6) {
          const [year, month, day, hour, minute, second] = parts
          date = new Date(year, month - 1, day, hour, minute, second)
        } else if (parts.length === 5) {
          const [year, month, day, hour, minute] = parts
          date = new Date(year, month - 1, day, hour, minute, 0)
        } else {
          return time
        }
      } else if (time.includes(',')) {
        const parts = time.split(',').map(part => parseInt(part.trim()))
        if (parts.length >= 6) {
          const [year, month, day, hour, minute, second] = parts
          date = new Date(year, month - 1, day, hour, minute, second)
        } else if (parts.length === 5) {
          const [year, month, day, hour, minute] = parts
          date = new Date(year, month - 1, day, hour, minute, 0)
        } else {
          return time
        }
      } else {
        date = new Date(time)
      }
    } else {
      return '无'
    }
    
    if (!isNaN(date.getTime())) {
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

onMounted(() => {
  loadData()
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

/* 纠纷详情样式 */
.dispute-detail {
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
  min-width: 100px;
}

.info-value {
  color: #333;
}

/* 处理记录样式 */
.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.action-header {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.action-by {
  font-weight: 500;
  color: #333;
}

.action-type {
  padding: 2px 8px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.action-time {
  color: #999;
  font-size: 12px;
  margin-left: auto;
}

.action-desc {
  color: #666;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-text {
  margin-top: 16px;
  color: #666;
}

.detail-dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.resolve-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .search-bar .el-select,
  .search-bar .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
