<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="title">地址管理</span>
        </div>
      </div>
    </div>

    <!-- 地址列表 -->
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
            <span class="phone">{{ addr.phone }}</span>
            <span class="defaultTag" v-if="addr.isDefault">默认</span>
          </div>
          <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</div>
        </div>
        <div class="actions">
          <button 
            class="defaultBtn" 
            @click.stop="setDefault(addr.id)" 
            v-if="!addr.isDefault"
          >
            <i class="fa fa-star"></i>
            设为默认
          </button>
          <div class="defaultActions" v-else>
            <span class="defaultBadge">
              <i class="fa fa-check-circle"></i>
              默认
            </span>
            <button class="cancelDefaultBtn" @click.stop="cancelDefault(addr.id)">
              取消默认
            </button>
          </div>
          <button class="editBtn" @click.stop="editAddress(addr)">
            <i class="fa fa-edit"></i>
            编辑
          </button>
          <button class="deleteBtn" @click.stop="deleteAddress(addr.id)">
            <i class="fa fa-trash-alt"></i>
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="emptyState">
      <div class="emptyIcon">
        <i class="fa fa-map-marker-alt"></i>
      </div>
      <p class="emptyText">暂无收货地址</p>
      <p class="emptyHint">添加收货地址方便您购物</p>
    </div>

    <!-- 添加/编辑地址表单 -->
    <div class="modal" v-if="showForm" @click.self="closeForm">
      <div class="modalContent formModal">
        <div class="modalHeader">
          <span class="modalTitle">{{ isEditing ? '编辑地址' : '添加新地址' }}</span>
          <button class="closeBtn" @click="closeForm">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modalBody">
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
          <button class="submitBtn" @click="submitForm" :disabled="!isFormValid">
            保存地址
          </button>
        </div>
      </div>
    </div>

    <!-- 底部添加按钮 -->
    <div class="bottomBar" v-if="!showForm">
      <button class="addBtn" @click="openAddForm">
        <i class="fa fa-plus"></i>
        添加新地址
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineOptions({ name: 'AddressPage' })

const router = useRouter()
const route = useRoute()

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
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const selectedId = ref<number | null>(null)

const formData = ref({
  receiver: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 省份数据（简化版）
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

// 区县数据（简化版，每个城市用同一套区县）
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
  return formData.value.receiver.trim() !== '' &&
    formData.value.phone.trim() !== '' &&
    formData.value.phone.length === 11 &&
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

const openAddForm = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = {
    receiver: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: addressList.value.length === 0
  }
  showForm.value = true
}

const editAddress = (addr: Address) => {
  isEditing.value = true
  editingId.value = addr.id
  formData.value = { ...addr }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  isEditing.value = false
  editingId.value = null
}

const submitForm = () => {
  if (!isFormValid.value) {
    alert('请填写完整信息')
    return
  }

  // 验证手机号格式
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(formData.value.phone)) {
    alert('请输入正确的手机号码')
    return
  }

  if (isEditing.value && editingId.value !== null) {
    // 编辑模式
    const index = addressList.value.findIndex(a => a.id === editingId.value)
    if (index !== -1) {
      // 如果设为默认，取消其他默认
      if (formData.value.isDefault) {
        addressList.value.forEach(a => a.isDefault = false)
      }
      addressList.value[index] = { ...formData.value, id: editingId.value }
    }
  } else {
    // 新增模式
    const newId = Math.max(0, ...addressList.value.map(a => a.id)) + 1
    // 如果设为默认，取消其他默认
    if (formData.value.isDefault) {
      addressList.value.forEach(a => a.isDefault = false)
    }
    addressList.value.push({ ...formData.value, id: newId })
  }

  closeForm()
  alert('保存成功')
}

const deleteAddress = (id: number) => {
  if (confirm('确定删除该地址吗？')) {
    addressList.value = addressList.value.filter(a => a.id !== id)
  }
}

const setDefault = (id: number) => {
  addressList.value.forEach(a => {
    a.isDefault = a.id === id
  })
  alert('已设为默认地址')
}

const cancelDefault = (id: number) => {
  const addr = addressList.value.find(a => a.id === id)
  if (addr) {
    addr.isDefault = false
    alert('已取消默认地址')
  }
}

const selectAddress = (addr: Address) => {
  selectedId.value = addr.id
  // 如果是从确认订单页面跳转来的，选择后返回
  if (route.query.returnTo === 'checkout') {
    // 将选中的地址信息通过 localStorage 传递
    localStorage.setItem('selectedAddress', JSON.stringify(addr))
    router.back()
  }
}

onMounted(() => {
  // 模拟加载已有地址
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
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

/* 顶部导航 */
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

/* 地址列表 */
.addressList {
  padding: 12px;
}

.addressItem {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.addressItem.selected {
  background: #fef7f0;
  border: 1px solid #f97316;
}

.addressContent {
  flex: 1;
  min-width: 0;
}

.addressTop {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.receiver {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.phone {
  font-size: 14px;
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
  gap: 8px;
  align-items: center;
}

.editBtn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.editBtn:hover {
  border-color: #f97316;
  color: #f97316;
}

.deleteBtn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #fca5a5;
  border-radius: 14px;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 150ms;
}

.deleteBtn:hover {
  background: #fef2f2;
}

.defaultBtn {
  padding: 6px 12px;
  background: none;
  border: 1px solid #fbbf24;
  border-radius: 14px;
  color: #d97706;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 150ms;
}

.defaultBtn:hover {
  background: #fffbeb;
  border-color: #f59e0b;
}

.defaultBtn i {
  color: #fbbf24;
}

.defaultBadge {
  font-size: 12px;
  color: #f97316;
  display: flex;
  align-items: center;
  gap: 4px;
}

.defaultBadge i {
  font-size: 14px;
}

.defaultActions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cancelDefaultBtn {
  padding: 6px 10px;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  color: #6b7280;
  font-size: 11px;
  cursor: pointer;
  transition: all 150ms;
}

.cancelDefaultBtn:hover {
  border-color: #f97316;
  color: #f97316;
}

/* 空状态 */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.emptyIcon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.emptyIcon i {
  font-size: 40px;
  color: #9ca3af;
}

.emptyText {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px;
}

.emptyHint {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

/* 底部栏 */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

.addBtn {
  width: 100%;
  height: 48px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.addBtn:hover {
  background: #ea580c;
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modalContent {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
}

.formModal {
  max-height: 90vh;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.modalTitle {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.closeBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 18px;
}

.modalBody {
  padding: 16px;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
}

.formItem {
  margin-bottom: 16px;
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
  height: 44px;
  padding: 0 14px;
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
  height: 44px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
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
  padding: 12px 14px;
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
  width: 20px;
  height: 20px;
  accent-color: #f97316;
}

.submitBtn {
  width: 100%;
  height: 48px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background 200ms;
}

.submitBtn:hover:not(:disabled) {
  background: #ea580c;
}

.submitBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
