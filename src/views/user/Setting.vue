<template>
  <div>
    <!-- 页面标题 -->
    <div class="user-page-card p-6 mb-6">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-cog text-xianyuText"></i>
        账号与安全
      </h1>
      
      <!-- 账号安全设置 -->
      <div class="max-w-3xl space-y-6">
        <!-- 账号基本信息 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">账号基本信息</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">账号ID</p>
                <p class="text-sm text-gray-500">{{ accountInfo.username }}</p>
              </div>
              <span class="text-gray-400">不可修改</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">注册时间</p>
                <p class="text-sm text-gray-500">{{ accountInfo.registerTime }}</p>
              </div>
              <span class="text-gray-400">不可修改</span>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">账号状态</p>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ accountInfo.status }}
                </span>
              </div>
              <span class="text-green-500">正常</span>
            </div>
          </div>
        </div>
        
        <!-- 登录密码 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">登录密码</h3>
              <p class="text-sm text-gray-500">定期修改密码可提高账号安全</p>
            </div>
            <button 
              @click="showPasswordModal = true"
              class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
            >
              修改
            </button>
          </div>
          <div class="text-sm text-gray-500">
            上次修改时间：{{ accountInfo.lastPasswordChange }}
          </div>
        </div>
        
        <!-- 手机绑定 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">手机绑定</h3>
              <p class="text-sm text-gray-500">已绑定手机：{{ accountInfo.phone }}</p>
            </div>
            <button 
              @click="showPhoneModal = true"
              class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
            >
              更换
            </button>
          </div>
          <p class="text-sm text-gray-500">绑定手机可用于登录、找回密码和接收重要通知</p>
        </div>
        
        <!-- 邮箱绑定 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">邮箱绑定</h3>
              <p class="text-sm text-gray-500">已绑定邮箱：{{ accountInfo.email }}</p>
            </div>
            <button 
              @click="showEmailModal = true"
              class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
            >
              更换
            </button>
          </div>
          <p class="text-sm text-gray-500">绑定邮箱可用于登录、找回密码和接收重要通知</p>
        </div>
        
        <!-- 账号保护 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">账号保护</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i class="fa fa-shield-alt text-blue-600"></i>
                </div>
                <div>
                  <p class="font-medium">登录保护</p>
                  <p class="text-sm text-gray-500">开启后，登录时需验证手机</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.loginProtection" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-xianyuText/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-xianyuText"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <i class="fa fa-bell text-green-600"></i>
                </div>
                <div>
                  <p class="font-medium">登录提醒</p>
                  <p class="text-sm text-gray-500">新设备登录时发送提醒</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="securitySettings.loginNotify" 
                  class="sr-only peer"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-xianyuText/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-xianyuText"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 操作记录 -->
    <div class="user-page-card p-6">
      <h3 class="text-lg font-semibold mb-4">最近操作记录</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP地址</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="log in operationLogs" :key="log.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.time }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.action }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.ip }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.device }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                  log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ log.status === 'success' ? '成功' : '失败' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模态框状态
const showPasswordModal = ref(false)
const showPhoneModal = ref(false)
const showEmailModal = ref(false)

// 账号信息
const accountInfo = ref({
  username: 'xiaoming123',
  registerTime: '2023-01-15 14:30:22',
  status: '正常',
  lastPasswordChange: '2023-12-01',
  phone: '138****5678',
  email: 'xiaoming@example.com'
})

// 安全设置
const securitySettings = ref({
  loginProtection: true,
  loginNotify: true
})

// 操作记录
const operationLogs = ref([
  {
    id: 1,
    time: '2024-01-15 14:30:22',
    action: '登录',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    status: 'success'
  },
  {
    id: 2,
    time: '2024-01-14 10:15:33',
    action: '修改资料',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    status: 'success'
  },
  {
    id: 3,
    time: '2024-01-12 18:45:12',
    action: '登录',
    ip: '192.168.1.101',
    device: 'iPhone/Safari',
    status: 'success'
  },
  {
    id: 4,
    time: '2024-01-10 09:20:45',
    action: '修改密码',
    ip: '192.168.1.100',
    device: 'Chrome/Windows',
    status: 'success'
  },
  {
    id: 5,
    time: '2024-01-08 22:10:30',
    action: '异地登录尝试',
    ip: '223.104.61.100',
    device: 'Android/Chrome',
    status: 'failed'
  }
])

onMounted(() => {
  // 这里可以加载账号安全信息
})
</script>