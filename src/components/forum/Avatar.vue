<template>
  <div class="avatar" :style="{ width: `${size}px`, height: `${size}px` }">
    <img :src="src" :alt="alt" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src: string
    alt?: string
    size?: number
  }>(),
  {
    alt: 'avatar',
    size: 24,
  },
)
</script>

<style scoped>
.avatar {
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.10);
  background: rgba(255, 255, 255, 0.7);
  flex: none;
}

.avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
</style>

