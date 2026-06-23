import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

import Home from '../views/home/Index.vue'
import Detail from '../views/goods/Detail.vue'
import SearchPage from '../views/goods/SearchPage.vue'
import ChatList from '../views/chat/Index.vue'
import OrderList from '../views/order/List.vue'
import UserLogin from '../views/user/Login.vue'
import UserRegister from '../views/user/Register.vue'
import UserForgotPassword from '../views/user/ForgotPassword.vue'
import UserResetPassword from '../views/user/ResetPassword.vue'
import UserLayout from '../views/user/UserLayout.vue'
import Center from '../views/user/Center.vue'


const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    // 首页路由
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    // 商品模块路由
    {
      path: '/search',
      name: 'search',
      component: SearchPage,
    },
    {
      path: '/detail',
      name: 'detail',
      component: Detail,
      meta: { requiresAuth: true },
    },
    {
      path: '/goods/:id',
      name: 'goods-detail',
      component: () => import('../views/goods/Detail.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('../views/goods/EditProduct.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../views/goods/EditProduct.vue'),
    },
    {
      path: '/seller/product',
      name: 'seller-product-detail',
      component: () => import('../views/goods/SellerProductDetail.vue'),
    },
    {
      path: '/seller/products',
      name: 'seller-products',
      component: () => import('../views/goods/SellerProducts.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/user/orders.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/order/Checkout.vue'),
      meta: { requiresAuth: true },
    },
    // 订单模块路由
    {
      path: '/order',
      name: 'order-list',
      component: OrderList,
    },
    {
      path: '/order/detail/:id',
      name: 'order-detail',
      component: () => import('../views/order/Detail.vue'),
      props: true,
    },
    {
      path: '/order/review/:id',
      name: 'order-review',
      component: () => import('../views/order/Review.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/order/payment/:id',
      name: 'payment',
      component: () => import('../views/order/Payment.vue'),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/order/order-detail/:id',
      name: 'order-detail-alt',
      component: () => import('../views/order/OrderDetail.vue'),
      props: true,
    },

    // 聊天模块路由
    {
      path: '/chat',
      name: 'chat',
      component: ChatList,
    },
    // 用户模块路由
    {
      path: '/user/login',
      name: 'login',
      component: UserLogin,
    },
    {
      path: '/user/register',
      name: 'register',
      component: UserRegister,
    },
    {
      path: '/user/forgot-password',
      name: 'forgot-password',
      component: UserForgotPassword,
    },
    {
      path: '/user/reset-password',
      name: 'reset-password',
      component: UserResetPassword,
    },
    {
      path: '/user/home/:id',
      name: 'user-home',
      component: () => import('../views/user/PublicProfile.vue'),
      props: true,
    },
     {
      path: '/user',
      component: UserLayout,
      children: [
        {
          path: 'center',
          name: 'user-center',
          component: Center,
        },
        {
          path: 'profile',
          name: 'user-profile',
          component: () => import('../views/user/Profile.vue'),
        },
        {
          path: 'setting',
          name: 'user-setting',
          component: () => import('../views/user/Setting.vue'),
        },
         {
          path: 'orders',
          name: 'user-orders',
          component: () => import('../views/user/orders.vue'),
        },
        {
          path: 'favorites',
          name: 'user-favorites',
          component: () => import('../views/user/favorites.vue'),
        },
        {
          path: 'follows',
          name: 'user-follows',
          component: () => import('../views/user/Follows.vue'),
        },
        {
          path: 'address',
          name: 'user-address',
          component: () => import('../views/user/UserAddress.vue'),
        },
      ],
    },
    {
      path: '/drafts',
      name: 'drafts',
      component: () => import('../views/goods/Drafts.vue'),
    },
    {
      path: '/address',
      name: 'address',
      component: () => import('../views/user/Address.vue'),
    },

    // 管理员路由
    {
      path: '/admin',
      component: () => import('../views/admin/Index.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../components/admin/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../components/admin/Users.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../components/admin/Products.vue'),
        },
        {
          path: 'disputes',
          name: 'admin-disputes',
          component: () => import('../components/admin/Disputes.vue'),
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('../components/admin/Log.vue'),
        },
      ],
    },

    // 错误页面路由
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/error/NotFound.vue'),
    }
  ],
})

const guestAllowedPaths = new Set(['/','/user/login','/user/register','/user/forgot-password','/user/reset-password'])

/** 记录：目标页面 → 被拦截前用户所在的页面 */
const originBeforeLogin = new Map<string, string>()

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  // 放宽校验：只要有非空 token 就认为已登录，不再强制依赖 userInfo.id
  // 避免 fetchUserProfile 覆盖 userInfo 后导致 id 丢失而被误踢
  const hasValidToken = Boolean(token && token.length > 8)
  console.log(`[router.beforeEach] path=${to.path}, hasValidToken=${hasValidToken}`)
  if (hasValidToken) return true
  if (guestAllowedPaths.has(to.path)) return true

  // 保存被拦截前的来源页面（即用户点消息/商品详情等之前所在的页面）
  // 注意：login 本身不做为有效来源
  if (from.path && from.path !== '/user/login') {
    originBeforeLogin.set(to.fullPath, from.fullPath)
  }

  ElMessage.info('请先进行登录')
  return {
    path: '/user/login',
    query: { redirect: to.fullPath },
  }
})

/** 记录从登录页进入的路由路径（用于 goBack 时跳过登录页） */
const enteredFromLogin = new Set<string>()

router.afterEach((to, from) => {
  if (from.path === '/user/login') {
    enteredFromLogin.add(to.path)
  }
})

/** 检测指定路径是否是从登录页跳转过来的 */
export function didEnterFromLogin(path: string): boolean {
  return enteredFromLogin.has(path)
}

/** 清除 enteredFromLogin 记录 */
export function clearEnterFromLogin(path: string): void {
  enteredFromLogin.delete(path)
}

/**
 * 获取"返回目标"
 * - 有被拦截前的来源页面 → 返回该页面
 * - 没有（比如用户直接打开浏览器访问受保护页面）→ 返回首页
 */
export function getBackDestination(path: string): string {
  const origin = originBeforeLogin.get(path)
  if (origin) {
    originBeforeLogin.delete(path)
    return origin
  }
  return '/'
}

export default router