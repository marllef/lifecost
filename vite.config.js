import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import offlineServiceWorker from './plugins/offlineServiceWorker.js'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), offlineServiceWorker()],
})
