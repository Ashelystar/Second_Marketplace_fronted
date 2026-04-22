<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <a href="#" class="logo" @click.prevent="router.push('/')">
            <i class="fa fa-fish"></i>
            <span>荔园交易</span>
          </a>
          <span class="title">地址管理</span>
        </div>

        <div class="searchBox">
          <div class="searchRow">
            <input
              type="text"
              v-model="searchInput"
              placeholder="搜索闲置物品"
              @keypress.enter="performSearch"
            />
            <button @click="performSearch"><i class="fa fa-search"></i></button>
          </div>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/forum')"><i class="fa fa-comments"></i> 社区</a>
          <a href="#" @click.prevent="router.push('/cart')"><i class="fa fa-shopping-cart"></i> 购物车</a>
          <a href="#" @click.prevent="router.push('/message')"><i class="fa fa-bell"></i> 消息</a>
          <template v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="router.push('/user/center')"><i class="fa fa-user"></i> 我的</a>
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 主内容区 - 左右布局 -->
    <div class="mainContent">
      <!-- 左侧 - 地址列表 -->
      <div class="leftPanel">
        <div class="panelHeader">
          <h3>我的地址</h3>
          <span class="addressCount">{{ addressList.length }} 个地址</span>
        </div>

        <div class="addressList" v-if="addressList.length > 0">
          <div 
            class="addressItem" 
            v-for="addr in addressList" 
            :key="addr.id"
            :class="{ selected: selectedId === addr.id }"
            @click="selectAddress(addr)"
          >
            <div class="addressContent">
              <div class="addressTop">
                <span class="receiver">{{ addr.receiver }}</span>
                <span class="phone">{{ formatPhone(addr.phone) }}</span>
                <span class="defaultTag" v-if="addr.isDefault">默认</span>
              </div>
              <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
            </div>
            <div class="actions">
              <button 
                class="actionBtn setDefault" 
                @click.stop="setDefault(addr.id)" 
                v-if="!addr.isDefault"
              >
                <i class="fa fa-star"></i>
              </button>
              <button class="actionBtn edit" @click.stop="editAddress(addr)">
                <i class="fa fa-edit"></i>
              </button>
              <button class="actionBtn delete" @click.stop="deleteAddress(addr.id)">
                <i class="fa fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="emptyState">
          <i class="fa fa-map-marker-alt"></i>
          <p>暂无收货地址</p>
          <p class="emptyHint">在右侧添加新地址</p>
        </div>
      </div>

      <!-- 右侧 - 地址编辑表单 -->
      <div class="rightPanel">
        <div class="panelHeader">
          <h3>{{ editingId ? '编辑地址' : '添加新地址' }}</h3>
        </div>

        <div class="formContent">
          <div class="formItem">
            <label class="formLabel">收货人</label>
            <input 
              type="text" 
              v-model="formData.receiver" 
              placeholder="请输入收货人姓名"
              class="formInput"
              maxlength="20"
            />
          </div>
          <div class="formItem">
            <label class="formLabel">手机号码</label>
            <input 
              type="tel" 
              v-model="formData.phone" 
              placeholder="请输入手机号码"
              class="formInput"
              maxlength="11"
            />
          </div>
          <div class="formItem">
            <label class="formLabel">所在地区</label>
            <div class="regionPicker">
              <select v-model="formData.province" class="formSelect" @change="onProvinceChange">
                <option value="">请选择省</option>
                <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
              </select>
              <select v-model="formData.city" class="formSelect" @change="onCityChange">
                <option value="">请选择市</option>
                <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
              </select>
              <select v-model="formData.district" class="formSelect">
                <option value="">请选择区</option>
                <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>
          <div class="formItem">
            <label class="formLabel">详细地址</label>
            <textarea 
              v-model="formData.detail" 
              placeholder="请输入详细地址，如街道、门牌号等"
              class="formTextarea"
              rows="2"
              maxlength="100"
            ></textarea>
          </div>
          <div class="formItem">
            <label class="formLabel checkboxLabel">
              <input type="checkbox" v-model="formData.isDefault" class="checkbox" />
              <span>设为默认地址</span>
            </label>
          </div>
          <div class="formActions">
            <button class="cancelBtn" @click="resetForm" v-if="editingId">取消</button>
            <button class="saveBtn" @click="submitForm" :disabled="!isFormValid">
              {{ editingId ? '保存修改' : '添加地址' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

defineOptions({ name: 'AddressPage' })

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchInput = ref('')

const performSearch = () => {
  if (searchInput.value.trim()) {
    router.push({ path: '/search', query: { q: searchInput.value.trim() } })
  }
}

const handleLogin = () => {
  router.push('/user/login')
}

interface Address {
  id: number
  receiver: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const addressList = ref<Address[]>([])
const editingId = ref<number | null>(null)
const selectedId = ref<number | null>(null)

// 手机号脱敏处理
const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const formData = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 省份数据
const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '河南省', '山东省']

// 城市数据
const cityData: Record<string, string[]> = {
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '广东省': ['广州市', '深圳市', '东莞市', '佛山市', '珠海市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
  '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市', '黄石市', '荆州市'],
  '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
  '河南省': ['郑州市', '洛阳市', '开封市', '安阳市', '新乡市'],
  '山东省': ['济南市', '青岛市', '烟台市', '威海市', '潍坊市']
}

// 区县数据
const districtData = ['市区', '新区', '开发区', '高新区', '工业园']

const cities = computed(() => {
  if (!formData.value.province) return []
  return cityData[formData.value.province] || []
})

const districts = computed(() => {
  if (!formData.value.city) return []
  return districtData
})

const isFormValid = computed(() => {
  const phoneReg = /^1[3-9]\d{9}$/
  return formData.value.receiver.trim() !== '' &&
    phoneReg.test(formData.value.phone) &&
    formData.value.province !== '' &&
    formData.value.city !== '' &&
    formData.value.district !== '' &&
    formData.value.detail.trim() !== ''
})

const onProvinceChange = () => {
  formData.value.city = ''
  formData.value.district = ''
}

const onCityChange = () => {
  formData.value.district = ''
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const editAddress = (addr: Address) => {
  editingId.value = addr.id
  formData.value = { ...addr }
}

const resetForm = () => {
  editingId.value = null
  formData.value = {
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  }
}

const submitForm = () => {
  if (!isFormValid.value) {
    alert('请填写完整信息')
    return
  }

  if (editingId.value !== null) {
    // 编辑模式
    const index = addressList.value.findIndex(a => a.id === editingId.value)
    if (index !== -1) {
      if (formData.value.isDefault) {
        addressList.value.forEach(a => a.isDefault = false)
      }
      addressList.value[index] = { ...formData.value, id: editingId.value }
    }
  } else {
    // 新增模式
    const newId = Math.max(0, ...addressList.value.map(a => a.id)) + 1
    if (formData.value.isDefault) {
      addressList.value.forEach(a => a.isDefault = false)
    }
    addressList.value.push({ ...formData.value, id: newId })
  }

  resetForm()
  alert('保存成功')
}

const deleteAddress = (id: number) => {
  if (confirm('确定删除该地址吗？')) {
    addressList.value = addressList.value.filter(a => a.id !== id)
    if (editingId.value === id) {
      resetForm()
    }
  }
}

const setDefault = (id: number) => {
  addressList.value.forEach(a => {
    a.isDefault = a.id === id
  })
  alert('已设为默认地址')
}

const selectAddress = (addr: Address) => {
  selectedId.value = addr.id
  if (route.query.returnTo === 'checkout') {
    localStorage.setItem('selectedAddress', JSON.stringify(addr))
    router.back()
  }
}

onMounted(() => {
  // 检查是否有从编辑页面返回的数据
  const formDataStr = localStorage.getItem('addressFormData')
  if (formDataStr) {
    try {
      const data = JSON.parse(formDataStr)
      const index = addressList.value.findIndex(a => a.id === data.id)
      if (index !== -1) {
        // 编辑
        if (data.isDefault) {
          addressList.value.forEach(a => a.isDefault = false)
        }
        addressList.value[index] = data
      } else {
        // 新增
        if (data.isDefault) {
          addressList.value.forEach(a => a.isDefault = false)
        }
        addressList.value.push(data)
      }
      localStorage.removeItem('addressFormData')
    } catch (e) {
      console.error('解析地址数据失败', e)
    }
  }

  // 模拟加载已有地址
  if (addressList.value.length === 0) {
    addressList.value = [
      {
        id: 1,
        receiver: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detail: '望京SOHO大厦T3-1801',
        isDefault: true
      },
      {
        id: 2,
        receiver: '李四',
        phone: '13900139000',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detail: '环球金融中心1001',
        isDefault: false
      }
    ]
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.top {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.topInner {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #374151;
  font-size: 18px;
}

.title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #f97316;
  font-weight: bold;
}

.logo i {
  font-size: 20px;
}

.searchBox {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.searchRow {
  display: flex;
}

.searchRow input {
  flex: 1;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-right: none;
  border-radius: 18px 0 0 18px;
  background: #f3f4f6;
  outline: none;
  font-size: 13px;
}

.searchRow input:focus {
  background: #fff;
}

.searchRow button {
  width: 44px;
  height: 36px;
  border: none;
  border-radius: 0 18px 18px 0;
  background: #f97316;
  color: #fff;
  cursor: pointer;
}

.navLinks {
  display: flex;
  gap: 16px;
}

.navLinks a {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
}

.navLinks a:hover {
  color: #f97316;
}

/* 主内容区 */
.mainContent {
  display: flex;
  gap: 20px;
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: calc(100vh - 80px);
}

/* 左侧面板 */
.leftPanel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
}

.panelHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.panelHeader h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.addressCount {
  font-size: 13px;
  color: #9ca3af;
}

.addressList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addressItem {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.addressItem:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.addressItem.selected {
  background: #fef7f0;
  border-color: #f97316;
}

.addressContent {
  flex: 1;
  min-width: 0;
}

.addressTop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.receiver {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.phone {
  font-size: 13px;
  color: #6b7280;
}

.defaultTag {
  font-size: 10px;
  color: #fff;
  background: #f97316;
  padding: 2px 6px;
  border-radius: 4px;
}

.addressDetail {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 6px;
}

.actionBtn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
}

.actionBtn:hover {
  background: #e5e7eb;
}

.actionBtn.setDefault:hover {
  background: #fffbeb;
  color: #d97706;
}

.actionBtn.edit:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.actionBtn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* 空状态 */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.emptyState i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.emptyState p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.emptyHint {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 右侧面板 */
.rightPanel {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
}

.formContent {
  padding-top: 4px;
}

.formItem {
  margin-bottom: 16px;
}

.formItem:last-child {
  margin-bottom: 0;
}

.formLabel {
  display: block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
  font-weight: 500;
}

.formInput {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  box-sizing: border-box;
  transition: border-color 150ms;
}

.formInput:focus {
  border-color: #f97316;
}

.formInput::placeholder {
  color: #9ca3af;
}

.regionPicker {
  display: flex;
  gap: 8px;
}

.formSelect {
  flex: 1;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #1f2937;
  background: #fff;
  outline: none;
  cursor: pointer;
}

.formSelect:focus {
  border-color: #f97316;
}

.formTextarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  resize: none;
  box-sizing: border-box;
  transition: border-color 150ms;
}

.formTextarea:focus {
  border-color: #f97316;
}

.formTextarea::placeholder {
  color: #9ca3af;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: #f97316;
}

.formActions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.cancelBtn {
  flex: 1;
  height: 44px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 22px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 150ms;
}

.cancelBtn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.saveBtn {
  flex: 2;
  height: 44px;
  background: #f97316;
  border: none;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 150ms;
}

.saveBtn:hover:not(:disabled) {
  background: #ea580c;
}

.saveBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 900px) {
  .mainContent {
    flex-direction: column;
  }

  .rightPanel {
    width: 100%;
  }

  .topInner {
    flex-wrap: wrap;
  }

  .searchBox {
    order: 3;
    max-width: none;
    margin: 10px 0 0 0;
    flex-basis: 100%;
  }
}

@media (max-width: 600px) {
  .navLinks {
    display: none;
  }

  .logo span {
    display: none;
  }
}
</style>
