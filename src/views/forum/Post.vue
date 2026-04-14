<template>
  <div class="page">
    <div class="top">
      <div>
        <div class="h">发布帖子</div>
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
        <select v-model="productId" class="input">
          <option value="">不关联商品</option>
          <option v-for="g in goods" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>

      <div class="field">
        <div class="label">多媒体（图片/视频）</div>
        <div class="uploader">
          <input ref="fileEl" class="file" type="file" multiple accept="image/*,video/*" @change="onPick" />
          <button class="btn" type="button" @click="fileEl?.click()">选择文件</button>
          <button v-if="media.length" class="btn btn-danger" type="button" @click="clearMedia">清空</button>
          <div class="tip">第一张图片将作为封面</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ForumMedia } from '../../types/forum'
import { useForumStore } from '../../stores/forum'
import { forumMockTags } from '../../mocks/forum'
import { mockGoods } from '../../mocks/goods'

const router = useRouter()
const store = useForumStore()

const title = ref('')
const content = ref('')
const selectedTags = ref<string[]>([])
const err = ref('')
const adminTags = forumMockTags
const goods = mockGoods
const productId = ref<string>('')

const fileEl = ref<HTMLInputElement | null>(null)
const media = ref<ForumMedia[]>([])

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

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  if (files.length === 0) return

  const list: ForumMedia[] = []
  for (const f of files) {
    const url = URL.createObjectURL(f)
    const isVideo = f.type.startsWith('video/')
    list.push({
      id: `${f.name}_${f.size}_${f.lastModified}`,
      type: isVideo ? 'video' : 'image',
      url,
      posterUrl: isVideo ? makePoster(f.name) : undefined,
    })
  }
  media.value = [...media.value, ...list].slice(0, 9)
}

function makePoster(label: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
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
  if (set.size >= 2) return
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
    productId: productId.value ? productId.value : null,
    postType: productId.value ? 'sell' : 'common',
  })

  // 后端对接预留（当前使用 store mock）
  // const created = await createForumPost({ title: t, content: c, tags, media: media.value })

  await router.push(`/forum/post/${created.id}`)
}
</script>

<style scoped>
.page {
  display: grid;
  gap: 14px;
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}

.h {
  font-size: 20px;
  font-weight: 900;
}

.sub {
  margin-top: 3px;
  color: var(--muted);
}

.form {
  padding: 14px;
  display: grid;
  gap: 14px;
}

.back-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: rgba(17, 24, 39, 0.8);
  font-size: 18px;
  line-height: 1;
}

.back-icon:hover {
  background: rgba(17, 24, 39, 0.04);
}

.field {
  display: grid;
  gap: 8px;
}

.label {
  font-weight: 800;
  color: rgba(17, 24, 39, 0.78);
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.78);
  padding: 0 12px;
  cursor: pointer;
}

.tag.active {
  border-color: rgba(6, 182, 212, 0.52);
  background: rgba(6, 182, 212, 0.10);
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
  color: rgba(17, 24, 39, 0.55);
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
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.8);
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
  color: rgba(17, 24, 39, 0.70);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  padding-top: 12px;
}

.err {
  color: var(--danger);
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
</style>

