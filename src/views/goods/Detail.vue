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
            <i class="fa fa-fish"></i>
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
          <a href="#" @click.prevent="router.push('/forum')"><i class="fa fa-comments"></i> 社区</a>
          <a href="#" @click.prevent="router.push('/cart')"><i class="fa fa-shopping-cart"></i> 购物车</a>
          <a href="#" @click.prevent="router.push('/chat')"><i class="fa fa-bell"></i> 消息</a>
          <template v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="router.push('/user/center')"><i class="fa fa-user"></i> 我的</a>
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
      <span class="muted">{{ product?.category || '手机数码' }}</span>
      <i class="fa fa-angle-right"></i>
      <span>{{ product?.title || '商品详情' }}</span>
    </div>

    <!-- 加载中 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载商品详情中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="loadError" class="error">
      <i class="fa fa-exclamation-triangle"></i>
      <p>{{ loadError }}</p>
      <button class="btn btn-primary" @click="loadDetails">重试</button>
    </div>

    <!-- 商品详情 -->
    <main v-else-if="product" class="detail">
      <!-- 卖家信息 -->
      <div class="sellerCard card">
        <div class="sellerMain">
          <div class="sellerInfo">
            <img v-if="product.sellerAvatar" :src="getImageUrl(product.sellerAvatar)" :alt="product.sellerName" class="avatar clickableAvatar" @click="goToSellerProfile" />
            <div v-else class="avatar avatarDefault clickableAvatar" @click="goToSellerProfile">{{ product.sellerName?.charAt(0) }}</div>
            <div class="sellerText">
              <div class="sellerName">
                <strong class="profileClickable nameLink" @click="goToSellerProfile">{{ product.sellerName }}</strong>
                <span v-if="product.sellerVerified" class="verified">
                  <i class="fa fa-check-circle"></i> 已实名
                </span>
              </div>
              <div class="sellerMeta">
                <span v-if="product.sellerRating" class="rating">
                  <i class="fa fa-star"></i> {{ product.sellerRating }}
                </span>
                <span v-if="product.sellerGoodRate" class="goodRate">
                  好评率 {{ product.sellerGoodRate }}%
                </span>
                <span><i class="fa fa-map-marker"></i> {{ product.location }}</span>
              </div>
            </div>
          </div>
          <button class="viewProfileBtn" @click="goToSellerProfile">
            <i class="fa fa-user"></i> 查看主页
          </button>
        </div>
        <div class="sellerStats">
          <div>在售 <strong>{{ product.sellerOnSale || 0 }}</strong></div>
          <div>已售 <strong>{{ product.sellerSold || 0 }}</strong></div>
          <div v-if="product.sellerDeliverySpeed">
            发货速度 <strong>{{ product.sellerDeliverySpeed }}</strong>
          </div>
          <div v-if="product.sellerServiceAttitude">
            服务态度 <strong>{{ product.sellerServiceAttitude }}</strong>
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
            <img :src="getImageUrl(img.url) || PLACEHOLDER_IMG" :alt="img.alt" @error="(e: Event) => { const el = e.target as HTMLImageElement; if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.src = PLACEHOLDER_IMG } }" />
          </button>
        </div>

        <!-- 中间：主图 -->
        <div class="mainImage">
          <img :src="getImageUrl(currentImage.url) || PLACEHOLDER_IMG" :alt="currentImage.alt" @error="(e: Event) => { const el = e.target as HTMLImageElement; if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.src = PLACEHOLDER_IMG } }" />
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
              <span v-if="product.freight === 0" class="tag tagGreen">包邮</span>
              <span class="muted">快递: ¥{{ product.freight || 0 }}</span>
            </div>
          </div>

          <!-- 标题 -->
          <h1 class="title">{{ product.title }}</h1>

          <!-- 数据统计 -->
          <div class="stats">
            <span><i class="fa fa-eye"></i> {{ productStats.viewCount || 0 }}人看过</span>
            <span><i class="fa fa-heart"></i> {{ productStats.favoriteCount || 0 }}人收藏</span>
            <span><i class="fa fa-clock-o"></i> {{ getPublishTime(product.id) }}</span>
          </div>

          <!-- 成色 -->
          <div class="conditionRow">
            <span class="label">成色</span>
            <span class="conditionTag">{{ product.condition }}</span>
            <span v-if="product.isNew" class="conditionTag new">全新</span>
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

          <!-- 操作按钮 -->
          <div class="actions">
            <div class="actionRow">
              <button class="actionBtn" :class="{ active: isFavorited }" @click="toggleFavorite">
                <i :class="isFavorited ? 'fas fa-star' : 'far fa-star'"></i>
                {{ isFavorited ? '已收藏' : '收藏' }}
              </button>
              <button class="actionBtn">
                <i class="fa fa-share-alt"></i> 分享
              </button>
            </div>
            <div class="actionRow">
              <button class="actionBtn secondary" @click="goToChat">
                <i class="fa fa-comment"></i> 聊一聊
              </button>
              <button class="actionBtn primary" @click="goToCheckout">
                立即购买
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品评论区 -->
      <section class="commentSection">
        <div class="commentHeader">
          <h3><i class="fa fa-comments"></i> 商品评论</h3>
          <span class="commentCount">{{ comments.length }} 条评论</span>
        </div>

        <!-- 评论输入框 -->
        <div class="commentInput">
          <img v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" class="commentAvatar" />
          <div v-else class="commentAvatar avatarDefault">{{ userStore.userInfo?.username?.charAt(0) || '游' }}</div>
          <div class="inputWrapper">
            <textarea
              v-model="newComment"
              placeholder="发表你的看法..."
              rows="3"
              @focus="handleCommentFocus"
            ></textarea>
            <div class="inputActions" v-if="showCommentInput">
              <button class="cancelBtn" @click="cancelComment">取消</button>
              <button class="submitBtn" @click="submitComment" :disabled="!newComment.trim()">发表评论</button>
            </div>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="commentList" v-if="comments.length > 0">
          <div v-for="comment in displayedComments" :key="comment.id" class="commentItem">
            <div class="commentUser">
              <img v-if="comment.avatar" :src="comment.avatar" class="commentAvatar profileClickable" @click.stop="goToUserProfile(comment)" />
              <div v-else class="commentAvatar avatarDefault profileClickable" @click.stop="goToUserProfile(comment)">{{ comment.name?.charAt(0) }}</div>
              <div class="commentMeta">
                <span class="commentName profileClickable nameLink" @click.stop="goToUserProfile(comment)">{{ comment.name }}</span>
                <span class="commentTime">{{ comment.time }}</span>
                <button class="subReplyBtn" @click="toggleReplyInput(comment.id, null)">
                  <i class="fa fa-commenting"></i> 回复
                </button>
              </div>
            </div>
            <div class="commentContent">{{ comment.content }}</div>

            <!-- 回复列表 -->
            <div class="replyList" v-if="comment.replies && comment.replies.length > 0">
              <div v-for="reply in getDisplayReplies(comment)" :key="reply.id" class="replyItem">
                <div class="replyUser">
                  <img v-if="reply.avatar" :src="reply.avatar" class="replyAvatar profileClickable" @click.stop="goToUserProfile(reply)" />
                  <div v-else class="replyAvatar avatarDefaultSm profileClickable" @click.stop="goToUserProfile(reply)">{{ reply.name?.charAt(0) }}</div>
                  <div class="replyMeta">
                    <span class="replyName profileClickable nameLink" @click.stop="goToUserProfile(reply)">{{ reply.name }}</span>
                    <span class="replyTime">{{ reply.time }}</span>
                    <button class="subReplyBtn" @click="openSubReply(comment.id, reply)">
                      <i class="fa fa-commenting"></i> 回复
                    </button>
                  </div>
                </div>
                <div class="replyContent">{{ reply.content }}</div>
              </div>

              <!-- 查看更多子回复 -->
              <button v-if="comment.replies.length > 3" class="toggleSubRepliesBtn" @click="comment.showAllReplies = !comment.showAllReplies">
                <i :class="comment.showAllReplies ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
                {{ comment.showAllReplies ? '收起回复' : `查看全部 ${comment.replies.length} 条回复` }}
              </button>
            </div>

            <!-- 回复输入框 -->
            <div v-if="activeReplyId === comment.id" class="replyInput">
              <textarea
                v-model="replyContent"
                :placeholder="replyToUser ? `回复 @${replyToUser}...` : `回复 @${comment.name}...`"
                rows="2"
              ></textarea>
              <div class="inputActions">
                <button class="cancelBtn" @click="cancelReply">取消</button>
                <button class="submitBtn" @click="submitReply(comment.id)" :disabled="!replyContent.trim()">回复</button>
              </div>
            </div>
          </div>

          <!-- 查看更多按钮 -->
          <div v-if="comments.length > 3" class="loadMore">
            <button class="loadMoreBtn" @click="showAllComments = !showAllComments">
              <i :class="showAllComments ? 'fa fa-chevron-up' : 'fa fa-chevron-down'"></i>
              {{ showAllComments ? '收起评论' : `查看全部 ${comments.length} 条评论` }}
            </button>
          </div>
        </div>

        <!-- 无评论状态 -->
        <div v-else class="noComments">
          <i class="fa fa-comments-o"></i>
          <p>暂无评论，来发表第一条评论吧</p>
        </div>
      </section>

      <!-- 猜你喜欢 -->
      <section class="recommendations">
        <div class="recHeader">
          <div>
            <h2>猜你喜欢</h2>
            <p>根据您的浏览记录推荐</p>
          </div>
          <button @click="loadRecs"><i class="fa fa-refresh"></i> 换一批</button>
        </div>
        <div class="recGrid">
          <div
            v-for="r in recommendations"
            :key="r.id"
            class="recCard card"
            @click="goToDetail(r.id)"
          >
            <div class="recImg">
              <img :src="getImageUrl(r.image) || PLACEHOLDER_IMG" :alt="r.title" @error="(e: Event) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG" />
              <span class="recCondition">{{ r.condition }}</span>
            </div>
            <div class="recInfo">
              <h4>{{ r.title }}</h4>
              <span class="recPrice">¥{{ r.price }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 商品不存在 -->
    <div v-else class="notFound">
      <div class="notFoundIcon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <h3>商品不存在或已下架</h3>
      <p>该商品可能已被卖家删除或下架</p>
      <RouterLink class="btn btn-primary" to="/">返回首页</RouterLink>
    </div>

    <!-- 悬浮工具栏 -->
    <!-- <div class="floatTools">
      <button v-for="t in floatingTools" :key="t.id" class="floatBtn" @click="handleTool(t)">
        <i :class="t.icon"></i>
        <span class="floatTip">{{ t.label }}</span>
      </button>
    </div>-->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import type { Product, ProductImage } from '@/types'
import { getProductDetail, incrementProductView, getProductStats, getProductStatus, getProductPage } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'

defineOptions({ name: 'ProductDetail' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const ensureLoggedIn = (actionHint: string) => {
  if (userStore.isLoggedIn) return true
  alert(`请先登录后再${actionHint}`)
  router.push('/user/login')
  return false
}

/**
 * 将后端返回的各种图片格式统一归一化为 ProductImage[] { id, url, alt }
 * 兼容格式：
 *   - string[]          → ["/a.jpg", "/b.jpg"]
 *   - { url }[]         → [{ url: "/a.jpg" }, ...]
 *   - { imageUrl }[]    → [{ imageUrl: "/a.jpg" }, ...]
 *   - { image }[]       → [{ image: "/a.jpg" }, ...]
 *   - { path }[]        → [{ path: "/a.jpg" }, ...]
 *   - ProductImage[]    → [{ id, url, alt }, ...]（标准格式）
 */
function normalizeImages(raw: unknown, title: string): ProductImage[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw.map((item, index): ProductImage => {
    if (typeof item === 'string') {
      return { id: index + 1, url: item, alt: title }
    }
    const obj = item as Record<string, unknown>
    const url = (obj.url || obj.imageUrl || obj.image || obj.path || '') as string
    return {
      id: (obj.id as number) || index + 1,
      url,
      alt: (obj.alt as string) || title,
    }
  }).filter(img => !!img.url)
}

const searchInput = ref('')
const product = ref<Product | null>(null)
const currentIndex = ref(0)
const images = ref<ProductImage[]>([])
const recommendations = ref<Product[]>([])
const productStats = ref({ viewCount: 0, favoriteCount: 0, orderCount: 0 })
const productStatus = ref('')
const isLoading = ref(true)
const loadError = ref('')
const favoritePending = ref(false)
const isFavorited = computed(() => {
  if (!product.value?.id) return false
  return userStore.isFavorited(product.value.id)
})

// 评论相关
const comments = ref<Comment[]>([])
const newComment = ref('')
const replyContent = ref('')
const activeReplyId = ref<number | null>(null)
const showCommentInput = ref(false)
const showAllComments = ref(false)
const replyToUser = ref<string | null>(null)

interface Comment {
  id: number
  userId?: number
  name: string
  avatar?: string
  time: string
  content: string
  replies?: Reply[]
  showAllReplies?: boolean
}

interface Reply {
  id: number
  userId?: number
  name: string
  avatar?: string
  time: string
  content: string
}

const handleCommentFocus = () => {
  if (!userStore.isLoggedIn) {
    alert('请先登录后再评论')
    router.push('/user/login')
    return
  }
  showCommentInput.value = true
}

const cancelComment = () => {
  newComment.value = ''
  showCommentInput.value = false
}

const submitComment = () => {
  if (!newComment.value.trim()) return

  const comment: Comment = {
    id: Date.now(),
    name: userStore.userInfo?.username || '匿名用户',
    avatar: userStore.userInfo?.avatar ?? undefined,
    time: '刚刚',
    content: newComment.value.trim(),
    replies: []
  }

  comments.value.unshift(comment)
  cancelComment()
}

const submitReply = (commentId: number) => {
  if (!replyContent.value.trim()) return

  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    if (!comment.replies) comment.replies = []

    const reply: Reply = {
      id: Date.now(),
      name: userStore.userInfo?.username || '匿名用户',
      avatar: userStore.userInfo?.avatar ?? undefined,
      time: '刚刚',
      content: replyContent.value.trim()
    }

    comment.replies.push(reply)
  }

  cancelReply()
}

// 模拟加载评论数据
const loadComments = () => {
  comments.value = [
    {
      id: 1,
      userId: 2001,
      name: '买家小明',
      avatar: 'https://picsum.photos/id/100/50/50',
      time: '2小时前',
      content: '东西看起来不错，成色怎么样？',
      replies: [
        {
          id: 101,
          userId: product.value?.sellerId ?? 101,
          name: '卖家小李',
          avatar: 'https://picsum.photos/id/101/50/50',
          time: '1小时前',
          content: '95新，无划痕无磕碰，电池健康度95%'
        }
      ]
    },
    {
      id: 2,
      userId: 2002,
      name: '买家小红',
      avatar: 'https://picsum.photos/id/102/50/50',
      time: '3小时前',
      content: '可以便宜点吗？诚心想要',
      replies: []
    },
    {
      id: 3,
      userId: 2003,
      name: '买家小王',
      avatar: 'https://picsum.photos/id/103/50/50',
      time: '1天前',
      content: '请问支持当面交易吗？',
      replies: [
        {
          id: 301,
          userId: product.value?.sellerId ?? 101,
          name: '卖家小李',
          avatar: 'https://picsum.photos/id/101/50/50',
          time: '23小时前',
          content: '可以的，周末在大学城附近'
        },
        {
          id: 302,
          userId: 2003,
          name: '买家小王',
          avatar: 'https://picsum.photos/id/103/50/50',
          time: '22小时前',
          content: '好的，周六下午方便吗？'
        }
      ]
    },
    {
      id: 4,
      userId: 2004,
      name: '买家小赵',
      avatar: 'https://picsum.photos/id/104/50/50',
      time: '1天前',
      content: '这个还在吗？',
      replies: [
        {
          id: 401,
          userId: product.value?.sellerId ?? 101,
          name: '卖家小李',
          avatar: 'https://picsum.photos/id/101/50/50',
          time: '20小时前',
          content: '在的，欢迎来问'
        }
      ]
    },
    {
      id: 5,
      userId: 2005,
      name: '买家小钱',
      avatar: 'https://picsum.photos/id/105/50/50',
      time: '2天前',
      content: '包装盒还在吗？',
      replies: []
    },
    {
      id: 6,
      userId: 2006,
      name: '买家小孙',
      avatar: 'https://picsum.photos/id/106/50/50',
      time: '2天前',
      content: '有发票吗？',
      replies: [
        {
          id: 601,
          userId: product.value?.sellerId ?? 101,
          name: '卖家小李',
          avatar: 'https://picsum.photos/id/101/50/50',
          time: '2天前',
          content: '有的，当时购买的小票还在'
        },
        {
          id: 602,
          userId: 2006,
          name: '买家小孙',
          avatar: 'https://picsum.photos/id/106/50/50',
          time: '2天前',
          content: '那就好，诚心要'
        }
      ]
    },
    {
      id: 7,
      userId: 2007,
      name: '买家小周',
      avatar: 'https://picsum.photos/id/107/50/50',
      time: '3天前',
      content: '走咸鱼交易可以吗？',
      replies: []
    }
  ]
}

// 计算属性：显示的评论
const displayedComments = computed(() => {
  if (showAllComments.value || comments.value.length <= 3) {
    return comments.value
  }
  return comments.value.slice(0, 3)
})

// 获取显示的回复列表
const getDisplayReplies = (comment: Comment) => {
  if (!comment.replies) return []
  if (comment.replies.length <= 3 || comment.showAllReplies) {
    return comment.replies
  }
  return comment.replies.slice(0, 3)
}

// 打开子回复输入框
const openSubReply = (commentId: number, reply: Reply) => {
  activeReplyId.value = commentId
  replyToUser.value = reply.name
  replyContent.value = ''
}

// 切换回复输入框
const toggleReplyInput = (commentId: number, reply: Reply | null) => {
  if (reply) {
    openSubReply(commentId, reply)
  } else {
    activeReplyId.value = activeReplyId.value === commentId ? null : commentId
    replyToUser.value = null
    replyContent.value = ''
  }
}

const cancelReply = () => {
  replyContent.value = ''
  activeReplyId.value = null
  replyToUser.value = null
}

const buildProfileIdByName = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return 10000 + (hash % 90000)
}

const goToUserProfile = (user: { userId?: number; name: string; avatar?: string }) => {
  const profileId = user.userId ?? buildProfileIdByName(user.name)
  router.push({
    path: `/user/home/${profileId}`,
    query: {
      name: user.name,
      avatar: user.avatar || '',
      location: product.value?.location || '未知',
      fromProductId: String(product.value?.id || ''),
    },
  })
}

const toggleFavorite = async () => {
  if (!product.value) return
  if (!ensureLoggedIn('收藏商品')) return
  if (favoritePending.value) return
  favoritePending.value = true
  try {
    await userStore.toggleFavorite({
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      image: product.value.image,
      condition: product.value.condition,
      location: product.value.location,
      addTime: new Date().toLocaleString()
    })
  } catch (error) {
    alert(error instanceof Error ? error.message : '收藏操作失败')
  } finally {
    favoritePending.value = false
  }
}

const goToCheckout = () => {
  if (!ensureLoggedIn('购买商品')) return
  const productId = resolveRouteProductId()
  if (!productId) {
    alert('商品信息异常，请返回后重试')
    return
  }
  router.push({ path: '/checkout', query: { productId: String(productId) } })
}
const goToChat = () => {
  if (!ensureLoggedIn('和卖家聊天')) return
  router.push('/chat')
}

const goToSellerProfile = () => {
  if (!product.value?.sellerId) return
  router.push({
    path: `/user/home/${product.value.sellerId}`,
    query: {
      fromProductId: String(product.value.id),
      name: product.value.sellerName || '',
      avatar: product.value.sellerAvatar || '',
      location: product.value.location || '未知',
    },
  })
}

const handleLogin = () => {
  router.push('/user/login')
}

const currentImage = computed(() => images.value[currentIndex.value] ?? { url: '', alt: '' })

const getPublishTime = (_id: number) => {
  // 优先使用接口返回的真实发布时间
  if (product.value?.publishedAt) {
    const published = new Date(product.value.publishedAt).getTime()
    if (!Number.isNaN(published)) {
      const now = Date.now()
      const diffMs = now - published
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return '刚刚发布'
      const diffHour = Math.floor(diffMin / 60)
      if (diffHour < 1) return `${diffMin}分钟前发布`
      const diffDay = Math.floor(diffHour / 24)
      if (diffDay < 1) return `${diffHour}小时前发布`
      if (diffDay <= 3) return `${diffDay}天内发布`
      if (diffDay <= 7) return '1周内发布'
      return '1周前发布'
    }
  }
  // 回退：根据 ID 模拟（兼容旧数据）
  if (_id >= 21 && _id <= 24) return '今天发布'
  if (_id >= 18 && _id <= 20) return '3天内发布'
  if (_id >= 12 && _id <= 17) return '1周内发布'
  return '1周前发布'
}

const normalizeRouteId = (value: unknown): number | null => {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (Array.isArray(value) && value.length > 0) {
    return normalizeRouteId(value[0])
  }
  return null
}

const resolveRouteProductId = (): number | null => {
  const queryId = normalizeRouteId(route.query.id)
  if (queryId) return queryId
  const paramId = normalizeRouteId(route.params.id)
  if (paramId) return paramId
  return null
}

const loadDetails = async () => {
  const id = resolveRouteProductId()
  console.log('=== 商品详情请求 ===')
  console.log('商品ID:', id)
  if (!id) {
    loadError.value = '无效的商品ID'
    isLoading.value = false
    return
  }
  try {
    // 先查询商品状态
    try {
      const status = await getProductStatus(id)
      productStatus.value = status
      console.log('商品状态:', status)
      // 可展示状态：on_sale(在售), published(已发布)
      if (status === 'on_sale' || status === 'published') {
        // 正常状态，继续加载
      } else if (status === 'offline' || status === 'off_shelf') {
        loadError.value = '该商品已下架'
        isLoading.value = false
        return
      } else {
        loadError.value = `该商品状态为：${status}，暂不可见`
        isLoading.value = false
        return
      }
    } catch (err) {
      console.error('查询商品状态失败:', err)
    }

    const data = await getProductDetail(id)
    console.log('接口返回数据:', data)
    // API 字段映射：后端字段 → 前端 Product 接口
    product.value = {
      ...data,
      // 售价：API 返回 sellingPrice(number) → 前端 price(string)
      price: String(data.sellingPrice ?? data.price ?? 0),
      // 原价：确保是字符串
      originalPrice: data.originalPrice ? String(data.originalPrice) : '',
      // 图片兜底
      image: data.image || (Array.isArray(data.images) && data.images.length > 0
        ? (typeof data.images[0] === 'string' ? data.images[0] : (data.images[0]?.url || ''))
        : ''),
    }
    // 增加浏览量（不阻塞主流程）
    incrementProductView(id).catch(err => console.error('增加浏览量失败:', err))
    // 获取商品统计（浏览量、收藏量等）
    try {
      const stats = await getProductStats(id)
      productStats.value = stats
    } catch (err) {
      console.error('获取商品统计失败:', err)
    }
    // 图片归一化：兼容后端各种返回格式（string[] / {url}[] / {imageUrl}[] 等）
    const normalized = normalizeImages(data.images, data.title || '')
    if (normalized.length > 0) {
      images.value = normalized
    } else if (data.image) {
      images.value = [
        { id: 1, url: data.image, alt: data.title || '' },
        { id: 2, url: PLACEHOLDER_IMG, alt: (data.title || '') + ' 细节图' },
        { id: 3, url: PLACEHOLDER_IMG, alt: (data.title || '') + ' 包装图' },
      ]
    } else {
      // 无任何图片数据时使用占位图
      images.value = [{ id: 1, url: PLACEHOLDER_IMG, alt: '' }]
    }
    currentIndex.value = 0
    isLoading.value = false
  } catch (err) {
    console.error('获取商品详情失败:', err)
    const msg = err instanceof Error ? err.message : '加载失败'
    loadError.value = msg.includes('商品不存在') ? '该商品不存在或已下架' : msg
    isLoading.value = false
  }
}

const loadRecs = async () => {
  try {
    // 使用同分类或随机推荐，排除当前商品
    const params: { current: number; size: number; categoryId?: number } = {
      current: 1,
      size: 6,
    }
    if (product.value?.category) {
      // 尝试通过分类名匹配，如果后端支持 categoryId 则传入
      // 这里暂时用 keyword 做模糊推荐，或直接取最新上架
    }
    const res = await getProductPage(params)
    // 过滤掉当前商品
    recommendations.value = res.records.filter(r => r.id !== product.value?.id).slice(0, 6)
  } catch (err) {
    console.error('获取推荐商品失败:', err)
    recommendations.value = []
  }
}

const prevImage = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextImage = () => { if (currentIndex.value < images.value.length - 1) currentIndex.value++ }

const performSearch = () => {
  if (searchInput.value.trim()) router.push({ path: '/search', query: { q: searchInput.value.trim() } })
}



const goToDetail = (id: number) => router.push({ path: '/detail', query: { id: id.toString() } })
const goBack = () => window.history.length > 1 ? router.back() : router.push('/')

watch(() => [route.query.id, route.params.id], () => {
  if (resolveRouteProductId()) {
    isLoading.value = true
    loadDetails()
    loadRecs()
  }
}, { immediate: true })

onMounted(() => {
  loadComments()
  if (userStore.isLoggedIn) {
    void userStore.loadFavoriteIds()
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
}

.left {
  display: flex;
  align-items: center;
  gap: 4px;
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
  border: 3px solid var(--border);
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
  color: var(--muted);
  margin-bottom: 16px;
}

.error p, .notFound p {
  color: var(--muted);
  margin-bottom: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: none;
  text-decoration: none;
  cursor: pointer;
}

.btn.btn-primary {
  background: #f97316;
  color: #fff;
}

.btn.btn-primary:hover {
  background: #ea580c;
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
  padding: 0 80px;
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

.sellerInfo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(249, 115, 22, 0.2);
}

.clickableAvatar {
  cursor: pointer;
}

.avatarDefault {
  background: #f97316;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.sellerName {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sellerName strong {
  font-size: 16px;
}

.verified {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #22c55e;
}

.sellerMeta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--muted);
}

.rating {
  color: #f97316;
}

.viewProfileBtn {
  padding: 6px 14px;
  border: 1px solid #f97316;
  border-radius: 999px;
  background: transparent;
  color: #f97316;
  font-size: 12px;
  cursor: pointer;
  transition: background 150ms;
}

.viewProfileBtn:hover {
  background: rgba(249, 115, 22, 0.08);
}

.sellerStats {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--muted);
}

.sellerStats strong {
  color: var(--text);
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
  color: var(--text);
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
  color: var(--muted);
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
  color: var(--text);
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--muted);
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
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
  color: var(--muted);
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
  color: var(--text);
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
  color: var(--muted);
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
  border: 1px solid var(--border);
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

.actionBtn.active {
  border-color: #eab308;
  background: #fefce8;
  color: #ca8a04;
}

.actionBtn.active i {
  color: #eab308;
}

.actionBtn.secondary {
  background: #f5f5f5;
}

.actionBtn.primary {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
  font-weight: 500;
}

.actionBtn.primary:hover {
  background: #ea580c;
}

/* 商品评论区 */
.commentSection {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.commentHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.commentHeader h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
}

.commentHeader h3 i {
  color: #f97316;
}

.commentCount {
  font-size: 13px;
  color: var(--muted);
}

/* 评论输入框 */
.commentInput {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.commentAvatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatarDefault {
  background: #f97316;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.inputWrapper {
  flex: 1;
}

.inputWrapper textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition: border-color 200ms;
}

.inputWrapper textarea:focus {
  border-color: #f97316;
}

.inputActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.cancelBtn {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
}

.cancelBtn:hover {
  background: #f5f5f5;
}

.submitBtn {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: #f97316;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.submitBtn:hover {
  background: #ea580c;
}

.submitBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 评论列表 */
.commentList {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.commentItem {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.commentUser {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.commentMeta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.commentName {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.commentTime {
  font-size: 12px;
  color: var(--muted);
}

.commentMeta .subReplyBtn {
  margin-left: auto;
}

.commentContent {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text);
  margin-bottom: 10px;
}

/* 回复列表 */
.replyList {
  margin-left: 50px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 10px;
  border-left: 3px solid #f97316;
}

.replyItem {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.replyItem:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.replyItem:first-child {
  padding-top: 0;
}

.replyUser {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.replyAvatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.avatarDefaultSm {
  background: #6b7280;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.profileClickable {
  cursor: pointer;
}

.nameLink:hover {
  color: #ea580c;
}

.replyMeta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.replyName {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.replyTime {
  font-size: 11px;
  color: var(--muted);
}

.replyContent {
  margin-left: 36px;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
}

/* 回复按钮 */
.replyBtn {
  margin-left: 50px;
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 150ms;
}

.replyBtn:hover {
  color: #f97316;
}

.subReplyBtn {
  margin-left: auto;
  padding: 2px 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  transition: color 150ms;
}

.subReplyBtn:hover {
  color: #f97316;
}

.toggleSubRepliesBtn {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.toggleSubRepliesBtn:hover {
  color: #f97316;
}

/* 回复输入框 */
.replyInput {
  margin-left: 50px;
  margin-top: 10px;
}

.replyInput textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  resize: none;
  font-size: 13px;
  outline: none;
}

.replyInput textarea:focus {
  border-color: #f97316;
}

/* 无评论状态 */
.noComments {
  text-align: center;
  padding: 30px;
  color: var(--muted);
}

.noComments i {
  font-size: 48px;
  margin-bottom: 12px;
}

.noComments p {
  font-size: 14px;
  margin: 0;
}

/* 查看更多 */
.loadMore {
  text-align: center;
  padding: 16px;
}

.loadMoreBtn {
  padding: 10px 24px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 200ms;
}

.loadMoreBtn:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7f0;
}

/* 猜你喜欢 */
.recommendations {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
}

.recHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.recHeader h2 {
  font-size: 18px;
  margin: 0 0 4px;
}

.recHeader p {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
}

.recHeader button {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #f97316;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
  gap: 14px;
}

.recCard {
  overflow: hidden;
  cursor: pointer;
  transition: transform 200ms, box-shadow 200ms;
}

.recCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.recImg {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.recImg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recCondition {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 9px;
  border-radius: 4px;
  color: var(--text);
}

.recInfo {
  padding: 8px;
}

.recInfo h4 {
  font-size: 11px;
  font-weight: 500;
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.recPrice {
  font-size: 13px;
  font-weight: bold;
  color: #f97316;
}



/* 响应式 */
@media (max-width: 900px) {
  .detailGrid {
    grid-template-columns: 1fr;
  }
  .gallery {
    position: static;
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
  .recGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
