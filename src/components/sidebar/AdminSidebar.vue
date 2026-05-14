<template>
  <aside class="admin-sidebar">
    <SidebarHeader />
    <nav class="sidebar-nav">
      <ul>
        <SidebarMenuItem
          v-for="item in menuItems"
          :key="item.id"
          :text="item.text"
          :icon="item.icon"
          :is-active="activeTab === item.id"
          @click="handleMenuItemClick(item.id)"
        />
      </ul>
    </nav>
    <SidebarFooter :logout-icon="SwitchButton" @logout="handleLogout" />
  </aside>
</template>

<script setup lang="ts">
import SidebarHeader from './SidebarHeader.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'
import SidebarFooter from './SidebarFooter.vue'
import { 
  DataAnalysis, 
  User, 
  Goods, 
  Ticket, 
  ChatLineSquare, 
  Bell, 
  SwitchButton 
} from '@element-plus/icons-vue'

defineProps({
  activeTab: {
    type: String,
    default: 'dashboard'
  }
})

const emit = defineEmits(['tabChange', 'logout'])

const menuItems = [
  { id: 'dashboard', text: '仪表盘', icon: DataAnalysis },
  { id: 'users', text: '用户管理', icon: User },
  { id: 'products', text: '商品审核', icon: Goods },
  { id: 'disputes', text: '纠纷仲裁', icon: Ticket },
  { id: 'forum', text: '社区管理', icon: ChatLineSquare },
  { id: 'notifications', text: '系统通知', icon: Bell }
]

function handleMenuItemClick(tabId: string) {
  emit('tabChange', tabId)
}

function handleLogout() {
  emit('logout')
}
</script>

<style scoped>
.admin-sidebar {
  width: 240px;
  height: 100vh;
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-nav {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>