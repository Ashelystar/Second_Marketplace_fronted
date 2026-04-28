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

        <!-- 实名认证 -->
        <div class="border border-gray-200 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">实名认证</h3>
              <p class="text-sm text-gray-500">
                当前状态：{{ realNameStatusText }}
              </p>
              <p v-if="realNameSubmittedAtText" class="text-xs text-gray-400 mt-1">
                提交时间：{{ realNameSubmittedAtText }}
              </p>
              <p v-if="realNameRejectReason" class="text-xs text-red-500 mt-1">
                驳回原因：{{ realNameRejectReason }}
              </p>
            </div>
            <button
              @click="showRealNameModal = true"
              class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
              :disabled="!canSubmitRealName"
            >
              {{ realNameActionText }}
            </button>
            <button
              @click="openVerificationDetail"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
              :disabled="!canViewVerificationDetail || verificationDetailLoading"
            >
              {{ verificationDetailLoading ? '加载中...' : '查看记录' }}
            </button>
          </div>
          <p class="text-sm text-gray-500">完成实名认证后可提升账户可信度并解锁更多能力。</p>
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

    <!-- 修改密码弹窗 -->
    <Teleport to="body">
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
        @click.self="closePasswordModal"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">修改登录密码</h3>
          <div class="space-y-4">
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closePasswordModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="submitPasswordChange"
              class="px-4 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuTextDark"
            >
              确认修改
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 更换手机弹窗 -->
    <Teleport to="body">
      <div
        v-if="showPhoneModal"
        class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
        @click.self="closePhoneModal"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">更换绑定手机</h3>
          <div class="space-y-4">
            <input
              v-model="phoneForm.newPhone"
              type="text"
              placeholder="请输入新手机号"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <input
              v-model="phoneForm.verifyCode"
              type="text"
              placeholder="请输入验证码"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closePhoneModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="submitPhoneChange"
              class="px-4 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuTextDark"
            >
              确认更换
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 更换邮箱弹窗 -->
    <Teleport to="body">
      <div
        v-if="showEmailModal"
        class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
        @click.self="closeEmailModal"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">更换绑定邮箱</h3>
          <div class="space-y-4">
            <input
              v-model="emailForm.newEmail"
              type="email"
              placeholder="请输入新邮箱"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <input
              v-model="emailForm.verifyCode"
              type="text"
              placeholder="请输入验证码"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closeEmailModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="submitEmailChange"
              class="px-4 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuTextDark"
            >
              确认更换
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 实名认证弹窗 -->
    <Teleport to="body">
      <div
        v-if="showRealNameModal"
        class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
        @click.self="closeRealNameModal"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">提交实名认证</h3>
          <div class="space-y-4">
            <input
              v-model="realNameForm.realName"
              type="text"
              placeholder="请输入真实姓名"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
            <input
              v-model="realNameForm.idCardNumber"
              type="text"
              placeholder="请输入18位身份证号"
              maxlength="18"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            />
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closeRealNameModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              :disabled="realNameSubmitting"
            >
              取消
            </button>
            <button
              @click="submitRealNameVerification"
              class="px-4 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuTextDark disabled:opacity-60"
              :disabled="realNameSubmitting"
            >
              {{ realNameSubmitting ? '提交中...' : '确认提交' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 认证记录详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="showVerificationDetailModal"
        class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4"
        @click.self="closeVerificationDetailModal"
      >
        <div class="bg-white rounded-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-4">认证记录详情</h3>
          <div v-if="verificationDetail" class="space-y-3 text-sm text-gray-700">
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">记录ID</span>
              <span class="font-medium">{{ verificationDetail.id }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">认证类型</span>
              <span class="font-medium">{{ verificationDetail.verifyType }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">真实姓名</span>
              <span class="font-medium">{{ verificationDetail.realName }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">身份证号</span>
              <span class="font-medium">{{ verificationDetail.idCardNumber }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">认证状态</span>
              <span class="font-medium">{{ getVerifyStatusText(verificationDetail.verifyStatus) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">提交时间</span>
              <span class="font-medium">{{ formatDateTime(verificationDetail.submittedAt) }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-gray-500">审核时间</span>
              <span class="font-medium">{{ formatDateTime(verificationDetail.reviewedAt) }}</span>
            </div>
            <div
              v-if="verificationDetail.rejectReason"
              class="rounded-lg bg-red-50 border border-red-100 p-3 text-red-600"
            >
              驳回原因：{{ verificationDetail.rejectReason }}
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">暂无认证记录详情</div>
          <div class="mt-6 flex justify-end">
            <button
              @click="closeVerificationDetailModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import {
  changePasswordApi,
  bindPhoneApi,
  bindEmailApi,
  submitRealNameVerificationApi,
  resubmitVerificationApi,
  getVerificationStatusApi,
  getVerificationDetailApi,
  type VerificationStatusItem,
  type VerificationDetailData,
} from '@/api/user'

// 模态框状态
const showPasswordModal = ref(false)
const showPhoneModal = ref(false)
const showEmailModal = ref(false)
const showRealNameModal = ref(false)
const showVerificationDetailModal = ref(false)
const realNameSubmitting = ref(false)
const verificationStatusLoading = ref(false)
const verificationDetailLoading = ref(false)
const userStore = useUserStore()
const verificationStatuses = ref<VerificationStatusItem[]>([])
const verificationDetail = ref<VerificationDetailData | null>(null)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const phoneForm = ref({
  newPhone: '',
  verifyCode: ''
})

const emailForm = ref({
  newEmail: '',
  verifyCode: ''
})

const realNameForm = ref({
  realName: '',
  idCardNumber: '',
})

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

const maskPhone = (phone: string) => {
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')
  if (!name || !domain) return email
  if (name.length <= 2) return `${name[0]}*@${domain}`
  return `${name[0]}***${name[name.length - 1]}@${domain}`
}

const resetPasswordForm = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const resetPhoneForm = () => {
  phoneForm.value = {
    newPhone: '',
    verifyCode: ''
  }
}

const resetEmailForm = () => {
  emailForm.value = {
    newEmail: '',
    verifyCode: ''
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  resetPasswordForm()
}

const closePhoneModal = () => {
  showPhoneModal.value = false
  resetPhoneForm()
}

const closeEmailModal = () => {
  showEmailModal.value = false
  resetEmailForm()
}

const closeRealNameModal = () => {
  showRealNameModal.value = false
  realNameForm.value = {
    realName: '',
    idCardNumber: '',
  }
}

const isRealNameVerified = computed(() => {
  return realNameVerifyStatus.value === 'approved'
})

const realNameVerification = computed(() =>
  verificationStatuses.value.find(
    (item) => item.verifyType === 'real_name' || item.verifyType === 'realname'
  ) || null
)

const realNameVerificationId = computed<number | null>(() => {
  const raw = realNameVerification.value?.id ?? realNameVerification.value?.verificationId
  const id = Number(raw)
  if (!Number.isFinite(id) || id <= 0) return null
  return id
})

const realNameVerifyStatus = computed(() => {
  if (realNameVerification.value?.verifyStatus) {
    return realNameVerification.value.verifyStatus.toLowerCase()
  }
  const status = String(userStore.userStatus || '').toLowerCase()
  if (/verified|已实名|realname|认证通过/.test(status)) return 'approved'
  return ''
})

const isRejectedRealName = computed(
  () => realNameVerifyStatus.value === 'rejected' || realNameVerifyStatus.value === 'reject'
)

const realNameStatusText = computed(() => {
  if (realNameVerifyStatus.value === 'approved') return '已实名'
  if (realNameVerifyStatus.value === 'pending') return '审核中'
  if (isRejectedRealName.value) return '已驳回'
  return '未实名'
})

const realNameRejectReason = computed(() => {
  if (!isRejectedRealName.value) return ''
  return realNameVerification.value?.rejectReason || '无'
})

const realNameSubmittedAtText = computed(() => {
  const raw = realNameVerification.value?.submittedAt
  if (!raw) return ''
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString('zh-CN')
})

const canSubmitRealName = computed(() => {
  if (realNameSubmitting.value || verificationStatusLoading.value) return false
  return realNameVerifyStatus.value !== 'pending' && realNameVerifyStatus.value !== 'approved'
})

const realNameActionText = computed(() => {
  if (verificationStatusLoading.value) return '加载中...'
  if (realNameVerifyStatus.value === 'pending') return '审核中'
  if (realNameVerifyStatus.value === 'approved') return '已认证'
  if (isRejectedRealName.value) return '重新提交'
  return '去认证'
})

const canViewVerificationDetail = computed(() => Boolean(realNameVerificationId.value))

const isValidRealName = (value: string) => /^[\u4e00-\u9fa5a-zA-Z·\s]{2,30}$/.test(value.trim())
const isValidIdCardNumber = (value: string) => /^\d{17}[\dXx]$/.test(value.trim())

const fetchVerificationStatus = async () => {
  verificationStatusLoading.value = true
  try {
    verificationStatuses.value = await getVerificationStatusApi()
  } catch (error) {
    console.error('查询认证状态失败:', error)
    verificationStatuses.value = []
  } finally {
    verificationStatusLoading.value = false
  }
}

const getVerifyStatusText = (status: string) => {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'approved') return '已通过'
  if (normalized === 'pending') return '审核中'
  if (normalized === 'rejected' || normalized === 'reject') return '已驳回'
  return status || '未知'
}

const formatDateTime = (value: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN')
}

const closeVerificationDetailModal = () => {
  showVerificationDetailModal.value = false
}

const openVerificationDetail = async () => {
  if (!realNameVerificationId.value) {
    alert('暂无可查询的认证记录ID')
    return
  }
  verificationDetailLoading.value = true
  try {
    verificationDetail.value = await getVerificationDetailApi(realNameVerificationId.value)
    showVerificationDetailModal.value = true
  } catch (error) {
    alert(error instanceof Error ? error.message : '查询认证记录详情失败')
  } finally {
    verificationDetailLoading.value = false
  }
}

const submitPasswordChange = async () => {
  const { oldPassword, newPassword, confirmPassword } = passwordForm.value
  if (!oldPassword || !newPassword || !confirmPassword) {
    alert('请完整填写密码信息')
    return
  }
  if (newPassword.length < 6) {
    alert('新密码长度不能少于6位')
    return
  }
  if (newPassword !== confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }
  try {
    await changePasswordApi({ oldPassword, newPassword })
    accountInfo.value.lastPasswordChange = new Date().toISOString().slice(0, 10)
    operationLogs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      action: '修改密码',
      ip: '127.0.0.1',
      device: navigator.userAgent.includes('Windows') ? 'Chrome/Windows' : 'Web',
      status: 'success'
    })
    alert('密码修改成功')
    closePasswordModal()
  } catch (error) {
    alert(error instanceof Error ? error.message : '密码修改失败')
  }
}

const submitPhoneChange = async () => {
  const { newPhone, verifyCode } = phoneForm.value
  if (!/^1\d{10}$/.test(newPhone)) {
    alert('请输入正确的11位手机号')
    return
  }
  if (!verifyCode) {
    alert('请输入验证码')
    return
  }
  try {
    await bindPhoneApi({ phone: newPhone, verifyCode })
    accountInfo.value.phone = maskPhone(newPhone)
    operationLogs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      action: '更换手机',
      ip: '127.0.0.1',
      device: navigator.userAgent.includes('Windows') ? 'Chrome/Windows' : 'Web',
      status: 'success'
    })
    alert('手机绑定更换成功')
    closePhoneModal()
  } catch (error) {
    alert(error instanceof Error ? error.message : '手机绑定更换失败')
  }
}

const submitEmailChange = async () => {
  const { newEmail, verifyCode } = emailForm.value
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    alert('请输入正确的邮箱地址')
    return
  }
  if (!verifyCode) {
    alert('请输入验证码')
    return
  }
  try {
    await bindEmailApi({ email: newEmail, verifyCode })
    accountInfo.value.email = maskEmail(newEmail)
    operationLogs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      action: '更换邮箱',
      ip: '127.0.0.1',
      device: navigator.userAgent.includes('Windows') ? 'Chrome/Windows' : 'Web',
      status: 'success'
    })
    alert('邮箱绑定更换成功')
    closeEmailModal()
  } catch (error) {
    alert(error instanceof Error ? error.message : '邮箱绑定更换失败')
  }
}

const submitRealNameVerification = async () => {
  if (!canSubmitRealName.value) return
  const realName = realNameForm.value.realName.trim()
  const idCardNumber = realNameForm.value.idCardNumber.trim().toUpperCase()

  if (!isValidRealName(realName)) {
    alert('请输入正确的真实姓名')
    return
  }
  if (!isValidIdCardNumber(idCardNumber)) {
    alert('请输入正确的18位身份证号')
    return
  }

  realNameSubmitting.value = true
  try {
    if (isRejectedRealName.value && realNameVerificationId.value) {
      await resubmitVerificationApi(realNameVerificationId.value, { realName, idCardNumber })
    } else {
      await submitRealNameVerificationApi({ realName, idCardNumber })
    }
    await fetchVerificationStatus()
    await userStore.loadUserSecurityInfo()
    operationLogs.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      action: isRejectedRealName.value ? '重新提交实名认证' : '提交实名认证',
      ip: '127.0.0.1',
      device: navigator.userAgent.includes('Windows') ? 'Chrome/Windows' : 'Web',
      status: 'success',
    })
    alert(isRejectedRealName.value ? '实名认证重新提交成功' : '实名认证提交成功')
    closeRealNameModal()
  } catch (error) {
    alert(error instanceof Error ? error.message : '实名认证提交失败')
  } finally {
    realNameSubmitting.value = false
  }
}

onMounted(() => {
  void fetchVerificationStatus()
  void userStore.loadUserSecurityInfo()
})
</script>