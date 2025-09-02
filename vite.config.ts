import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Kui deploy’d GitHub Pages’i repo alamteele, lisa nt: base: '/bolt-demo-games2/'
})
