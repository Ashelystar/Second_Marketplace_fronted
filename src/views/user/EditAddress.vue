<template>
  <div class="edit-address-page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="pageTitle">{{ isEditing ? '编辑地址' : '新建地址' }}</span>
        </div>
        <div class="right">
          <button class="actionBtn cancelBtn" @click="goBack">取消</button>
          <button class="actionBtn saveBtn" @click="submitForm">保存</button>
        </div>
      </div>
    </div>

    <!-- 表单内容 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

defineOptions({ name: 'EditAddress' })

const router = useRouter()
const route = useRoute()

interface Address {
  id?: number
  receiver: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

const isEditing = computed(() => !!route.query.id)

const formData = ref<Address>({
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
    router.push('/address')
  }
}

const submitForm = () => {
  if (!isFormValid.value) {
    alert('请填写完整信息')
    return
  }

  // 将地址数据传递给父页面
  const addressData = {
    ...formData.value,
    id: isEditing.value ? Number(route.query.id) : Date.now()
  }
  
  if (route.query.from === 'checkout') {
    // 从确认订单页面来的，保存后直接返回确认订单页
    localStorage.setItem('selectedAddress', JSON.stringify(addressData))
    router.push('/checkout')
  } else {
    // 从地址管理页面来的，保存数据后返回
    localStorage.setItem('addressFormData', JSON.stringify(addressData))
    router.push('/address')
  }
}

onMounted(() => {
  // 如果是编辑模式，从 localStorage 获取编辑的数据
  const editData = localStorage.getItem('editingAddress')
  if (editData) {
    try {
      const addr = JSON.parse(editData)
      formData.value = { ...addr }
      localStorage.removeItem('editingAddress')
    } catch (e) {
      console.error('解析编辑数据失败', e)
    }
  }
})
</script>

<style scoped>
.edit-address-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
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

.right {
  display: flex;
  gap: 8px;
}

.actionBtn {
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 150ms;
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

.pageTitle {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

/* 表单内容 */
.formContent {
  flex: 1;
  padding: 16px;
  background: #fff;
  margin: 12px;
  border-radius: 12px;
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

/* 右上角按钮样式 */
.cancelBtn {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}

.cancelBtn:hover {
  border-color: #d1d5db;
  color: #374151;
}

.saveBtn {
  background: #f97316;
  border: none;
  color: #fff;
}

.saveBtn:hover:not(:disabled) {
  background: #ea580c;
}

.saveBtn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
