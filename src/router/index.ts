import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
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
