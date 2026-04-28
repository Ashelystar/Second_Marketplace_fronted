import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_BASE_URL || 'http://127.0.0.1:4523/m1/8074072-7829695-default'

  return {
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
        // 前端请求 /api/* 时，转发到 .env 中配置的后端地址
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/filebucket': { // 当请求路径以 /filebucket 开头时
        target: 'http://218.244.142.223:9000', // 转发到这个目标地址
        changeOrigin: true,
      }
      }
    },
  }
})
