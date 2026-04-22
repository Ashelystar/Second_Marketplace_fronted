<template>
  <div class="page">
    <!-- 顶部导航 -->
    <div class="top">
      <div class="topInner">
        <div class="left">
          <button class="backBtn" @click="goBack">
            <i class="fa fa-arrow-left"></i>
          </button>
          <span class="pageTitle">{{ isEditing ? '编辑商品' : '发布商品' }}</span>
        </div>

        <nav class="navLinks">
          <a href="#" @click.prevent="router.push('/forum')"><i class="fa fa-comments"></i> 社区</a>
          <a href="#" @click.prevent="router.push('/cart')"><i class="fa fa-shopping-cart"></i> 购物车</a>
          <a href="#" @click.prevent="router.push('/chat')"><i class="fa fa-bell"></i> 消息</a>
          <template v-if="userStore.isLoggedIn">
            <a href="#" @click.prevent="router.push('/user/center')"><i class="fa fa-user"></i> 我的</a>
          </template>
          <template v-else>
            <a href="#" @click="handleLogin"><i class="fa fa-user"></i> 登录/注册</a>
          </template>
        </nav>
      </div>
    </div>

    <!-- 表单 -->
    <main class="form">
      <!-- 商品图片 -->
      <section class="formSection">
        <h3>商品图片</h3>
        <div class="imageGrid">
          <div
            v-for="(img, index) in form.images"
            :key="index"
            class="imageItem"
          >
            <img :src="img" />
            <button class="deleteBtn" @click="removeImage(index)">
              <i class="fa fa-times"></i>
            </button>
            <div v-if="index === 0" class="coverTag">封面</div>
          </div>
          <label v-if="form.images.length < 9" class="uploadArea">
            <i class="fa fa-plus"></i>
            <span>{{ form.images.length }}/9</span>
            <input type="file" accept="image/*" multiple @change="handleImageUpload" />
          </label>
        </div>
        <p class="hint">最多上传9张图片，第一张为封面图</p>
      </section>

      <!-- 商品标题 -->
      <section class="formSection">
        <h3>商品标题</h3>
        <input
          v-model="form.title"
          type="text"
          class="input"
          placeholder="描述一下你的宝贝品牌、型号、尺寸等信息"
          maxlength="50"
        />
        <div class="charCount">{{ form.title.length }}/50</div>
      </section>

      <!-- 商品描述 -->
      <section class="formSection">
        <h3>商品描述</h3>
        <textarea
          v-model="form.description"
          class="textarea"
          placeholder="详细描述宝贝的品牌、型号、入手渠道、转手原因、瑕疵情况等"
          maxlength="500"
        ></textarea>
        <div class="charCount">{{ form.description.length }}/500</div>
      </section>

      <!-- 价格设置 -->
      <section class="formSection">
        <h3>价格设置</h3>
        <div class="priceRow">
          <div class="priceField">
            <label>出售价格</label>
            <div class="priceInput">
              <span>¥</span>
              <input v-model="form.price" type="number" placeholder="0.00" min="0" step="0.01" />
            </div>
          </div>
          <div class="priceField">
            <label>原价（选填）</label>
            <div class="priceInput">
              <span>¥</span>
              <input v-model="form.originalPrice" type="number" placeholder="0.00" min="0" step="0.01" />
            </div>
          </div>
        </div>
        <div class="checkboxes">
          <label class="checkbox">
            <input type="checkbox" v-model="form.canBargain" />
            <span>可议价</span>
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="form.freeFreight" />
            <span>包邮</span>
          </label>
        </div>
      </section>

      <!-- 商品分类 -->
      <section class="formSection">
        <h3>商品分类</h3>
        <div class="chipGroup">
          <button
            v-for="cat in categoryList"
            :key="cat.id"
            class="chip"
            :class="{ active: form.categoryId === cat.id }"
            @click="form.categoryId = cat.id"
          >
            {{ cat.categoryName }}
          </button>
        </div>
      </section>

      <!-- 商品成色 -->
      <section class="formSection">
        <h3>商品成色</h3>
        <div class="chipGroup">
          <button
            v-for="cond in conditions"
            :key="cond"
            class="chip"
            :class="{ active: form.condition === cond }"
            @click="form.condition = cond"
          >
            {{ cond }}
          </button>
        </div>
      </section>

      <!-- 品牌 -->
      <section class="formSection">
        <h3>品牌（选填）</h3>
        <input
          v-model="form.brand"
          type="text"
          class="input"
          placeholder="如：Apple、华为、小米等"
        />
      </section>

      <!-- 发货信息 -->
      <section class="formSection">
        <h3>发货信息</h3>
        <div class="shipRow">
          <div class="field">
            <label>发货地</label>
            <input
              v-model="form.location"
              type="text"
              class="input"
              placeholder="如：北京市朝阳区"
            />
          </div>
          <div v-if="!form.freeFreight" class="field">
            <label>运费</label>
            <div class="priceInput">
              <span>¥</span>
              <input v-model="form.freight" type="number" placeholder="0" min="0" />
            </div>
          </div>
        </div>
      </section>

      <!-- 商品标签 -->
      <section class="formSection">
        <h3>商品标签（选填）</h3>
        <div class="tagsContainer">
          <div class="tags">
            <span v-for="(tag, index) in form.tags" :key="index" class="tag">
              {{ tag }}
              <button @click="removeTag(index)"><i class="fa fa-times"></i></button>
            </span>
          </div>
          <div class="tagInput">
            <input
              v-model="newTag"
              type="text"
              placeholder="添加标签后回车"
              @keypress.enter="addTag"
            />
            <button @click="addTag">添加</button>
          </div>
          <div class="suggestTags">
            <button v-for="tag in suggestedTags" :key="tag" @click="form.tags.push(tag)">
              + {{ tag }}
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部保存 -->
    <div class="bottomBar">
      <button class="draftBtn" @click="handleSaveDraft">保存草稿</button>
      <button class="saveFullBtn" @click="handleSave">
        {{ isEditing ? '保存修改' : '保存并发布' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getProductDetail, updateProduct, createProduct, saveToDraft, getCategoryList, type UpdateProductParams, type Category } from '@/api/goods'

defineOptions({ name: 'EditProduct' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 分类列表（从接口加载）
const categoryList = ref<Category[]>([])
const categoryMap = ref<Record<string, number>>({}) // name -> id
const categoryIdMap = ref<Record<number, string>>({}) // id -> name

// 加载分类列表
const loadCategories = async () => {
  try {
    const list = await getCategoryList()
    categoryList.value = list.filter(c => c.isEnabled)
    // 构建映射
    categoryMap.value = {}
    categoryIdMap.value = {}
    list.forEach(c => {
      categoryMap.value[c.categoryName] = c.id
      categoryIdMap.value[c.id] = c.categoryName
    })
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

// 成色名称到接口值的映射
const conditionMap: Record<string, UpdateProductParams['conditionLevel']> = {
  '全新': 'new',
  '99新': 'almost_new',
  '95新': 'good',
  '9成新': 'fair',
  '8成新': 'poor',
  '7成新及以下': 'poor'
}

const productId = ref<number | null>(null)
const isEditing = ref(false)
const newTag = ref('')

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
  categoryId: 1, // 默认选中第一个分类
  condition: '9成新',
  brand: '',
  location: '',
  tags: [] as string[]
})

const loadProduct = async () => {
  const id = parseInt(route.query.id as string)
  if (!isNaN(id)) {
    isEditing.value = true
    productId.value = id
    try {
      const product = await getProductDetail(id)
      form.images = product.images?.map(img => img.url) || [product.image]
      form.title = product.title
      form.description = product.description || ''
      form.price = String(product.sellingPrice || product.price)
      form.originalPrice = product.originalPrice || ''
      // 根据分类名称查找ID
      if (product.category && categoryIdMap.value[0]) {
        const catEntry = categoryList.value.find(c => c.categoryName === product.category)
        form.categoryId = catEntry?.id || 1
      }
      form.condition = getConditionLabel(product.conditionLevel)
      form.brand = product.brand || ''
      form.location = product.pickupCity || ''
    } catch (err) {
      console.error('加载商品失败:', err)
      alert('加载商品信息失败')
    }
  }
}

// 将接口的 conditionLevel 转换为界面显示的标签
const conditionLevelMap: Record<string, string> = {
  'new': '全新',
  'almost_new': '99新',
  'good': '95新',
  'fair': '9成新',
  'poor': '8成新'
}

const getConditionLabel = (level?: string): string => {
  if (!level) return '9成新'
  return conditionLevelMap[level] || '9成新'
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

// 保存草稿
const handleSaveDraft = async () => {
  if (!form.title.trim()) {
    alert('请填写商品标题')
    return
  }

  const params: UpdateProductParams = {
    categoryId: form.categoryId,
    title: form.title,
    description: form.description,
    originalPrice: Number(form.originalPrice) || 0,
    sellingPrice: Number(form.price) || 0,
    conditionLevel: conditionMap[form.condition] || 'fair',
    brand: form.brand,
    tradeMode: 'both',
    pickupCity: form.location,
    images: form.images
  }

  try {
    console.log('【保存草稿】调用 saveToDraft 接口')
    console.log('请求参数:', params)
    const result = await saveToDraft(params)
    console.log('【保存草稿】接口返回:', result)
    alert('已保存至草稿箱')
    router.push('/drafts')
  } catch (err) {
    console.error('保存草稿失败:', err)
    alert(err instanceof Error ? err.message : '保存草稿失败')
  }
}

const handleSave = async () => {
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

  // 构建接口参数
  const params: UpdateProductParams = {
    categoryId: form.categoryId,
    title: form.title,
    description: form.description,
    originalPrice: Number(form.originalPrice) || 0,
    sellingPrice: Number(form.price),
    conditionLevel: conditionMap[form.condition] || 'fair',
    brand: form.brand,
    tradeMode: 'both',
    pickupCity: form.location,
    images: form.images
  }

  try {
    if (isEditing.value && productId.value) {
      // 编辑商品
      console.log('【编辑商品】调用 updateProduct 接口')
      console.log('商品ID:', productId.value)
      console.log('请求参数:', params)
      const result = await updateProduct(productId.value, params)
      console.log('【编辑商品】接口返回:', result)
      alert('商品信息已保存！')
    } else {
      // 发布新商品
      console.log('【发布商品】调用 createProduct 接口')
      console.log('请求参数:', params)
      const result = await createProduct(params)
      console.log('【发布商品】接口返回:', result)
      alert('商品发布成功！')
    }
    router.back()
  } catch (err) {
    console.error('操作失败:', err)
    alert(err instanceof Error ? err.message : '操作失败')
  }
}

const goBack = () => router.back()

const handleLogin = () => {
  router.push('/user/login')
}

onMounted(async () => {
  await loadCategories()
  loadProduct()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 20px;
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

.pageTitle {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  padding-left: 12px;
  border-left: 1px solid #e5e7eb;
}

.navLinks {
  display: flex;
  gap: 20px;
}

.navLinks a {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  transition: color 150ms;
}

.navLinks a:hover {
  color: #f97316;
}

/* 表单 */
.form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.formSection {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.formSection h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #1f2937;
}

/* 图片上传 */
.imageGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.imageItem {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f5;
}

.imageItem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deleteBtn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity 150ms;
}

.imageItem:hover .deleteBtn {
  opacity: 1;
}

.coverTag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(249, 115, 22, 0.9);
  color: #fff;
  font-size: 11px;
  text-align: center;
}

.uploadArea {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #9ca3af;
  font-size: 12px;
  transition: all 150ms;
}

.uploadArea:hover {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.04);
}

.uploadArea i {
  font-size: 24px;
  color: #d1d5db;
}

.uploadArea input {
  display: none;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0;
}

/* 输入框 */
.input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 150ms;
  background: #fff;
}

.input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  transition: border-color 150ms;
  background: #fff;
  line-height: 1.5;
}

.textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.charCount {
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}

/* 价格 */
.priceRow {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.priceField {
  flex: 1;
}

.priceField label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.priceInput {
  position: relative;
}

.priceInput span {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.priceInput input {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 28px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 150ms;
  background: #fff;
}

.priceInput input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.checkboxes {
  display: flex;
  gap: 20px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #f97316;
}

/* 分类标签 */
.chipGroup {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms;
}

.chip:hover {
  border-color: #f97316;
  color: #f97316;
}

.chip.active {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
}

/* 发货信息 */
.shipRow {
  display: flex;
  gap: 16px;
}

.field {
  flex: 1;
}

.field label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.field .input {
  height: 46px;
}

/* 标签区域 */
.tagsContainer {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 32px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.tag button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.tag button:hover {
  color: #fff;
}

.tagInput {
  display: flex;
  gap: 8px;
}

.tagInput input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.tagInput input:focus {
  border-color: #f97316;
}

.tagInput button {
  height: 38px;
  padding: 0 14px;
  border: 1px solid #f97316;
  border-radius: 8px;
  background: #fff;
  color: #f97316;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 150ms;
}

.tagInput button:hover {
  background: #f97316;
  color: #fff;
}

.suggestTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
}

.suggestTags button {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.suggestTags button:hover {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.05);
}

/* 底部保存 */
.bottomBar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  gap: 12px;
  align-items: center;
}

.draftBtn {
  width: 140px;
  height: 48px;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: #fff;
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;
}

.draftBtn:hover {
  border-color: #f97316;
  color: #f97316;
}

.saveFullBtn {
  width: 140px;
  height: 48px;
  border: none;
  border-radius: 24px;
  background: #f97316;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
  transition: background 150ms;
}

.saveFullBtn:hover {
  background: #ea580c;
}

/* 响应式 */
@media (max-width: 600px) {
  .topInner {
    padding: 10px 12px;
  }
  
  .navLinks {
    gap: 12px;
  }
  
  .navLinks a span {
    display: none;
  }

  .imageGrid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .priceRow, .shipRow {
    flex-direction: column;
    gap: 12px;
  }
  
  .bottomBar {
    left: 16px;
    right: 16px;
    transform: none;
  }
  
  .saveFullBtn {
    max-width: none;
  }
}
</style>
