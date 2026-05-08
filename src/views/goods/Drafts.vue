<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <a href="#" class="logo" @click.prevent="router.push('/')">
            <span>荔园交易</span>
          </a>
          <span class="pageTitle">草稿箱</span>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/forum')"><i class="fa fa-comments"></i> 社区</a>
          <a href="#" @click.prevent="router.push('/cart')"><i class="fa fa-shopping-cart"></i> 购物车</a>
          <a href="#" @click.prevent="router.push('/chat')"><i class="fa fa-bell"></i> 消息</a>
          <template v-if="userStore.isLoggedIn">
            <UserDropdown />
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main">
      <!-- 操作栏 -->
      <div class="actionBar">
        <div class="draftCount">共 {{ drafts.length }} 个草稿</div>
        <button class="publishBtn" @click="goToPublish">
          <i class="fa fa-plus"></i> 发布新商品
        </button>
      </div>

      <!-- 草稿列表 -->
      <div class="draftList" v-if="drafts.length > 0">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="draftCard card"
        >
          <div class="draftImage" @click="editDraft(draft)">
            <img v-if="draft.images?.length" :src="draft.images[0]" :alt="draft.title" />
            <div v-else class="noImage">
              <i class="fa fa-image"></i>
              <span>暂无图片</span>
            </div>
          </div>
          <div class="draftInfo">
            <h3 class="draftTitle" @click="editDraft(draft)">{{ draft.title || '未填写标题' }}</h3>
            <p class="draftDesc">{{ draft.description || '暂无描述' }}</p>
            <div class="draftMeta">
              <span class="draftCategory">{{ getCategoryName(draft.categoryId) }}</span>
              <span class="draftPrice" v-if="draft.sellingPrice">¥{{ draft.sellingPrice }}</span>
            </div>
            <div class="draftTime">
              <i class="fa fa-clock-o"></i>
              {{ formatTime(draft.updatedAt) }}
            </div>
          </div>
          <div class="draftActions">
            <button class="actionBtn primary" @click="publishDraft(draft)">
              <i class="fa fa-send"></i> 发布
            </button>
            <button class="actionBtn" @click="editDraft(draft)">
              <i class="fa fa-edit"></i> 编辑
            </button>
            <button class="actionBtn delete" @click="deleteDraft(draft)">
              <i class="fa fa-trash-alt"></i> 删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty">
        <i class="fa fa-file-text-o"></i>
        <p>草稿箱是空的</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getCategoryList, getDraftList } from '@/api/goods'
import type { Category } from '@/api/goods'
import UserDropdown from '@/components/UserDropdown.vue'

defineOptions({ name: 'Drafts' })

const router = useRouter()
const userStore = useUserStore()
const EDIT_PRODUCT_CACHE_KEY = 'edit_product_cache'

interface Draft {
  id: number
  title?: string
  description?: string
  categoryId?: number
  sellingPrice?: number
  images?: string[]
  updatedAt?: string
}

const drafts = ref<Draft[]>([])
const categoryList = ref<Category[]>([])

const getCategoryName = (id?: number): string => {
  if (!id) return '未分类'
  const cat = categoryList.value.find(c => c.id === id)
  return cat?.categoryName || '未分类'
}

const formatTime = (time?: string): string => {
  if (!time) return '未知时间'
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days > 0) return `${days}天前`
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) return `${hours}小时前`
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/user/center')
  }
}

const handleLogin = () => {
  router.push('/user/login')
}

const goToPublish = () => {
  router.push('/publish')
}

const editDraft = (draft: Draft) => {
  sessionStorage.setItem(EDIT_PRODUCT_CACHE_KEY, JSON.stringify(draft))
  router.push({ path: '/edit', query: { id: draft.id.toString() } })
}

const publishDraft = (draft: Draft) => {
  sessionStorage.setItem(EDIT_PRODUCT_CACHE_KEY, JSON.stringify(draft))
  router.push({ path: '/edit', query: { id: draft.id.toString(), publish: 'true' } })
}

const deleteDraft = (draft: Draft) => {
  if (confirm(`确定要删除草稿「${draft.title || '未命名'}」吗？`)) {
    drafts.value = drafts.value.filter(d => d.id !== draft.id)
    // TODO: 调用后端删除接口
  }
}

const loadCategories = async () => {
  try {
    categoryList.value = await getCategoryList()
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

onMounted(async () => {
  await loadCategories()
  try {
    const res = await getDraftList()
    // 将后端返回的 Product[] 映射为 Draft 格式
    drafts.value = res.records.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      categoryId: undefined as number | undefined, // Product 返回 category(名称)，需从分类列表反查 ID
      sellingPrice: item.sellingPrice || parseFloat(item.price) || undefined,
      images: item.images?.map(img => img.url).filter(Boolean) || [],
      updatedAt: item.publishedAt || undefined,
    }))
  } catch (err) {
    console.error('加载草稿列表失败:', err)
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 顶部导航 */
.top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topInner {
  padding: 12px 80px;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.backBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 18px;
  transition: color 200ms;
}

.backBtn:hover {
  color: #f97316;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.logo span {
  font-size: 20px;
  font-weight: bold;
  color: #f97316;
}

.pageTitle {
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 13px;
  border-radius: 12px;
}

.navLinks {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  margin-left: auto;
}

.navLinks a {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition: color 150ms;
}

.navLinks a:hover {
  color: #f97316;
}

/* 主体内容 */
.main {
  padding: 20px 80px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 操作栏 */
.actionBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.draftCount {
  font-size: 14px;
  color: #6b7280;
}

.publishBtn {
  padding: 10px 20px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 150ms;
}

.publishBtn:hover {
  background: #ea580c;
}

/* 草稿卡片 */
.draftList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.draftCard {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.draftImage {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.draftImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.noImage {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  gap: 4px;
}

.draftInfo {
  flex: 1;
  min-width: 0;
}

.draftTitle {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draftTitle:hover {
  color: #f97316;
}

.draftDesc {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.draftMeta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.draftCategory {
  padding: 2px 8px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  border-radius: 4px;
}

.draftPrice {
  font-size: 14px;
  font-weight: 600;
  color: #f97316;
}

.draftTime {
  font-size: 12px;
  color: #9ca3af;
}

.draftTime i {
  margin-right: 4px;
}

.draftActions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.actionBtn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms;
}

.actionBtn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.actionBtn.primary {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}

.actionBtn.primary:hover {
  background: #ea580c;
}

.actionBtn.delete {
  color: #ef4444;
}

.actionBtn.delete:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 12px;
}

.empty i {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 20px 0;
}

.btnPrimary {
  padding: 12px 24px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 150ms;
}

.btnPrimary:hover {
  background: #ea580c;
}

/* 响应式 */
@media (max-width: 768px) {
  .topInner {
    padding: 10px 16px;
  }

  .main {
    padding: 16px;
  }

  .navLinks {
    gap: 12px;
  }

  .navLinks a span {
    display: none;
  }

  .draftCard {
    flex-direction: column;
  }

  .draftImage {
    width: 100%;
    height: 180px;
  }

  .draftActions {
    flex-direction: row;
    justify-content: flex-start;
  }
}
</style>
