import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

import Home from '../views/home/Index.vue'
import Detail from '../views/goods/Detail.vue'
import SearchPage from '../views/goods/SearchPage.vue'
import ForumLayout from '../views/forum/ForumLayout.vue'
import Forum from '../views/forum/Index.vue'
import GoodsList from '../views/goods/List.vue'
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
      path: '/goods',
      name: 'goods-list',
      component: GoodsList,
    },
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

    // 论坛模块路由
    {
      path: '/forum',
      component: ForumLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'forum',
          component: Forum,
        },
        {
          path: 'new',
          name: 'forum-create',
          component: () => import('../views/forum/Post.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'post/:id',
          name: 'forum-detail',
          component: () => import('../views/forum/Detail.vue'),
          props: true,
        },
        {
          path: 'search',
          name: 'forum-search',
          component: () => import('../views/forum/ForumSearch.vue'),
        },
      ],
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
    // 购物车模块路由
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/cart/Index.vue'),
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
      path: '/order/confirm',
      name: 'order-confirm',
      component: () => import('../views/order/Confirm.vue'),
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../views/order/Payment.vue'),
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
    {
      path: '/chat/room/:id',
      name: 'chat-room',
      component: () => import('../views/chat/Room.vue'),
      props: true,
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
    // 错误页面路由
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/error/NotFound.vue'),
    }
  ],
})

const guestAllowedPaths = new Set(['/','/user/login','/user/register','/user/forgot-password','/user/reset-password'])

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (userStore.isLoggedIn) return true
  if (guestAllowedPaths.has(to.path)) return true

  alert('请先进行登录')
  return {
    path: '/user/login',
    query: { redirect: to.fullPath },
  }
})

export default router
