<template>
  <span class="tag">#{{ label }}</span>
</template>

<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<style scoped>
.tag {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(6, 182, 212, 0.22);
  background: rgba(6, 182, 212, 0.08);
  color: rgba(17, 24, 39, 0.75);
}
</style>

