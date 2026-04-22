<template>
  <div class="address-management">
    <!-- 页面标题和新建按钮 -->
    <div class="pageHeader">
      <h2 class="pageTitle">
        <i class="fa fa-map-marker-alt"></i>
        地址管理
      </h2>
      <button class="addBtn" @click="goToAddAddress">
        <i class="fa fa-plus"></i>
        新建地址
      </button>
    </div>

    <!-- 地址列表 -->
    <div class="addressList" v-if="addressList.length > 0">
      <div 
        class="addressItem" 
        v-for="addr in addressList" 
        :key="addr.id"
        :class="{ isDefault: addr.isDefault }"
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
          <button class="actionBtn setDefault" @click="setDefault(addr.id)" v-if="!addr.isDefault" title="设为默认">
            <i class="fa fa-star"></i>
          </button>
          <button class="actionBtn edit" @click="editAddress(addr)" title="编辑">
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
      <button class="addBtn" @click="goToAddAddress">
        <i class="fa fa-plus"></i>
        添加第一个地址
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'UserAddress' })

const router = useRouter()

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

// 手机号脱敏处理
const formatPhone = (phone: string) => {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const goToAddAddress = () => {
  router.push('/address/edit')
}

const editAddress = (addr: Address) => {
  localStorage.setItem('editingAddress', JSON.stringify(addr))
  router.push('/address/edit')
}

const deleteAddress = (id: number) => {
  if (confirm('确定删除该地址吗？')) {
    addressList.value = addressList.value.filter(a => a.id !== id)
    localStorage.setItem('userAddresses', JSON.stringify(addressList.value))
  }
}

const setDefault = (id: number) => {
  addressList.value.forEach(a => {
    a.isDefault = a.id === id
  })
  localStorage.setItem('userAddresses', JSON.stringify(addressList.value))
}

onMounted(() => {
  // 从 localStorage 加载地址
  const saved = localStorage.getItem('userAddresses')
  if (saved) {
    try {
      addressList.value = JSON.parse(saved)
    } catch (e) {
      console.error('解析地址失败', e)
    }
  }

  // 如果没有地址，加载默认数据
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

  // 检查是否有从编辑页面返回的数据
  const formDataStr = localStorage.getItem('addressFormData')
  if (formDataStr) {
    try {
      const data = JSON.parse(formDataStr)
      const index = addressList.value.findIndex(a => a.id === data.id)
      if (index !== -1) {
        addressList.value[index] = data
      } else {
        if (data.isDefault) {
          addressList.value.forEach(a => a.isDefault = false)
        }
        addressList.value.push(data)
      }
      localStorage.removeItem('addressFormData')
      localStorage.setItem('userAddresses', JSON.stringify(addressList.value))
    } catch (e) {
      console.error('解析地址数据失败', e)
    }
  }
})
</script>

<style scoped>
.address-management {
  padding: 0;
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
</style>
