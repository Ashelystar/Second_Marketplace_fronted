import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 5173,       // 开发服务器端口
    strictPort: true, // 端口被占用时报错
    open: false,      // 是否自动打开浏览器
    cors: true,       // 启用CORS
    proxy: {
      // 配置转发规则
      '/api': {
        target: 'http://127.0.0.1:4523/m1/8074072-7829695-default',
        changeOrigin: true,
        // 注意：因为你的后端接口路径里本身就带有 /api
        // 所以这里千万不要写 rewrite，保持原样转发即可
      }
    }
  }
})
