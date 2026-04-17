<template>
  <div>
    <!-- 页面标题 -->
    <div class="user-page-card p-6 mb-6">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-user-circle text-xianyuText"></i>
        个人资料
      </h1>
      
      <!-- 基本信息 -->
      <div class="max-w-3xl">
        <!-- 头像上传 -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-3">头像</label>
          <div class="flex items-center gap-6">
            <div class="relative">
              <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow">
                <img 
                  v-if="user.avatar" 
                  :src="user.avatar" 
                  alt="头像"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center text-white text-3xl">
                  {{ user.nickname?.charAt(0) || '用' }}
                </div>
              </div>
              <label for="avatar-upload" class="absolute bottom-0 right-0 w-8 h-8 bg-xianyuText text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-xianyuText/90">
                <i class="fa fa-camera text-sm"></i>
                <input 
                  id="avatar-upload" 
                  ref="avatarUpload"
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleAvatarUpload"
                >
              </label>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">支持 jpg、png 格式，大小不超过 2MB</p>
              <button 
                type="button"
                @click="avatarUpload?.click()"
                class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                更换头像
              </button>
            </div>
          </div>
        </div>
        
        <!-- 个人资料表单 -->
        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- 昵称 -->
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <input
              id="nickname"
              v-model="user.nickname"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              placeholder="请输入昵称"
              maxlength="20"
            >
            <p class="mt-1 text-sm text-gray-500">昵称长度为2-20个字符</p>
          </div>
          
          <!-- 用户名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <input
              id="username"
              v-model="user.username"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              placeholder="请输入用户名"
              disabled
            >
            <p class="mt-1 text-sm text-gray-500">用户名不可修改</p>
          </div>
          
          <!-- 性别 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input 
                  v-model="user.gender" 
                  type="radio" 
                  value="male" 
                  class="mr-2"
                >
                <span>男</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="user.gender" 
                  type="radio" 
                  value="female" 
                  class="mr-2"
                >
                <span>女</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="user.gender" 
                  type="radio" 
                  value="secret" 
                  class="mr-2"
                >
                <span>保密</span>
              </label>
            </div>
          </div>
          
          <!-- 生日 -->
          <div>
            <label for="birthday" class="block text-sm font-medium text-gray-700 mb-2">生日</label>
            <input
              id="birthday"
              v-model="user.birthday"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
            >
          </div>
          
          <!-- 所在地 -->
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">所在地</label>
            <div class="grid grid-cols-2 gap-4">
              <select 
                v-model="user.province"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              >
                <option value="">请选择省份</option>
                <option v-for="province in provinces" :key="province" :value="province">{{ province }}</option>
              </select>
              <select 
                v-model="user.city"
                :disabled="!user.province"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              >
                <option value="">请选择城市</option>
                <option v-for="city in getCities(user.province)" :key="city" :value="city">{{ city }}</option>
              </select>
            </div>
          </div>
          
          <!-- 个性签名 -->
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">个性签名</label>
            <textarea
              id="bio"
              v-model="user.bio"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xianyuText focus:border-transparent"
              placeholder="介绍一下自己吧～"
              maxlength="100"
            ></textarea>
            <div class="flex justify-between mt-1">
              <p class="text-sm text-gray-500">最多100个字符</p>
              <span class="text-sm" :class="user.bio.length > 100 ? 'text-red-500' : 'text-gray-500'">
                {{ user.bio.length }}/100
              </span>
            </div>
          </div>
          
          <!-- 保存按钮 -->
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              @click="resetForm"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button 
              type="submit"
              class="px-6 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuText/90"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 账号安全卡片 -->
    <div class="user-page-card p-6">
      <h3 class="font-semibold text-lg mb-4">账号安全</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i class="fa fa-phone text-blue-600"></i>
            </div>
            <div>
              <p class="font-medium">手机绑定</p>
              <p class="text-sm text-gray-500">{{ user.phone || '未绑定' }}</p>
            </div>
          </div>
          <button 
            @click="$router.push('/user/setting')"
            class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
          >
            管理
          </button>
        </div>
        
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i class="fa fa-envelope text-green-600"></i>
            </div>
            <div>
              <p class="font-medium">邮箱绑定</p>
              <p class="text-sm text-gray-500">{{ user.email || '未绑定' }}</p>
            </div>
          </div>
          <button 
            @click="$router.push('/user/setting')"
            class="px-4 py-2 text-xianyuText border border-xianyuText rounded-lg hover:bg-xianyuText/5"
          >
            管理
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟数据
let originalUser = {
  avatar: '',
  nickname: '小明同学',
  username: 'xiaoming123',
  gender: 'male',
  birthday: '1995-05-15',
  province: '广东省',
  city: '广州市',
  bio: '热爱生活，喜欢分享，让闲置物品找到新主人！',
  phone: '138****5678',
  email: 'xiaoming@example.com'
}

const user = ref({ ...originalUser })
const avatarUpload = ref<HTMLInputElement | null>(null)

// 省份城市数据
const provinces = ref([
  '北京市', '上海市', '天津市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省',
  '青海省', '台湾省', '内蒙古自治区', '广西壮族自治区',
  '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'
])

const cities = {
  '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
  '北京市': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区', '崇明区']
  // 其他省份的城市数据...
}

const getCities = (province: string) => {
  return cities[province as keyof typeof cities] || []
}

const handleAvatarUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = () => {
  // 这里调用API保存用户资料
  console.log('保存用户资料:', user.value)
  alert('资料保存成功！')
  originalUser = { ...user.value }
}

const resetForm = () => {
  if (confirm('确定要放弃修改吗？所有未保存的更改都会丢失。')) {
    user.value = { ...originalUser }
  }
}

onMounted(() => {
  // 这里可以加载用户资料
})
</script>