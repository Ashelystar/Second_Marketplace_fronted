<template>
  <div class="disputes-content">
    <div class="section-header">
      <h2>纠纷仲裁</h2>
      <p class="section-description">处理买卖双方的纠纷，维护平台交易公平</p>
    </div>
    
    <div class="search-bar">
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
      <ElTableColumn prop="orderId" label="订单号" width="180" />
      <ElTableColumn prop="buyerId" label="买家ID" width="100" />
      <ElTableColumn prop="sellerId" label="卖家ID" width="100" />
      <ElTableColumn prop="reason" label="纠纷原因" min-width="200" />
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="创建时间" width="180" />
      <ElTableColumn label="操作" width="100">
        <template #default="scope">
          <ElButton type="primary" size="small" @click="handleDispute(scope.row.id)">
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
        :total="adminStore.disputes.length"
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

// 过滤纠纷
const filteredDisputes = computed(() => {
  let disputes = adminStore.disputes
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    disputes = disputes.filter(dispute => 
      dispute.id.toString().includes(keyword) ||
      dispute.orderId.toLowerCase().includes(keyword) ||
      dispute.buyerId.toString().includes(keyword) ||
      dispute.sellerId.toString().includes(keyword) ||
      dispute.reason.toLowerCase().includes(keyword)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return disputes.slice(start, end)
})

// 获取状态类型
function getStatusType(status: string): string {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'resolved': return 'success'
    case 'closed': return 'primary'
    default: return ''
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '待处理'
    case 'processing': return '处理中'
    case 'resolved': return '已解决'
    case 'closed': return '已关闭'
    default: return status
  }
}

// 搜索纠纷
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

// 处理纠纷
function handleDispute(disputeId: number) {
  ElMessage.info(`处理纠纷 ${disputeId}`)
  // 实际项目中这里应该调用API
}

onMounted(() => {
  adminStore.loadDisputes()
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