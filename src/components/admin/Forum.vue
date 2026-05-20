<template>
  <div class="forum-content">
    <div class="section-header">
      <h2>社区管理</h2>
      <p class="section-description">管理论坛板块和内容，维护社区讨论环境</p>
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
    
    <!-- 帖子审核界面 - 只在开发模式或无错误时显示 -->
    <div v-else-if="isDev || !apiError">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <ElSelect v-model="filterStatus" placeholder="帖子状态" clearable style="width: 150px;">
          <ElOption label="全部" value="" />
          <ElOption label="待审核" value="pending" />
          <ElOption label="已通过" value="approved" />
          <ElOption label="已拒绝" value="rejected" />
          <ElOption label="已隐藏" value="hidden" />
        </ElSelect>

        <ElSelect v-model="filterCategory" placeholder="板块筛选" clearable style="width: 150px;">
          <ElOption label="全部" :value="null" />
          <ElOption
            v-for="section in adminStore.forumSections"
            :key="section.id"
            :label="section.name"
            :value="section.id"
          />
        </ElSelect>

        <ElInput 
          v-model="searchKeyword" 
          placeholder="搜索帖子ID、标题或作者" 
          style="width: 300px;" 
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
      
      <ElTable :data="filteredPosts" style="width: 100%" stripe v-loading="tableLoading">
        <ElTableColumn prop="id" label="帖子ID" width="80" />
        <ElTableColumn prop="title" label="帖子标题" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="post-title">
              <ElTag v-if="row.isTop" type="danger" size="small" style="margin-right: 4px;">置顶</ElTag>
              <ElTag v-if="row.isFeatured" type="warning" size="small" style="margin-right: 4px;">精华</ElTag>
              {{ row.title }}
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="authorName" label="作者" width="100" />
        <ElTableColumn prop="categoryName" label="板块" width="100" />
        <ElTableColumn prop="status" label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="数据" width="160">
          <template #default="{ row }">
            <span class="data-item">
              <ElIcon><View /></ElIcon> {{ row.viewCount }}
            </span>
            <span class="data-item" style="margin-left: 8px;">
              <ElIcon><ChatDotRound /></ElIcon> {{ row.commentCount }}
            </span>
            <span class="data-item" style="margin-left: 8px;">
              <ElIcon><Star /></ElIcon> {{ row.likeCount }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="发布时间" width="170">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <ElButton type="info" size="small" @click="showPostDetail(row)">查看</ElButton>
            <ElButton 
              type="success" 
              size="small" 
              @click="approvePost(row.id)" 
              v-if="row.status === 'pending'"
            >
              通过
            </ElButton>
            <ElButton 
              type="danger" 
              size="small" 
              @click="showRejectDialog(row.id)" 
              v-if="row.status === 'pending'"
            >
              拒绝
            </ElButton>
            <ElDropdown @command="(cmd) => handleDropdownCommand(cmd, row)" trigger="click">
              <ElButton size="small">
                更多<ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem :command="row.isTop ? 'untop' : 'top'">
                    {{ row.isTop ? '取消置顶' : '置顶' }}
                  </ElDropdownItem>
                  <ElDropdownItem :command="row.isFeatured ? 'unfeature' : 'feature'">
                    {{ row.isFeatured ? '取消精华' : '设为精华' }}
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" divided>删除帖子</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
      
      <div class="pagination">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="adminStore.totalForumPosts"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 帖子详情预览模态框 -->
      <ElDialog
        v-model="detailDialogVisible"
        title="帖子详情"
        width="900px"
        :close-on-click-modal="false"
      >
        <!-- 加载状态 -->
        <div v-if="postDetailLoading" class="loading-container">
          <ElLoading />
          <p class="loading-text">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="postDetailError" class="error-container">
          <ElResult
            icon="error"
            title="加载失败"
            :sub-title="postDetailError"
          >
            <template #extra>
              <ElButton type="primary" @click="retryLoadPostDetail">重试</ElButton>
            </template>
          </ElResult>
        </div>

        <!-- 帖子详情 -->
        <div v-else-if="adminStore.selectedPost" class="post-detail">
          <div class="detail-section">
            <h3 class="section-title">帖子基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">帖子ID:</span>
                <span class="info-value">{{ adminStore.selectedPost.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">标题:</span>
                <span class="info-value">{{ adminStore.selectedPost.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">作者:</span>
                <span class="info-value">{{ adminStore.selectedPost.authorName }} (ID: {{ adminStore.selectedPost.authorId }})</span>
              </div>
              <div class="info-item">
                <span class="info-label">板块:</span>
                <span class="info-value">{{ adminStore.selectedPost.categoryName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">状态:</span>
                <span class="info-value">
                  <ElTag :type="getStatusType(adminStore.selectedPost.status)">
                    {{ getStatusText(adminStore.selectedPost.status) }}
                  </ElTag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">置顶:</span>
                <span class="info-value">{{ adminStore.selectedPost.isTop ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">精华:</span>
                <span class="info-value">{{ adminStore.selectedPost.isFeatured ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">浏览次数:</span>
                <span class="info-value">{{ adminStore.selectedPost.viewCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">评论次数:</span>
                <span class="info-value">{{ adminStore.selectedPost.commentCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">点赞次数:</span>
                <span class="info-value">{{ adminStore.selectedPost.likeCount || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">发布时间:</span>
                <span class="info-value">{{ formatTime(adminStore.selectedPost.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间:</span>
                <span class="info-value">{{ formatTime(adminStore.selectedPost.updatedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3 class="section-title">帖子内容</h3>
            <p class="description">{{ adminStore.selectedPost.content }}</p>
          </div>
        </div>

        <template #footer>
          <div class="detail-dialog-footer">
            <ElButton @click="detailDialogVisible = false">关闭</ElButton>
            <template v-if="adminStore.selectedPost?.status === 'pending'">
              <ElButton type="success" @click="approvePostFromDetail">审核通过</ElButton>
              <ElButton type="danger" @click="showRejectDialogFromDetail">审核拒绝</ElButton>
            </template>
          </div>
        </template>
      </ElDialog>

      <!-- 拒绝原因输入模态框 -->
      <ElDialog
        v-model="rejectDialogVisible"
        title="拒绝帖子"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElMessage, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElResult, ElLoading, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDivider } from 'element-plus'
import { Search, View, ChatDotRound, Star, ArrowDown } from '@element-plus/icons-vue'

const adminStore = useAdminStore()

// 筛选和搜索
const filterStatus = ref('')
const filterCategory = ref<number | null>(null)
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
const rejectDialogVisible = ref(false)
const rejectForm = ref({
  reason: ''
})
const currentPostId = ref<number | null>(null)

// 帖子详情相关
const postDetailLoading = ref(false)
const postDetailError = ref('')

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    tableLoading.value = true
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
      console.log('社区管理-开发模式')
    } else {
      // 生产模式下请求真实API
      await Promise.all([
        adminStore.loadForumSections(),
        adminStore.loadForumPosts({
          page: currentPage.value,
          size: pageSize.value,
          keyword: searchKeyword.value || undefined
        })
      ])
      console.log('社区管理-生产环境')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    apiError.value = true
    ElMessage.error('数据加载失败，请检查网络连接')
    // 清空相关数据
    adminStore.forumSections = []
    adminStore.forumPosts = []
    adminStore.totalForumPosts = 0
  } finally {
    tableLoading.value = false
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 过滤帖子
const filteredPosts = computed(() => {
  // 非开发模式且有错误时，不返回任何数据
  if (!isDev.value && apiError.value) {
    return []
  }
  
  let posts = adminStore.forumPosts
  
  if (filterStatus.value) {
    posts = posts.filter(p => p.status === filterStatus.value)
  }
  
  if (filterCategory.value !== null) {
    posts = posts.filter(p => p.categoryId === filterCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    posts = posts.filter(p => 
      p.id.toString().includes(keyword) ||
      p.title.toLowerCase().includes(keyword) ||
      p.authorName.toLowerCase().includes(keyword)
    )
  }
  
  return posts
})

// 获取状态类型
function getStatusType(status: string): string {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'hidden': return 'info'
    default: return ''
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    case 'hidden': return '已隐藏'
    default: return status
  }
}

// 搜索帖子
function handleSearch() {
  currentPage.value = 1
  loadData()
}

function handleReset() {
  filterStatus.value = ''
  filterCategory.value = null
  searchKeyword.value = ''
  currentPage.value = 1
  pageSize.value = 10
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
async function approvePost(postId: number) {
  try {
    if (isDev.value) {
      // 开发模式下直接修改本地数据
      const post = adminStore.forumPosts.find(p => p.id === postId)
      if (post) {
        post.status = 'approved'
      }
      ElMessage.success('帖子审核通过')
    } else {
      // 生产模式下调用API
      const success = await adminStore.auditPost(postId, true)
      if (success) {
        ElMessage.success('帖子审核通过')
      } else {
        ElMessage.error('帖子审核失败')
      }
    }
  } catch (error) {
    console.error('审核帖子失败:', error)
    ElMessage.error('帖子审核失败')
  }
}

// 显示拒绝对话框
function showRejectDialog(postId: number) {
  currentPostId.value = postId
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
async function confirmReject() {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.error('请输入拒绝原因')
    return
  }
  
  if (!currentPostId.value) {
    ElMessage.error('请选择要拒绝的帖子')
    return
  }
  
  try {
    if (isDev.value) {
      // 开发模式下直接修改本地数据
      const post = adminStore.forumPosts.find(p => p.id === currentPostId.value)
      if (post) {
        post.status = 'rejected'
      }
      ElMessage.success('帖子已拒绝')
    } else {
      // 生产模式下调用API
      const success = await adminStore.auditPost(currentPostId.value, false, rejectForm.value.reason)
      if (success) {
        ElMessage.success('帖子已拒绝')
      } else {
        ElMessage.error('帖子拒绝失败')
      }
    }
    rejectDialogVisible.value = false
  } catch (error) {
    console.error('拒绝帖子失败:', error)
    ElMessage.error('帖子拒绝失败')
  }
}

// 显示帖子详情
async function showPostDetail(post: any) {
  detailDialogVisible.value = true
  postDetailError.value = ''
  
  try {
    if (isDev.value) {
      // 开发模式下直接从列表获取
      const targetPost = adminStore.forumPosts.find(p => p.id === post.id)
      if (targetPost) {
        adminStore.selectedPost = targetPost
      }
    } else {
      // 生产模式下调用API
      await adminStore.loadPostDetail(post.id)
    }
  } catch (error) {
    console.error('加载帖子详情失败:', error)
    postDetailError.value = error instanceof Error ? error.message : '加载失败，请稍后重试'
    if (!isDev.value) {
      ElMessage.error('加载帖子详情失败')
    }
  }
}

// 重试加载帖子详情
async function retryLoadPostDetail() {
  if (currentPostId.value) {
    const post = adminStore.forumPosts.find(p => p.id === currentPostId.value)
    if (post) {
      await showPostDetail(post)
    }
  }
}

// 从详情页审核通过
async function approvePostFromDetail() {
  if (adminStore.selectedPost?.id) {
    await approvePost(adminStore.selectedPost.id)
    // 更新详情页数据状态
    if (adminStore.selectedPost) {
      adminStore.selectedPost.status = 'approved'
    }
  }
}

// 从详情页显示拒绝对话框
function showRejectDialogFromDetail() {
  if (adminStore.selectedPost?.id) {
    currentPostId.value = adminStore.selectedPost.id
    rejectForm.value.reason = ''
    rejectDialogVisible.value = true
  }
}

// 下拉菜单命令
const handleDropdownCommand = async (command: string, row: any) => {
  try {
    switch (command) {
      case 'top':
        if (isDev.value) {
          row.isTop = true
          ElMessage.success('已置顶')
        } else {
          const success = await adminStore.toggleTopPost(row.id, true)
          if (success) {
            ElMessage.success('已置顶')
          } else {
            ElMessage.error('置顶失败')
          }
        }
        break
      case 'untop':
        if (isDev.value) {
          row.isTop = false
          ElMessage.success('已取消置顶')
        } else {
          const success = await adminStore.toggleTopPost(row.id, false)
          if (success) {
            ElMessage.success('已取消置顶')
          } else {
            ElMessage.error('取消置顶失败')
          }
        }
        break
      case 'feature':
        if (isDev.value) {
          row.isFeatured = true
          ElMessage.success('已设为精华')
        } else {
          const success = await adminStore.toggleFeaturePost(row.id, true)
          if (success) {
            ElMessage.success('已设为精华')
          } else {
            ElMessage.error('设为精华失败')
          }
        }
        break
      case 'unfeature':
        if (isDev.value) {
          row.isFeatured = false
          ElMessage.success('已取消精华')
        } else {
          const success = await adminStore.toggleFeaturePost(row.id, false)
          if (success) {
            ElMessage.success('已取消精华')
          } else {
            ElMessage.error('取消精华失败')
          }
        }
        break
      case 'delete':
        await ElMessageBox.confirm('确定要删除这个帖子吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        if (isDev.value) {
          adminStore.forumPosts = adminStore.forumPosts.filter(p => p.id !== row.id)
          adminStore.totalForumPosts--
          ElMessage.success('已删除')
        } else {
          const success = await adminStore.deletePost(row.id)
          if (success) {
            ElMessage.success('已删除')
          } else {
            ElMessage.error('删除帖子失败')
          }
        }
        break
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 格式化时间
function formatTime(time: string): string {
  if (!time) return '无'
  
  const date = new Date(time)
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
  return time
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

.post-title {
  display: flex;
  align-items: center;
}

.data-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #666;
  font-size: 13px;
}

/* 帖子详情样式 */
.post-detail {
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

.description {
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
  }
  
  .filter-bar .el-select,
  .filter-bar .el-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
