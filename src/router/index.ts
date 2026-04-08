import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Detail from '../views/Detail.vue'
import SearchPage from '../views/SearchPage.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
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
      path: '/publish',
      name: 'publish',
      component: () => import('../views/EditProduct.vue'),
    },
    {
      path: '/forum',
      name: 'forum',
      component: () => import('../views/forum/ForumHome.vue'),
    },
    {
      path: '/forum/new',
      name: 'forum-create',
      component: () => import('../views/forum/ForumCreate.vue'),
    },
    {
      path: '/forum/post/:id',
      name: 'forum-detail',
      component: () => import('../views/forum/ForumDetail.vue'),
      props: true,
    },
    {
      path: '/goods/:id',
      name: 'goods-detail',
      component: () => import('../views/goods/GoodsDetail.vue'),
      props: true,
    },
  ],
})

export default router
