<template>
  <li :class="{ active: isActive }">
    <a href="#" @click.prevent="handleClick">
      <span class="nav-icon">
        <component :is="icon" />
      </span>
      <span class="nav-text">{{ text }}</span>
    </a>
  </li>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<style scoped>
li {
  margin-bottom: 8px;
}

li.active {
  background-color: #f0f0f0;
  border-radius: 8px;
}

li.active a {
  color: #ff7f00;
}

a {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  border-radius: 8px;
  transition: all 0.3s ease;
}

a:hover {
  background-color: #f5f5f5;
}

.nav-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
}
</style>