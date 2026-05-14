<template>
  <div class="products-content">
    <div class="section-header">
      <h2>商品审核</h2>
      <p class="section-description">审核商家发布的商品，确保平台商品内容合规</p>
    </div>
    
    <div class="search-bar">
      <ElInput 
        v-model="searchKeyword" 
        placeholder="搜索商品ID、名称或商家" 
        style="width: 300px;" 
        prefix-icon="Search"
      />
      <ElButton type="primary" @click="handleSearch">搜索</ElButton>
    </div>
    
    <ElTable :data="filteredProducts" style="width: 100%" stripe>
      <ElTableColumn prop="id" label="商品ID" width="100" />
      <ElTableColumn label="商品图片" width="100">
        <template #default="scope">
          <img :src="scope.row.images[0]" alt="商品图片" class="product-image" />
        </template>
      </ElTableColumn>
      <ElTableColumn prop="title" label="商品名称" min-width="200" />
      <ElTableColumn prop="sellingPrice" label="价格" width="100">
        <template #default="scope">
          ¥{{ scope.row.sellingPrice ? scope.row.sellingPrice.toFixed(2) : '0.00' }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="sellerId" label="商家ID" width="100" />
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="创建时间" width="180" />
      <ElTableColumn label="操作" width="200">
        <template #default="scope">
          <ElButton type="success" size="small" @click="approveProduct(scope.row.id)" v-if="scope.row.status === 'pending'">
            通过
          </ElButton>
          <ElButton type="danger" size="small" @click="rejectProduct(scope.row.id)" v-if="scope.row.status === 'pending'" style="margin-left: 8px;">
            拒绝
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
        :total="adminStore.products.length"
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

// 过滤商品
const filteredProducts = computed(() => {
  let products = adminStore.products
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    products = products.filter(product => 
      product.id.toString().includes(keyword) ||
      product.title.toLowerCase().includes(keyword) ||
      product.sellerId.toString().includes(keyword)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return products.slice(start, end)
})

// 获取状态类型
function getStatusType(status: string): string {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'onSale': return 'info'
    case 'sold': return 'primary'
    default: return ''
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    case 'onSale': return '在售'
    case 'sold': return '已售出'
    default: return status
  }
}

// 搜索商品
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

// 审核通过
function approveProduct(productId: number) {
  ElMessage.success('商品审核通过')
  // 实际项目中这里应该调用API
}

// 审核拒绝
function rejectProduct(productId: number) {
  ElMessage.error('商品审核拒绝')
  // 实际项目中这里应该调用API
}

onMounted(() => {
  adminStore.loadProducts()
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

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
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