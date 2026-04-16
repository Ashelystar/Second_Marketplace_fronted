<template>
  <div>
    <div class="user-page-card p-6 md:p-7">
      <h1 class="user-page-title text-gray-900">
        <i class="fa fa-map-marker text-xianyuText"></i>
        地址管理
      </h1>

      <div class="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <p class="text-sm text-gray-500">最多可管理 20 个地址，默认地址将优先用于下单。</p>
        <button class="px-4 py-2.5 bg-xianyuText text-white rounded-lg hover:bg-xianyuText/90 transition-colors" @click="openAdd">
          <i class="fa fa-plus mr-1"></i>新增地址
        </button>
      </div>

      <div class="space-y-4">
        <article v-for="item in addresses" :key="item.id" class="addr-card" :class="{ default: item.isDefault }">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <strong class="text-gray-900">{{ item.name }}</strong>
                <span class="text-sm text-gray-500">{{ item.phone }}</span>
                <span v-if="item.isDefault" class="badge-default">默认</span>
              </div>
              <p class="mt-2 text-gray-700 break-words">{{ item.province }}{{ item.city }}{{ item.area }} {{ item.detail }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button class="op-btn" @click="setDefault(item.id)" :disabled="item.isDefault">设为默认</button>
              <button class="op-btn" @click="editItem(item.id)">编辑</button>
              <button class="op-btn danger" @click="removeItem(item.id)">删除</button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div v-if="showForm" class="editor-mask" @click.self="showForm = false">
      <div class="editor-panel">
        <h3 class="text-lg font-semibold mb-4">{{ editingId ? '编辑地址' : '新增地址' }}</h3>
        <form class="grid gap-3" @submit.prevent="save">
          <input v-model.trim="form.name" class="input" placeholder="收货人姓名" />
          <input v-model.trim="form.phone" class="input" placeholder="手机号" />
          <input v-model.trim="form.province" class="input" placeholder="省份" />
          <input v-model.trim="form.city" class="input" placeholder="城市" />
          <input v-model.trim="form.area" class="input" placeholder="区/县" />
          <input v-model.trim="form.detail" class="input" placeholder="详细地址" />
          <label class="text-sm text-gray-600 flex items-center gap-2">
            <input type="checkbox" v-model="form.isDefault" />
            设为默认地址
          </label>
          <div class="flex justify-end gap-2 mt-2">
            <button type="button" class="op-btn" @click="showForm = false">取消</button>
            <button type="submit" class="px-4 py-2 bg-xianyuText text-white rounded-lg hover:bg-xianyuText/90 transition-colors">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

type Addr = {
  id: number
  name: string
  phone: string
  province: string
  city: string
  area: string
  detail: string
  isDefault: boolean
}

const addresses = ref<Addr[]>([
  { id: 1, name: '张三', phone: '13800001111', province: '广东省', city: '广州市', area: '天河区', detail: '珠江新城 88 号', isDefault: true },
  { id: 2, name: '李四', phone: '13900002222', province: '广东省', city: '深圳市', area: '南山区', detail: '科技园中区 66 号', isDefault: false },
])

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive<Addr>({
  id: 0,
  name: '',
  phone: '',
  province: '',
  city: '',
  area: '',
  detail: '',
  isDefault: false,
})

const resetForm = () => {
  form.id = 0
  form.name = ''
  form.phone = ''
  form.province = ''
  form.city = ''
  form.area = ''
  form.detail = ''
  form.isDefault = false
}

const openAdd = () => {
  editingId.value = null
  resetForm()
  showForm.value = true
}

const editItem = (id: number) => {
  const target = addresses.value.find((a) => a.id === id)
  if (!target) return
  editingId.value = id
  Object.assign(form, target)
  showForm.value = true
}

const setDefault = (id: number) => {
  addresses.value = addresses.value.map((a) => ({ ...a, isDefault: a.id === id }))
}

const removeItem = (id: number) => {
  addresses.value = addresses.value.filter((a) => a.id !== id)
  if (!addresses.value.some((a) => a.isDefault) && addresses.value.length > 0) {
    addresses.value[0].isDefault = true
  }
}

const save = () => {
  if (!form.name || !form.phone || !form.province || !form.city || !form.area || !form.detail) return
  if (form.isDefault) {
    addresses.value = addresses.value.map((a) => ({ ...a, isDefault: false }))
  }
  if (editingId.value) {
    addresses.value = addresses.value.map((a) => (a.id === editingId.value ? { ...form, id: editingId.value! } : a))
  } else {
    addresses.value.unshift({ ...form, id: Date.now() })
  }
  showForm.value = false
  resetForm()
}
</script>

<style scoped>
.addr-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  background: #fff;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.addr-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}

.addr-card.default {
  border-color: rgba(249, 115, 22, 0.45);
  background: rgba(255, 247, 237, 0.7);
}

.badge-default {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f97316;
  color: #fff;
}

.op-btn {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 6px 10px;
  color: #374151;
  background: #fff;
}

.op-btn:hover {
  background: #f9fafb;
}

.op-btn.danger {
  color: #dc2626;
  border-color: #fecaca;
}

.editor-mask {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.28);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 70;
  padding: 16px;
  animation: mask-in 160ms ease;
}

.editor-panel {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  animation: pop 180ms ease;
}

.input {
  width: 100%;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 12px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes mask-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>