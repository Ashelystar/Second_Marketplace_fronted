<template>
  <div class="page">
    <div class="top">
     <div>
        <div class="h">发布页</div>
      </div>
      <div class="actions">
        <RouterLink class="back-icon" to="/forum" aria-label="返回社区">
          <span>←</span>
        </RouterLink>
      </div>
    </div>

    <form class="card form" @submit.prevent="submit">
      <div class="field">
        <div class="label">标题</div>
        <input v-model.trim="title" class="input" placeholder="一句话说明你想分享/求助的内容" />
      </div>

      <div class="field">
        <div class="label">正文</div>
        <textarea v-model.trim="content" class="textarea" placeholder="写一些你想分享的内容" />
      </div>

      <div class="field">
        <div class="label">标签选择</div>
        <div class="tags">
          <button
            v-for="tag in adminTags"
            :key="tag"
            class="tag"
            :class="{ active: selectedTags.includes(tag) }"
            type="button"
            @click="toggleTag(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">关联商品（可选）</div>
        <!--
          对接预留（购物车/历史订单模块尚未实现）：
          1) GET /api/cart/my -> 当前用户购物车商品
          2) GET /api/order/my/history -> 当前用户历史订单商品
          3) 合并去重后渲染下拉选项，value 使用商品 id
          4) 发帖时将选中值写入 createForumPost 的 product_id
        -->
        <select v-model="productId" class="input" :disabled="isLoadingMyTrades">
          <option value="">不关联商品</option>
          <option v-for="g in goodsFromMyTrades" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
        <div v-if="!isLoadingMyTrades && goodsFromMyTrades.length === 0" class="tip">
          暂无可关联商品
        </div>
      </div>

      <div class="field">
        <div class="label">多媒体（图片/视频）</div>
        <div class="uploader">
          <input ref="fileEl" class="file" type="file" multiple accept="image/*,video/*" @change="onPick" />
          <button class="btn" type="button" @click="fileEl?.click()">选择文件</button>
          <button v-if="media.length" class="btn btn-danger" type="button" @click="clearMedia">清空</button>
          <div class="tip">最多上传 9 个文件</div>
        </div>
        <div v-if="media.length" class="previews">
          <div v-for="m in media" :key="m.id" class="pv">
            <img v-if="m.type === 'image'" :src="m.url" alt="preview" />
            <div v-else class="v">
              <img :src="m.posterUrl" alt="poster" />
              <div class="play">▶</div>
            </div>
            <div class="cap">{{ m.type === 'video' ? '视频' : '图片' }}</div>
          </div>
        </div>
      </div>

      <div class="field">
        <div class="label">封面（可选）</div>
        <div class="uploader">
          <input ref="coverEl" class="file" type="file" accept="image/*" @change="onPickCover" />
          <button class="btn" type="button" @click="coverEl?.click()">上传封面</button>
          <button v-if="coverFileUrl" class="btn btn-danger" type="button" @click="clearCover">移除封面</button>
        </div>
      </div>

      <div class="bar">
        <div class="err" v-if="err">{{ err }}</div>
        <div class="right">
          <button class="btn" type="button" @click="fillDemo">一键填充示例</button>
          <button class="btn btn-primary" type="submit">发布</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ForumMedia } from '../../types/forum'
import { useForumStore } from '../../stores/forum'
import { useOrderStore } from '../../stores/order'
import { useUserStore } from '@/stores/userStore'
import { forumMockTags } from '../../mocks/forum'
import { mockCartItems } from '@/mocks/cart'

const router = useRouter()
const store = useForumStore()
const orderStore = useOrderStore()
const userStore = useUserStore()

const title = ref('')
const content = ref('')
const selectedTags = ref<string[]>([])
const err = ref('')
const adminTags = forumMockTags
const productId = ref<string>('')
const isLoadingMyTrades = ref(false)

const goodsFromMyTrades = computed(() => {
  const userId = Number(userStore.userInfo?.id ?? 0)
  const fromOrders = orderStore.orders.flatMap((order) =>
    (order.products ?? []).map((item) => ({
      id: String(item.product_id),
      name: item.product_title,
    })),
  )
  const fromCart = mockCartItems
    .filter((item) => item.userId === userId)
    .map((item) => ({
      id: String(item.id),
      name: item.title,
    }))
  const merged = [...fromOrders, ...fromCart]

  // 相同商品仅保留一份，避免下拉框重复
  const uniqueById = new Map<string, { id: string; name: string }>()
  for (const item of merged) {
    if (!uniqueById.has(item.id)) uniqueById.set(item.id, item)
  }
  return [...uniqueById.values()]
})

const fileEl = ref<HTMLInputElement | null>(null)
const media = ref<ForumMedia[]>([])
const MAX_MEDIA_COUNT = 9
const coverEl = ref<HTMLInputElement | null>(null)
const coverFileUrl = ref('')

function clearMedia() {
  for (const m of media.value) {
    try {
      if (m.url.startsWith('blob:')) URL.revokeObjectURL(m.url)
    } catch {
      // ignore
    }
  }
  media.value = []
  if (fileEl.value) fileEl.value.value = ''
}

function clearCover() {
  if (coverFileUrl.value.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(coverFileUrl.value)
    } catch {
      // ignore
    }
  }
  coverFileUrl.value = ''
  if (coverEl.value) coverEl.value.value = ''
}

function onPickCover(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  clearCover()
  coverFileUrl.value = URL.createObjectURL(f)
  err.value = ''
  if (coverEl.value) coverEl.value.value = ''
}

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  if (files.length === 0) return
  if (media.value.length >= MAX_MEDIA_COUNT) {
    err.value = `多媒体最多上传 ${MAX_MEDIA_COUNT} 个`
    if (fileEl.value) fileEl.value.value = ''
    return
  }

  err.value = ''
  const remainCount = MAX_MEDIA_COUNT - media.value.length
  const picked = files.slice(0, remainCount)
  if (files.length > remainCount) {
    err.value = `最多上传 ${MAX_MEDIA_COUNT} 个，已自动保留前 ${remainCount} 个`
  }

  const list: ForumMedia[] = []
  for (const f of picked) {
    const url = URL.createObjectURL(f)
    const isVideo = f.type.startsWith('video/')
    list.push({
      id: `${f.name}_${f.size}_${f.lastModified}`,
      type: isVideo ? 'video' : 'image',
      url,
      posterUrl: isVideo ? makePoster(f.name) : undefined,
    })
  }
  media.value = [...media.value, ...list]
  if (fileEl.value) fileEl.value.value = ''
}

function makePoster(label: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <rect width="100%" height="100%" fill="#f97316" fill-opacity="0.22"/>
    <text x="32" y="74" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="28" fill="rgba(255,255,255,0.92)" font-weight="800">视频预览</text>
    <text x="32" y="114" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="18" fill="rgba(255,255,255,0.78)">${escapeXml(
      label.slice(0, 24),
    )}</text>
  </svg>
  `.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const firstMediaCover = computed(() => {
  const first = media.value[0]
  if (!first) return ''
  return first.posterUrl || first.url || ''
})

const resolvedCoverPreview = computed(() => {
  if (coverFileUrl.value) return coverFileUrl.value
  return firstMediaCover.value || ''
})

function fillDemo() {
  title.value = '二手交易避坑：验机 + 议价 + 走平台'
  content.value =
    '我把最近一次买二手手机的完整流程整理了一下：\n\n1) 先问清楚：激活锁/维修史/电池健康/配件与票据\n2) 面交验机：屏幕坏点、相机、扬声器、麦克风、指纹/人脸、充电口\n3) 议价策略：用“可量化的小瑕疵”谈，不要情绪化\n4) 走平台：留证据、别脱离平台私下转账\n\n有需要我再补一份更细的 checklist。'
  selectedTags.value = ['二手', '验机']
}

function toggleTag(tag: string) {
  const set = new Set(selectedTags.value)
  if (set.has(tag)) {
    set.delete(tag)
    selectedTags.value = [...set]
    return
  }
  set.add(tag)
  selectedTags.value = [...set]
}

async function submit() {
  err.value = ''
  const t = title.value.trim()
  const c = content.value.trim()
  if (t.length < 4) {
    err.value = '标题至少 4 个字'
    return
  }
  if (c.length < 10) {
    err.value = '正文至少 10 个字'
    return
  }
  const tags = [...selectedTags.value]
  if (tags.length === 0) {
    err.value = '至少选择 1 个标签'
    return
  }

  const created = store.addPost({
    title: t,
    content: c,
    tags,
    media: media.value.length ? media.value : [],
    coverUrl: coverFileUrl.value || firstMediaCover.value || '',
    productId: productId.value ? productId.value : null,
    postType: productId.value ? 'sell' : 'common',
  })

  // 后端对接预留（当前使用 store mock）
  // const created = await createForumPost({ title: t, content: c, tags, media: media.value })

  await router.push(`/forum/post/${created.id}`)
}

onMounted(async () => {
  if (!userStore.isLoggedIn) return
  try {
    isLoadingMyTrades.value = true
    await orderStore.loadOrders()
  } finally {
    isLoadingMyTrades.value = false
  }
})
</script>

<style scoped>
.page {
  display: grid;
  gap: 16px;
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}

.h {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.sub {
  margin-top: 3px;
  color: var(--muted);
}

.form {
  padding: 18px;
  display: grid;
  gap: 16px;
  border-color: rgba(249, 115, 22, 0.24);
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.14);
  animation: popIn 260ms ease both;
}

.back-icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.34);
  background: #fff;
  color: #ea580c;
  font-size: 24px;
  line-height: 1;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.back-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(249, 115, 22, 0.22);
  background: rgba(249, 115, 22, 0.08);
}

.field {
  display: grid;
  gap: 8px;
}

.label {
  font-weight: 800;
  color: #171717;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
  padding: 0 12px;
  cursor: pointer;
  transition: transform 120ms ease, background-color 120ms ease;
}

.tag:hover {
  transform: translateY(-1px);
  background: rgba(249, 115, 22, 0.14);
}

.tag.active {
  border-color: rgba(249, 115, 22, 0.72);
  background: #f97316;
  color: #fff;
}

.uploader {
  display: grid;
  gap: 10px;
  align-items: center;
  grid-template-columns: auto auto 1fr;
}

.file {
  display: none;
}

.tip {
  color: #6b7280;
}

.previews {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pv {
  width: 140px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.24);
  background: rgba(255, 255, 255, 0.8);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.pv:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(249, 115, 22, 0.18);
}

.pv img {
  width: 100%;
  height: 96px;
  object-fit: cover;
  display: block;
}

.pv .v {
  position: relative;
}

.pv .play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}

.cap {
  padding: 8px 10px;
  font-weight: 700;
  color: #374151;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid rgba(249, 115, 22, 0.18);
  padding-top: 12px;
}

.err {
  color: #111827;
  font-weight: 700;
}

.right {
  display: flex;
  gap: 10px;
}

@media (max-width: 720px) {
  .top {
    align-items: flex-start;
    flex-direction: column;
  }
  .uploader {
    grid-template-columns: 1fr;
  }
  .right {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}

@keyframes popIn {
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

