<template>
  <div class="forum-content">
    <div class="section-header">
      <h2>社区管理</h2>
      <p class="section-description">管理论坛板块和内容，维护社区讨论环境</p>
    </div>
    
    <div class="actions-bar">
      <ElButton type="primary" @click="addSection">
        添加板块
      </ElButton>
    </div>
    
    <ElTable :data="adminStore.forumSections" style="width: 100%" stripe>
      <ElTableColumn prop="id" label="板块ID" width="100" />
      <ElTableColumn prop="name" label="板块名称" width="180" />
      <ElTableColumn prop="description" label="板块描述" min-width="300" />
      <ElTableColumn prop="order" label="排序" width="80" />
      <ElTableColumn prop="postCount" label="帖子数" width="100" />
      <ElTableColumn label="操作" width="150">
        <template #default="scope">
          <ElButton type="primary" size="small" @click="editSection(scope.row.id)">
            编辑
          </ElButton>
          <ElButton type="danger" size="small" @click="deleteSection(scope.row.id)" style="margin-left: 8px;">
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
    
    <ElDivider content-position="left">帖子管理</ElDivider>
    
    <div class="search-bar">
      <ElInput 
        v-model="searchKeyword" 
        placeholder="搜索帖子ID、标题或作者" 
        style="width: 300px;" 
        prefix-icon="Search"
      />
      <ElButton type="primary" @click="handleSearch">搜索</ElButton>
    </div>
    
    <ElTable :data="filteredPosts" style="width: 100%" stripe>
      <ElTableColumn prop="id" label="帖子ID" width="100" />
      <ElTableColumn prop="title" label="帖子标题" min-width="300" />
      <ElTableColumn prop="authorId" label="作者ID" width="100" />
      <ElTableColumn prop="sectionId" label="板块ID" width="100" />
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="scope">
          <ElTag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="创建时间" width="180" />
      <ElTableColumn label="操作" width="150">
        <template #default="scope">
          <ElButton type="primary" size="small" @click="viewPost(scope.row.id)">
            查看
          </ElButton>
          <ElButton type="danger" size="small" @click="deletePost(scope.row.id)" style="margin-left: 8px;">
            删除
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
        :total="adminStore.forumPosts.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { ElInput, ElButton, ElTable, ElTableColumn, ElTag, ElPagination, ElDivider, ElMessage } from 'element-plus'

const adminStore = useAdminStore()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤帖子
const filteredPosts = computed(() => {
  let posts = adminStore.forumPosts
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    posts = posts.filter(post => 
      post.id.toString().includes(keyword) ||
      post.title.toLowerCase().includes(keyword) ||
      post.authorId.toString().includes(keyword)
    )
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return posts.slice(start, end)
})

// 获取状态类型
function getStatusType(status: string): string {
  switch (status) {
    case 'pending': return 'warning'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    default: return ''
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return status
  }
}

// 搜索帖子
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

// 添加板块
function addSection() {
  ElMessage.info('添加板块')
  // 实际项目中这里应该调用API
}

// 编辑板块
function editSection(sectionId: number) {
  ElMessage.info(`编辑板块 ${sectionId}`)
  // 实际项目中这里应该调用API
}

// 删除板块
function deleteSection(sectionId: number) {
  ElMessage.info(`删除板块 ${sectionId}`)
  // 实际项目中这里应该调用API
}

// 查看帖子
function viewPost(postId: number) {
  ElMessage.info(`查看帖子 ${postId}`)
  // 实际项目中这里应该调用API
}

// 删除帖子
function deletePost(postId: number) {
  ElMessage.info(`删除帖子 ${postId}`)
  // 实际项目中这里应该调用API
}

onMounted(() => {
  adminStore.loadForumSections()
  adminStore.loadForumPosts()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.actions-bar {
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