<template>
  <div class="notifications-content">
    <div class="section-header">
      <h2>系统通知</h2>
      <p class="section-description">发布平台公告和系统通知，保持用户信息同步</p>
    </div>
    
    <div class="actions-bar">
      <ElButton type="primary" @click="addNotification">
        发布通知
      </ElButton>
    </div>
    
    <ElTable :data="adminStore.notifications" style="width: 100%" stripe>
      <ElTableColumn prop="id" label="通知ID" width="100" />
      <ElTableColumn prop="title" label="通知标题" min-width="300" />
      <ElTableColumn prop="type" label="通知类型" width="120">
        <template #default="scope">
          <ElTag :type="getTypeType(scope.row.type)">
            {{ getTypeText(scope.row.type) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="创建时间" width="180" />
      <ElTableColumn prop="publishedAt" label="发布时间" width="180" />
      <ElTableColumn label="操作" width="150">
        <template #default="scope">
          <ElButton type="primary" size="small" @click="editNotification(scope.row.id)">
            编辑
          </ElButton>
          <ElButton type="danger" size="small" @click="deleteNotification(scope.row.id)" style="margin-left: 8px;">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElButton, ElTable, ElTableColumn, ElTag, ElMessage } from 'element-plus'

const adminStore = useAdminStore()

// 获取类型类型
function getTypeType(type: string): string {
  switch (type) {
    case 'announcement': return 'success'
    case 'notification': return 'info'
    case 'warning': return 'warning'
    case 'system': return 'primary'
    default: return ''
  }
}

// 获取类型文本
function getTypeText(type: string): string {
  switch (type) {
    case 'announcement': return '公告'
    case 'notification': return '通知'
    case 'warning': return '警告'
    case 'system': return '系统'
    default: return type
  }
}

// 发布通知
function addNotification() {
  ElMessage.info('发布通知')
  // 实际项目中这里应该调用API
}

// 编辑通知
function editNotification(notificationId: number) {
  ElMessage.info(`编辑通知 ${notificationId}`)
  // 实际项目中这里应该调用API
}

// 删除通知
function deleteNotification(notificationId: number) {
  ElMessage.info(`删除通知 ${notificationId}`)
  // 实际项目中这里应该调用API
}

onMounted(() => {
  adminStore.loadNotifications()
})
</script>

<style scoped>
.actions-bar {
  margin-bottom: 20px;
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