<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">闲鱼</div>
        <div class="search-box">
          <input type="text" placeholder="搜索" />
          <button class="search-btn">🔍</button>
        </div>
        <div class="header-icons">
          <router-link to="/" class="icon-link">📱</router-link>
          <router-link to="/orders" class="icon-link">📦</router-link>
        </div>
      </div>
    </header>

    <!-- 页面内容 -->
    <main class="main-content">
      <!-- 商品分类区域 -->
      <section class="categories-section">
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-item"
            @click="goToCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-name">{{ category.name }}</div>
          </div>
        </div>
        <div class="upgrade-notice">
          <span>网页版发闲置功能又升级啦！</span>
          <router-link to="/publish" class="upgrade-link">去看看</router-link>
        </div>
      </section>

      <!-- 广告和特色区域 -->
      <section class="featured-section">
        <div class="ad-banner">
          <h2>闲鱼抄底好物</h2>
          <p>超绝性价比 省到底</p>
        </div>
        
        <div class="featured-grid">
          <div 
            v-for="feature in featuredItems" 
            :key="feature.id"
            class="featured-item"
            @click="goToDetail(feature.id)"
          >
            <div class="featured-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p class="featured-desc">{{ feature.desc }}</p>
            <div class="featured-price">{{ feature.price }}</div>
          </div>
        </div>
      </section>

      <!-- 推荐标签 -->
      <section class="tags-section">
        <h3>猜你喜欢</h3>
        <div class="tags-container">
          <span 
            v-for="tag in tags" 
            :key="tag"
            class="tag"
            @click="filterByTag(tag)"
          >{{ tag }}</span>
        </div>
      </section>

      <!-- 商品列表 -->
      <section class="products-section">
        <h3>个人闲置推荐</h3>
        <div class="products-grid">
          <div 
            v-for="product in products" 
            :key="product.id"
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="product-img" :style="{ backgroundColor: getRandomColor() }">
              <span class="product-status">{{ product.status }}</span>
            </div>
            <div class="product-info">
              <h4 class="product-title">{{ product.title }}</h4>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-meta">
                <span class="product-price">{{ product.price }}</span>
                <span class="product-seller">{{ product.seller }}</span>
              </div>
              <div class="product-tags">
                <span v-if="product.freeShipping" class="tag-shipping">包邮</span>
                <span v-if="product.received" class="tag-received">已收货</span>
                <span v-if="product.new" class="tag-new">48小时内发布</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部导航 -->
    <footer class="footer">
      <router-link to="/" class="footer-item active">
        <span class="footer-icon">🏠</span>
        <span>首页</span>
      </router-link>
      <router-link to="/fish-pond" class="footer-item">
        <span class="footer-icon">🐟</span>
        <span>鱼塘</span>
      </router-link>
      <router-link to="/publish" class="footer-item publish">
        <span class="footer-icon">+</span>
        <span>发布</span>
      </router-link>
      <router-link to="/message" class="footer-item">
        <span class="footer-icon">💬</span>
        <span>消息</span>
      </router-link>
      <router-link to="/my" class="footer-item">
        <span class="footer-icon">👤</span>
        <span>我的</span>
      </router-link>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      categories: [
        { id: 1, name: '手机/数码/电脑', icon: '📱' },
        { id: 2, name: '服饰/箱包/运动', icon: '👕' },
        { id: 3, name: '技能/卡券/潮玩', icon: '🎮' },
        { id: 4, name: '母婴/美妆/个护', icon: '👶' },
        { id: 5, name: '家具/家电/家装', icon: '🛋️' },
        { id: 6, name: '文玩/珠宝/礼品', icon: '💎' },
        { id: 7, name: '食品/宠物/花卉', icon: '🍪' },
        { id: 8, name: '图书/游戏/音像', icon: '📚' },
        { id: 9, name: '汽车/电动车/租房', icon: '🚗' },
        { id: 10, name: '五金/设备/农牧', icon: '🔧' }
      ],
      featuredItems: [
        { id: 1, title: '衣橱捡漏', desc: '时尚美衣低价淘', price: '￥22起', icon: '👗' },
        { id: 2, title: '手机数码', desc: '热门装备省心入', price: '￥6999起', icon: '📱' },
        { id: 3, title: '二次元', desc: '烫门新品随手入', price: '￥32起', icon: '🎭' },
        { id: 4, title: '买手机', desc: '品牌低价放心购', price: '￥999起', icon: '📲' }
      ],
      tags: [
        '个人闲置', 'BJD娃娃', '垂钓', '吉他乐器', '台球', 
        '摄影摄像', '钱币收藏', '女装穿搭', '居家好物', '大牌美妆', '机车'
      ],
      products: [
        { 
          id: 1, 
          title: '佳能600d单反相机', 
          description: '宝贝买时花近1万元，自己用不上啦 感兴趣的话点"我想…"', 
          price: '￥1888', 
          status: '已报警了，好几个平台都举报了', 
          seller: '天猫假货', 
          freeShipping: true, 
          received: false,
          new: false
        },
        { 
          id: 2, 
          title: '大疆DJI Pocket 3', 
          description: '全新未拆封，不包原厂瑕疵', 
          price: '￥2580', 
          status: '特价处理', 
          seller: 'Bearbrick', 
          freeShipping: true, 
          received: false,
          new: true
        },
        { 
          id: 3, 
          title: '富士拍立得相机', 
          description: '魔术道具，7.99元包邮', 
          price: '￥168', 
          status: '菜鸟快递', 
          seller: '淘宝', 
          freeShipping: true, 
          received: true,
          new: false
        },
        { 
          id: 4, 
          title: '笔记本电脑', 
          description: '省35元，1.50元起', 
          price: '￥1280', 
          status: '特价', 
          seller: '淘宝', 
          freeShipping: false, 
          received: false,
          new: true
        },
        { 
          id: 5, 
          title: '穿戴甲美甲', 
          description: '全新未使用，多款式可选', 
          price: '￥35', 
          status: '包邮', 
          seller: '个人卖家', 
          freeShipping: true, 
          received: false,
          new: true
        },
        { 
          id: 6, 
          title: 'MCM特拍', 
          description: '正品特价，数量有限', 
          price: '￥899', 
          status: '限量', 
          seller: '品牌特卖', 
          freeShipping: true, 
          received: false,
          new: false
        }
      ]
    }
  },
  methods: {
    goToCategory(categoryId) {
      this.$router.push({ path: `/category/${categoryId}` });
    },
    goToDetail(productId) {
      this.$router.push({ path: `/product/${productId}` });
    },
    filterByTag(tag) {
      alert(`筛选标签: ${tag}`);
      // 实际应用中这里会触发商品筛选
    },
    getRandomColor() {
      const colors = ['#FFE4E1', '#F0F8FF', '#F5F5DC', '#F0FFF0', '#FFF0F5', '#F8F8FF'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

body {
  background-color: #f5f5f5;
  color: #333;
  padding-bottom: 60px; /* 为底部导航留出空间 */
}

#app {
  max-width: 100%;
  margin: 0 auto;
  background-color: #fff;
}

/* 顶部导航栏样式 */
.header {
  background-color: #FFD700;
  padding: 10px 15px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.search-box {
  display: flex;
  flex: 1;
  margin: 0 15px;
  max-width: 500px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 20px 0 0 20px;
  font-size: 14px;
  outline: none;
}

.search-btn {
  background-color: #fff;
  border: none;
  border-radius: 0 20px 20px 0;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 16px;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.icon-link {
  font-size: 20px;
  text-decoration: none;
  color: #333;
}

/* 主要内容区域 */
.main-content {
  padding: 0 10px 20px;
}

/* 分类区域样式 */
.categories-section {
  margin-top: 10px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 5px;
  width: 50px;
  height: 50px;
  background-color: #FFF9C4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 12px;
  text-align: center;
  color: #666;
  margin-top: 5px;
  line-height: 1.2;
}

.upgrade-notice {
  background-color: #FFF3CD;
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.upgrade-link {
  color: #FF6B00;
  text-decoration: none;
  font-weight: bold;
}

/* 广告和特色区域 */
.featured-section {
  margin-bottom: 20px;
}

.ad-banner {
  background: linear-gradient(to right, #FF9800, #FFD700);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  color: #fff;
}

.ad-banner h2 {
  font-size: 20px;
  margin-bottom: 5px;
}

.ad-banner p {
  font-size: 14px;
  opacity: 0.9;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.featured-item {
  background-color: #FFF9C4;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: transform 0.2s;
}

.featured-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.featured-icon {
  font-size: 30px;
  margin-bottom: 8px;
}

.featured-item h3 {
  font-size: 16px;
  margin-bottom: 5px;
}

.featured-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.featured-price {
  color: #FF6B00;
  font-weight: bold;
  font-size: 18px;
}

/* 标签区域 */
.tags-section {
  margin-bottom: 20px;
}

.tags-section h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background-color: #FFF9C4;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background-color: #FFD700;
  transform: scale(1.05);
}

/* 商品列表 */
.products-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.product-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-img {
  height: 150px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: bold;
}

.product-status {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.product-info {
  padding: 10px;
}

.product-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.product-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.product-price {
  color: #FF6B00;
  font-weight: bold;
  font-size: 16px;
}

.product-seller {
  font-size: 11px;
  color: #999;
}

.product-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag-shipping, .tag-received, .tag-new {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.tag-shipping {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.tag-received {
  background-color: #E3F2FD;
  color: #1565C0;
}

.tag-new {
  background-color: #FFF3E0;
  color: #EF6C00;
}

/* 底部导航 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #999;
  font-size: 12px;
  transition: color 0.2s;
}

.footer-item.active {
  color: #FFD700;
}

.footer-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.footer-item.publish .footer-icon {
  background-color: #FFD700;
  color: #333;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(10, 1fr);
  }
  
  .featured-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .main-content {
    padding: 0 20px 20px;
  }
}

@media (min-width: 1024px) {
  #app {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>