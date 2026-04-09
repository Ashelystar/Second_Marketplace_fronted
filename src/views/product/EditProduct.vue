<template>
  <div class="bg-white min-h-screen">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="text-gray-600 hover:text-xianyuText" @click="goBack">
            <i class="fa fa-arrow-left text-xl"></i>
          </button>
          <h1 class="text-xl font-bold text-gray-800">编辑商品</h1>
        </div>
        <button class="px-4 py-1.5 bg-xianyuText text-white rounded-full text-sm hover:bg-xianyuHover" @click="handleSave">
          保存
        </button>
      </div>
    </header>

    <!-- 表单内容 -->
    <main class="max-w-[800px] mx-auto px-4 py-6">
      <!-- 商品图片 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-3">商品图片</h3>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="(img, index) in form.images" :key="index" class="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
            <img :src="img" class="w-full h-full object-cover">
            <button @click="removeImage(index)" class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fa fa-times text-xs"></i>
            </button>
            <div v-if="index === 0" class="absolute bottom-0 left-0 right-0 bg-xianyuText/80 text-white text-xs text-center py-0.5">封面</div>
          </div>
          <label v-if="form.images.length < 9" class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-xianyuText hover:bg-orange-50/30 transition-colors">
            <i class="fa fa-plus text-2xl text-gray-400 mb-1"></i>
            <span class="text-xs text-gray-500">{{ form.images.length }}/9</span>
            <input type="file" accept="image/*" multiple class="hidden" @change="handleImageUpload">
          </label>
        </div>
        <p class="text-xs text-gray-500 mt-2">最多上传9张图片，第一张为封面图</p>
      </section>

      <!-- 商品标题 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">商品标题</h3>
        <input v-model="form.title" type="text" placeholder="描述一下你的宝贝品牌、型号、尺寸等信息" maxlength="50"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
        <div class="text-right text-xs text-gray-400 mt-1">{{ form.title.length }}/50</div>
      </section>

      <!-- 商品描述 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">商品描述</h3>
        <textarea v-model="form.description" placeholder="详细描述宝贝的品牌、型号、入手渠道、转手原因、瑕疵情况等" rows="5" maxlength="500"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all resize-none"></textarea>
        <div class="text-right text-xs text-gray-400 mt-1">{{ form.description.length }}/500</div>
      </section>

      <!-- 价格设置 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-3">价格设置</h3>
        <div class="flex items-center gap-4 mb-3">
          <div class="flex-1">
            <label class="text-sm text-gray-600 mb-1 block">出售价格</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input v-model="form.price" type="number" placeholder="0.00" min="0" step="0.01"
                class="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
            </div>
          </div>
          <div class="flex-1">
            <label class="text-sm text-gray-600 mb-1 block">原价（选填）</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input v-model="form.originalPrice" type="number" placeholder="0.00" min="0" step="0.01"
                class="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.canBargain" class="w-4 h-4 rounded text-xianyuText focus:ring-xianyuText">
            <span class="text-sm text-gray-700">可议价</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.freeFreight" class="w-4 h-4 rounded text-xianyuText focus:ring-xianyuText">
            <span class="text-sm text-gray-700">包邮</span>
          </label>
        </div>
      </section>

      <!-- 商品分类 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">商品分类</h3>
        <div class="flex flex-wrap gap-2">
          <button v-for="cat in categories" :key="cat" @click="form.category = cat"
            class="px-4 py-2 rounded-full text-sm transition-colors"
            :class="form.category === cat ? 'bg-xianyuText text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            {{ cat }}
          </button>
        </div>
      </section>

      <!-- 商品成色 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">商品成色</h3>
        <div class="flex flex-wrap gap-2">
          <button v-for="cond in conditions" :key="cond" @click="form.condition = cond"
            class="px-4 py-2 rounded-full text-sm transition-colors"
            :class="form.condition === cond ? 'bg-xianyuText text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
            {{ cond }}
          </button>
        </div>
      </section>

      <!-- 品牌 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">品牌（选填）</h3>
        <input v-model="form.brand" type="text" placeholder="如：Apple、华为、小米等"
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
      </section>

      <!-- 发货信息 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">发货信息</h3>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <label class="text-sm text-gray-600 mb-1 block">发货地</label>
            <input v-model="form.location" type="text" placeholder="如：北京市朝阳区"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
          </div>
          <div class="w-32" v-if="!form.freeFreight">
            <label class="text-sm text-gray-600 mb-1 block">运费</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input v-model="form.freight" type="number" placeholder="0" min="0" step="1"
                class="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all">
            </div>
          </div>
        </div>
      </section>

      <!-- 商品标签 -->
      <section class="mb-6">
        <h3 class="text-base font-medium text-gray-800 mb-2">商品标签（选填）</h3>
        <div class="flex flex-wrap gap-2 mb-2">
          <span v-for="(tag, index) in form.tags" :key="index"
            class="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-xianyuText rounded-full text-sm">
            {{ tag }}
            <button @click="removeTag(index)" class="hover:text-red-500"><i class="fa fa-times text-xs"></i></button>
          </span>
        </div>
        <div class="flex gap-2">
          <input v-model="newTag" type="text" placeholder="添加标签后回车" @keypress.enter="addTag"
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-xianyuText focus:ring-2 focus:ring-xianyuText/20 outline-none transition-all text-sm">
          <button @click="addTag" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">添加</button>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <button v-for="tag in suggestedTags" :key="tag" @click="form.tags.push(tag)"
            class="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded hover:bg-gray-100">
            + {{ tag }}
          </button>
        </div>
      </section>

      <!-- 保存按钮 -->
      <div class="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg">
        <button @click="handleSave" class="w-full py-3 bg-xianyuText text-white rounded-full font-medium hover:bg-xianyuHover transition-colors">
          保存修改
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

const productId = ref<number | null>(null)
const newTag = ref('')

const categories = ['手机数码', '电脑办公', '数码配件', '家用电器', '服饰鞋包', '美妆护肤', '图书音像', '家居用品', '运动户外', '其他闲置']
const conditions = ['全新', '99新', '95新', '9成新', '8成新', '7成新及以下']
const suggestedTags = ['包邮', '可议价', '全新未拆封', '正品', '保修期内', '送配件']

const form = reactive({
  images: [] as string[],
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  canBargain: false,
  freeFreight: false,
  freight: 0,
  category: '手机数码',
  condition: '9成新',
  brand: '',
  location: '',
  tags: [] as string[]
})

const loadProduct = () => {
  const id = parseInt(route.query.id as string)
  if (!isNaN(id)) {
    productId.value = id
    const product = store.getProductById(id)
    if (product) {
      form.images = product.images?.map(img => img.url) || [product.image]
      form.title = product.title
      form.description = product.description
      form.price = product.price
      form.originalPrice = product.originalPrice
      form.canBargain = product.canBargain || false
      form.freeFreight = product.freight === 0
      form.freight = product.freight || 0
      form.category = product.category || '手机数码'
      form.condition = product.condition
      form.brand = product.brand || ''
      form.location = product.location
      form.tags = [...(product.tags || [])]
    }
  }
}

const handleImageUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    Array.from(input.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && form.images.length < 9) {
          form.images.push(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const handleSave = () => {
  if (!form.title.trim()) {
    alert('请填写商品标题')
    return
  }
  if (!form.price) {
    alert('请填写出售价格')
    return
  }
  if (form.images.length === 0) {
    alert('请至少上传一张商品图片')
    return
  }
  
  alert('商品信息已保存！')
  router.back()
}

const goBack = () => router.back()

onMounted(() => {
  store.initialize()
  loadProduct()
})
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
