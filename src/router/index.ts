import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/home/Home.vue'
import Detail from '../views/goods/Detail.vue'
import SearchPage from '../views/goods/SearchPage.vue'
import Forum from '../views/forum/Index.vue'
import GoodsList from '../views/goods/List.vue'
import Cart from '../views/cart/Index.vue'
import ChatList from '../views/chat/Index.vue'
import OrderList from '../views/order/List.vue'
import UserLogin from '../views/user/Login.vue'
import UserRegister from '../views/user/Register.vue'
import UserLayout from '../views/user/UserLayout.vue' 
import Center from '../views/user/center.vue'


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
    },
    {
      path: '/goods/:id',
      name: 'goods-detail',
      component: () => import('../views/goods/Detail.vue'),
      props: true,
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

    // 论坛模块路由
    {
      path: '/forum',
      name: 'forum',
      component: Forum,
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/order/Orders.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/order/Checkout.vue'),
    },
    {
      path: '/forum/new',
      name: 'forum-create',
      component: () => import('../views/forum/Post.vue'),
    },
    {
      path: '/forum/post/:id',
      name: 'forum-detail',
      component: () => import('../views/forum/Detail.vue'),
      props: true,
    },
    {
      path: '/forum/search',
      name: 'forum-search',
      component: () => import('../views/forum/ForumSearch.vue'),
    },

    // 购物车模块路由
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/goods/Cart.vue'),
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
      path: '/order/order-detail/:id',
      name: 'order-detail-alt',
      component: () => import('../views/order/OrderDetail.vue'),
      props: true,
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/order/Orders.vue'),
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
          path: 'address',
          name: 'user-address',
          component: () => import('../views/user/Address.vue'),
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

export default router
