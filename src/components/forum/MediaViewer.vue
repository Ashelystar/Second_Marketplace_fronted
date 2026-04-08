<template>
  <div class="wrap">
    <div class="stage">
      <template v-if="active?.type === 'video'">
        <video class="video" controls :poster="active.posterUrl" :src="active.url || undefined">
          <source :src="active.url || undefined" />
        </video>
        <div v-if="!active.url" class="empty">
          <div class="hint">模拟视频：当前未提供真实视频地址</div>
          <img v-if="active.posterUrl" :src="active.posterUrl" alt="poster" />
        </div>
      </template>

      <template v-else>
        <img v-if="active?.url" class="img" :src="active.url" alt="media" />
        <div v-else class="empty">
          <div class="hint">暂无媒体</div>
        </div>
      </template>
    </div>

    <div v-if="media.length > 1" class="thumbs">
      <button
        v-for="m in media"
        :key="m.id"
        class="t"
        :class="{ active: m.id === activeId }"
        type="button"
        @click="activeId = m.id"
      >
        <img :src="m.posterUrl ?? m.url" alt="thumb" />
        <span v-if="m.type === 'video'" class="v">▶</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ForumMedia } from '../../types/forum'

const props = defineProps<{ media: ForumMedia[] }>()
const activeId = ref<string>(props.media[0]?.id ?? '')

watch(
  () => props.media,
  (m) => {
    activeId.value = m[0]?.id ?? ''
  },
)

const active = computed(() => props.media.find((m) => m.id === activeId.value) ?? props.media[0] ?? null)
</script>

<style scoped>
.wrap {
  display: grid;
  gap: 10px;
}

.stage {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(17, 24, 39, 0.03);
  aspect-ratio: 16 / 10;
  position: relative;
}

.img,
.video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  text-align: center;
  color: rgba(17, 24, 39, 0.62);
}

.empty img {
  width: min(480px, 100%);
  border-radius: 14px;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.hint {
  margin-bottom: 12px;
}

.thumbs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.t {
  width: 86px;
  height: 64px;
  border-radius: 12px;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.8);
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 120ms ease, border-color 120ms ease;
}

.t:hover {
  transform: translateY(-1px);
}

.t.active {
  border-color: rgba(6, 182, 212, 0.50);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.12);
}

.t img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.v {
  position: absolute;
  right: 8px;
  bottom: 6px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}
</style>

