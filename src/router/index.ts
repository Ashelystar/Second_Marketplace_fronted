import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
import Home from '../views/product/Home.vue'
import Detail from '../views/product/Detail.vue'
import SearchPage from '../views/product/SearchPage.vue'
import Forum from '../views/forum/ForumHome.vue'
=======
import Home from '../views/home/Index.vue'
import Detail from '../views/goods/Detail.vue'
import SearchPage from '../views/goods/Search.vue'
import Forum from '../views/forum/Index.vue'
import GoodsList from '../views/goods/List.vue'
import Cart from '../views/cart/Index.vue'
import ChatList from '../views/chat/Index.vue'
import OrderList from '../views/order/List.vue'
import UserLogin from '../views/user/Login.vue'
import UserRegister from '../views/user/Register.vue'
>>>>>>> 46d1b682b7337dd35515cb8e5bde0fa1d2843eb5

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
<<<<<<< HEAD
      component: () => import('../views/product/EditProduct.vue'),
=======
      component: () => import('../views/goods/Publish.vue'),
>>>>>>> 46d1b682b7337dd35515cb8e5bde0fa1d2843eb5
    },
    {
      path: '/edit',
      name: 'edit',
<<<<<<< HEAD
      component: () => import('../views/product/EditProduct.vue'),
=======
      component: () => import('../views/goods/Publish.vue'),
>>>>>>> 46d1b682b7337dd35515cb8e5bde0fa1d2843eb5
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
      component: Cart,
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
      path: '/user/center',
      name: 'user-center',
      component: () => import('../views/user/Center.vue'),
    },
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('../views/user/Profile.vue'),
    },
    {
      path: '/user/setting',
      name: 'user-setting',
      component: () => import('../views/user/Setting.vue'),
    },
    {
      path: '/user/address',
      name: 'user-address',
      component: () => import('../views/user/Address.vue'),
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