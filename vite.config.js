import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const anthropicApiKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'anthropic-version': '2023-06-01',
            ...(anthropicApiKey ? { 'x-api-key': anthropicApiKey } : {}),
          },
        },
      },
    },
  }
})
