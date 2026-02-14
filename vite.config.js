import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tests': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth/github/login': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/auth/github/callback': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/github/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
