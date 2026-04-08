<template>
  <div class="wrap" v-if="goodsItem">
    <div class="top card">
      <div class="thumbWrap">
        <img class="thumb" :src="goodsItem.coverUrl" :alt="goodsItem.name" />
      </div>
      <div class="info">
        <div class="name">{{ goodsItem.name }}</div>
        <div class="price">{{ goodsItem.priceText }}</div>
        <div class="desc">{{ goodsItem.desc }}</div>
      </div>
      <div class="side">
        <RouterLink class="btn btn-primary" :to="`/forum`">回到社区</RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="empty card">
    <div class="t">商品不存在</div>
    <div class="s">返回社区查看其他帖子。</div>
    <RouterLink class="btn btn-primary" to="/forum">返回社区</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { mockGoods } from '../../mocks/goods'

const route = useRoute()
const goodsId = computed(() => String(route.params.id ?? ''))
const goodsItem = computed(() => mockGoods.find((g) => g.id === goodsId.value) ?? null)
</script>

<style scoped>
.wrap {
  padding: 14px 0;
}

.top {
  padding: 14px;
  display: grid;
  grid-template-columns: 260px 1fr auto;
  gap: 14px;
  align-items: start;
}

.thumbWrap {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(17, 24, 39, 0.03);
}

.thumb {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.name {
  font-weight: 950;
  font-size: 18px;
}

.price {
  margin-top: 8px;
  font-weight: 950;
  color: #00a4bb;
}

.desc {
  margin-top: 10px;
  color: rgba(17, 24, 39, 0.70);
  white-space: pre-wrap;
}

.empty {
  padding: 18px;
}

.t {
  font-weight: 950;
}

.s {
  margin-top: 4px;
  color: var(--muted);
}

@media (max-width: 820px) {
  .top {
    grid-template-columns: 1fr;
  }
  .thumb {
    height: 180px;
  }
}
</style>

