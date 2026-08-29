import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['interactive-sales-analytics-dashboard-production-a2d1.up.railway.app']
  }
})