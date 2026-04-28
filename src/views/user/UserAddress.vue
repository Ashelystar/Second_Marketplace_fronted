<template>
  <div class="address-management">
    <section class="hero user-page-card">
      <div class="hero-left">
        <h2 class="pageTitle">
          <i class="fa fa-map-marker-alt"></i>
          地址管理
        </h2>
        <p class="hero-subtitle">管理收货信息，支持一键设置默认地址，提升下单效率。</p>
      </div>
      <button class="addBtn" @click="openAddModal">
        <i class="fa fa-plus"></i>
        新建地址
      </button>
    </section>

    <Teleport to="body">
      <div v-if="showModal" class="modalOverlay" @click.self="closeModal">
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
                  <span class="checkboxText">设为默认地址</span>
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
    </Teleport>

    <div v-if="loading" class="loadingState user-page-card">
      <i class="fa fa-spinner fa-spin"></i>
      <p>加载中...</p>
    </div>

    <div v-else>
      <div class="addressList" v-if="addressList.length > 0">
        <article
          class="addressItem"
          v-for="addr in addressList"
          :key="addr.id"
          :class="{ isDefault: addr.isDefault }"
        >
          <div class="addressMark">
            <i class="fa fa-map-pin"></i>
          </div>
          <div class="addressContent">
            <div class="addressTop">
              <span class="receiver">{{ addr.receiverName }}</span>
              <span class="phone">{{ formatPhone(addr.receiverPhone) }}</span>
              <span class="defaultTag" v-if="addr.isDefault">默认地址</span>
            </div>
            <div class="addressDetail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detailAddress }}</div>
          </div>
          <div class="actions">
            <button class="actionBtn setDefault" @click="setDefault(addr.id)" v-if="!addr.isDefault" title="设为默认">
              <i class="fa fa-star-o"></i>
              <span>默认</span>
            </button>
            <button class="actionBtn edit" @click="openEditModal(addr)" title="编辑">
              <i class="fa fa-edit"></i>
              <span>编辑</span>
            </button>
            <button class="actionBtn delete" @click="deleteAddress(addr.id)" title="删除">
              <i class="fa fa-trash"></i>
              <span>删除</span>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="emptyState user-page-card">
        <div class="emptyIcon"><i class="fa fa-map-marker-alt"></i></div>
        <p>暂无收货地址</p>
        <button class="addBtn large" @click="openAddModal">
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
  position: relative;
}

.hero {
  padding: 22px 24px;
  margin-bottom: 16px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pageTitle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 23px;
  font-weight: 700;
  color: #111827;
}

.pageTitle i {
  color: #f97316;
}

.hero-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.addBtn {
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  background: #f97316;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25);
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.addBtn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.3);
}

.addBtn.large {
  padding: 11px 22px;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0) 40%),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.62));
  backdrop-filter: blur(4px) saturate(105%);
  -webkit-backdrop-filter: blur(4px) saturate(105%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlay-fade-in 180ms ease-out;
}

.modalContainer {
  background: #fff;
  border-radius: 16px;
  width: min(560px, calc(100vw - 32px));
  max-height: 86vh;
  overflow-y: auto;
  box-shadow: 0 24px 40px rgba(17, 24, 39, 0.2);
  animation: modal-pop-in 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid #eef0f3;
}

.modalHeader h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.closeBtn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  color: #6b7280;
  background: #f3f4f6;
  cursor: pointer;
}

.modalBody {
  padding: 20px 22px 24px;
}

.formGroup {
  margin-bottom: 16px;
}

.formRow {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.formGroup label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.formGroup input,
.formGroup textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  box-sizing: border-box;
  background: #fff;
  transition: all 150ms ease;
}

.formGroup input:focus,
.formGroup textarea:focus {
  outline: none;
  border-color: #fb923c;
  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16);
}

.checkboxGroup label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
}

.checkboxText {
  white-space: nowrap;
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modalActions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.modalActions button {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cancelBtn {
  background: #f3f4f6;
  color: #374151;
}

.submitBtn {
  color: #fff;
  background: #f97316;
}

.submitBtn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.addressList {
  display: grid;
  gap: 12px;
}

.addressItem {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #eceff3;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 140ms ease;
}

.addressItem:hover {
  border-color: #e2e8f0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.addressItem.isDefault {
  border-color: rgba(249, 115, 22, 0.4);
  background: #fff7ed;
}

.addressMark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff7ed;
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  flex-wrap: wrap;
}

.receiver {
  font-weight: 700;
  color: #111827;
}

.phone {
  color: #6b7280;
  font-size: 13px;
}

.defaultTag {
  font-size: 11px;
  color: #c2410c;
  background: #ffedd5;
  border: 1px solid #fdba74;
  padding: 2px 8px;
  border-radius: 999px;
}

.addressDetail {
  color: #4b5563;
  line-height: 1.5;
  font-size: 13px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.actionBtn {
  border: none;
  border-radius: 9px;
  height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  cursor: pointer;
  color: #4b5563;
  background: #f8fafc;
}

.actionBtn.edit:hover {
  background: #eff6ff;
  color: #2563eb;
}

.actionBtn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}

.actionBtn.setDefault:hover {
  background: #fffbeb;
  color: #d97706;
}

.emptyState,
.loadingState {
  padding: 56px 20px;
  text-align: center;
  border-radius: 16px;
}

.emptyIcon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #9ca3af;
  font-size: 30px;
}

.emptyState p,
.loadingState p {
  margin: 0 0 16px;
  color: #6b7280;
}

.loadingState i {
  font-size: 28px;
  color: #f97316;
  margin-bottom: 12px;
}

@media (max-width: 640px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .formRow {
    grid-template-columns: 1fr;
  }

  .actions {
    width: 100%;
    justify-content: flex-end;
  }

  .modalOverlay {
    padding: 12px;
  }
}
</style>