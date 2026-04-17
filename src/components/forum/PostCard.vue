<template>
  <article class="card post">
    <RouterLink class="link" :to="`/forum/post/${post.id}`">
      <div class="media">
        <img class="thumb" :src="thumbUrl" :alt="post.title" loading="lazy" @error="onThumbError" />
        <div class="coverShade" />
        <div v-if="hasVideo" class="badge">
          <span class="dot" />
          <span class="txt">{{ durationText }}</span>
        </div>
      </div>

      <div class="body">
        <div class="title" :title="post.title">{{ titleText }}</div>
      </div>
    </RouterLink>

    <div class="row">
      <div class="author">
        <Avatar :src="post.author.avatarUrl" :alt="post.author.name" :size="18" />
        <span class="name">{{ authorName }}</span>
      </div>
      <button class="like" :class="{ liked: liked }" type="button" @click="toggleLike">♥ {{ likeText }}</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ForumPost } from '../../types/forum'
import { formatCompactNumber } from '../../mocks/forum'
import Avatar from './Avatar.vue'
import { useForumStore } from '../../stores/forum'

const props = defineProps<{ post: ForumPost }>()
const store = useForumStore()
const broken = ref(false)

function nonEmpty(v?: string) {
  return typeof v === 'string' && v.trim().length > 0
}

const firstMedia = computed(
  () => props.post.media.find((m) => nonEmpty(m.posterUrl) || nonEmpty(m.url)) ?? props.post.media[0] ?? null,
)
const hasVideo = computed(() => props.post.media.some((m) => m.type === 'video'))
const fallbackSvg = computed(() => {
  const title = encodeURIComponent((props.post.title || '论坛帖子').slice(0, 10))
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900"><rect width="100%" height="100%" fill="#ececec"/><text x="36" y="96" fill="#262626" font-size="44" font-family="Arial" font-weight="700">${title}</text></svg>`,
  )}`
})
const thumbUrl = computed(() => {
  if (broken.value) return fallbackSvg.value
  const cover = props.post.coverUrl
  const poster = firstMedia.value?.posterUrl
  const url = firstMedia.value?.url
  const avatar = props.post.author.avatarUrl
  if (nonEmpty(cover)) return cover
  if (nonEmpty(poster)) return poster
  if (nonEmpty(url)) return url
  if (nonEmpty(avatar)) return avatar
  return fallbackSvg.value
})
const likeText = computed(() => formatCompactNumber(props.post.likeCount))
const liked = computed(() => store.isPostLiked(props.post.id))
const authorName = computed(() => props.post.author.name)
const titleText = computed(() => {
  const title = props.post.title ?? ''
  return title.length > 50 ? `${title.slice(0, 50)}...` : title
})
const durationText = computed(() => {
  const v = props.post.media.find((m) => m.type === 'video')
  const s = v?.durationSec ?? 0
  if (!s) return '视频'
  const mm = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
})

function toggleLike() {
  store.toggleLike(props.post.id)
}

function onThumbError() {
  broken.value = true
}
</script>

<style scoped>
.post {
  display: block;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.12);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  border: 1px solid rgba(249, 115, 22, 0.2);
  animation: fadeInUp 240ms ease both;
}

.post:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.34);
}

.link {
  display: block;
}

.media {
  position: relative;
  background: #f1f1f1;
  overflow: hidden;
}

.thumb {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 280ms ease, filter 280ms ease;
}

.post:hover .thumb {
  transform: scale(1.03);
  filter: contrast(1.02);
}

.coverShade {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.12);
}

.badge {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.68);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
}

.body {
  padding: 11px 12px 10px;
}

.title {
  font-size: 14px;
  font-weight: 800;
  color: #171717;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.45;
  min-height: 42px;
  max-height: 44px;
  overflow: hidden;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(249, 115, 22, 0.14);
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.name {
  color: #525252;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.like {
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  background: #fff;
  color: #262626;
  cursor: pointer;
  transition: transform 140ms ease, background-color 140ms ease;
}

.like:hover {
  transform: translateY(-1px);
  background: rgba(249, 115, 22, 0.08);
}

.like.liked {
  border-color: rgba(239, 68, 68, 0.58);
  color: #dc2626;
  background: rgba(239, 68, 68, 0.12);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

