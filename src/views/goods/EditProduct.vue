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
            <UserDropdown />
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
            <img :src="getImageUrl(img)" @error="(e: Event) => (e.target as HTMLImageElement).src = PLACEHOLDER_IMG" />
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

      <!-- 商品副标题（选填） -->
      <section class="formSection">
        <h3>副标题（选填）</h3>
        <input
          v-model="form.subtitle"
          type="text"
          class="input"
          placeholder="如：iPhone 16 Pro Max，256GB，暗夜紫"
          maxlength="30"
        />
        <div class="charCount">{{ form.subtitle.length }}/30</div>
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

      <!-- 型号 -->
      <section class="formSection">
        <h3>型号（选填）</h3>
        <input
          v-model="form.model"
          type="text"
          class="input"
          placeholder="如：iPhone 16 Pro Max、Mate 60 Pro 等"
        />
      </section>

      <!-- 发货信息 -->
      <section class="formSection">
        <h3>发货信息</h3>
        <div class="chipGroup" style="margin-bottom: 12px;">
          <span style="font-size: 13px; color: #6b7280; margin-right: 8px;">交易方式：</span>
          <button
            v-for="opt in tradeModeOptions"
            :key="opt.value"
            class="chip"
            :class="{ active: form.tradeMode === opt.value }"
            @click="form.tradeMode = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="shipRow">
          <div class="field">
            <label>自提城市</label>
            <input
              v-model="form.location"
              type="text"
              class="input"
              placeholder="如：深圳市南山区"
            />
          </div>
          <div class="field">
            <label>详细地址（选填）</label>
            <input
              v-model="form.pickupAddress"
              type="text"
              class="input"
              placeholder="具体地址，方便买家自提"
            />
          </div>
        </div>
      </section>

      <!-- 购买信息 -->
      <section class="formSection">
        <h3>购买信息（选填）</h3>
        <div class="priceRow">
          <div class="priceField">
            <label>购买年份</label>
            <div class="priceInput">
              <input
                v-model.number="form.purchaseYear"
                type="number"
                placeholder="如 2024"
                min="1990"
                :max="new Date().getFullYear()"
                style="padding-left: 14px;"
              />
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
import { getProductDetail, updateProduct, createProduct, saveToDraft, getCategoryList, uploadImage, submitForReview, type UpdateProductParams, type Category } from '@/api/goods'
import { getImageUrl, PLACEHOLDER_IMG } from '@/utils/image'
import UserDropdown from '@/components/UserDropdown.vue'

defineOptions({ name: 'EditProduct' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const EDIT_PRODUCT_CACHE_KEY = 'edit_product_cache'

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

// 成色显示标签 → 后端英文枚举值
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

// 交易方式选项（中文标签 + 后端英文值）
const tradeModeOptions = [
  { label: '自提', value: 'pickup' as const },
  { label: '配送', value: 'shipping' as const },
  { label: '两者均可', value: 'both' as const },
]

const form = reactive({
  images: [] as string[],
  title: '',
  subtitle: '',           // 副标题
  description: '',
  price: '',
  originalPrice: '',
  canBargain: false,
  freeFreight: false,
  freight: 0,
  categoryId: 1,          // 默认选中第一个分类
  condition: '9成新',
  brand: '',
  model: '',              // 型号
  purchaseYear: undefined as number | undefined, // 购买年份
  location: '',
  pickupAddress: '',      // 自提详细地址
  tradeMode: 'both' as UpdateProductParams['tradeMode'], // 交易方式（后端英文值）
  tags: [] as string[]
})

type ProductFormSource = {
  images?: unknown[]
  image?: string
  title?: string
  subtitle?: string
  description?: string
  sellingPrice?: string | number
  price?: string | number
  originalPrice?: string | number
  categoryId?: number
  category?: string
  conditionLevel?: string
  condition?: string
  brand?: string
  model?: string
  purchaseYear?: number | undefined
  pickupCity?: string
  pickupAddress?: string
  location?: string
  tradeMode?: string
  tags?: unknown[]
  canBargain?: boolean
  freight?: string | number
  freeFreight?: boolean
}

const applyProductToForm = (product: ProductFormSource) => {
  const imageList = Array.isArray(product.images)
    ? product.images
      .map((img) => {
        if (typeof img === 'string') return img
        if (img && typeof img === 'object' && 'url' in img) return String((img as { url: unknown }).url || '')
        return ''
      })
      .filter(Boolean)
    : []
  const cover = typeof product.image === 'string' ? product.image : ''
  form.images = imageList.length ? imageList : (cover ? [cover] : [])

  form.title = String(product.title || '')
  form.description = String(product.description || '')

  const sellingPrice = product.sellingPrice ?? product.price
  form.price = sellingPrice === undefined || sellingPrice === null ? '' : String(sellingPrice)

  const originalPrice = product.originalPrice
  form.originalPrice = originalPrice === undefined || originalPrice === null || Number(originalPrice) <= 0
    ? ''
    : String(originalPrice)

  if (typeof product.categoryId === 'number' && product.categoryId > 0) {
    form.categoryId = product.categoryId
  } else if (typeof product.category === 'string' && product.category.trim()) {
    const catEntry = categoryList.value.find(c => c.categoryName === product.category)
    if (catEntry) form.categoryId = catEntry.id
  }

  if (typeof product.conditionLevel === 'string') {
    form.condition = getConditionLabel(product.conditionLevel)
  } else if (typeof product.condition === 'string' && conditions.includes(product.condition)) {
    form.condition = product.condition
  }

  form.brand = String(product.brand || '')
  form.model = String(product.model || '')
  form.subtitle = String(product.subtitle || '')

  if (typeof product.purchaseYear === 'number' && product.purchaseYear > 1900) {
    form.purchaseYear = product.purchaseYear
  }

  form.location = String(product.pickupCity || product.location || '')
  form.pickupAddress = String(product.pickupAddress || '')

  // 交易方式：后端返回英文枚举值，直接使用
  const tradeModeVal = product.tradeMode
  if (tradeModeVal && ['pickup', 'shipping', 'both'].includes(tradeModeVal)) {
    form.tradeMode = tradeModeVal as UpdateProductParams['tradeMode']
  } else {
    // 兼容旧数据或默认值
    form.tradeMode = 'both'
  }

  form.tags = Array.isArray(product.tags)
    ? product.tags
      .map(tag => String(tag).trim())
      .filter(Boolean)
      .slice(0, 5)
    : []

  form.canBargain = Boolean(product.canBargain)
  const freight = Number(product.freight || 0)
  form.freight = Number.isFinite(freight) ? freight : 0
  form.freeFreight = Boolean(product.freeFreight) || form.freight <= 0
}

const getCachedEditingProduct = (id: number) => {
  try {
    const raw = sessionStorage.getItem(EDIT_PRODUCT_CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as ProductFormSource & { id?: number }
    if (cached && Number(cached.id) === id) return cached
  } catch (err) {
    console.error('读取编辑缓存失败:', err)
  }
  return null
}

const loadProduct = async () => {
  const id = parseInt(route.query.id as string)
  if (isNaN(id)) return

  isEditing.value = true
  productId.value = id

  let hasLocalFilled = false
  const cachedProduct = getCachedEditingProduct(id)
  if (cachedProduct) {
    applyProductToForm(cachedProduct)
    hasLocalFilled = true
  }

  try {
    const product = await getProductDetail(id)
    applyProductToForm(product)
  } catch (err) {
    console.error('加载商品失败:', err)
    if (!hasLocalFilled) {
      alert('加载商品信息失败')
    }
  }
}

// 将后端英文枚举值转换为界面显示的中文标签
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

const handleImageUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  for (const file of files) {
    if (form.images.length >= 9) break
    try {
      const url = await uploadImage(file)
      form.images.push(url)
    } catch (err) {
      console.error('图片上传失败:', err)
      const msg = err instanceof Error ? err.message : '未知错误'
      alert(`图片 "${file.name}" 上传失败：${msg}`)
    }
  }
  // 清空 input 以便重复选择同一文件
  input.value = ''
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
    subtitle: form.subtitle || undefined,
    description: form.description,
    originalPrice: Number(form.originalPrice) || 0,
    sellingPrice: Number(form.price) || 0,
    conditionLevel: conditionMap[form.condition] || 'fair',
    brand: form.brand || undefined,
    model: form.model || undefined,
    purchaseYear: form.purchaseYear,
    tradeMode: form.tradeMode,
    pickupCity: form.location || undefined,
    pickupAddress: form.pickupAddress || undefined,
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

  // 构建接口参数（与后端 POST /api/product/create 对齐）
  const params: UpdateProductParams = {
    categoryId: form.categoryId,
    title: form.title,
    subtitle: form.subtitle || undefined,
    description: form.description,
    originalPrice: Number(form.originalPrice) || 0,
    sellingPrice: Number(form.price),
    conditionLevel: conditionMap[form.condition] || 'fair',
    brand: form.brand || undefined,
    model: form.model || undefined,
    purchaseYear: form.purchaseYear,
    tradeMode: form.tradeMode,
    pickupCity: form.location || undefined,
    pickupAddress: form.pickupAddress || undefined,
    images: form.images
  }

  try {
    let savedId: number
    if (isEditing.value && productId.value) {
      // 编辑商品
      console.log('【编辑商品】调用 updateProduct 接口')
      console.log('商品ID:', productId.value)
      console.log('请求参数:', params)
      const result = await updateProduct(productId.value, params)
      console.log('【编辑商品】接口返回:', result)
      savedId = productId.value
    } else {
      // 发布新商品
      console.log('【发布商品】调用 createProduct 接口')
      console.log('请求参数:', params)
      const result = await createProduct(params)
      console.log('【发布商品】接口返回:', result)
      savedId = result.id
    }

    // 提交审核（将状态从 draft/rejected 变为 pending_review）
    try {
      await submitForReview(savedId)
      alert('已提交审核，请等待管理员审核')
    } catch (reviewErr) {
      console.error('提交审核失败:', reviewErr)
      alert('商品已保存，但提交审核失败：' + (reviewErr instanceof Error ? reviewErr.message : '请稍后重试'))
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
