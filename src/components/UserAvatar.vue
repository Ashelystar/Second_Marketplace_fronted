<template>
  <img
    v-if="resolvedSrc && !hasError"
    :src="resolvedSrc"
    :alt="name"
    v-bind="$attrs"
    class="user-avatar-img"
    @error="handleError"
  />
  <div
    v-else
    v-bind="$attrs"
    class="user-avatar-fallback"
  >
    {{ initial }}
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getImageUrl } from '@/utils/image'

const props = withDefaults(defineProps<{
  src?: string | null
  name?: string
}>(), {
  src: '',
  name: '用户',
})

const hasError = ref(false)

const resolvedSrc = computed(() => {
  if (!props.src) return ''
  return getImageUrl(props.src) || ''
})

const initial = computed(() => {
  return props.name?.charAt(0) || '?'
})

const handleError = () => {
  hasError.value = true
}
</script>

<style scoped>
.user-avatar-img,
.user-avatar-fallback {
  width: 100%;
  height: 100%;
  display: block;
}

.user-avatar-img {
  object-fit: cover;
}

.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fed7aa;
  color: #c2410c;
  font-weight: 700;
}
</style>
