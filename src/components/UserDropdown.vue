<!-- UserDropdown.vue - 通用的「我的」用户下拉菜单 -->
<template>
  <div class="userMenuWrapper" ref="menuRef">
    <!-- 触发按钮 -->
    <a href="#" class="triggerBtn" @click.prevent="toggle" @mouseenter="onEnter" @mouseleave="startLeaveTimer">
      <i :class="iconClass || 'fa fa-user'"></i>
      {{ label || '我的' }}
      <i class="fa fa-caret-down caretIcon" :class="{ rotate: open }"></i>
    </a>

    <!-- 下拉面板 -->
    <transition name="dropdown">
      <div v-if="open" class="dropdownPanel" @mouseenter="cancelLeaveTimer" @mouseleave="startLeaveTimer">
        <!-- 用户信息头 -->
        <div class="userInfoHeader">
          <img :src="avatarSrc" alt="" class="avatarImg" />
          <div class="userName">{{ displayName }}</div>
        </div>
        <hr class="divider" />
        <!-- 菜单项 -->
        <template v-for="(item, index) in menuItems" :key="item.path">
          <a href="#" class="menuItem" @click.prevent="navigate(item.path)">
            <i :class="item.icon"></i> {{ item.label }}
          </a>
          <hr v-if="item.separator && index < menuItems.length - 1" class="divider" />
        </template>
        <hr class="divider" />
        <a href="#" class="menuItem logoutItem" @click.prevent="handleLogout">
          <i class="fa fa-sign-out"></i> 退出登录
        </a>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

// 内联默认头像 SVG
const PLACEHOLDER_AVATAR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect fill="#f0f0f0" width="40" height="40" rx="20"/><text fill="#999" font-family="sans-serif" font-size="18" x="50%" y="55%" text-anchor="middle" dominant-baseline="middle">U</text></svg>')}`

withDefaults(defineProps<{
  iconClass?: string
  label?: string
}>(), {
  iconClass: 'fa fa-user',
  label: '我的',
})

const router = useRouter()
const userStore = useUserStore()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)
let leaveTimer: ReturnType<typeof setTimeout> | null = null

// 默认菜单项
const menuItems = [
  { icon: 'fa fa-home', label: '个人中心', path: '/user/center' },
  { icon: 'fa fa-plus-circle', label: '我要发布', path: '/publish' },
  { icon: 'fa fa-heart-o', label: '我的收藏', path: '/user/favorites', separator: true },
  { icon: 'fa fa-shopping-cart', label: '购物车', path: '/cart' },
  { icon: 'fa fa-bell', label: '消息通知', path: '/chat' },
]

const avatarSrc = computed(() => userStore.userInfo?.avatar || PLACEHOLDER_AVATAR)
const displayName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '用户')

const toggle = (e: Event) => {
  e.stopPropagation()
  open.value = !open.value
}

const close = () => { open.value = false }

const onEnter = () => { cancelLeaveTimer() }
const startLeaveTimer = () => { leaveTimer = setTimeout(close, 200) }
const cancelLeaveTimer = () => { if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null } }

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) close()
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const navigate = (path: string) => { close(); router.push(path) }
const handleLogout = async () => { close(); userStore.logout(); router.push('/') }

defineExpose({ close })
</script>

<style scoped>
.userMenuWrapper { position: relative; }

.triggerBtn {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition: color 200ms;
}
.triggerBtn:hover { color: #f97316; }

.caretIcon { font-size: 11px; transition: transform 200ms ease; }
.caretIcon.rotate { transform: rotate(180deg); }

.dropdownPanel {
  position: absolute;
  top: calc(100% + 8px);
  right: -8px;
  width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
  z-index: 100;
  overflow: hidden;
}

.userInfoHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px;
  background: linear-gradient(135deg, #ff6e27, #ff8c42);
}

.avatarImg {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.7);
  object-fit: cover;
  flex-shrink: 0;
}

.userName {
  color: #fff; font-size: 14px; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 130px;
}

.divider { border: none; border-top: 1px solid #f0f0f0; margin: 4px 10px; }

.menuItem {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; font-size: 13.5px;
  color: #333; text-decoration: none;
  cursor: pointer; transition: all 150ms;
}
.menuItem:hover { background: #fff5f0; color: #f97316; }
.logoutItem { color: #e74c3c !important; }
.logoutItem:hover { background: #fef2f2 !important; }

/* 动画 */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0; transform: translateY(-8px);
}
</style>
