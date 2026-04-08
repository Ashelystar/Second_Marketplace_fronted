<template>
  <article class="card post">
    <RouterLink class="link" :to="`/forum/post/${post.id}`">
      <div class="media" :style="{ aspectRatio: mediaRatio }">
        <img class="thumb" :src="thumbUrl" :alt="post.title" />
        <div v-if="hasVideo" class="badge">
          <span class="dot" />
          <span class="txt">{{ durationText }}</span>
        </div>
      </div>

      <div class="body">
        <div class="title" :title="post.title">{{ post.title }}</div>
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
import { computed } from 'vue'
import type { ForumPost } from '../../types/forum'
import { formatCompactNumber } from '../../mocks/forum'
import Avatar from './Avatar.vue'
import { useForumStore } from '../../stores/forum'

const props = defineProps<{ post: ForumPost }>()
const store = useForumStore()

const firstMedia = computed(() => props.post.media[0] ?? null)
const hasVideo = computed(() => props.post.media.some((m) => m.type === 'video'))
const thumbUrl = computed(() => firstMedia.value?.posterUrl ?? firstMedia.value?.url ?? props.post.author.avatarUrl)
const likeText = computed(() => formatCompactNumber(props.post.likeCount))
const liked = computed(() => store.isPostLiked(props.post.id))
const authorName = computed(() => props.post.author.name)
const mediaRatio = computed(() => {
  const w = firstMedia.value?.width ?? 3
  const h = firstMedia.value?.height ?? 4
  const ratio = w / h
  const clamped = Math.max(0.72, Math.min(1.35, ratio))
  return `${clamped}`
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
</script>

<style scoped>
.post {
  display: block;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.08);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.post:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(17, 24, 39, 0.10);
}

.link {
  display: block;
}

.media {
  position: relative;
  aspect-ratio: 1 / 1;
  background: rgba(17, 24, 39, 0.04);
  max-height: 360px;
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
  background: rgba(0, 0, 0, 0.55);
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
  padding: 10px 10px 12px;
}

.title {
  font-size: 14px;
  font-weight: 700;
  color: rgba(17, 24, 39, 0.92);
  white-space: normal;
  word-break: break-word;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px 12px;
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.name {
  color: rgba(17, 24, 39, 0.68);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.like {
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: rgba(17, 24, 39, 0.68);
  cursor: pointer;
}

.like.liked {
  border-color: rgba(239, 68, 68, 0.38);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
</style>

