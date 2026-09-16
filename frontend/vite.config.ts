import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxy = {
    '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
    '/openapi.json': { target: env.VITE_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
  }

  return {
    plugins: [react()],
    server: { port: 5173, host: true, proxy },
    preview: { port: 5173, host: true, proxy },
  }
})
