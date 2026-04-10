<template>
  <div class="page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="headerLeft">
        <button class="backBtn" @click="goBack">
          <i class="fa fa-arrow-left"></i>
        </button>
        <h1 class="title">编辑商品</h1>
      </div>
      <button class="saveBtn" @click="handleSave">保存</button>
    </header>

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
            v-for="cat in categories"
            :key="cat"
            class="chip"
            :class="{ active: form.category === cat }"
            @click="form.category = cat"
          >
            {{ cat }}
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
      </section>
    </main>

    <!-- 底部保存 -->
    <div class="bottomBar">
      <button class="saveFullBtn" @click="handleSave">保存修改</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/productStore'

defineOptions({ name: 'EditProduct' })

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
.page {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 100px;
}

/* 顶部导航 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
  font-size: 18px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.saveBtn {
  padding: 6px 16px;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  transition: background 150ms;
}

.saveBtn:hover {
  background: #ea580c;
}

/* 表单 */
.form {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px;
}

.formSection {
  margin-bottom: 28px;
}

.formSection h3 {
  font-size: 15px;
  font-weight: 500;
  margin: 0 0 12px;
  color: var(--text);
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
  border: 2px dashed var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: var(--muted);
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
  color: var(--muted);
  margin: 8px 0 0;
}

/* 输入框 */
.input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--border);
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
  border: 1px solid var(--border);
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
  color: var(--muted);
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
  color: var(--muted);
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
  color: var(--muted);
}

.priceInput input {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 28px;
  border: 1px solid var(--border);
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
  border: 1px solid var(--border);
  background: #f5f5f5;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms;
}

.chip:hover {
  background: #f0f0f0;
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
  color: var(--muted);
  margin-bottom: 6px;
}

.field .input {
  height: 46px;
}

/* 标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #fff7ed;
  color: #f97316;
  border-radius: 999px;
  font-size: 13px;
}

.tag button {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
}

.tag button:hover {
  color: #dc2626;
}

.tagInput {
  display: flex;
  gap: 8px;
}

.tagInput input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
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
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f5f5f5;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
  transition: background 150ms;
}

.tagInput button:hover {
  background: #e5e5e5;
}

.suggestTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.suggestTags button {
  padding: 4px 10px;
  background: #f9f9f9;
  border: none;
  border-radius: 4px;
  color: var(--muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms;
}

.suggestTags button:hover {
  background: #f0f0f0;
  color: var(--text);
}

/* 底部保存 */
.bottomBar {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}

.saveFullBtn {
  width: 300px;
  height: 48px;
  border: none;
  border-radius: 24px;
  background: #f97316;
  color: #fff;
  font-size: 16px;
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
    width: 100%;
  }
}
</style>
