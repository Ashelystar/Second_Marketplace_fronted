<template>
  <div class="address-management">
    <!-- 页面标题和新建按钮 -->
    <div class="pageHeader">
      <h2 class="pageTitle">
        <i class="fa fa-map-marker-alt"></i>
        地址管理
      </h2>
      <button class="addBtn" @click="openAddModal">
        <i class="fa fa-plus"></i>
        新建地址
      </button>
    </div>

    <!-- 新增/编辑地址弹框 -->
    <div v-if="showModal" class="modalOverlay">
      <div class="modalContainer">
        <div class="modalHeader">
          <h3>{{ isEditing ? '编辑收货地址' : '新增收货地址' }}</h3>
          <button class="closeBtn" @click="closeModal">×</button>
        </div>
        <div class="modalBody">
          <form @submit.prevent="saveAddress">
            <div class="formGroup">
              <label>收货人姓名</label>
              <input 
                type="text" 
                v-model="currentAddress.receiverName" 
                placeholder="请输入收货人姓名" 
                required
              >
            </div>
            
            <div class="formGroup">
              <label>手机号码</label>
              <input 
                type="tel" 
                v-model="currentAddress.receiverPhone" 
                placeholder="请输入11位手机号码" 
                pattern="\d{11}"
                maxlength="11"
                required
              >
            </div>
            
            <div class="formRow">
              <div class="formGroup">
                <label>省份</label>
                <input 
                  type="text" 
                  v-model="currentAddress.province" 
                  placeholder="省/自治区/直辖市" 
                  required
                >
              </div>
              
              <div class="formGroup">
                <label>城市</label>
                <input 
                  type="text" 
                  v-model="currentAddress.city" 
                  placeholder="城市" 
                  required
                >
              </div>
            </div>
            
            <div class="formRow">
              <div class="formGroup">
                <label>区/县</label>
                <input 
                  type="text" 
                  v-model="currentAddress.district" 
                  placeholder="区/县" 
                  required
                >
              </div>
            </div>
            
            <div class="formGroup">
              <label>详细地址</label>
              <textarea 
                v-model="currentAddress.detailAddress" 
                placeholder="请输入详细地址，如街道、小区、楼栋、房间号等" 
                rows="3"
                required
              ></textarea>
            </div>
            
            <div class="formGroup checkboxGroup">
              <label>
                <input 
                  type="checkbox" 
                  v-model="currentAddress.isDefault"
                >
                设为默认地址
              </label>
            </div>
            
            <div class="modalActions">
              <button type="button" class="cancelBtn" @click="closeModal">取消</button>
              <button type="submit" class="submitBtn" :disabled="saving">
                {{ saving ? '保存中...' : (isEditing ? '更新地址' : '保存地址') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loadingState">
      <i class="fa fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <!-- 地址列表 -->
    <div v-else>
      <div class="addressList" v-if="addressList.length > 0">
        <div 
          class="addressItem" 
          v-for="addr in addressList" 
          :key="addr.id"
          :class="{ isDefault: addr.isDefault }"
        >
          <div class="addressContent">
            <div class="addressTop">
              <span class="receiver">{{ addr.receiverName }}</span>
              <span class="phone">{{ formatPhone(addr.receiverPhone) }}</span>
              <span class="defaultTag" v-if="addr.isDefault">默认</span>
            </div>
            <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detailAddress }}</div>
          </div>
          <div class="actions">
            <button class="actionBtn setDefault" @click="setDefault(addr.id)" v-if="!addr.isDefault" title="设为默认">
              <i class="fa fa-star"></i>
            </button>
            <button class="actionBtn edit" @click="openEditModal(addr)" title="编辑">
              <i class="fa fa-edit"></i>
            </button>
            <button class="actionBtn delete" @click="deleteAddress(addr.id)" title="删除">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="emptyState">
        <i class="fa fa-map-marker-alt"></i>
        <p>暂无收货地址</p>
        <button class="addBtn" @click="openAddModal">
          <i class="fa fa-plus"></i>
          添加第一个地址
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

defineOptions({ name: 'UserAddress' })

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const addressList = ref<Address[]>([])

// 定义地址接口
interface Address {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

// API响应接口
interface ApiResponse {
  code: number
  message: string
  data: Address[]
}

// 当前正在编辑/新增的地址
const currentAddress = reactive({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false
})

// 手机号脱敏处理
const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取地址列表
const fetchAddresses = async () => {
  loading.value = true
  try {
    const response = await axios.get<ApiResponse>('/api/user/addresses', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data.code === 200) {
      addressList.value = response.data.data
    } else {
      console.error('获取地址失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取地址异常:', error)
  } finally {
    loading.value = false
  }
}

// 打开新增地址弹框
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  resetCurrentAddress()
  showModal.value = true
}

// 打开编辑地址弹框
const openEditModal = (address: Address) => {
  isEditing.value = true
  editingId.value = address.id
  
  // 用选中的地址信息填充表单
  Object.assign(currentAddress, {
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    province: address.province,
    city: address.city,
    district: address.district,
    detailAddress: address.detailAddress,
    isDefault: address.isDefault
  })
  
  showModal.value = true
}

// 重置当前地址表单
const resetCurrentAddress = () => {
  Object.assign(currentAddress, {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false
  })
}

// 保存地址（新增或编辑）
const saveAddress = async () => {
  // 表单验证
  if (!currentAddress.receiverName.trim()) {
    alert('请输入收货人姓名')
    return
  }
  if (!/^\d{11}$/.test(currentAddress.receiverPhone)) {
    alert('请输入正确的11位手机号码')
    return
  }
  if (!currentAddress.province.trim() || !currentAddress.city.trim() || !currentAddress.district.trim()) {
    alert('请完善省市区信息')
    return
  }
  if (!currentAddress.detailAddress.trim()) {
    alert('请输入详细地址')
    return
  }

  saving.value = true
  try {
    let response
    
    if (isEditing.value && editingId.value) {
      // 编辑地址 - 使用PUT请求
      response = await axios.put(`/api/user/address/${editingId.value}`, currentAddress, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
    } else {
      // 新增地址 - 使用POST请求
      response = await axios.post('/api/user/address', currentAddress, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
    }

    console.log('保存地址响应:', response.data)
    if (response.data.code === 200) {
      // 保存成功
      closeModal()
      await fetchAddresses() // 重新加载地址列表
      alert(isEditing.value ? '地址更新成功' : '地址添加成功')
    } else {
      alert(`${isEditing.value ? '更新' : '添加'}失败: ${response.data.message}`)
    }
  } catch (error) {
    console.error('保存地址失败:', error)
    alert('网络错误，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 关闭弹框
const closeModal = () => {
  showModal.value = false
  resetCurrentAddress()
  isEditing.value = false
  editingId.value = null
}

// 删除地址
const deleteAddress = async (id: number) => {
  console.log('删除地址ID:', id)
  if (confirm('确定删除该地址吗？')) {
    try {
      await axios.delete(`/api/user/address/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log('地址删除成功:', id)
      await fetchAddresses()
    } catch (error) {
      console.error('删除地址失败:', error)
    }
  }
}

// 设为默认地址
const setDefault = async (id: number) => {
  console.log('设置默认地址ID:', id)
  try {
    await axios.put(`/api/user/address/${id}/default`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    await fetchAddresses()
  } catch (error) {
    console.error('设置默认地址失败:', error)
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.address-management {
  padding: 0;
  position: relative;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pageTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.pageTitle i {
  color: #f97316;
}

.addBtn {
  padding: 10px 18px;
  background: #f97316;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 200ms;
}

.addBtn:hover {
  background: #ea580c;
}

/* 弹框样式 */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modalContainer {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modalHeader h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.closeBtn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.closeBtn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modalBody {
  padding: 24px;
}

.formGroup {
  margin-bottom: 20px;
}

.formGroup label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.formGroup input,
.formGroup textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 200ms;
  box-sizing: border-box;
}

.formGroup input:focus,
.formGroup textarea:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.formRow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.checkboxGroup {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkboxGroup input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.checkboxGroup label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  cursor: pointer;
}

.modalActions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.modalActions button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms;
}

.cancelBtn {
  background: #f3f4f6;
  color: #374151;
}

.cancelBtn:hover {
  background: #e5e7eb;
}

.submitBtn {
  background: #f97316;
  color: white;
}

.submitBtn:hover:not(:disabled) {
  background: #ea580c;
}

.submitBtn:disabled {
  background: #fbbf94;
  cursor: not-allowed;
}

.addressList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addressItem {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #e5e7eb;
  transition: all 150ms;
}

.addressItem:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.addressItem.isDefault {
  border-color: #f97316;
  background: #fef7f0;
}

.addressContent {
  flex: 1;
  min-width: 0;
}

.addressTop {
  display: flex;
  align-items: center;
  gap: 10px;
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
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.addressDetail {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.actionBtn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
  font-size: 13px;
}

.actionBtn:hover {
  background: #e5e7eb;
}

.actionBtn.edit:hover {
  background: #eff6ff;
  color: #3b82f6;
}

.actionBtn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.actionBtn.setDefault:hover {
  background: #fffbeb;
  color: #d97706;
}

/* 空状态 */
.emptyState {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.emptyState i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.emptyState p {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
}

/* 加载状态样式 */
.loadingState {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.loadingState i {
  font-size: 32px;
  color: #f97316;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.loadingState p {
  font-size: 14px;
  color: #6b7280;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>