<template>
  <div class="notifications-content">
    <div class="section-header">
      <h2>系统通知管理</h2>
      <p class="section-description">发布和管理平台通知公告，支持按类型和状态筛选</p>
    </div>

    <!-- 错误状态 -->
    <el-result
      v-if="apiError"
      icon="error"
      title="数据加载失败"
      sub-title="无法连接到服务器，请稍后重试"
    >
      <template #extra>
        <el-button type="primary" @click="reloadData">重新加载</el-button>
      </template>
    </el-result>

    <!-- 正常内容 -->
    <div v-else>
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-left">
          <el-select
            v-model="filterNoticeType"
            placeholder="通知类型"
            clearable
            style="width: 150px"
            @change="handleFilterChange"
          >
            <el-option label="全部类型" value="" />
            <el-option label="系统通知" value="system" />
            <el-option label="订单通知" value="order" />
            <el-option label="售后通知" value="after_sale" />
            <el-option label="促销通知" value="promotion" />
          </el-select>

          <el-select
            v-model="filterPublishStatus"
            placeholder="发布状态"
            clearable
            style="width: 150px; margin-left: 12px"
            @change="handleFilterChange"
          >
            <el-option label="全部状态" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已撤回" value="revoked" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-button type="primary" :icon="Plus" @click="showPublishDialog = true">
            发布公告
          </el-button>
        </div>
      </div>

      <!-- 通知列表表格 -->
      <el-table
        :data="notifications"
        v-loading="notificationLoading"
        stripe
        style="width: 100%"
        empty-text="暂无通知数据"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="通知类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getNoticeTypeTag(row.noticeType)" size="small">
              {{ getNoticeTypeLabel(row.noticeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标范围" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.targetScope === 'all' ? 'success' : 'warning'" size="small">
              {{ getTargetScopeLabel(row.targetScope) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTag(row.publishStatus)"
              size="small"
              effect="plain"
            >
              {{ getStatusLabel(row.publishStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.publishedAt ? formatTime(row.publishedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="viewDetail(row.id)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.publishStatus === 'published'"
              link
              type="danger"
              size="small"
              @click="handleRevoke(row)"
            >
              撤回
            </el-button>
            <span v-else-if="row.publishStatus === 'revoked'" class="revoked-text">
              已撤回
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <el-empty
        v-if="!notificationLoading && notifications.length === 0"
        description="暂无通知数据，点击「发布公告」创建第一条通知"
      />
    </div>

    <!-- 发布通知对话框 -->
    <el-dialog
      v-model="showPublishDialog"
      title="发布系统公告"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="publishFormRef"
        :model="publishForm"
        :rules="publishRules"
        label-width="90px"
        label-position="right"
      >
        <el-form-item label="通知类型" prop="noticeType">
          <el-select v-model="publishForm.noticeType" style="width: 100%">
            <el-option label="系统通知" value="system" />
            <el-option label="订单通知" value="order" />
            <el-option label="售后通知" value="after_sale" />
            <el-option label="促销通知" value="promotion" />
          </el-select>
        </el-form-item>

        <el-form-item label="公告标题" prop="title">
          <el-input
            v-model="publishForm.title"
            placeholder="请输入公告标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入公告内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="目标范围" prop="targetScope">
          <el-radio-group v-model="publishForm.targetScope">
            <el-radio value="all">全部用户</el-radio>
            <el-radio value="role">指定角色</el-radio>
            <el-radio value="user">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="publishForm.targetScope === 'role'"
          label="目标角色"
          prop="targetRoleCode"
        >
          <el-input
            v-model="publishForm.targetRoleCode"
            placeholder="请输入角色编码"
          />
        </el-form-item>

        <el-form-item
          v-if="publishForm.targetScope === 'user'"
          label="目标用户ID"
          prop="targetUserId"
        >
          <el-input-number
            v-model="publishForm.targetUserId"
            :min="1"
            placeholder="请输入用户ID"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showPublishDialog = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="handlePublish">
          确认发布
        </el-button>
      </template>
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="通知详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedNotification" class="detail-content" v-loading="notificationDetailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="通知ID">
            {{ selectedNotification.id }}
          </el-descriptions-item>
          <el-descriptions-item label="通知类型">
            <el-tag :type="getNoticeTypeTag(selectedNotification.noticeType)" size="small">
              {{ getNoticeTypeLabel(selectedNotification.noticeType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标题">
            {{ selectedNotification.title }}
          </el-descriptions-item>
          <el-descriptions-item label="内容">
            <div class="detail-content-text">{{ selectedNotification.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="目标范围">
            <el-tag :type="selectedNotification.targetScope === 'all' ? 'success' : 'warning'" size="small">
              {{ getTargetScopeLabel(selectedNotification.targetScope) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedNotification.targetRoleCode" label="目标角色">
            {{ selectedNotification.targetRoleCode }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedNotification.targetUserId" label="目标用户ID">
            {{ selectedNotification.targetUserId }}
          </el-descriptions-item>
          <el-descriptions-item label="发布状态">
            <el-tag
              :type="getStatusTag(selectedNotification.publishStatus)"
              size="small"
              effect="plain"
            >
              {{ getStatusLabel(selectedNotification.publishStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ selectedNotification.publishedAt ? formatTime(selectedNotification.publishedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建人ID">
            {{ selectedNotification.createdBy }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(selectedNotification.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatTime(selectedNotification.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAdminStore } from '@/stores/adminStore'
import type { NoticeType, PublishStatus } from '@/api/notification'

const adminStore = useAdminStore()
const {
  notifications,
  notificationLoading,
  selectedNotification,
  notificationDetailLoading
} = storeToRefs(adminStore)

const apiError = ref(false)

// 筛选条件
const filterNoticeType = ref('')
const filterPublishStatus = ref('')

// 发布对话框
const showPublishDialog = ref(false)
const publishing = ref(false)
const publishFormRef = ref<FormInstance>()

const publishForm = ref({
  noticeType: 'system' as NoticeType,
  title: '',
  content: '',
  targetScope: 'all' as 'all' | 'role' | 'user',
  targetRoleCode: '',
  targetUserId: undefined as number | undefined
})

const publishRules: FormRules = {
  noticeType: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 1, max: 2000, message: '内容长度在 1 到 2000 个字符', trigger: 'blur' }
  ],
  targetScope: [{ required: true, message: '请选择目标范围', trigger: 'change' }],
  targetRoleCode: [{ required: true, message: '请输入目标角色编码', trigger: 'blur' }],
  targetUserId: [{ required: true, message: '请输入目标用户ID', trigger: 'blur' }]
}

// 详情对话框
const showDetailDialog = ref(false)

// 加载数据
async function loadData() {
  try {
    apiError.value = false
    await adminStore.loadNotifications({
      noticeType: filterNoticeType.value as NoticeType || undefined,
      publishStatus: filterPublishStatus.value as PublishStatus || undefined
    })
  } catch {
    apiError.value = true
  }
}

function reloadData() {
  loadData()
}

function handleFilterChange() {
  adminStore.currentNotificationPage = 1
  loadData()
}

// 发布通知
async function handlePublish() {
  if (!publishFormRef.value) return
  try {
    await publishFormRef.value.validate()
  } catch {
    return
  }

  publishing.value = true
  try {
    const success = await adminStore.publishNotice({
      noticeType: publishForm.value.noticeType,
      title: publishForm.value.title,
      content: publishForm.value.content,
      targetScope: publishForm.value.targetScope,
      targetRoleCode: publishForm.value.targetScope === 'role' ? publishForm.value.targetRoleCode : undefined,
      targetUserId: publishForm.value.targetScope === 'user' ? publishForm.value.targetUserId : undefined
    })

    if (success) {
      ElMessage.success('公告发布成功')
      showPublishDialog.value = false
      // 重置表单
      publishForm.value = {
        noticeType: 'system',
        title: '',
        content: '',
        targetScope: 'all',
        targetRoleCode: '',
        targetUserId: undefined
      }
      await loadData()
    } else {
      ElMessage.error('公告发布失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '公告发布失败')
  } finally {
    publishing.value = false
  }
}

// 撤回通知
async function handleRevoke(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要撤回公告「${row.title}」吗？撤回后用户将无法看到此通知。`,
      '撤回确认',
      {
        confirmButtonText: '确认撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  try {
    const success = await adminStore.revokeNotice(row.id)
    if (success) {
      ElMessage.success('公告已撤回')
      await loadData()
    } else {
      ElMessage.error('撤回失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '撤回失败')
  }
}

// 查看详情
async function viewDetail(noticeId: number) {
  try {
    await adminStore.loadNotificationDetail(noticeId)
    showDetailDialog.value = true
  } catch (error: any) {
    ElMessage.error(error?.message || '获取通知详情失败')
  }
}

// 辅助方法
function getNoticeTypeLabel(type: string): string {
  const map: Record<string, string> = {
    system: '系统通知',
    order: '订单通知',
    after_sale: '售后通知',
    promotion: '促销通知'
  }
  return map[type] || type
}

function getNoticeTypeTag(type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, string> = {
    system: 'primary',
    order: 'success',
    after_sale: 'warning',
    promotion: 'info'
  }
  return (map[type] || 'info') as 'primary' | 'success' | 'warning' | 'info' | 'danger'
}

function getTargetScopeLabel(scope: string): string {
  const map: Record<string, string> = {
    all: '全部用户',
    role: '指定角色',
    user: '指定用户'
  }
  return map[scope] || scope
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    revoked: '已撤回'
  }
  return map[status] || status
}

function getStatusTag(status: string): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, string> = {
    draft: 'info',
    published: 'success',
    revoked: 'danger'
  }
  return (map[status] || 'info') as 'success' | 'warning' | 'info' | 'danger'
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return timeStr
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.notifications-content {
  padding: 0;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.section-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-right {
  display: flex;
  align-items: center;
}

.revoked-text {
  color: #999;
  font-size: 0.85rem;
}

.detail-content {
  min-height: 100px;
}

.detail-content-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #333;
}

/* 表格样式微调 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

:deep(.el-table .el-button--small) {
  padding: 4px 8px;
}
</style>
