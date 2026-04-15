<template>
  <div class="page">
    <div class="top card">
      <div class="left">
        <div class="h">帖子搜索</div>
        <div class="sub">支持标题/正文/标签/作者昵称</div>
      </div>
      <div class="right">
        <div class="searchBox">
          <span class="icon">⌕</span>
          <input v-model.trim="q" class="searchInput" placeholder="搜点什么，比如：验机 / 宿舍 / 穿搭…" @keydown.enter="doSearch" />
          <button class="searchBtn" type="button" @click="doSearch">搜索</button>
        </div>
      </div>
    </div>

    <div v-if="searched" class="result">
      <div class="count">找到 {{ results.length }} 条结果</div>
      <div v-if="results.length === 0" class="empty card">
        <div class="t">没有匹配到内容</div>
        <div class="s">换个关键词试试，或去发一篇新帖。</div>
        <div class="actions">
          <RouterLink class="btn btn-primary" to="/forum/new">去发帖</RouterLink>
          <RouterLink class="btn" to="/forum">返回首页</RouterLink>
        </div>
      </div>

      <div v-else class="list">
        <RouterLink v-for="p in results" :key="p.id" class="item card" :to="`/forum/post/${p.id}`">
          <img class="thumb" :src="p.coverUrl ?? p.media[0]?.posterUrl ?? p.media[0]?.url ?? p.author.avatarUrl" :alt="p.title" />
          <div class="meta">
            <div class="title">{{ p.title }}</div>
            <div class="desc">{{ p.content }}</div>
            <div class="tags">
              <TagPill v-for="t in p.tags.slice(0, 4)" :key="t" :label="t" />
            </div>
          </div>
        </RouterLink>
      </div>
    </div>

    <div v-else class="hint card">
      <div class="t">你可以搜索：</div>
      <div class="chips">
        <button v-for="x in suggestions" :key="x" class="chip" type="button" @click="quick(x)">{{ x }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForumStore } from '../../stores/forum'
import TagPill from '../../components/forum/TagPill.vue'

const store = useForumStore()
const q = ref('')
const searched = ref(false)
const results = ref(store.posts)

const suggestions = computed(() => ['验机', '宿舍', '穿搭', '跑鞋', '二手', '清单'])

function doSearch() {
  searched.value = true
  const keyword = q.value.trim().toLowerCase()
  if (!keyword) {
    results.value = store.posts
    return
  }
  results.value = store.posts.filter((p) => {
    const hay = [p.title, p.content, p.author.name, ...p.tags].join(' ').toLowerCase()
    return hay.includes(keyword)
  })

  // 后端对接预留（当前用前端过滤）
  // results.value = await searchForumPosts(keyword)
}

function quick(x: string) {
  q.value = x
  doSearch()
}
</script>

<style scoped>
.page {
  display: grid;
  gap: 16px;
}

.top {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  animation: fadeIn 260ms ease both;
}

.h {
  font-weight: 900;
  font-size: 18px;
}

.sub {
  color: var(--muted);
  margin-top: 2px;
}

.right {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.searchBox {
  width: min(560px, 100%);
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 8px 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.3);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.searchBox:focus-within {
  border-color: rgba(249, 115, 22, 0.62);
  box-shadow: 0 14px 26px rgba(249, 115, 22, 0.18);
}

.icon {
  color: #525252;
  font-size: 18px;
}

.searchInput {
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  height: 100%;
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

.hint {
  padding: 14px;
}

.hint .t {
  font-weight: 800;
}

.chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.chip {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  background: rgba(249, 115, 22, 0.06);
  cursor: pointer;
  transition: transform 120ms ease, background-color 120ms ease;
}

.chip:hover {
  transform: translateY(-1px);
  background: rgba(249, 115, 22, 0.12);
}

.result {
  display: grid;
  gap: 12px;
}

.count {
  color: rgba(17, 24, 39, 0.72);
}

.list {
  display: grid;
  gap: 12px;
}

.item {
  padding: 12px;
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 12px;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.16);
}

.thumb {
  width: 128px;
  height: 96px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(17, 24, 39, 0.03);
}

.title {
  font-weight: 900;
  font-size: 15px;
}

.desc {
  margin-top: 6px;
  color: rgba(17, 24, 39, 0.68);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty {
  padding: 18px;
}

.empty .t {
  font-weight: 900;
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

@media (max-width: 720px) {
  .top {
    flex-direction: column;
    align-items: stretch;
  }
  .right {
    justify-content: stretch;
    width: 100%;
  }
  .searchBox {
    width: 100%;
    height: 44px;
  }
  .searchBtn {
    height: 32px;
    padding: 0 14px;
    font-size: 12px;
  }
  .item {
    grid-template-columns: 1fr;
  }
  .thumb {
    width: 100%;
    height: 160px;
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

