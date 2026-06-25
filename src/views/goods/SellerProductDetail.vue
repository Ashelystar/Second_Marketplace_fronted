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
        </div>

        <div class="searchBox">
          <div class="searchRow">
            <input
              type="text"
              v-model="searchInput"
              placeholder="搜索闲置物品"
              @keypress.enter="performSearch"
            />
            <button @click="performSearch"><i class="fa fa-search"></i></button>
          </div>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/user/favorites')"><i class="fa fa-heart"></i> 收藏</a>
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

    <!-- 面包屑 -->
    <div class="breadcrumb">
      <a href="#" @click.prevent="router.push('/')">首页</a>
      <i class="fa fa-angle-right"></i>
      <span class="muted">{{ product?.category || '商品分类' }}</span>
      <i class="fa fa-angle-right"></i>
      <span>{{ product?.title || '商品详情' }}</span>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载商品详情中...</p>
    </div>

    <!-- 商品详情 -->
    <main v-else-if="product" class="detail">
      <!-- 商品状态卡片 -->
      <div class="sellerCard card">
        <div class="sellerMain">
          <div class="productStatus">
            <span
              class="statusTag"
              :class="
                product.status === '在售' ? 'onSale' :
                product.status === '待审核' ? 'pending' :
                product.status === '已驳回' || product.status === '已删除' ? 'rejected' :
                'offSale'
              "
            >
              <i :class="product.status === '在售' ? 'fa fa-check-circle' : product.status === '待审核' ? 'fa fa-clock' : 'fa fa-pause-circle'"></i>
              {{ product.status }}
            </span>
            <span class="productTitle">{{ product.title }}</span>
          </div>
          <div class="quickStats">
            <span><i class="fa fa-eye"></i> {{ product.viewCount }} 浏览</span>
            <span><i class="fa fa-heart"></i> {{ product.favoriteCount }} 收藏</span>
          </div>
        </div>
      </div>

      <!-- 图片和商品信息：三列布局 -->
      <div class="detailGrid">
        <!-- 左侧：缩略图 -->
        <div class="thumbnails">
          <button
            v-for="(img, i) in images"
            :key="img.id"
            class="thumb"
            :class="{ active: i === currentIndex }"
            @click="currentIndex = i"
          >
            <img :src="img.url" :alt="img.alt" />
          </button>
        </div>

        <!-- 中间：主图 -->
        <div class="mainImage">
          <img :src="currentImage.url" :alt="currentImage.alt" />
          <button class="navBtn prev" @click="prevImage" :disabled="currentIndex === 0">
            <i class="fa fa-chevron-left"></i>
          </button>
          <button class="navBtn next" @click="nextImage" :disabled="currentIndex === images.length - 1">
            <i class="fa fa-chevron-right"></i>
          </button>
          <div class="imageCounter">{{ currentIndex + 1 }}/{{ images.length }}</div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="info">
          <!-- 价格 -->
          <div class="priceSection">
            <div class="priceRow">
              <span class="price">¥{{ product.price }}</span>
              <span class="originalPrice">¥{{ product.originalPrice }}</span>
            </div>
            <div class="priceTags">
              <span v-if="product.canBargain" class="tag tagRed">可议价</span>
              <span v-if="!product.canBargain" class="tag tagGray">不议价</span>
              <span v-if="product.freight === 0" class="tag tagGreen">包邮</span>
              <span class="muted">交易方式: {{ product.tradeMode === 'pickup' ? '自提' : product.tradeMode === 'shipping' ? '快递' : product.tradeMode === 'both' ? '自提/快递' : product.tradeMode || '未知' }}</span>
            </div>
          </div>

          <!-- 标题 -->
          <h1 class="title">{{ product.title }}</h1>

          <!-- 数据统计 -->
          <div class="stats">
            <span><i class="fa fa-eye"></i> {{ product.viewCount }}人看过</span>
            <span><i class="fa fa-heart"></i> {{ product.favoriteCount }}人收藏</span>
            <span><i class="fa fa-clock-o"></i> {{ getPublishTime() }}</span>
          </div>

          <!-- 成色 -->
          <div class="conditionRow">
            <span class="label">成色</span>
            <span class="conditionTag">{{ formatCondition(product.condition) }}</span>
            <span v-if="product.isNew" class="conditionTag new">全新</span>
          </div>

          <!-- 品牌 -->
          <div v-if="product.brand" class="conditionRow">
            <span class="label">品牌</span>
            <span class="modelValue">{{ product.brand }}</span>
          </div>

          <!-- 型号 -->
          <div v-if="product.model" class="conditionRow">
            <span class="label">型号</span>
            <span class="modelValue">{{ product.model }}</span>
          </div>

          <!-- 库存 -->
          <div v-if="product.stock != null" class="conditionRow">
            <span class="label">库存</span>
            <span class="stockValue" :class="{ lowStock: product.stock <= 3 }">{{ product.stock > 0 ? `剩余 ${product.stock} 件` : '已售罄' }}</span>
          </div>

          <!-- 安全保障 -->
          <div class="securityBox">
            <span><i class="fa fa-shield"></i> 交易安全</span>
            <span><i class="fa fa-check-circle"></i> 正品保障</span>
            <span><i class="fa fa-undo"></i> 7天无理由</span>
          </div>

          <!-- 商品描述 -->
          <div class="descSection">
            <h3>商品描述</h3>
            <p class="desc">{{ product.description }}</p>
          </div>

          <!-- 标签 -->
          <div v-if="product.tags?.length" class="tagsSection">
            <span class="label">标签</span>
            <div class="tags">
              <span v-for="tag in product.tags" :key="tag" class="tagItem">{{ tag }}</span>
            </div>
          </div>

          <!-- 卖家操作按钮 -->
          <div class="actions">
            <div class="actionRow">
              <button class="actionBtn" @click="shareProduct">
                <i class="fa fa-share-alt"></i> 分享
              </button>
              <button v-if="product?.status === '在售'" class="actionBtn" @click="goToConsult">
                <i class="fa fa-comment"></i> 咨询
              </button>
            </div>
            <div class="actionRow">
              <button v-if="product?.status !== '待审核'" class="actionBtn secondary" @click="toggleStatus">
                <i :class="product?.status === '在售' ? 'fa fa-pause' : 'fa fa-play'"></i>
                {{ product?.status === '在售' ? '下架商品' : '重新上架' }}
              </button>
              <button v-if="product?.status === '待审核'" class="actionBtn revoke" @click="revokeReviewFn">
                <i class="fa fa-undo"></i> 撤销审核
              </button>
              <button class="actionBtn primary" @click="editProduct">
                <i class="fa fa-edit"></i> 编辑商品
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品评价 -->
      <section class="reviewSection">
        <div class="reviewHeader">
          <h3><i class="fa fa-star"></i> 商品评价</h3>
          <span class="reviewCount">{{ comments.length }} 条评价</span>
        </div>

        <!-- 评价列表 -->
        <div class="reviewList" v-if="comments.length > 0">
          <div v-for="comment in displayedComments" :key="comment.id" class="reviewItem">
            <div class="reviewUser">
              <UserAvatar :src="comment.avatar" :name="comment.name" class="reviewAvatar" />
              <div class="reviewMeta">
                <span class="reviewName">{{ comment.name }}</span>
                <span class="reviewTime">{{ comment.time }}</span>
                <!-- 评分星星 -->
                <span class="reviewStars" v-if="comment.rating">
                  <i v-for="s in 5" :key="s" class="fa" :class="s <= comment.rating ? 'fa-star' : 'fa-star-o'"></i>
                </span>
              </div>
            </div>
            <div class="reviewContent">{{ comment.content }}</div>

            <!-- 我的回复 -->
            <div v-if="comment.sellerReply" class="sellerReplyBox">
              <span class="sellerReplyTag">我的回复：</span>{{ comment.sellerReply }}
            </div>
          </div>

          <!-- 查看更多按钮 -->
          <div v-if="comments.length > 3" class="loadMore">
            <button class="loadMoreBtn" @click="showAllComments = !showAllComments">
              <i :class="showAllComments ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
              {{ showAllComments ? '收起评价' : `查看全部 ${comments.length} 条评价` }}
            </button>
          </div>
        </div>

        <!-- 无评价 -->
        <div v-else class="emptyReview">
          <i class="fa fa-star-o"></i>
          <p>暂无评价</p>
        </div>
      </section>

      <!-- 底部操作栏 -->
      <div class="bottomBar">
        <button class="deleteBtn" @click="deleteProductHandler">
          <i class="fa fa-trash-alt"></i> 删除商品
        </button>
        <div class="bottomRight">
          <button class="shareBtn" @click="shareProduct">
            <i class="fa fa-share"></i> 分享
          </button>
          <button class="editBtn" @click="editProduct">
            <i class="fa fa-edit"></i> 编辑信息
          </button>
          <button v-if="product?.status !== '待审核'" class="toggleBtn" :class="product.status === '在售' ? 'off' : 'on'" @click="toggleStatus">
            <i :class="product.status === '在售' ? 'fa fa-pause' : 'fa fa-play'"></i>
            {{ product.status === '在售' ? '下架' : '上架' }}
          </button>
          <button v-if="product?.status === '待审核'" class="toggleBtn revoke" @click="revokeReviewFn">
            <i class="fa fa-undo"></i> 撤销
          </button>
        </div>
      </div>
    </main>

    <!-- 商品不存在 -->
    <div v-else class="notFound">
      <div class="notFoundIcon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <h3>商品不存在或已删除</h3>
      <p>该商品可能已被删除</p>
      <RouterLink class="btn btn-primary" to="/">返回首页</RouterLink>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floatTools">
      <button v-for="t in floatingTools" :key="t.id" class="floatBtn" @click="handleTool(t)">
        <i :class="t.icon"></i>
        <span class="floatTip">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import { offShelfProduct, deleteProduct, relistProduct, revokeReview, getProductDetail } from '@/api/goods'
import { getProductReviews } from '@/api/review'
import type { Review } from '@/api/review'
import { createConversation } from '@/api/chat'
import type { ProductVO } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import UserDropdown from '@/components/UserDropdown.vue'
import UserAvatar from '@/components/UserAvatar.vue'

defineOptions({ name: 'SellerProductDetail' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const searchInput = ref('')

interface ProductImage {
  id: number
  url: string
  alt: string
}

interface ProductData {
  id: number
  title: string
  category: string
  location: string
  sellerId: number
  sellerName: string
  sellerAvatar: string
  sellerRating: number
  price: number
  originalPrice: number
  image: string
  images?: ProductImage[]
  description: string
  condition: string
  isNew: boolean
  canBargain: boolean
  freight: number
  status: '在售' | '已下架' | '待审核' | '草稿' | '已驳回' | '已删除' | '未知'
  viewCount: number
  favoriteCount: number
  soldCount: number
  tags: string[]
  publishedAt?: string
  tradeMode?: string
  brand?: string
  model?: string
  stock?: number
}

const product = ref<ProductData | null>(null)
const currentIndex = ref(0)
const images = ref<ProductImage[]>([])
const isLoading = ref(true)
const EDIT_PRODUCT_CACHE_KEY = 'edit_product_cache'

// 评价相关
interface Comment {
  id: number
  userId?: number
  name: string
  avatar?: string
  time: string
  content: string
  rating?: number
  isAnonymous?: number
  sellerReply?: string
  sellerReplyAt?: string
  images?: string[]
}

const comments = ref<Comment[]>([])
const showAllComments = ref(false)

const displayedComments = computed(() => {
  if (showAllComments.value || comments.value.length <= 3) {
    return comments.value
  }
  return comments.value.slice(0, 3)
})

const formatCommentTime = (isoTime: string) => {
  const created = new Date(isoTime).getTime()
  if (Number.isNaN(created)) return '未知时间'
  const now = Date.now()
  const diffMs = now - created
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}小时前`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay}天前`
  return new Date(created).toLocaleDateString()
}

const convertApiReviewToComment = (apiReview: Review): Comment => {
  return {
    id: apiReview.id,
    userId: apiReview.buyerId,
    name: apiReview.isAnonymous ? '匿名用户' : `用户${apiReview.buyerId}`,
    avatar: '',
    time: formatCommentTime(apiReview.createdAt),
    content: apiReview.content,
    rating: apiReview.rating,
    isAnonymous: apiReview.isAnonymous,
    sellerReply: apiReview.sellerReply,
    sellerReplyAt: apiReview.sellerReplyAt,
    images: apiReview.images,
  }
}

const loadComments = async () => {
  if (!product.value?.id) return
  try {
    const res = await getProductReviews(product.value.id)
    if (res.code === 200) {
      comments.value = res.data.map(convertApiReviewToComment)
    }
  } catch (error) {
    console.error('加载评价失败:', error)
  }
}

const currentImage = computed(() => images.value[currentIndex.value] ?? { url: '', alt: '' })

const formatCondition = (level?: string) => {
  const map: Record<string, string> = {
    new: '全新',
    almost_new: '99新',
    good: '9成新',
    fair: '8成新',
    poor: '7成新及以下',
  }
  return map[level || ''] || level || '成色未知'
}

const getPublishTime = () => {
  if (!product.value?.publishedAt) return '未知'
  try {
    const pub = new Date(product.value.publishedAt)
    const now = Date.now()
    const diffMs = now - pub.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return '今天发布'
    if (diffDays <= 3) return '3天内发布'
    if (diffDays <= 7) return '1周内发布'
    if (diffDays <= 30) return '1月内发布'
    return '1个月前发布'
  } catch {
    return '未知'
  }
}

const loadDetails = async () => {
  const id = parseInt(route.query.id as string) || 0
  if (!id) {
    isLoading.value = false
    return
  }

  try {
    const data = await getProductDetail(id)
    // getProductDetail 返回的实际是 ProductVO 结构
    const vo = data as unknown as ProductVO

    // 处理图片（url 需经过 getImageUrl 转为完整路径）
    const productImages: ProductImage[] = (vo.images || []).map(img => ({
      id: img.id,
      url: getImageUrl(img.imageUrl || ''),
      alt: vo.title || '商品图片'
    }))

    // 条件映射
    const conditionMap: Record<string, string> = {
      new: '全新',
      almost_new: '99新',
      good: '95新',
      fair: '八成新',
      poor: '有瑕疵'
    }

    product.value = {
      id: vo.id,
      title: vo.title || '未命名商品',
      category: vo.categoryId ? `分类${vo.categoryId}` : '未分类',
      location: vo.pickupCity || '未知',
      sellerId: vo.sellerId || 0,
      sellerName: userStore.userInfo?.nickname || userStore.userInfo?.username || '卖家',
      sellerAvatar: userStore.userInfo?.avatar || userStore.userInfo?.avatarUrl || '',
      sellerRating: 5.0,
      price: vo.sellingPrice || 0,
      originalPrice: vo.originalPrice || 0,
      image: productImages.length > 0 ? getImageUrl(productImages[0]!.url) : PLACEHOLDER_IMG,
      images: productImages,
      description: vo.description || '',
      condition: vo.conditionLevel ? (conditionMap[vo.conditionLevel] || vo.conditionLevel) : '未知',
      isNew: vo.conditionLevel === 'new',
      canBargain: vo.canBargain ?? false,
      freight: 0,
      status: (() => {
        const raw = String(vo.publishStatus || '').toLowerCase()
        if (raw === 'on_sale') return '在售'
        if (raw === 'off_sale' || raw === 'off_shelf' || raw === 'offline') return '已下架'
        if (raw === 'pending_review') return '待审核'
        if (raw === 'draft') return '草稿'
        if (raw === 'rejected') return '已驳回'
        if (raw === 'deleted') return '已删除'
        console.warn('[SellerProductDetail] 未知商品状态，请更新映射:', vo.publishStatus)
        return '未知'
      })(),
      viewCount: vo.viewCount || 0,
      favoriteCount: vo.favoriteCount || 0,
      soldCount: 0,
      tags: [],
      publishedAt: vo.publishedAt || undefined,
      tradeMode: vo.tradeMode || undefined,
      brand: vo.brand || undefined,
      model: vo.model || undefined,
      stock: vo.stock ?? undefined,
    }

    images.value = productImages
  } catch (err) {
    console.error('获取商品详情失败:', err)
    alert('获取商品信息失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const prevImage = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextImage = () => { if (currentIndex.value < images.value.length - 1) currentIndex.value++ }

const performSearch = () => {
  if (searchInput.value.trim()) router.push({ path: '/search', query: { q: searchInput.value.trim() } })
}

const handleLogin = () => {
  router.push('/user/login')
}

import { useSmartBack } from '@/composables/useSmartBack'
const { goBack } = useSmartBack('/')

const toggleStatus = async () => {
  if (!product.value) return
  if (product.value.status === '在售') {
    // 在售 -> 下架
    if (!confirm('确定要下架该商品吗？')) return
    try {
      await offShelfProduct(product.value.id)
      product.value.status = '已下架'
      alert('商品已下架')
    } catch (err) {
      alert(err instanceof Error ? err.message : '下架失败')
    }
  } else {
    // 已下架 -> 重新上架
    if (!confirm('确定要重新上架该商品吗？')) return
    try {
      await relistProduct(product.value.id)
      product.value.status = '在售'
      alert('商品已重新上架')
    } catch (err) {
      alert(err instanceof Error ? err.message : '重新上架失败')
    }
  }
}

const revokeReviewFn = async () => {
  if (!product.value) return
  if (!confirm('确定要撤销审核吗？商品将恢复为草稿状态。')) return
  try {
    await revokeReview(product.value.id)
    product.value.status = '草稿'
    alert('已撤销审核，商品恢复为草稿')
  } catch (err) {
    alert(err instanceof Error ? err.message : '撤销审核失败')
  }
}

const editProduct = () => {
  if (!product.value) return
  sessionStorage.setItem(EDIT_PRODUCT_CACHE_KEY, JSON.stringify(product.value))
  router.push({ path: '/edit', query: { id: product.value.id.toString() } })
}

const deleteProductHandler = async () => {
  if (!product.value) return
  if (confirm('确定要删除该商品吗？删除后不可恢复！')) {
    try {
      await deleteProduct(product.value.id)
      alert('商品已删除')
      router.push('/')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '删除商品失败')
    }
  }
}

const shareProduct = () => {
  alert('复制商品链接成功！')
}

const goToConsult = async () => {
  if (!userStore.isLoggedIn) {
    alert('请先登录后再咨询卖家')
    router.push('/user/login')
    return
  }
  if (!product.value) return

  // 只有「在售」的商品才允许发起咨询
  if (product.value.status !== '在售') {
    alert('商品当前未在售，暂时无法发起咨询')
    return
  }

  const p = product.value

  // 1. 强制刷新会话列表，拿到后端最新数据再检查是否已有同一卖家的会话
  try {
    await chatStore.refreshConversations()
  } catch { /* 刷新失败不阻塞 */ }

  // 2. 查找是否已有与该卖家的历史会话（同一卖家共用一个对话列表）
  const existingConv = chatStore.conversations.find(
    (conv) => conv.userId === p.sellerId
  )

  if (existingConv) {
    // 复用已有会话
    router.push({
      path: '/chat',
      query: { conversationId: String(existingConv.id), productId: String(p.id) }
    })
    return
  }

  // 3. 没有已有会话，创建新的
  try {
    const conv = await createConversation({
      conversationType: 'product_consult',
      productId: p.id,
      userId: p.sellerId,
    })
    // 立即加入本地 store，避免聊天页 syncActiveConversation 找不到而回退到第一条会话
    const idx = chatStore.conversations.findIndex((c: { id: number }) => c.id === conv.id)
    if (idx >= 0) {
      chatStore.conversations[idx] = conv
    } else {
      chatStore.conversations.unshift(conv)
    }
    router.push({ path: '/chat', query: { conversationId: String(conv.id), productId: String(p.id) } })
  } catch (err) {
    console.error('创建会话失败，使用兜底流程:', err)
    // 兜底：让聊天页自动补建会话（不再把 userId 当作 friendId 存入 localStorage）
    router.push({
      path: '/chat',
      query: {
        sellerId: String(p.sellerId),
        sellerName: p.sellerName || '',
        sellerAvatar: p.sellerAvatar || '',
        productId: String(p.id),
      },
    })
  }
}

const floatingTools = [
  { id: 1, icon: 'fa fa-plus', label: '发布商品' },
  { id: 2, icon: 'fa fa-list', label: '商品列表' },
  { id: 3, icon: 'fa fa-chart-bar', label: '数据统计' },
  { id: 4, icon: 'fa fa-headphones', label: '客服' }
]

const handleTool = (t: { id: number }) => {
  const actions: Record<number, string> = {
    1: '正在跳转到发布页面...',
    2: '正在跳转到商品列表...',
    3: '正在跳转到数据统计...',
    4: '正在为您连接客服...'
  }
  alert(actions[t.id])
}

onMounted(async () => {
  await loadDetails()
  void loadComments()
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

.logo i {
  font-size: 24px;
  color: #f97316;
}

.logo span {
  font-size: 20px;
  font-weight: bold;
  color: #f97316;
}

.sellerBadge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.searchBox {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
}

.searchRow {
  display: flex;
}

.searchRow input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1px solid #d1d5db;
  border-right: none;
  border-radius: 20px 0 0 20px;
  background: #f3f4f6;
  outline: none;
  font-size: 14px;
}

.searchRow input:focus {
  background: #fff;
  border-color: #3b82f6;
}

.searchRow button {
  width: 56px;
  height: 40px;
  border: none;
  border-radius: 0 20px 20px 0;
  background: #f97316;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.searchRow button:hover {
  background: #ea580c;
}

.navLinks {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
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

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 80px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb .muted {
  color: #9ca3af;
}

.breadcrumb a {
  color: #374151;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #f97316;
}

/* 加载 */
.loading, .error, .notFound {
  padding: 80px;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e5e7eb;
  border-top-color: #f97316;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error i, .notFoundIcon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.error p, .notFound p {
  color: #9ca3af;
  margin-bottom: 20px;
}

.notFoundIcon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

/* 详情主体 */
.detail {
  padding: 0 80px 80px;
}

/* 卖家卡片 */
.sellerCard {
  padding: 14px;
  margin-bottom: 14px;
}

.sellerMain {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.productStatus {
  display: flex;
  align-items: center;
  gap: 12px;
}

.statusTag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.statusTag.onSale {
  background: #f0fdf4;
  color: #16a34a;
}

.statusTag.offSale {
  background: #fef2f2;
  color: #dc2626;
}

.statusTag.pending {
  background: #fffbeb;
  color: #d97706;
}

.statusTag.rejected {
  background: #fef2f2;
  color: #dc2626;
}

.productTitle {
  font-size: 14px;
  color: #374151;
}

.quickStats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.quickStats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 商品详情网格 - 三列布局 */
.detailGrid {
  display: grid;
  grid-template-columns: 120px 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 60px 16px 32px;
  align-items: start;
  background: #fff;
  border-radius: 12px;
}

/* 左侧缩略图区域 */
.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 550px;
  padding: 2px 12px 2px 0;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.thumbnails::-webkit-scrollbar {
  width: 4px;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.thumb {
  width: 96px;
  height: 96px;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  padding: 0;
  background: none;
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
  margin: 2px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 150ms;
}

.thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #f97316;
}

.thumb:hover img {
  transform: scale(1);
}

.thumb.active {
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

/* 中间主图区域 */
.mainImage {
  position: relative;
  aspect-ratio: 1;
  background: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  max-height: 550px;
}

.mainImage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.navBtn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  color: #374151;
  transition: opacity 150ms;
}

.navBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.navBtn.prev { left: 12px; }
.navBtn.next { right: 12px; }

.imageCounter {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  border-radius: 999px;
}

/* 商品信息 */
.info {
  padding: 8px 0;
}

.priceSection {
  margin-bottom: 16px;
}

.priceRow {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price {
  font-size: 32px;
  font-weight: bold;
  color: #f97316;
}

.originalPrice {
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
}

.priceTags {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tagRed {
  background: #fef2f2;
  color: #dc2626;
}

.tagGreen {
  background: #f0fdf4;
  color: #16a34a;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px;
  color: #374151;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #9ca3af;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.conditionRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.label {
  font-size: 14px;
  color: #9ca3af;
}

.conditionTag {
  padding: 4px 10px;
  background: #f97316;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.conditionTag.new {
  background: #22c55e;
}

.modelValue {
  font-size: 14px;
  color: var(--text);
}

.stockValue {
  font-size: 14px;
  color: #16a34a;
}

.stockValue.lowStock {
  color: #dc2626;
}

.tagGray {
  background: #f1f5f9;
  color: #64748b;
}

.securityBox {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #eff6ff;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #16a34a;
}

.securityBox span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.descSection {
  margin-bottom: 16px;
}

.descSection h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px;
}

.desc {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-line;
  margin: 0;
}

.tagsSection {
  margin-bottom: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tagItem {
  padding: 4px 10px;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 12px;
  border-radius: 4px;
}

/* 操作按钮 */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actionRow {
  display: flex;
  gap: 10px;
}

.actionBtn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: all 150ms;
  color: #6b7280;
}

.actionBtn i {
  color: #6b7280;
}

.actionBtn:hover {
  background: #e5e7eb;
}

.actionBtn.secondary {
  background: #f5f5f5;
  color: #dc2626;
}

.actionBtn.secondary i {
  color: #dc2626;
}

.actionBtn.primary {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
  font-weight: 500;
}

.actionBtn.primary i {
  color: #fff;
}

.actionBtn.warning {
  background: #fff7ed;
  border-color: #fdba74;
  color: #c2410c;
}

.actionBtn.warning i {
  color: #c2410c;
}

.actionBtn.warning:hover {
  background: #ffedd5;
}

.actionBtn.primary:hover {
  background: #ea580c;
}

/* 商品评价 */
.reviewSection {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 80px;
  padding: 20px;
}

.reviewHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.reviewHeader h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviewHeader h3 i {
  color: #f97316;
}

.reviewCount {
  font-size: 13px;
  color: #9ca3af;
}

.reviewList {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.reviewItem {
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}

.reviewItem:last-child {
  border-bottom: none;
}

.reviewUser {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.reviewAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.reviewMeta {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
}

.reviewName {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.reviewTime {
  font-size: 12px;
  color: #9ca3af;
}

.reviewStars {
  font-size: 12px;
  color: #f59e0b;
  display: flex;
  gap: 2px;
}

.reviewContent {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin-top: 8px;
}

.sellerReplyBox {
  font-size: 13px;
  line-height: 1.6;
  color: #c2410c;
  background: #fff7ed;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}

.sellerReplyTag {
  font-weight: 600;
}

.emptyReview {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.emptyReview i {
  font-size: 48px;
  margin-bottom: 12px;
}

.loadMore {
  text-align: center;
  padding-top: 12px;
}

.loadMoreBtn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
}

.loadMoreBtn:hover {
  color: #f97316;
  background: #fff7ed;
}

/* 底部操作栏 */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 80px;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  z-index: 50;
}

.deleteBtn {
  min-width: 126px;
  height: 42px;
  padding: 0 18px;
  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  border: 1px solid #fecdd3;
  border-radius: 10px;
  color: #be123c;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 150ms ease;
}

.deleteBtn:hover {
  background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
  border-color: #fda4af;
  transform: translateY(-1px);
}

.bottomRight {
  display: flex;
  gap: 10px;
}

.shareBtn {
  padding: 10px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.shareBtn:hover {
  background: #e5e7eb;
}

.editBtn {
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #f97316;
  border-radius: 8px;
  color: #f97316;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.editBtn:hover {
  background: #fff7ed;
}

.toggleBtn {
  min-width: 106px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 150ms ease;
}

.toggleBtn.off {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.toggleBtn.off:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
}

.toggleBtn.on {
  background: #f0fdf4;
  color: #16a34a;
}

.toggleBtn.on:hover {
  background: #dcfce7;
}

.toggleBtn.revoke {
  background: #fffbeb;
  color: #d97706;
}

.toggleBtn.revoke:hover {
  background: #fef3c7;
}

/* 悬浮工具栏 */
.floatTools {
  position: fixed;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 30;
}

.floatBtn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #374151;
  position: relative;
  transition: transform 120ms ease, background 120ms ease;
}

.floatBtn:hover {
  transform: translateY(-2px);
  background: #f5f5f5;
}

.floatTip {
  position: absolute;
  right: calc(100% + 8px);
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms;
}

.floatBtn:hover .floatTip {
  opacity: 1;
}

/* 响应式 */
@media (max-width: 900px) {
  .detailGrid {
    grid-template-columns: 1fr;
  }
  .floatTools {
    display: none;
  }
}

@media (max-width: 600px) {
  .topInner {
    flex-wrap: wrap;
  }
  .searchBox {
    order: 3;
    flex: 1 1 100%;
    max-width: 100%;
    margin-top: 8px;
  }
}
</style>
