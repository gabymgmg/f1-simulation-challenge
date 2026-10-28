import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api calls to the Express server, so the client needs no CORS setup
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
