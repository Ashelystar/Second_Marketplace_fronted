import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home/Index.vue'
import Detail from '../views/goods/Detail.vue'
import SearchPage from '../views/goods/Search.vue'
import Forum from '../views/forum/Index.vue'

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
      component: () => import('../views/goods/Publish.vue'),
    },
    {
      path: '/edit',
      name: 'edit',
      component: () => import('../views/goods/Publish.vue'),
    },
    {
      path: '/forum',
      name: 'forum',
      component: Forum,
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
      path: '/goods/:id',
      name: 'goods-detail',
      component: () => import('../views/goods/Detail.vue'),
      props: true,
    },
  ],
})

export default router
