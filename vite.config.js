import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_AI_TEST_GEN_BACKEND_URL || 'https://threerd-back.onrender.com';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/tests': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target,
          changeOrigin: true,
          secure: false,
          bypass: (req, res, options) => {
            if (req.url.includes('/auth/github/callback')) {
              return req.url;
            }
          }
        },
        '/github/repos': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
})
