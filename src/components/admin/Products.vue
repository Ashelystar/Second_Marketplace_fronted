<template>
  <div class="products-content">
    <div class="section-header">
      <h2>商品审核</h2>
      <p class="section-description">审核商家发布的商品，确保平台商品内容合规</p>
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
    
    <!-- 商品审核界面 - 只在开发模式或无错误时显示 -->
    <div v-else-if="isDev || !apiError">
      <div class="search-bar">
        <ElSelect v-model="statusFilter" placeholder="按状态筛选" style="width: 150px; margin-right: 10px;">
          <ElOption label="全部" value="" />
          <ElOption label="草稿" value="draft" />
          <ElOption label="待审核" value="pending_review" />
          <ElOption label="下架" value="off_shelf" />
          <ElOption label="在售" value="on_sale" />
          <ElOption label="已预订" value="reserved" />
        </ElSelect>
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
            <img :src="getProductImage(scope.row)" alt="商品图片" class="product-image" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="title" label="商品名称" min-width="200" />
        <ElTableColumn prop="sellingPrice" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.sellingPrice ? scope.row.sellingPrice.toFixed(2) : '0.00' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sellerId" label="商家ID" width="100" />
        <ElTableColumn prop="publishStatus" label="状态" width="100">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.publishStatus)">
              {{ getStatusText(scope.row.publishStatus) }}
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
            <ElButton type="info" size="small" @click="showProductDetail(scope.row.id)">查看详情</ElButton>
            <ElButton type="success" size="small" @click="approveProduct(scope.row.id)" v-if="scope.row.publishStatus === 'pending_review'">
              通过
            </ElButton>
            <ElButton type="danger" size="small" @click="showRejectDialog(scope.row.id)" v-if="scope.row.publishStatus === 'pending_review'" style="margin-left: 8px;">
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
          :total="adminStore.totalProducts"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 拒绝原因输入模态框 -->
      <ElDialog
        v-model="rejectDialogVisible"
        title="拒绝商品"
        width="500px"
      >
        <ElForm :model="rejectForm" label-width="100px">
          <ElFormItem label="拒绝原因">
            <ElInput
              v-model="rejectForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入拒绝原因"
              required
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <span class="dialog-footer">
            <ElButton @click="rejectDialogVisible = false">取消</ElButton>
            <ElButton type="danger" @click="confirmReject">确认拒绝</ElButton>
          </span>
        </template>
      </ElDialog>

      <!-- 商品详情预览模态框 -->
      <ElDialog
        v-model="productDetailDialogVisible"
        title="商品详情"
        width="900px"
        :close-on-click-modal="false"
      >
        <!-- 加载状态 -->
        <div v-if="productDetailLoading" class="loading-container">
          <ElLoading />
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="productDetailError" class="error-container">
          <ElResult
            icon="error"
            title="加载失败"
            :sub-title="productDetailError"
          >
            <template #extra>
              <ElButton type="primary" @click="retryLoadProductDetail">重试</ElButton>
            </template>
          </ElResult>
        </div>

        <!-- 商品详情 -->
        <div v-else-if="adminStore.selectedProduct" class="product-detail">
          <div class="detail-section">
            <h3 class="section-title">商品基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">商品ID:</span>
                <span class="info-value">{{ adminStore.selectedProduct.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">标题:</span>
                <span class="info-value">{{ adminStore.selectedProduct.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">副标题:</span>
                <span class="info-value">{{ adminStore.selectedProduct.subtitle || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">品牌:</span>
                <span class="info-value">{{ adminStore.selectedProduct.brand || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">型号:</span>
                <span class="info-value">{{ adminStore.selectedProduct.model || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">成色:</span>
                <span class="info-value">{{ formatCondition(adminStore.selectedProduct.conditionLevel) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">原价:</span>
                <span class="info-value">¥{{ adminStore.selectedProduct.originalPrice?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">售价:</span>
                <span class="info-value price">¥{{ adminStore.selectedProduct.sellingPrice?.toFixed(2) || '0.00' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">可议价:</span>
                <span class="info-value">{{ adminStore.selectedProduct.canBargain ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">交易方式:</span>
                <span class="info-value">{{ formatTradeMode(adminStore.selectedProduct.tradeMode) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">自提城市:</span>
                <span class="info-value">{{ adminStore.selectedProduct.pickupCity || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">库存:</span>
                <span class="info-value">{{ adminStore.selectedProduct.stock }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发布状态:</span>
                <span class="info-value">
                  <ElTag :type="getStatusType(adminStore.selectedProduct.publishStatus)">
                    {{ getStatusText(adminStore.selectedProduct.publishStatus) }}
                  </ElTag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">拒绝原因:</span>
                <span class="info-value">{{ adminStore.selectedProduct.rejectReason || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">浏览次数:</span>
                <span class="info-value">{{ adminStore.selectedProduct.viewCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">收藏次数:</span>
                <span class="info-value">{{ adminStore.selectedProduct.favoriteCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发布时间:</span>
                <span class="info-value">{{ formatTime(adminStore.selectedProduct.publishedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">商品描述</h3>
            <p class="description">{{ adminStore.selectedProduct.description }}</p>
          </div>

          <div v-if="adminStore.selectedProduct.images && adminStore.selectedProduct.images.length > 0" class="detail-section">
            <h3 class="section-title">商品图片</h3>
            <div class="image-list">
              <div v-for="(img, index) in adminStore.selectedProduct.images" :key="index" class="image-item">
                <img :src="getImageUrl(img.imageUrl || img.url || img)" alt="商品图片" />
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">商家信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">商家ID:</span>
                <span class="info-value">{{ adminStore.selectedProduct.sellerId }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="detail-dialog-footer">
            <ElButton @click="productDetailDialogVisible = false">关闭</ElButton>
            <template v-if="adminStore.selectedProduct?.publishStatus === 'pending_review'">
              <ElButton type="success" @click="approveProductFromDetail">审核通过</ElButton>
              <ElButton type="danger" @click="showRejectDialogFromDetail">审核拒绝</ElButton>
            </template>
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
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 开发模式开关 - 默认false
const isDev = ref(false)

// API错误状态
const apiError = ref(false)

// 拒绝对话框相关
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  reason: ''
})
const currentProductId = ref<number | null>(null)

// 商品详情相关
const productDetailDialogVisible = ref(false)
const productDetailLoading = ref(false)
const productDetailError = ref('')

// 获取商品图片
function getProductImage(product: any): string {
  if (product.images && product.images.length > 0) {
    const firstImg = product.images[0]
    let imgUrl = ''
    if (typeof firstImg === 'string') {
      imgUrl = firstImg
    } else if (firstImg && typeof firstImg === 'object') {
      imgUrl = firstImg.url || firstImg.imageUrl || ''
    }
    if (imgUrl) {
      return getImageUrl(imgUrl)
    }
  }
  return PLACEHOLDER_IMG
}

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
      console.log('商品审核-开发模式')
    } else {
      // 生产模式下请求真实API
      await adminStore.loadProducts({
        publishStatus: statusFilter.value || undefined,
        keyword: searchKeyword.value || undefined,
        page: currentPage.value,
        pageSize: pageSize.value
      })
      console.log('商品审核-生产环境')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    apiError.value = true
    ElMessage.error('数据加载失败，请检查网络连接')
    // 清空相关数据
    adminStore.products = []
    adminStore.totalProducts = 0
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 过滤商品
const filteredProducts = computed(() => {
  // 非开发模式且有错误时，不返回任何数据
  if (!isDev.value && apiError.value) {
    return []
  }
  
  let products = adminStore.products
  
  // 如果有状态筛选，先按状态筛选
  if (statusFilter.value) {
    products = products.filter(product => product.publishStatus === statusFilter.value)
  }
  
  // 如果有关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    products = products.filter(product => 
      product.id.toString().includes(keyword) ||
      product.title.toLowerCase().includes(keyword) ||
      product.sellerId.toString().includes(keyword)
    )
  }
  
  return products
})

// 获取状态类型
function getStatusType(status: string): string {
  switch (status) {
    case 'draft': return 'info'
    case 'pending_review': return 'warning'
    case 'off_shelf': return 'danger'
    case 'on_sale': return 'success'
    case 'reserved': return 'primary'
    default: return ''
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'draft': return '草稿'
    case 'pending_review': return '待审核'
    case 'off_shelf': return '下架'
    case 'on_sale': return '在售'
    case 'reserved': return '已预订'
    default: return status
  }
}

// 格式化成色
function formatCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    'new': '全新',
    'almost_new': '几乎全新',
    'good': '良好',
    'fair': '一般',
    'poor': '较旧'
  }
  return conditionMap[condition] || condition || '-'
}

// 格式化交易方式
function formatTradeMode(mode: string): string {
  const modeMap: Record<string, string> = {
    'pickup': '自提',
    'shipping': '快递',
    'express': '快递',
    'both': '自提/快递'
  }
  return modeMap[mode] || mode || '-'
}

// 搜索商品
function handleSearch() {
  currentPage.value = 1
  loadData()
}

// 页面大小变化
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

// 当前页面变化
function handleCurrentChange(current: number) {
  currentPage.value = current
  loadData()
}

// 审核通过
async function approveProduct(productId: number) {
  try {
    if (isDev.value) {
      // 开发模式下直接修改本地数据
      const product = adminStore.products.find(p => p.id === productId)
      if (product) {
        product.publishStatus = 'on_sale'
      }
      ElMessage.success('商品审核通过')
    } else {
      // 生产模式下调用API
      const success = await adminStore.auditProduct(productId, true)
      if (success) {
        ElMessage.success('商品审核通过')
      } else {
        ElMessage.error('商品审核失败')
      }
    }
  } catch (error) {
    console.error('审核商品失败:', error)
    ElMessage.error('商品审核失败')
  }
}

// 显示拒绝对话框
function showRejectDialog(productId: number) {
  currentProductId.value = productId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
async function confirmReject() {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.error('请输入拒绝原因')
    return
  }
  
  if (!currentProductId.value) {
    ElMessage.error('请选择要拒绝的商品')
    return
  }
  
  try {
    if (isDev.value) {
      // 开发模式下直接修改本地数据
      const product = adminStore.products.find(p => p.id === currentProductId.value)
      if (product) {
        product.publishStatus = 'off_shelf'
      }
      ElMessage.success('商品已拒绝')
    } else {
      // 生产模式下调用API
      const success = await adminStore.auditProduct(currentProductId.value, false, rejectForm.value.reason)
      if (success) {
        ElMessage.success('商品已拒绝')
      } else {
        ElMessage.error('商品拒绝失败')
      }
    }
    rejectDialogVisible.value = false
  } catch (error) {
    console.error('拒绝商品失败:', error)
    ElMessage.error('商品拒绝失败')
  }
}

// 显示商品详情
async function showProductDetail(productId: number) {
  productDetailDialogVisible.value = true
  productDetailError.value = ''
  
  try {
    if (isDev.value) {
      // 开发模式下直接从列表获取
      const product = adminStore.products.find(p => p.id === productId)
      if (product) {
        adminStore.selectedProduct = product
      }
    } else {
      // 生产模式下调用API
      await adminStore.loadProductDetail(productId)
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    productDetailError.value = error instanceof Error ? error.message : '加载失败，请稍后重试'
    if (!isDev.value) {
      ElMessage.error('加载商品详情失败')
    }
  }
}

// 重试加载商品详情
async function retryLoadProductDetail() {
  if (currentProductId.value) {
    await showProductDetail(currentProductId.value)
  }
}

// 从详情页审核通过
async function approveProductFromDetail() {
  if (adminStore.selectedProduct?.id) {
    await approveProduct(adminStore.selectedProduct.id)
    // 更新详情页数据状态
    if (adminStore.selectedProduct) {
      adminStore.selectedProduct.publishStatus = 'on_sale'
    }
  }
}

// 从详情页显示拒绝对话框
function showRejectDialogFromDetail() {
  if (adminStore.selectedProduct?.id) {
    currentProductId.value = adminStore.selectedProduct.id
    rejectForm.value.reason = ''
    rejectDialogVisible.value = true
  }
}

// 格式化时间
function formatTime(time: string | number[]): string {
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

/* 商品详情样式 */
.product-detail {
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

.price {
  color: #f56c6c;
  font-weight: 600;
}

.description {
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
