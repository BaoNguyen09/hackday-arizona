import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/chat': 'http://localhost:8001',
      '/health': 'http://localhost:8001',
      '/voice': {
        target: 'ws://localhost:8001',
        ws: true,
      },
    },
  },
})
