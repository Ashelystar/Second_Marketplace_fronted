<template>
  <div class="page">
    
    <Topnav v-if="showNav" />

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

    <RouterLink class="fab" to="/forum/new" aria-label="打开上传界面">
      <span class="fabPlus">+</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PostCard from '../../components/forum/PostCard.vue'
import { useForumStore } from '../../stores/forum'
import { useRoute} from 'vue-router'
import Topnav from '@/components/TopNav.vue' 

const route = useRoute()
const hideNavRoutes = ['/user/login', '/user/register']
const showNav = computed(() => !hideNavRoutes.includes(route.path))
 console.log(route.path, showNav.value)

const store = useForumStore()
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
</script>

<style scoped>
.page {
  display: grid;
  gap: 14px;
}

.top {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.h {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.sub {
  color: var(--muted);
  margin-top: 3px;
}

.search {
  width: min(520px, 100%);
}

.searchRow {
  display: flex;
  gap: 10px;
  width: 100%;
}

.search .input {
  flex: 1;
}

.searchBtn {
  flex: none;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
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
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.78);
  color: rgba(17, 24, 39, 0.72);
  cursor: pointer;
  transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
}

.chip:hover {
  transform: translateY(-1px);
}

.chip.active {
  border-color: rgba(6, 182, 212, 0.50);
  background: rgba(6, 182, 212, 0.10);
  color: rgba(17, 24, 39, 0.92);
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

.fab {
  position: fixed;
  right: 26px;
  bottom: 26px;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 16px 40px rgba(0, 188, 212, 0.25);
  z-index: 60;
  transition: transform 120ms ease;
}

.fab:hover {
  transform: translateY(-2px);
}

.fabPlus {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  transform: translateY(-1px);
}
</style>

