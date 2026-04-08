// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';  // 导入Home组件

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // 路由级别的代码分割

  },
  // 添加更多路由...
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;