<template>
  <div class="page">
    <div class="top card">
      <div class="left">
        <div class="h">社区广场</div>
        <div class="sub">真实经验、交易建议、避坑分享</div>
      </div>
      <div class="search">
        <div class="searchRow">
          <span class="searchIcon">⌕</span>
          <input
            v-model.trim="keyword"
            class="input"
            placeholder="搜索帖子标题、标签、作者"
            @keydown.enter="doSearch"
          />
          <button class="searchBtn" type="button" @click="doSearch">搜索</button>
        </div>
      </div>
    </div>

    <div class="filters">
      <button class="chip" :class="{ active: activeTag === '' }" type="button" @click="activeTag = ''">全部</button>
      <button
        v-for="t in hotTags"
        :key="t"
        class="chip"
        :class="{ active: activeTag === t }"
        type="button"
        @click="activeTag = t"
      >
        #{{ t }}
      </button>
    </div>

    <div class="masonry">
      <PostCard v-for="p in filtered" :key="p.id" :post="p" />
    </div>

    <div class="fabStack">
      <RouterLink class="fab fab-home" to="/" aria-label="首页" data-tip="首页">
        <span class="fabIcon">⌂</span>
      </RouterLink>
      <button class="fab fab-upload" type="button" aria-label="上传" data-tip="上传" @click="goCreatePost">
        <span class="fabPlus">＋</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PostCard from '../../components/forum/PostCard.vue'
import { useForumStore } from '../../stores/forum'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const store = useForumStore()
const userStore = useUserStore()
const activeTag = ref('')
const keyword = ref('')
const searchQuery = ref('')

const hotTags = computed(() => {
  const m = new Map<string, number>()
  for (const p of store.posts) for (const t of p.tags) m.set(t, (m.get(t) ?? 0) + 1)
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map((x) => x[0])
})

const filtered = computed(() => {
  return store.posts.filter((p) => {
    const tagMatch = !activeTag.value || p.tags.includes(activeTag.value)
    const k = searchQuery.value.trim().toLowerCase()
    if (!k) return tagMatch
    const text = `${p.title} ${p.tags.join(' ')}`.toLowerCase()
    return tagMatch && text.includes(k)
  })
})

function doSearch() {
  searchQuery.value = keyword.value
}

function goCreatePost() {
  if (!userStore.isLoggedIn) {
    alert('请先登录后再上传内容')
    router.push({ path: '/user/login', query: { redirect: '/forum/new' } })
    return
  }
  router.push('/forum/new')
}
</script>

<style scoped>
:global(html) {
  overflow-y: scroll;
}

.page {
  display: grid;
  gap: 16px;
}

.top {
  padding: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border-color: rgba(249, 115, 22, 0.26);
  animation: fadeInTop 280ms ease both;
}

.left {
  min-width: 0;
}

.h {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.3px;
}

.sub {
  margin-top: 4px;
  color: #525252;
}

.search {
  width: min(520px, 100%);
}

.searchRow {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  padding: 0 8px 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
  transition: box-shadow 160ms ease, border-color 160ms ease;
}

.searchRow:focus-within {
  border-color: rgba(249, 115, 22, 0.62);
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.18);
}

.searchIcon {
  font-size: 18px;
  color: #525252;
}

.searchRow .input {
  flex: 1;
  height: 100%;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.searchRow .input:focus {
  box-shadow: none;
  border: 0;
}

.searchBtn {
  height: 36px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: transform 140ms ease, background-color 140ms ease;
}

.searchBtn:hover {
  transform: translateY(-1px);
  background: #ea580c;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chip {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.26);
  background: rgba(249, 115, 22, 0.06);
  color: rgba(17, 24, 39, 0.76);
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
}

.chip:hover {
  transform: translateY(-1px);
}

.chip.active {
  border-color: rgba(249, 115, 22, 0.68);
  background: #f97316;
  color: #fff;
}

.masonry {
  column-count: 5;
  column-gap: 14px;
}

.masonry :deep(.post) {
  break-inside: avoid;
  margin-bottom: 14px;
}

@media (max-width: 1180px) {
  .masonry {
    column-count: 4;
  }
}

@media (max-width: 980px) {
  .masonry {
    column-count: 3;
  }
}

@media (max-width: 720px) {
  .top {
    flex-direction: column;
    align-items: stretch;
  }
  .masonry {
    column-count: 2;
  }
  .search {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .masonry {
    column-count: 1;
  }
}

.fabStack {
  position: fixed;
  right: 26px;
  bottom: 26px;
  display: grid;
  gap: 12px;
  z-index: 60;
}

.fab {
  width: 70px;
  height: 70px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  transition: transform 140ms ease, box-shadow 140ms ease;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(4px);
}

.fab:hover {
  transform: translateY(-2px) scale(1.02);
}

.fab::after {
  content: attr(data-tip);
  position: absolute;
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%) translateX(4px);
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.86);
  color: #fff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
}

.fab:hover::after {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

.fab-home {
  background: #fff;
  color: #ea580c;
  border-color: rgba(249, 115, 22, 0.3);
  box-shadow: 0 14px 24px rgba(249, 115, 22, 0.2);
}

.fab-upload {
  background: #f97316;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.26);
  box-shadow: 0 20px 34px rgba(249, 115, 22, 0.34);
}

.fabIcon {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
  transform: translateY(-1px);
}

.fabPlus {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
  transform: translateY(-2px);
}

@media (max-width: 720px) {
  .searchRow {
    height: 44px;
  }
  .searchBtn {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
  }
  .fab {
    width: 62px;
    height: 62px;
  }
}

@keyframes fadeInTop {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

