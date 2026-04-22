<template>
  <div class="layout" v-if="post">
    <section class="left">
      <div class="card main">
        <div class="head-top">
          <RouterLink class="back-icon" to="/forum" aria-label="返回帖子首页">
            <span>←</span>
          </RouterLink>
        </div>
        <div class="head">
          <div class="title">{{ post.title }}</div>
          <div class="meta">
            <div class="author">
              <button class="uLink avatarBtn" type="button" @click="goAuthorHome(post.author)">
                <Avatar :src="post.author.avatarUrl" :alt="post.author.name" :size="26" />
              </button>
              <div class="a">
                <button class="uLink nameBtn n" type="button" @click="goAuthorHome(post.author)">
                  {{ authorDisplayName(post.author) }}
                </button>
                <div class="t">{{ timeText }} · {{ viewText }} 浏览</div>
              </div>
            </div>
            <div class="ops">
              <button class="icon-like" :class="{ liked: postLiked }" type="button" aria-label="点赞" @click="like">
                <span class="heart">♥</span>
                <span class="count">{{ likeText }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="relatedProduct" class="productLink">
          <RouterLink class="pinner" :to="{ path: '/detail', query: { id: String(relatedProduct.id) } }">
            <img class="pcover" :src="relatedProduct.coverUrl" :alt="relatedProduct.name" />
            <div class="pbody">
              <div class="pname">{{ relatedProduct.name }}</div>
              <div class="pdesc">{{ relatedProduct.priceText }}</div>
            </div>
            <div class="goto">查看详情 →</div>
          </RouterLink>
        </div>

        <div class="media">
          <MediaViewer :media="post.media" />
        </div>

        <div class="content">
          <div class="tags">
            <TagPill v-for="t in post.tags" :key="t" :label="t" />
          </div>
          <div class="text" v-text="post.content" />
        </div>
      </div>

      <div class="card comments">
        <div class="ch">
          <div class="ct">全部评论 ({{ post.commentCount }})</div>
        </div>

        <form class="composer" @submit.prevent="submitComment">
          <Avatar :src="meAvatar" alt="me" :size="28" />
          <input v-model.trim="commentText" class="input grow" :placeholder="inputPlaceholder" />
          <button class="btn btn-primary" type="submit">发送</button>
        </form>

        <div class="clist">
          <div v-for="c in rootComments" :key="c.id" class="citem">
            <button class="uLink avatarBtn" type="button" @click="goAuthorHome(c.author)">
              <Avatar :src="c.author.avatarUrl" :alt="c.author.name" :size="28" />
            </button>
            <div class="cbody">
              <div class="crow">
                <button class="uLink nameBtn cn" type="button" @click="goAuthorHome(c.author)">
                  {{ authorDisplayName(c.author) }}
                </button>
                <div class="ctm">{{ formatDateShort(c.createdAt) }}</div>
              </div>
              <div class="cc">{{ c.content }}</div>
              <div class="cops">
                <button class="action" :class="{ liked: store.isCommentLiked(c.id) }" type="button" @click="likeComment(c.id)">
                  ♥ {{ formatCompactNumber(c.likeCount) }}
                </button>
                <button class="action" type="button" @click="startReply(c)">回复</button>
                <button
                  v-if="isMine(c)"
                  class="action small"
                  type="button"
                  @click="openEdit(c)"
                >
                  编辑
                </button>
                <button
                  v-if="isMine(c)"
                  class="action small"
                  type="button"
                  @click="deleteMineComment(c.id)"
                >
                  删除
                </button>
              </div>
              <div v-if="repliesByParent.get(c.id)?.length" class="replies">
                <div v-for="r in repliesByParent.get(c.id)" :key="r.id" class="reply">
                  <button class="uLink nameBtn reply-author" type="button" @click="goAuthorHome(r.author)">
                    {{ authorDisplayName(r.author) }}
                  </button>
                  <span v-if="r.replyToAuthorName" class="reply-to">@{{ r.replyToAuthorName }}</span>
                  <span class="reply-content">{{ r.content }}</span>
                  <button class="action small" :class="{ liked: store.isCommentLiked(r.id) }" type="button" @click="likeComment(r.id)">
                    ♥ {{ formatCompactNumber(r.likeCount) }}
                  </button>
                  <button class="action small" type="button" @click="startReply(r)">回复</button>
                  <button
                    v-if="isMine(r)"
                    class="action small"
                    type="button"
                    @click="openEdit(r)"
                  >
                    编辑
                  </button>
                  <button
                    v-if="isMine(r)"
                    class="action small"
                    type="button"
                    @click="deleteMineComment(r.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <aside class="right">
      <div class="card side">
        <div class="st">相关推荐</div>
        <div class="slist">
          <RouterLink v-for="p in related" :key="p.id" class="sitem" :to="`/forum/post/${p.id}`">
            <img class="simg" :src="p.coverUrl ?? p.media[0]?.posterUrl ?? p.media[0]?.url ?? p.author.avatarUrl" :alt="p.title" />
            <div class="sm">
              <div class="sn">{{ p.title }}</div>
              <div class="ss">♥ {{ formatCompactNumber(p.likeCount) }} · {{ formatCompactNumber(p.viewCount) }} 浏览</div>
            </div>
          </RouterLink>
        </div>
      </div>
    </aside>
  </div>

  <div v-else class="empty card">
    <div class="t">帖子不存在或已删除</div>
    <div class="s">先回到帖子首页看看。</div>
    <div class="actions">
      <RouterLink class="btn btn-primary" to="/forum">返回社区</RouterLink>
      <RouterLink class="btn" to="/forum/new">去发帖</RouterLink>
    </div>
  </div>

  <div v-if="editModalOpen" class="modalOverlay" @click.self="cancelEdit">
    <div class="modal card">
      <div class="mtitle">编辑评论</div>
      <textarea v-model.trim="editText" class="textarea" placeholder="请输入新的评论内容" />
      <div class="mbar">
        <button class="btn" type="button" @click="cancelEdit">取消</button>
        <button class="btn btn-primary" type="button" @click="saveEdit">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Avatar from '../../components/forum/Avatar.vue'
import MediaViewer from '../../components/forum/MediaViewer.vue'
import TagPill from '../../components/forum/TagPill.vue'
import { formatCompactNumber, formatDateShort } from '../../mocks/forum'
import { useForumStore } from '../../stores/forum'
import { useProductStore } from '@/stores/productStore'
import type { ForumComment } from '../../types/forum'
import { mockGoods } from '../../mocks/goods'

const props = defineProps<{ id?: string }>()
const route = useRoute()
const router = useRouter()
const store = useForumStore()
const productStore = useProductStore()

const postId = computed(() => (props.id as string) ?? (route.params.id as string) ?? '')
const post = computed(() => store.postById(postId.value))
const relatedProduct = computed(() => {
  if (!post.value?.productId) return null
  const pid = String(post.value.productId)
  const pidNum = Number(pid)

  // 优先使用商品模块数据（订单/购物车关联来的就是这里的商品 ID）
  if (!Number.isNaN(pidNum)) {
    const p = productStore.getProductById(pidNum)
    if (p) {
      return {
        id: pidNum,
        name: p.title,
        coverUrl: p.image,
        priceText: `¥${p.price}`,
      }
    }
  }

  // 兼容旧 mock 商品（g1/g2/g3）
  return mockGoods.find((g) => g.id === pid) ?? null
})

const commentText = ref('')
const comments = computed(() => store.commentsByPost(postId.value))
const related = computed(() => store.relatedPosts(postId.value, 7))
const replyTarget = ref<ForumComment | null>(null)
const rootComments = computed(() => comments.value.filter((c) => !c.parentCommentId))
const repliesByParent = computed(() => {
  const m = new Map<string, ForumComment[]>()
  for (const c of comments.value) {
    if (!c.parentCommentId) continue
    const list = m.get(c.parentCommentId) ?? []
    list.push(c)
    m.set(c.parentCommentId, list)
  }
  return m
})

const timeText = computed(() => (post.value ? formatDateShort(post.value.createdAt) : ''))
const viewText = computed(() => (post.value ? formatCompactNumber(post.value.viewCount) : '0'))
const likeText = computed(() => (post.value ? formatCompactNumber(post.value.likeCount) : '0'))
const meAvatar = computed(() => post.value?.author.avatarUrl ?? '')
const postLiked = computed(() => (post.value ? store.isPostLiked(post.value.id) : false))
const inputPlaceholder = computed(() =>
  replyTarget.value ? `回复 @${replyTarget.value.author.name}：` : '写下你的评论…',
)

function authorDisplayName(a: { id: string; name: string }) {
  return a.name
}

function normalizeProfileId(rawId: string) {
  const n = Number(rawId)
  if (Number.isFinite(n) && n > 0) return n
  let hash = 0
  for (let i = 0; i < rawId.length; i++) hash = (hash * 31 + rawId.charCodeAt(i)) >>> 0
  return 10000 + (hash % 90000)
}

function goAuthorHome(author: { id: string; name: string; avatarUrl: string }) {
  const profileId = normalizeProfileId(author.id)
  router.push({
    path: `/user/home/${profileId}`,
    query: {
      name: author.name,
      avatar: author.avatarUrl || '',
      fromForumPostId: postId.value,
    },
  })
}

const editModalOpen = ref(false)
const editingCommentId = ref('')
const editText = ref('')

function isMine(c: ForumComment) {
  return c.author.id === store.currentUserId
}

function openEdit(c: ForumComment) {
  editingCommentId.value = c.id
  editText.value = c.content
  editModalOpen.value = true
}

function cancelEdit() {
  editModalOpen.value = false
  editingCommentId.value = ''
  editText.value = ''
}

function saveEdit() {
  const v = editText.value.trim()
  if (!v) return
  store.updateComment(editingCommentId.value, v)
  cancelEdit()
  // 后端对接预留：PUT /api/forum/comment/{id}
}

function deleteMineComment(commentId: string) {
  const ok = window.confirm('确认删除该评论？')
  if (!ok) return
  store.deleteComment(commentId)
  // 后端对接预留：DELETE /api/forum/comment/{id}
  if (editingCommentId.value === commentId) cancelEdit()
}

function like() {
  if (!post.value) return
  store.toggleLike(post.value.id)

  // 后端对接预留：POST /forum/posts/:id/like
}

function likeComment(commentId: string) {
  store.toggleCommentLike(commentId)
}

function startReply(c: ForumComment) {
  replyTarget.value = c
  commentText.value = `@${c.author.name} `
}

function submitComment() {
  const text = commentText.value.trim()
  if (!text || !post.value) return
  const pure = text.replace(/^@\S+\s*/, '').trim()
  if (!pure) return
  if (replyTarget.value) {
    store.addComment(post.value.id, pure, {
      parentCommentId: replyTarget.value.parentCommentId ?? replyTarget.value.id,
      replyTo: { id: replyTarget.value.author.id, name: replyTarget.value.author.name },
    })
  } else {
    store.addComment(post.value.id, pure)
  }
  commentText.value = ''
  replyTarget.value = null

  // 后端对接预留：POST /forum/posts/:id/comments
}

onMounted(() => {
  if (post.value) store.incrementView(post.value.id)
})

watch(
  () => postId.value,
  () => {
    if (post.value) store.incrementView(post.value.id)
    commentText.value = ''
    replyTarget.value = null
  },
)
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 1.55fr 0.85fr;
  gap: 16px;
  align-items: start;
  animation: fadeIn 280ms ease both;
}

.left {
  display: grid;
  gap: 14px;
}

.main {
  overflow: hidden;
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.14);
}

.head-top {
  padding: 12px 14px 0;
}

.back-icon {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.34);
  background: #fff;
  color: #ea580c;
  font-size: 24px;
  line-height: 1;
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.back-icon:hover {
  transform: translateY(-1px);
  background: rgba(249, 115, 22, 0.08);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.2);
}

.head {
  padding: 8px 14px 0;
}

.productLink {
  padding: 10px 14px 0;
}

.pinner {
  display: grid;
  grid-template-columns: 92px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(249, 115, 22, 0.22);
  background: #fff;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.pinner:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(249, 115, 22, 0.16);
}

.pcover {
  width: 92px;
  height: 68px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.03);
}

.pname {
  font-weight: 900;
}

.pdesc {
  margin-top: 6px;
  color: rgba(17, 24, 39, 0.62);
  font-size: 12px;
}

.goto {
  color: #ea580c;
  font-weight: 800;
  font-size: 12px;
}

.title {
  font-size: 24px;
  font-weight: 950;
  letter-spacing: 0.2px;
}

.meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.author {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.uLink {
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.avatarBtn {
  border-radius: 999px;
}

.nameBtn:hover {
  color: #ea580c;
}

.a {
  min-width: 0;
}

.n {
  font-weight: 900;
  font-size: inherit;
}

.t {
  color: rgba(17, 24, 39, 0.58);
  font-size: 12px;
  margin-top: 1px;
}

.ops {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.icon-like {
  min-width: 72px;
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  background: #fff;
  color: #262626;
  cursor: pointer;
  transition: transform 140ms ease, background-color 140ms ease;
}

.icon-like:hover {
  transform: translateY(-1px);
  background: rgba(249, 115, 22, 0.08);
}

.icon-like .heart {
  font-size: 14px;
  transform: translateY(-0.5px);
}

.icon-like .count {
  font-size: 12px;
}

.icon-like.liked {
  border-color: rgba(239, 68, 68, 0.58);
  color: #dc2626;
  background: rgba(239, 68, 68, 0.12);
}

.media {
  padding: 12px 14px 0;
}

.content {
  padding: 12px 14px 16px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.text {
  margin-top: 12px;
  white-space: pre-wrap;
  color: rgba(17, 24, 39, 0.80);
}

.comments {
  padding: 14px;
}

.ch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ct {
  font-weight: 950;
}

.composer {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.grow {
  flex: 1;
}

.clist {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.citem {
  display: flex;
  gap: 10px;
}

.cbody {
  flex: 1;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(249, 115, 22, 0.2);
  background: #fff;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.cbody:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.14);
}

.crow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cn {
  font-weight: 900;
  font-size: inherit;
}

.ctm {
  color: rgba(17, 24, 39, 0.55);
  font-size: 12px;
}

.cc {
  margin-top: 6px;
  color: rgba(17, 24, 39, 0.78);
  white-space: pre-wrap;
}

.cops {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action {
  border: 0;
  background: transparent;
  color: rgba(17, 24, 39, 0.55);
  padding: 0;
  cursor: pointer;
}

.action.liked {
  color: #ea580c;
  font-weight: 700;
}

.action.small {
  font-size: 12px;
}

.replies {
  margin-top: 10px;
  display: grid;
  gap: 6px;
  border-left: 2px solid rgba(249, 115, 22, 0.24);
  padding-left: 10px;
}

.reply {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
}

.reply-author {
  font-weight: 700;
  font-size: inherit;
}

.reply-to {
  color: #ea580c;
}

.reply-content {
  color: rgba(17, 24, 39, 0.78);
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 18px;
}

.modal {
  width: min(720px, 100%);
  padding: 14px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 42px rgba(249, 115, 22, 0.24);
}

.mtitle {
  font-weight: 950;
  margin-bottom: 10px;
}

.mbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.side {
  padding: 14px;
  position: sticky;
  top: 74px;
}

.st {
  font-weight: 950;
  margin-bottom: 10px;
}

.slist {
  display: grid;
  gap: 10px;
}

.sitem {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(249, 115, 22, 0.2);
  background: #fff;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.sitem:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.16);
}

.simg {
  width: 86px;
  height: 62px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.03);
}

.sn {
  font-weight: 900;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ss {
  margin-top: 6px;
  color: rgba(17, 24, 39, 0.60);
  font-size: 12px;
}

.empty {
  padding: 18px;
}

.empty .t {
  font-weight: 950;
  font-size: 16px;
}

.empty .s {
  margin-top: 4px;
  color: var(--muted);
}

.empty .actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
}

@media (max-width: 520px) {
  .pinner {
    grid-template-columns: 76px 1fr;
    grid-auto-rows: auto;
  }
  .goto {
    grid-column: 1 / -1;
    justify-self: start;
  }
  .meta {
    align-items: flex-start;
    flex-direction: column;
  }
  .ops {
    width: 100%;
    justify-content: flex-start;
  }
  .composer {
    align-items: stretch;
    flex-direction: column;
  }
  .grow {
    width: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

